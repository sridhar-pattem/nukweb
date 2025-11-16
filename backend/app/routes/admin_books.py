from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required
from app.utils.auth import admin_required
from app.utils.database import execute_query, get_db_cursor
from app.utils.openlibrary import fetch_book_by_isbn
from app.config import Config

admin_books_bp = Blueprint('admin_books', __name__)

@admin_books_bp.route('/books', methods=['GET'])
@jwt_required()
@admin_required
def get_books():
    """Get all books with pagination and filters"""
    page = request.args.get('page', 1, type=int)
    search = request.args.get('search', '')
    collection = request.args.get('collection', '')
    genre = request.args.get('genre', '')
    status = request.args.get('status', '')
    
    offset = (page - 1) * Config.ITEMS_PER_PAGE
    
    # Build query
    where_clauses = []
    params = []
    
    if search:
        where_clauses.append("""
            (title ILIKE %s OR author ILIKE %s OR isbn LIKE %s)
        """)
        search_param = f'%{search}%'
        params.extend([search_param, search_param, search_param])
    
    if collection:
        where_clauses.append("collection = %s")
        params.append(collection)
    
    if genre:
        where_clauses.append("genre = %s")
        params.append(genre)
    
    if status:
        where_clauses.append("status = %s")
        params.append(status)
    
    where_sql = "WHERE " + " AND ".join(where_clauses) if where_clauses else ""
    
    # Get total count
    count_query = f"SELECT COUNT(*) as total FROM books {where_sql}"
    total_result = execute_query(count_query, tuple(params), fetch_one=True)
    total = total_result['total'] if total_result else 0
    
    # Get books with borrowing information
    query = f"""
        SELECT b.book_id, b.isbn, b.title, b.author, b.genre, b.sub_genre, b.publisher,
               b.publication_year, b.collection, b.total_copies, b.available_copies,
               b.age_rating, b.cover_image_url, b.status, b.created_at,
               MIN(br.due_date) as earliest_due_date,
               COUNT(CASE WHEN br.status = 'active' THEN 1 END) as active_borrowings
        FROM books b
        LEFT JOIN borrowings br ON b.book_id = br.book_id AND br.status = 'active'
        {where_sql}
        GROUP BY b.book_id, b.isbn, b.title, b.author, b.genre, b.sub_genre, b.publisher,
                 b.publication_year, b.collection, b.total_copies, b.available_copies,
                 b.age_rating, b.cover_image_url, b.status, b.created_at
        ORDER BY b.created_at DESC
        LIMIT %s OFFSET %s
    """
    params.extend([Config.ITEMS_PER_PAGE, offset])

    books = execute_query(query, tuple(params), fetch_all=True)
    
    return jsonify({
        "books": [dict(b) for b in (books or [])],
        "total": total,
        "page": page,
        "per_page": Config.ITEMS_PER_PAGE,
        "total_pages": (total + Config.ITEMS_PER_PAGE - 1) // Config.ITEMS_PER_PAGE
    }), 200

@admin_books_bp.route('/books/fetch-by-isbn', methods=['POST'])
@jwt_required()
@admin_required
def fetch_book_details():
    """Fetch book details from Open Library API by ISBN"""
    data = request.get_json()
    isbn = data.get('isbn')
    
    if not isbn:
        return jsonify({"error": "ISBN is required"}), 400
    
    # Check if book already exists
    existing_query = "SELECT book_id FROM books WHERE isbn = %s"
    existing = execute_query(existing_query, (isbn.replace('-', '').replace(' ', ''),), fetch_one=True)
    
    if existing:
        return jsonify({"error": "Book with this ISBN already exists"}), 400
    
    # Fetch from Open Library
    book_info = fetch_book_by_isbn(isbn)
    
    if not book_info:
        return jsonify({"error": "Book not found in Open Library"}), 404
    
    return jsonify(book_info), 200

@admin_books_bp.route('/books', methods=['POST'])
@jwt_required()
@admin_required
def add_book():
    """Add a new book to the catalogue"""
    data = request.get_json()
    
    required_fields = ['isbn', 'title', 'collection']
    if not all(field in data for field in required_fields):
        return jsonify({"error": "Missing required fields"}), 400
    
    # Check if ISBN already exists
    check_query = "SELECT book_id FROM books WHERE isbn = %s"
    existing = execute_query(check_query, (data['isbn'],), fetch_one=True)
    
    if existing:
        return jsonify({"error": "Book with this ISBN already exists"}), 400
    
    query = """
        INSERT INTO books 
        (isbn, title, author, genre, sub_genre, publisher, publication_year,
         description, collection, total_copies, available_copies, age_rating,
         cover_image_url, status)
        VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, 'Available')
        RETURNING book_id
    """
    
    total_copies = data.get('total_copies', 1)
    
    with get_db_cursor() as cursor:
        cursor.execute(query, (
            data['isbn'],
            data['title'],
            data.get('author'),
            data.get('genre'),
            data.get('sub_genre'),
            data.get('publisher'),
            data.get('publication_year'),
            data.get('description'),
            data['collection'],
            total_copies,
            total_copies,  # available_copies = total_copies initially
            data.get('age_rating'),
            data.get('cover_image_url')
        ))
        
        book_id = cursor.fetchone()['book_id']
        
        return jsonify({
            "message": "Book added successfully",
            "book_id": book_id
        }), 201

@admin_books_bp.route('/books/<int:book_id>', methods=['PUT'])
@jwt_required()
@admin_required
def update_book(book_id):
    """Update book information"""
    data = request.get_json()
    
    # Check if book exists
    check_query = "SELECT book_id FROM books WHERE book_id = %s"
    book = execute_query(check_query, (book_id,), fetch_one=True)
    
    if not book:
        return jsonify({"error": "Book not found"}), 404
    
    # Build update query dynamically
    update_fields = []
    params = []
    
    updatable_fields = [
        'title', 'author', 'genre', 'sub_genre', 'publisher', 'publication_year',
        'description', 'collection', 'total_copies', 'age_rating', 'cover_image_url'
    ]
    
    for field in updatable_fields:
        if field in data:
            update_fields.append(f"{field} = %s")
            params.append(data[field])
    
    if not update_fields:
        return jsonify({"error": "No fields to update"}), 400
    
    params.append(book_id)
    
    query = f"""
        UPDATE books 
        SET {', '.join(update_fields)}
        WHERE book_id = %s
    """
    
    execute_query(query, tuple(params))
    
    return jsonify({"message": "Book updated successfully"}), 200

@admin_books_bp.route('/books/<int:book_id>/status', methods=['PATCH'])
@jwt_required()
@admin_required
def update_book_status(book_id):
    """Update book status (Lost, Damaged, Phased Out)"""
    data = request.get_json()
    status = data.get('status')
    
    if status not in ['Available', 'Lost', 'Damaged', 'Phased Out']:
        return jsonify({"error": "Invalid status"}), 400
    
    query = "UPDATE books SET status = %s WHERE book_id = %s"
    rows_affected = execute_query(query, (status, book_id))
    
    if rows_affected == 0:
        return jsonify({"error": "Book not found"}), 404
    
    return jsonify({"message": "Book status updated successfully"}), 200

@admin_books_bp.route('/books/<int:book_id>/copies', methods=['PATCH'])
@jwt_required()
@admin_required
def update_book_copies(book_id):
    """Add or remove book copies"""
    data = request.get_json()
    action = data.get('action')  # 'add' or 'remove'
    count = data.get('count', 1)
    
    if action not in ['add', 'remove']:
        return jsonify({"error": "Invalid action"}), 400
    
    if action == 'add':
        query = """
            UPDATE books 
            SET total_copies = total_copies + %s,
                available_copies = available_copies + %s
            WHERE book_id = %s
        """
    else:  # remove
        query = """
            UPDATE books 
            SET total_copies = total_copies - %s,
                available_copies = GREATEST(available_copies - %s, 0)
            WHERE book_id = %s AND total_copies >= %s
        """
        
    with get_db_cursor() as cursor:
        if action == 'add':
            cursor.execute(query, (count, count, book_id))
        else:
            cursor.execute(query, (count, count, book_id, count))
        
        if cursor.rowcount == 0:
            return jsonify({"error": "Book not found or insufficient copies"}), 404
        
        return jsonify({"message": f"Book copies {action}ed successfully"}), 200

@admin_books_bp.route('/books/collections', methods=['GET'])
@jwt_required()
def get_collections():
    """Get all unique collections"""
    query = "SELECT DISTINCT collection FROM books WHERE collection IS NOT NULL ORDER BY collection"
    collections = execute_query(query, fetch_all=True)
    return jsonify([c['collection'] for c in (collections or [])]), 200

@admin_books_bp.route('/books/genres', methods=['GET'])
@jwt_required()
def get_genres():
    """Get all unique genres"""
    query = "SELECT DISTINCT genre FROM books WHERE genre IS NOT NULL ORDER BY genre"
    genres = execute_query(query, fetch_all=True)
    return jsonify([g['genre'] for g in (genres or [])]), 200

@admin_books_bp.route('/age-ratings', methods=['GET'])
@jwt_required()
def get_age_ratings():
    """Get all age ratings"""
    query = "SELECT * FROM age_ratings ORDER BY min_age"
    ratings = execute_query(query, fetch_all=True)
    return jsonify([dict(r) for r in (ratings or [])]), 200

@admin_books_bp.route('/age-ratings', methods=['POST'])
@jwt_required()
@admin_required
def add_age_rating():
    """Add a new age rating"""
    data = request.get_json()
    
    required_fields = ['rating_name', 'min_age']
    if not all(field in data for field in required_fields):
        return jsonify({"error": "Missing required fields"}), 400
    
    query = """
        INSERT INTO age_ratings (rating_name, min_age, max_age, description)
        VALUES (%s, %s, %s, %s)
        RETURNING rating_id
    """
    
    with get_db_cursor() as cursor:
        cursor.execute(query, (
            data['rating_name'],
            data['min_age'],
            data.get('max_age'),
            data.get('description')
        ))
        
        rating_id = cursor.fetchone()['rating_id']
        
        return jsonify({
            "message": "Age rating added successfully",
            "rating_id": rating_id
        }), 201
