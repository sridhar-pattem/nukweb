from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required
from datetime import datetime, timedelta
from app.utils.auth import admin_required
from app.utils.database import execute_query, get_db_cursor
from app.config import Config

admin_borrowings_bp = Blueprint('admin_borrowings', __name__)

@admin_borrowings_bp.route('/borrowings/issue', methods=['POST'])
@jwt_required()
@admin_required
def issue_book():
    """Issue an item to a patron"""
    data = request.get_json()

    patron_id = data.get('patron_id')
    item_id = data.get('item_id')

    if not patron_id or not item_id:
        return jsonify({"error": "patron_id and item_id are required"}), 400

    with get_db_cursor() as cursor:
        # Check if item is available
        cursor.execute("""
            SELECT i.item_id, i.circulation_status, i.barcode,
                   b.title, b.book_id
            FROM items i
            JOIN books b ON i.book_id = b.book_id
            WHERE i.item_id = %s
        """, (item_id,))
        item = cursor.fetchone()

        if not item:
            return jsonify({"error": "Item not found"}), 404

        if item['circulation_status'] != 'available':
            return jsonify({"error": f"Item is {item['circulation_status']}"}), 400

        # Check if patron has active account and get borrowing limit
        cursor.execute("""
            SELECT u.status, mp.borrowing_limit
            FROM patrons p
            JOIN users u ON p.user_id = u.user_id
            LEFT JOIN membership_plans mp ON p.membership_plan_id = mp.plan_id
            WHERE p.patron_id = %s
        """, (patron_id,))
        patron = cursor.fetchone()

        if not patron:
            return jsonify({"error": "Patron not found"}), 404

        if patron['status'] != 'active':
            return jsonify({"error": f"Patron account is {patron['status']}"}), 400

        # Check current active borrowings against limit
        borrowing_limit = patron['borrowing_limit'] or 3  # Default to 3 if no plan
        cursor.execute("""
            SELECT COUNT(*) as active_count
            FROM borrowings
            WHERE patron_id = %s AND status = 'active'
        """, (patron_id,))
        active_count = cursor.fetchone()['active_count']

        if active_count >= borrowing_limit:
            return jsonify({"error": f"Borrowing limit reached. Maximum {borrowing_limit} books allowed."}), 400

        # Create borrowing record
        checkout_date = datetime.now().date()
        due_date = checkout_date + timedelta(days=Config.CHECKOUT_DURATION_DAYS)

        cursor.execute("""
            INSERT INTO borrowings
            (patron_id, item_id, checkout_date, due_date, status)
            VALUES (%s, %s, %s, %s, 'active')
            RETURNING borrowing_id
        """, (patron_id, item_id, checkout_date, due_date))

        borrowing_id = cursor.fetchone()['borrowing_id']

        # Item status will be automatically updated by trigger

        return jsonify({
            "message": "Item issued successfully",
            "borrowing_id": borrowing_id,
            "due_date": due_date.isoformat(),
            "barcode": item['barcode'],
            "title": item['title']
        }), 201

@admin_borrowings_bp.route('/borrowings/<int:borrowing_id>/renew', methods=['POST'])
@jwt_required()
@admin_required
def renew_borrowing(borrowing_id):
    """Renew an item borrowing"""
    with get_db_cursor() as cursor:
        # Get current borrowing
        cursor.execute("""
            SELECT renewal_count, due_date, status
            FROM borrowings
            WHERE borrowing_id = %s
        """, (borrowing_id,))
        borrowing = cursor.fetchone()

        if not borrowing:
            return jsonify({"error": "Borrowing not found"}), 404

        if borrowing['status'] != 'active':
            return jsonify({"error": "Can only renew active borrowings"}), 400

        if borrowing['renewal_count'] >= Config.MAX_RENEWALS:
            return jsonify({"error": f"Maximum {Config.MAX_RENEWALS} renewals allowed"}), 400

        # Update borrowing
        new_due_date = borrowing['due_date'] + timedelta(days=Config.RENEWAL_EXTENSION_DAYS)

        cursor.execute("""
            UPDATE borrowings
            SET renewal_count = renewal_count + 1,
                due_date = %s
            WHERE borrowing_id = %s
        """, (new_due_date, borrowing_id))

        return jsonify({
            "message": "Item renewed successfully",
            "new_due_date": new_due_date.isoformat(),
            "renewals_remaining": Config.MAX_RENEWALS - borrowing['renewal_count'] - 1
        }), 200

@admin_borrowings_bp.route('/borrowings/<int:borrowing_id>/return', methods=['POST'])
@jwt_required()
@admin_required
def return_book(borrowing_id):
    """Mark an item as returned"""

    query = """
        UPDATE borrowings
        SET status = 'returned',
            return_date = CURRENT_DATE
        WHERE borrowing_id = %s AND status = 'active'
    """
    rows_affected = execute_query(query, (borrowing_id,))

    if rows_affected == 0:
        return jsonify({"error": "Borrowing not found or already returned"}), 404

    # Item status will be automatically updated by trigger

    return jsonify({"message": "Item returned successfully"}), 200

@admin_borrowings_bp.route('/borrowings/search', methods=['GET'])
@jwt_required()
@admin_required
def search_borrowings():
    """Search borrowings by patron or book/item"""
    search_type = request.args.get('type')  # 'patron' or 'book'
    search_value = request.args.get('value')
    status = request.args.get('status', 'active')

    if not search_type or not search_value:
        return jsonify({"error": "type and value parameters required"}), 400

    if search_type == 'patron':
        query = """
            SELECT br.*,
                   b.title, b.isbn, b.cover_image_url,
                   i.barcode, i.call_number,
                   p.patron_id, p.first_name, p.last_name, u.email
            FROM borrowings br
            JOIN items i ON br.item_id = i.item_id
            JOIN books b ON i.book_id = b.book_id
            JOIN patrons p ON br.patron_id = p.patron_id
            JOIN users u ON p.user_id = u.user_id
            WHERE (CAST(p.patron_id AS TEXT) LIKE %s
                   OR p.first_name ILIKE %s
                   OR p.last_name ILIKE %s
                   OR u.email ILIKE %s
                   OR p.phone LIKE %s)
              AND br.status = %s
            ORDER BY br.checkout_date DESC
        """
        search_param = f'%{search_value}%'
        borrowings = execute_query(
            query,
            (search_param, search_param, search_param, search_param, search_param, status),
            fetch_all=True
        )
    else:  # book
        query = """
            SELECT br.*,
                   b.title, b.isbn, b.cover_image_url,
                   i.barcode, i.call_number,
                   p.patron_id, p.first_name, p.last_name, u.email
            FROM borrowings br
            JOIN items i ON br.item_id = i.item_id
            JOIN books b ON i.book_id = b.book_id
            JOIN patrons p ON br.patron_id = p.patron_id
            JOIN users u ON p.user_id = u.user_id
            WHERE (b.title ILIKE %s OR b.isbn LIKE %s OR i.barcode LIKE %s)
              AND br.status = %s
            ORDER BY br.checkout_date DESC
        """
        search_param = f'%{search_value}%'
        borrowings = execute_query(
            query,
            (search_param, search_param, search_param, status),
            fetch_all=True
        )

    return jsonify([dict(b) for b in (borrowings or [])]), 200

@admin_borrowings_bp.route('/borrowings/overdue', methods=['GET'])
@jwt_required()
@admin_required
def get_overdue_borrowings():
    """Get all overdue borrowings"""
    query = """
        SELECT br.*,
               b.title, b.isbn,
               i.barcode, i.call_number,
               p.patron_id, p.first_name, p.last_name, u.email, p.phone
        FROM borrowings br
        JOIN items i ON br.item_id = i.item_id
        JOIN books b ON i.book_id = b.book_id
        JOIN patrons p ON br.patron_id = p.patron_id
        JOIN users u ON p.user_id = u.user_id
        WHERE br.status = 'active' AND br.due_date < CURRENT_DATE
        ORDER BY br.due_date ASC
    """
    overdue = execute_query(query, fetch_all=True)
    return jsonify([dict(b) for b in (overdue or [])]), 200

@admin_borrowings_bp.route('/patrons/search', methods=['GET'])
@jwt_required()
@admin_required
def search_patrons():
    """Search patrons by name for autocomplete"""
    search = request.args.get('q', '')

    if len(search) < 2:
        return jsonify([]), 200

    query = """
        SELECT p.patron_id, p.first_name, p.last_name, u.email, u.status,
               mp.plan_name,
               (SELECT COUNT(*) FROM borrowings br
                WHERE br.patron_id = p.patron_id AND br.status = 'active') as active_borrowings
        FROM patrons p
        JOIN users u ON p.user_id = u.user_id
        LEFT JOIN membership_plans mp ON p.membership_plan_id = mp.plan_id
        WHERE (p.first_name ILIKE %s OR p.last_name ILIKE %s OR u.email ILIKE %s) AND u.status = 'active'
        ORDER BY p.first_name, p.last_name
        LIMIT 10
    """
    search_param = f'%{search}%'
    patrons = execute_query(query, (search_param, search_param, search_param), fetch_all=True)

    return jsonify([dict(p) for p in (patrons or [])]), 200

@admin_borrowings_bp.route('/items/search', methods=['GET'])
@jwt_required()
@admin_required
def search_items():
    """Search available items for checkout by title, ISBN, or barcode"""
    search = request.args.get('q', '')

    if len(search) < 2:
        return jsonify([]), 200

    query = """
        SELECT i.item_id, i.barcode, i.call_number, i.circulation_status as status,
               b.book_id, b.isbn, b.title, b.cover_image_url,
               ba.available_items, ba.total_items,
               COALESCE((SELECT json_agg(
                   json_build_object('name', c.name, 'role', bc.role)
                   ORDER BY bc.role, bc.sequence_number
               )
                FROM book_contributors bc
                JOIN contributors c ON bc.contributor_id = c.contributor_id
                WHERE bc.book_id = b.book_id
               ), '[]'::json) as contributors,
               COALESCE(string_agg(c.name, ', ') FILTER (WHERE bc.role = 'Author'), '') as authors
        FROM items i
        JOIN books b ON i.book_id = b.book_id
        LEFT JOIN mv_book_availability ba ON b.book_id = ba.book_id
        LEFT JOIN book_contributors bc ON b.book_id = bc.book_id
        LEFT JOIN contributors c ON bc.contributor_id = c.contributor_id
        WHERE (b.title ILIKE %s OR b.isbn LIKE %s OR i.barcode LIKE %s)
          AND i.circulation_status = 'available'
          AND b.is_active = TRUE
        GROUP BY i.item_id, i.barcode, i.call_number, i.circulation_status,
                 b.book_id, b.isbn, b.title, b.cover_image_url,
                 ba.available_items, ba.total_items
        ORDER BY b.title
        LIMIT 10
    """
    search_param = f'%{search}%'
    items = execute_query(query, (search_param, search_param, search_param), fetch_all=True)

    return jsonify([dict(i) for i in (items or [])]), 200

@admin_borrowings_bp.route('/borrowings/all', methods=['GET'])
@jwt_required()
@admin_required
def get_all_borrowings():
    """Get all active borrowings with optional filtering"""
    patron_filter = request.args.get('patron', '')
    book_filter = request.args.get('book', '')

    query = """
        SELECT br.*,
               b.title, b.isbn,
               i.barcode, i.call_number,
               p.patron_id, p.first_name, p.last_name, u.email
        FROM borrowings br
        JOIN items i ON br.item_id = i.item_id
        JOIN books b ON i.book_id = b.book_id
        JOIN patrons p ON br.patron_id = p.patron_id
        JOIN users u ON p.user_id = u.user_id
        WHERE 1=1
    """

    params = []

    # If either patron_filter or book_filter is provided, use OR logic to search both
    if patron_filter or book_filter:
        search_term = patron_filter or book_filter
        query += """ AND (
            p.first_name ILIKE %s OR
            p.last_name ILIKE %s OR
            u.email ILIKE %s OR
            b.title ILIKE %s OR
            i.barcode ILIKE %s
        )"""
        search_param = f'%{search_term}%'
        params.extend([search_param, search_param, search_param, search_param, search_param])

    query += " ORDER BY br.checkout_date DESC"

    borrowings = execute_query(query, tuple(params) if params else None, fetch_all=True)
    return jsonify([dict(b) for b in (borrowings or [])]), 200

@admin_borrowings_bp.route('/borrowings/history', methods=['GET'])
@jwt_required()
@admin_required
def get_borrowing_history():
    """Get borrowing history for a patron or item"""
    patron_id = request.args.get('patron_id')
    item_id = request.args.get('item_id')
    book_id = request.args.get('book_id')

    if not patron_id and not item_id and not book_id:
        return jsonify({"error": "patron_id, item_id, or book_id required"}), 400

    if patron_id:
        query = """
            SELECT br.*,
                   b.title, b.isbn, b.cover_image_url,
                   i.barcode, i.call_number,
                   p.first_name, p.last_name, u.email
            FROM borrowings br
            JOIN items i ON br.item_id = i.item_id
            JOIN books b ON i.book_id = b.book_id
            JOIN patrons p ON br.patron_id = p.patron_id
            JOIN users u ON p.user_id = u.user_id
            WHERE p.patron_id = %s
            ORDER BY br.checkout_date DESC
            LIMIT 50
        """
        history = execute_query(query, (patron_id,), fetch_all=True)
    elif item_id:
        query = """
            SELECT br.*,
                   p.patron_id, p.first_name, p.last_name, u.email,
                   b.title, b.isbn,
                   i.barcode
            FROM borrowings br
            JOIN items i ON br.item_id = i.item_id
            JOIN books b ON i.book_id = b.book_id
            JOIN patrons p ON br.patron_id = p.patron_id
            JOIN users u ON p.user_id = u.user_id
            WHERE br.item_id = %s
            ORDER BY br.checkout_date DESC
            LIMIT 50
        """
        history = execute_query(query, (item_id,), fetch_all=True)
    else:  # book_id
        query = """
            SELECT br.*,
                   p.patron_id, p.first_name, p.last_name, u.email,
                   b.title, b.isbn,
                   i.barcode, i.call_number
            FROM borrowings br
            JOIN items i ON br.item_id = i.item_id
            JOIN books b ON i.book_id = b.book_id
            JOIN patrons p ON br.patron_id = p.patron_id
            JOIN users u ON p.user_id = u.user_id
            WHERE b.book_id = %s
            ORDER BY br.checkout_date DESC
            LIMIT 50
        """
        history = execute_query(query, (book_id,), fetch_all=True)

    return jsonify([dict(h) for h in (history or [])]), 200

@admin_borrowings_bp.route('/borrowings/stats', methods=['GET'])
@jwt_required()
@admin_required
def get_borrowing_stats():
    """Get borrowing statistics"""
    query = """
        SELECT
            COUNT(*) FILTER (WHERE status = 'active') as active_borrowings,
            COUNT(*) FILTER (WHERE status = 'active' AND due_date < CURRENT_DATE) as overdue_borrowings,
            COUNT(*) FILTER (WHERE status = 'returned') as total_returned,
            COUNT(*) FILTER (WHERE status = 'returned' AND return_date > due_date) as late_returns
        FROM borrowings
    """
    stats = execute_query(query, fetch_one=True)

    return jsonify(dict(stats) if stats else {}), 200
