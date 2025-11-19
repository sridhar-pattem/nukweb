from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from app.utils.database import execute_query, get_db_cursor
from app.utils.recommendations import get_recommendations_for_patron
from app.config import Config

patron_bp = Blueprint('patron', __name__)

@patron_bp.route('/books/new-arrivals', methods=['GET'])
def get_new_arrivals():
    """Get recently added books (public endpoint)"""
    limit = request.args.get('limit', 6, type=int)

    # Limit to a reasonable number to prevent abuse
    if limit > 50:
        limit = 50

    query = """
        SELECT b.book_id, b.isbn, b.title, b.subtitle,
               b.publisher, b.publication_year,
               b.collection_id, c.collection_name,
               b.age_rating, b.cover_image_url,
               b.created_at,
               ba.available_items, ba.total_items,
               COALESCE((SELECT json_agg(
                   json_build_object('name', contrib.name, 'role', bc.role)
                   ORDER BY bc.role, bc.sequence_number
               )
                FROM book_contributors bc
                JOIN contributors contrib ON bc.contributor_id = contrib.contributor_id
                WHERE bc.book_id = b.book_id
               ), '[]'::json) as contributors,
               (SELECT AVG(rating) FROM reviews WHERE book_id = b.book_id) as avg_rating,
               (SELECT COUNT(*) FROM reviews WHERE book_id = b.book_id) as review_count
        FROM books b
        LEFT JOIN collections c ON b.collection_id = c.collection_id
        LEFT JOIN mv_book_availability ba ON b.book_id = ba.book_id
        WHERE b.is_active = TRUE
        ORDER BY b.created_at DESC
        LIMIT %s
    """

    books = execute_query(query, (limit,), fetch_all=True)

    return jsonify({
        "books": [dict(b) for b in (books or [])]
    }), 200

@patron_bp.route('/books', methods=['GET'])
@jwt_required()
def browse_books():
    """Browse books by collection"""
    collection_id = request.args.get('collection')
    search = request.args.get('search', '')
    page = request.args.get('page', 1, type=int)

    offset = (page - 1) * Config.ITEMS_PER_PAGE

    where_clauses = ["b.is_active = TRUE"]
    params = []

    if collection_id:
        where_clauses.append("b.collection_id = %s")
        params.append(collection_id)

    if search:
        where_clauses.append("""
            (b.title ILIKE %s OR b.subtitle ILIKE %s OR
             EXISTS (
                 SELECT 1 FROM book_contributors bc
                 JOIN contributors c ON bc.contributor_id = c.contributor_id
                 WHERE bc.book_id = b.book_id AND c.name ILIKE %s
             ))
        """)
        search_param = f'%{search}%'
        params.extend([search_param, search_param, search_param])

    where_sql = "WHERE " + " AND ".join(where_clauses)

    # Get total count
    count_query = f"SELECT COUNT(*) as total FROM books b {where_sql}"
    total_result = execute_query(count_query, tuple(params) if params else None, fetch_one=True)
    total = total_result['total'] if total_result else 0

    # Get books with contributors and availability
    query = f"""
        SELECT b.book_id, b.isbn, b.title, b.subtitle,
               b.publisher, b.publication_year,
               b.collection_id, c.collection_name,
               b.age_rating, b.cover_image_url,
               ba.available_items, ba.total_items,
               COALESCE((SELECT json_agg(
                   json_build_object('name', contrib.name, 'role', bc.role)
                   ORDER BY bc.role, bc.sequence_number
               )
                FROM book_contributors bc
                JOIN contributors contrib ON bc.contributor_id = contrib.contributor_id
                WHERE bc.book_id = b.book_id
               ), '[]'::json) as contributors,
               (SELECT AVG(rating) FROM reviews WHERE book_id = b.book_id) as avg_rating,
               (SELECT COUNT(*) FROM reviews WHERE book_id = b.book_id) as review_count
        FROM books b
        LEFT JOIN collections c ON b.collection_id = c.collection_id
        LEFT JOIN mv_book_availability ba ON b.book_id = ba.book_id
        {where_sql}
        ORDER BY b.title
        LIMIT %s OFFSET %s
    """
    params.extend([Config.ITEMS_PER_PAGE, offset])

    books = execute_query(query, tuple(params), fetch_all=True)

    return jsonify({
        "books": [dict(b) for b in (books or [])],
        "total": total,
        "page": page,
        "per_page": Config.ITEMS_PER_PAGE
    }), 200

@patron_bp.route('/books/<int:book_id>', methods=['GET'])
@jwt_required()
def get_book_details(book_id):
    """Get detailed book information"""
    query = """
        SELECT b.*,
               ba.available_items, ba.total_items,
               ba.checked_out_items, ba.on_hold_items,
               (SELECT AVG(rating) FROM reviews WHERE book_id = b.book_id) as avg_rating,
               (SELECT COUNT(*) FROM reviews WHERE book_id = b.book_id) as review_count
        FROM books b
        LEFT JOIN mv_book_availability ba ON b.book_id = ba.book_id
        WHERE b.book_id = %s AND b.is_active = TRUE
    """
    book = execute_query(query, (book_id,), fetch_one=True)

    if not book:
        return jsonify({"error": "Book not found"}), 404

    # Get contributors
    contributors_query = """
        SELECT c.name, c.name_type, bc.role, bc.sequence_number,
               c.date_of_birth, c.date_of_death
        FROM book_contributors bc
        JOIN contributors c ON bc.contributor_id = c.contributor_id
        WHERE bc.book_id = %s
        ORDER BY bc.role, bc.sequence_number
    """
    contributors = execute_query(contributors_query, (book_id,), fetch_all=True)

    # Get reviews
    reviews_query = """
        SELECT r.*, u.name as patron_name
        FROM reviews r
        JOIN patrons p ON r.patron_id = p.patron_id
        JOIN users u ON p.user_id = u.user_id
        WHERE r.book_id = %s
        ORDER BY r.created_at DESC
        LIMIT 10
    """
    reviews = execute_query(reviews_query, (book_id,), fetch_all=True)

    result = dict(book)
    result['contributors'] = [dict(c) for c in (contributors or [])]
    result['reviews'] = [dict(r) for r in (reviews or [])]

    return jsonify(result), 200

@patron_bp.route('/books/<int:book_id>/review', methods=['POST'])
@jwt_required()
def add_review(book_id):
    """Add or update a review for a book"""
    user_id = int(get_jwt_identity())
    data = request.get_json()

    rating = data.get('rating')
    comment = data.get('comment', '')

    if not rating or rating < 1 or rating > 5:
        return jsonify({"error": "Rating must be between 1 and 5"}), 400

    # Get patron_id
    patron_query = "SELECT patron_id FROM patrons WHERE user_id = %s"
    patron = execute_query(patron_query, (user_id,), fetch_one=True)

    if not patron:
        return jsonify({"error": "Patron not found"}), 404

    with get_db_cursor() as cursor:
        # Check if review already exists
        cursor.execute("""
            SELECT review_id FROM reviews
            WHERE patron_id = %s AND book_id = %s
        """, (patron['patron_id'], book_id))

        existing = cursor.fetchone()

        if existing:
            # Update existing review
            cursor.execute("""
                UPDATE reviews
                SET rating = %s, comment = %s
                WHERE review_id = %s
            """, (rating, comment, existing['review_id']))
            message = "Review updated successfully"
        else:
            # Create new review
            cursor.execute("""
                INSERT INTO reviews (patron_id, book_id, rating, comment)
                VALUES (%s, %s, %s, %s)
                RETURNING review_id
            """, (patron['patron_id'], book_id, rating, comment))
            message = "Review added successfully"

        # Add to reading history if not already there
        cursor.execute("""
            INSERT INTO reading_history (patron_id, book_id)
            VALUES (%s, %s)
            ON CONFLICT DO NOTHING
        """, (patron['patron_id'], book_id))

        return jsonify({"message": message}), 200

@patron_bp.route('/my-borrowings', methods=['GET'])
@jwt_required()
def get_my_borrowings():
    """Get current patron's borrowings"""
    user_id = int(get_jwt_identity())
    status = request.args.get('status', 'active')

    query = """
        SELECT br.*,
               b.title, b.subtitle, b.isbn, b.cover_image_url,
               i.barcode, i.call_number,
               COALESCE((SELECT json_agg(
                   json_build_object('name', c.name, 'role', bc.role)
                   ORDER BY bc.role, bc.sequence_number
               )
                FROM book_contributors bc
                JOIN contributors c ON bc.contributor_id = c.contributor_id
                WHERE bc.book_id = b.book_id
               ), '[]'::json) as contributors
        FROM borrowings br
        JOIN items i ON br.item_id = i.item_id
        JOIN books b ON i.book_id = b.book_id
        JOIN patrons p ON br.patron_id = p.patron_id
        WHERE p.user_id = %s AND br.status = %s
        ORDER BY br.checkout_date DESC
    """
    borrowings = execute_query(query, (user_id, status), fetch_all=True)

    return jsonify([dict(b) for b in (borrowings or [])]), 200

@patron_bp.route('/recommendations', methods=['GET'])
@jwt_required()
def get_recommendations():
    """Get personalized book recommendations"""
    user_id = int(get_jwt_identity())

    # Get patron_id
    patron_query = "SELECT patron_id FROM patrons WHERE user_id = %s"
    patron = execute_query(patron_query, (user_id,), fetch_one=True)

    if not patron:
        return jsonify({"error": "Patron not found"}), 404

    recommendations = get_recommendations_for_patron(patron['patron_id'], limit=10)

    return jsonify([dict(r) for r in recommendations]), 200

@patron_bp.route('/cowork-booking', methods=['POST'])
@jwt_required()
def request_cowork_booking():
    """Request a cowork space booking"""
    user_id = int(get_jwt_identity())
    data = request.get_json()

    required_fields = ['booking_date', 'time_slot', 'booking_type']
    if not all(field in data for field in required_fields):
        return jsonify({"error": "Missing required fields"}), 400

    # Get patron_id
    patron_query = "SELECT patron_id FROM patrons WHERE user_id = %s"
    patron = execute_query(patron_query, (user_id,), fetch_one=True)

    if not patron:
        return jsonify({"error": "Patron not found"}), 404

    query = """
        INSERT INTO cowork_bookings
        (patron_id, booking_date, time_slot, booking_type, request_message, status)
        VALUES (%s, %s, %s, %s, %s, 'pending')
        RETURNING booking_id
    """

    with get_db_cursor() as cursor:
        cursor.execute(query, (
            patron['patron_id'],
            data['booking_date'],
            data['time_slot'],
            data['booking_type'],
            data.get('request_message', '')
        ))

        booking_id = cursor.fetchone()['booking_id']

        return jsonify({
            "message": "Cowork booking request submitted",
            "booking_id": booking_id
        }), 201

@patron_bp.route('/my-cowork-bookings', methods=['GET'])
@jwt_required()
def get_my_cowork_bookings():
    """Get current patron's cowork bookings"""
    user_id = int(get_jwt_identity())

    query = """
        SELECT cb.*
        FROM cowork_bookings cb
        JOIN patrons p ON cb.patron_id = p.patron_id
        WHERE p.user_id = %s
        ORDER BY cb.booking_date DESC
    """
    bookings = execute_query(query, (user_id,), fetch_all=True)

    return jsonify([dict(b) for b in (bookings or [])]), 200
