from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required
from app.utils.auth import admin_required
from app.utils.database import execute_query
from datetime import datetime, timedelta

admin_dashboard_bp = Blueprint('admin_dashboard', __name__)

@admin_dashboard_bp.route('/dashboard/stats', methods=['GET'])
@jwt_required()
@admin_required
def get_dashboard_stats():
    """Get overall library statistics"""

    stats = {}

    # Total Books
    books_query = """
        SELECT
            COUNT(*) as total_books,
            COALESCE(SUM(ba.total_items), 0) as total_copies,
            COALESCE(SUM(ba.available_items), 0) as available_copies,
            COUNT(CASE WHEN ba.available_items > 0 THEN 1 END) as available_titles
        FROM books b
        LEFT JOIN mv_book_availability ba ON b.book_id = ba.book_id
        WHERE b.is_active = TRUE
    """
    books_stats = execute_query(books_query, fetch_one=True)
    stats['books'] = dict(books_stats) if books_stats else {}

    # Total Patrons
    patrons_query = """
        SELECT
            COUNT(*) as total_patrons,
            COUNT(CASE WHEN u.status = 'active' THEN 1 END) as active_patrons,
            COUNT(CASE WHEN u.status = 'frozen' THEN 1 END) as frozen_patrons,
            COUNT(CASE WHEN u.status = 'closed' THEN 1 END) as closed_patrons
        FROM patrons p
        JOIN users u ON p.user_id = u.user_id
    """
    patrons_stats = execute_query(patrons_query, fetch_one=True)
    stats['patrons'] = dict(patrons_stats) if patrons_stats else {}

    # Active Borrowings
    borrowings_query = """
        SELECT
            COUNT(*) as total_active,
            COUNT(CASE WHEN due_date < CURRENT_DATE THEN 1 END) as overdue,
            COUNT(CASE WHEN due_date >= CURRENT_DATE THEN 1 END) as on_time
        FROM borrowings
        WHERE status = 'active'
    """
    borrowings_stats = execute_query(borrowings_query, fetch_one=True)
    stats['borrowings'] = dict(borrowings_stats) if borrowings_stats else {}

    # Collections
    collections_query = """
        SELECT
            COUNT(*) as total_collections,
            (SELECT COUNT(*) FROM books WHERE collection_id IS NOT NULL) as books_with_collection
        FROM collections
    """
    collections_stats = execute_query(collections_query, fetch_one=True)
    stats['collections'] = dict(collections_stats) if collections_stats else {}

    # Total returns (all time)
    returns_query = """
        SELECT COUNT(*) as total_returns
        FROM borrowings
        WHERE status = 'returned'
    """
    returns_stats = execute_query(returns_query, fetch_one=True)
    stats['returns'] = dict(returns_stats) if returns_stats else {}

    return jsonify(stats), 200

@admin_dashboard_bp.route('/dashboard/borrowing-trends', methods=['GET'])
@jwt_required()
@admin_required
def get_borrowing_trends():
    """Get borrowing trends over the last 30 days"""
    days = request.args.get('days', 30, type=int)

    query = """
        WITH date_series AS (
            SELECT CURRENT_DATE - generate_series(0, %s) AS date
        )
        SELECT
            ds.date,
            COALESCE(COUNT(b.borrowing_id), 0) as checkouts,
            COALESCE(COUNT(CASE WHEN b.status = 'returned' AND b.return_date = ds.date THEN 1 END), 0) as returns
        FROM date_series ds
        LEFT JOIN borrowings b ON DATE(b.checkout_date) = ds.date
        GROUP BY ds.date
        ORDER BY ds.date ASC
    """

    trends = execute_query(query, (days - 1,), fetch_all=True)
    return jsonify([dict(t) for t in (trends or [])]), 200

@admin_dashboard_bp.route('/dashboard/popular-books', methods=['GET'])
@jwt_required()
@admin_required
def get_popular_books():
    """Get most borrowed books"""
    limit = request.args.get('limit', 10, type=int)

    query = """
        SELECT
            b.book_id,
            b.title,
            COALESCE((SELECT json_agg(
                json_build_object('name', c.name, 'role', bc.role)
                ORDER BY bc.role, bc.sequence_number
            )
             FROM book_contributors bc
             JOIN contributors c ON bc.contributor_id = c.contributor_id
             WHERE bc.book_id = b.book_id
            ), '[]'::json) as contributors,
            col.collection_name,
            COUNT(br.borrowing_id) as borrow_count,
            b.cover_image_url
        FROM books b
        LEFT JOIN collections col ON b.collection_id = col.collection_id
        LEFT JOIN items i ON b.book_id = i.book_id
        LEFT JOIN borrowings br ON i.item_id = br.item_id
        GROUP BY b.book_id, b.title, col.collection_name, b.cover_image_url
        ORDER BY borrow_count DESC
        LIMIT %s
    """

    popular = execute_query(query, (limit,), fetch_all=True)
    return jsonify([dict(p) for p in (popular or [])]), 200

@admin_dashboard_bp.route('/dashboard/collection-distribution', methods=['GET'])
@jwt_required()
@admin_required
def get_collection_distribution():
    """Get distribution of books across collections"""

    query = """
        SELECT
            c.collection_id,
            c.collection_name,
            COUNT(DISTINCT b.book_id) as book_count,
            COALESCE(SUM(ba.total_items), 0) as total_copies,
            COALESCE(SUM(ba.checked_out_items), 0) as currently_borrowed
        FROM collections c
        LEFT JOIN books b ON c.collection_id = b.collection_id AND b.is_active = TRUE
        LEFT JOIN mv_book_availability ba ON b.book_id = ba.book_id
        GROUP BY c.collection_id, c.collection_name
        ORDER BY book_count DESC
    """

    distribution = execute_query(query, fetch_all=True)
    return jsonify([dict(d) for d in (distribution or [])]), 200

@admin_dashboard_bp.route('/dashboard/membership-distribution', methods=['GET'])
@jwt_required()
@admin_required
def get_membership_distribution():
    """Get distribution of patrons across membership plans"""

    query = """
        SELECT
            COALESCE(mp.plan_name, 'No Plan') as plan_name,
            COALESCE(mp.plan_id, 0) as plan_id,
            COUNT(p.patron_id) as patron_count,
            COALESCE(mp.price, 0) as price
        FROM patrons p
        LEFT JOIN membership_plans mp ON p.membership_plan_id = mp.plan_id
        LEFT JOIN users u ON p.user_id = u.user_id
        WHERE u.status = 'active'
        GROUP BY mp.plan_id, mp.plan_name, mp.price
        ORDER BY patron_count DESC
    """

    distribution = execute_query(query, fetch_all=True)
    return jsonify([dict(d) for d in (distribution or [])]), 200

@admin_dashboard_bp.route('/dashboard/overdue-books', methods=['GET'])
@jwt_required()
@admin_required
def get_overdue_books():
    """Get list of overdue books with patron details"""

    query = """
        SELECT
            br.borrowing_id,
            br.checkout_date,
            br.due_date,
            (CURRENT_DATE - br.due_date) as days_overdue,
            b.book_id,
            b.title,
            COALESCE((SELECT json_agg(
                json_build_object('name', c.name, 'role', bc.role)
                ORDER BY bc.role, bc.sequence_number
            )
             FROM book_contributors bc
             JOIN contributors c ON bc.contributor_id = c.contributor_id
             WHERE bc.book_id = b.book_id
            ), '[]'::json) as contributors,
            b.isbn,
            i.barcode,
            p.patron_id,
            p.first_name || ' ' || p.last_name as patron_name,
            u.email as patron_email,
            p.phone
        FROM borrowings br
        JOIN items i ON br.item_id = i.item_id
        JOIN books b ON i.book_id = b.book_id
        JOIN patrons p ON br.patron_id = p.patron_id
        JOIN users u ON p.user_id = u.user_id
        WHERE br.status = 'active' AND br.due_date < CURRENT_DATE
        ORDER BY br.due_date ASC
    """

    overdue = execute_query(query, fetch_all=True)
    return jsonify([dict(o) for o in (overdue or [])]), 200

@admin_dashboard_bp.route('/dashboard/recent-activity', methods=['GET'])
@jwt_required()
@admin_required
def get_recent_activity():
    """Get recent borrowing activity"""
    limit = request.args.get('limit', 20, type=int)

    query = """
        SELECT
            br.borrowing_id,
            br.checkout_date,
            br.due_date,
            br.return_date,
            br.status,
            b.book_id,
            b.title as book_title,
            COALESCE((SELECT json_agg(
                json_build_object('name', c.name, 'role', bc.role)
                ORDER BY bc.role, bc.sequence_number
            )
             FROM book_contributors bc
             JOIN contributors c ON bc.contributor_id = c.contributor_id
             WHERE bc.book_id = b.book_id
            ), '[]'::json) as contributors,
            i.barcode,
            p.patron_id,
            p.first_name || ' ' || p.last_name as patron_name,
            col.collection_name
        FROM borrowings br
        JOIN items i ON br.item_id = i.item_id
        JOIN books b ON i.book_id = b.book_id
        LEFT JOIN collections col ON b.collection_id = col.collection_id
        JOIN patrons p ON br.patron_id = p.patron_id
        JOIN users u ON p.user_id = u.user_id
        ORDER BY br.checkout_date DESC
        LIMIT %s
    """

    activity = execute_query(query, (limit,), fetch_all=True)
    return jsonify([dict(a) for a in (activity or [])]), 200

@admin_dashboard_bp.route('/dashboard/patron-activity', methods=['GET'])
@jwt_required()
@admin_required
def get_patron_activity():
    """Get patron borrowing activity metrics"""

    query = """
        SELECT
            p.patron_id,
            p.first_name || ' ' || p.last_name as patron_name,
            u.email,
            mp.plan_name,
            COUNT(br.borrowing_id) as total_borrows,
            COUNT(CASE WHEN br.status = 'active' THEN 1 END) as active_borrows,
            COUNT(CASE WHEN br.status = 'returned' THEN 1 END) as returned_books,
            COUNT(CASE WHEN br.status = 'active' AND br.due_date < CURRENT_DATE THEN 1 END) as overdue_count,
            MAX(br.checkout_date) as last_checkout
        FROM patrons p
        JOIN users u ON p.user_id = u.user_id
        LEFT JOIN membership_plans mp ON p.membership_plan_id = mp.plan_id
        LEFT JOIN borrowings br ON p.patron_id = br.patron_id
        WHERE u.status = 'active'
        GROUP BY p.patron_id, p.first_name, p.last_name, u.email, mp.plan_name
        HAVING COUNT(br.borrowing_id) > 0
        ORDER BY total_borrows DESC
        LIMIT 20
    """

    activity = execute_query(query, fetch_all=True)
    return jsonify([dict(a) for a in (activity or [])]), 200
