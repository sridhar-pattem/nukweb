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
    """Issue a book to a patron"""
    data = request.get_json()
    
    patron_id = data.get('patron_id')
    book_id = data.get('book_id')
    
    if not patron_id or not book_id:
        return jsonify({"error": "patron_id and book_id are required"}), 400
    
    with get_db_cursor() as cursor:
        # Check if book is available
        cursor.execute("""
            SELECT available_copies, status, title 
            FROM books 
            WHERE book_id = %s
        """, (book_id,))
        book = cursor.fetchone()
        
        if not book:
            return jsonify({"error": "Book not found"}), 404
        
        if book['status'] != 'Available':
            return jsonify({"error": f"Book is {book['status']}"}), 400
        
        if book['available_copies'] <= 0:
            return jsonify({"error": "No copies available"}), 400
        
        # Check if patron has active account
        cursor.execute("""
            SELECT u.status 
            FROM patrons p
            JOIN users u ON p.user_id = u.user_id
            WHERE p.patron_id = %s
        """, (patron_id,))
        patron = cursor.fetchone()
        
        if not patron:
            return jsonify({"error": "Patron not found"}), 404
        
        if patron['status'] != 'active':
            return jsonify({"error": f"Patron account is {patron['status']}"}), 400
        
        # Create borrowing record
        checkout_date = datetime.now().date()
        due_date = checkout_date + timedelta(days=Config.CHECKOUT_DURATION_DAYS)
        
        cursor.execute("""
            INSERT INTO borrowings 
            (patron_id, book_id, checkout_date, due_date, status)
            VALUES (%s, %s, %s, %s, 'active')
            RETURNING borrowing_id
        """, (patron_id, book_id, checkout_date, due_date))
        
        borrowing_id = cursor.fetchone()['borrowing_id']
        
        return jsonify({
            "message": "Book issued successfully",
            "borrowing_id": borrowing_id,
            "due_date": due_date.isoformat()
        }), 201

@admin_borrowings_bp.route('/borrowings/<int:borrowing_id>/renew', methods=['POST'])
@jwt_required()
@admin_required
def renew_borrowing(borrowing_id):
    """Renew a book borrowing"""
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
            "message": "Book renewed successfully",
            "new_due_date": new_due_date.isoformat(),
            "renewals_remaining": Config.MAX_RENEWALS - borrowing['renewal_count'] - 1
        }), 200

@admin_borrowings_bp.route('/borrowings/<int:borrowing_id>/return', methods=['POST'])
@jwt_required()
@admin_required
def return_book(borrowing_id):
    """Mark a book as returned"""
    query = """
        UPDATE borrowings
        SET status = 'returned',
            return_date = CURRENT_DATE
        WHERE borrowing_id = %s AND status = 'active'
    """
    rows_affected = execute_query(query, (borrowing_id,))
    
    if rows_affected == 0:
        return jsonify({"error": "Borrowing not found or already returned"}), 404
    
    return jsonify({"message": "Book returned successfully"}), 200

@admin_borrowings_bp.route('/borrowings/search', methods=['GET'])
@jwt_required()
@admin_required
def search_borrowings():
    """Search borrowings by patron or book"""
    search_type = request.args.get('type')  # 'patron' or 'book'
    search_value = request.args.get('value')
    status = request.args.get('status', 'active')
    
    if not search_type or not search_value:
        return jsonify({"error": "type and value parameters required"}), 400
    
    if search_type == 'patron':
        query = """
            SELECT b.*, bk.title, bk.author, bk.isbn,
                   p.patron_id, u.name as patron_name, u.email
            FROM borrowings b
            JOIN books bk ON b.book_id = bk.book_id
            JOIN patrons p ON b.patron_id = p.patron_id
            JOIN users u ON p.user_id = u.user_id
            WHERE (CAST(p.patron_id AS TEXT) LIKE %s 
                   OR u.name ILIKE %s 
                   OR u.email ILIKE %s
                   OR p.mobile_number LIKE %s)
              AND b.status = %s
            ORDER BY b.checkout_date DESC
        """
        search_param = f'%{search_value}%'
        borrowings = execute_query(
            query, 
            (search_param, search_param, search_param, search_param, status),
            fetch_all=True
        )
    else:  # book
        query = """
            SELECT b.*, bk.title, bk.author, bk.isbn, bk.cover_image_url,
                   p.patron_id, u.name as patron_name, u.email
            FROM borrowings b
            JOIN books bk ON b.book_id = bk.book_id
            JOIN patrons p ON b.patron_id = p.patron_id
            JOIN users u ON p.user_id = u.user_id
            WHERE (bk.title ILIKE %s OR bk.author ILIKE %s OR bk.isbn LIKE %s)
              AND b.status = %s
            ORDER BY b.checkout_date DESC
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
        SELECT b.*, bk.title, bk.author, bk.isbn,
               p.patron_id, u.name as patron_name, u.email, p.mobile_number
        FROM borrowings b
        JOIN books bk ON b.book_id = bk.book_id
        JOIN patrons p ON b.patron_id = p.patron_id
        JOIN users u ON p.user_id = u.user_id
        WHERE b.status = 'active' AND b.due_date < CURRENT_DATE
        ORDER BY b.due_date ASC
    """
    overdue = execute_query(query, fetch_all=True)
    return jsonify([dict(b) for b in (overdue or [])]), 200
