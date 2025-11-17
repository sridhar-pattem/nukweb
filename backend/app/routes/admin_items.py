from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required
from app.utils.auth import admin_required
from app.utils.database import execute_query, get_db_cursor
from app.config import Config

admin_items_bp = Blueprint('admin_items', __name__)

@admin_items_bp.route('/items', methods=['GET'])
@jwt_required()
@admin_required
def get_items():
    """Get all items with pagination and filters"""
    page = request.args.get('page', 1, type=int)
    book_id = request.args.get('book_id', type=int)
    search = request.args.get('search', '')
    status = request.args.get('status', '')
    location = request.args.get('location', '')

    offset = (page - 1) * Config.ITEMS_PER_PAGE

    # Build query
    where_clauses = []
    params = []

    if book_id:
        where_clauses.append("i.book_id = %s")
        params.append(book_id)

    if search:
        where_clauses.append("""
            (i.barcode ILIKE %s OR i.accession_number ILIKE %s OR
             i.call_number ILIKE %s OR b.title ILIKE %s)
        """)
        search_param = f'%{search}%'
        params.extend([search_param, search_param, search_param, search_param])

    if status:
        where_clauses.append("i.circulation_status = %s")
        params.append(status)

    if location:
        where_clauses.append("i.shelf_location ILIKE %s")
        params.append(f'%{location}%')

    where_sql = "WHERE " + " AND ".join(where_clauses) if where_clauses else ""

    # Get total count
    count_query = f"""
        SELECT COUNT(*) as total
        FROM items i
        JOIN books b ON i.book_id = b.book_id
        {where_sql}
    """
    total_result = execute_query(count_query, tuple(params) if params else None, fetch_one=True)
    total = total_result['total'] if total_result else 0

    # Get items
    query = f"""
        SELECT i.item_id, i.book_id, i.barcode, i.accession_number,
               i.call_number, i.shelf_location, i.current_location,
               i.circulation_status, i.status_changed_at,
               i.condition, i.condition_notes,
               i.acquisition_date, i.acquisition_price, i.acquisition_source,
               i.notes, i.created_at, i.updated_at,
               b.title, b.isbn, b.cover_image_url,
               CASE
                   WHEN EXISTS (
                       SELECT 1 FROM borrowings br
                       WHERE br.item_id = i.item_id AND br.status = 'active'
                   ) THEN true
                   ELSE false
               END as is_borrowed,
               (SELECT json_build_object(
                   'borrowing_id', br.borrowing_id,
                   'patron_id', p.patron_id,
                   'patron_name', u.name,
                   'due_date', br.due_date
               )
                FROM borrowings br
                JOIN patrons p ON br.patron_id = p.patron_id
                JOIN users u ON p.user_id = u.user_id
                WHERE br.item_id = i.item_id AND br.status = 'active'
               ) as active_borrowing
        FROM items i
        JOIN books b ON i.book_id = b.book_id
        {where_sql}
        ORDER BY i.created_at DESC
        LIMIT %s OFFSET %s
    """
    params.extend([Config.ITEMS_PER_PAGE, offset])

    items = execute_query(query, tuple(params), fetch_all=True)

    return jsonify({
        "items": [dict(item) for item in (items or [])],
        "total": total,
        "page": page,
        "per_page": Config.ITEMS_PER_PAGE,
        "total_pages": (total + Config.ITEMS_PER_PAGE - 1) // Config.ITEMS_PER_PAGE
    }), 200

@admin_items_bp.route('/items/<int:item_id>', methods=['GET'])
@jwt_required()
@admin_required
def get_item_details(item_id):
    """Get detailed information about a specific item"""
    query = """
        SELECT i.item_id, i.book_id, i.barcode, i.accession_number,
               i.call_number, i.shelf_location, i.current_location,
               i.circulation_status, i.status_changed_at,
               i.condition, i.condition_notes,
               i.acquisition_date, i.acquisition_price, i.acquisition_source,
               i.notes, i.created_at, i.updated_at,
               b.title, b.subtitle, b.isbn, b.publisher, b.publication_year,
               b.cover_image_url
        FROM items i
        JOIN books b ON i.book_id = b.book_id
        WHERE i.item_id = %s
    """

    item = execute_query(query, (item_id,), fetch_one=True)

    if not item:
        return jsonify({"error": "Item not found"}), 404

    # Get borrowing history for this item
    history_query = """
        SELECT br.borrowing_id, br.checkout_date, br.due_date, br.return_date,
               br.status, br.renewal_count,
               p.patron_id, u.name as patron_name
        FROM borrowings br
        JOIN patrons p ON br.patron_id = p.patron_id
        JOIN users u ON p.user_id = u.user_id
        WHERE br.item_id = %s
        ORDER BY br.checkout_date DESC
        LIMIT 20
    """
    history = execute_query(history_query, (item_id,), fetch_all=True)

    result = dict(item)
    result['borrowing_history'] = [dict(h) for h in (history or [])]

    return jsonify(result), 200

@admin_items_bp.route('/items/by-barcode/<string:barcode>', methods=['GET'])
@jwt_required()
@admin_required
def get_item_by_barcode(barcode):
    """Get item details by barcode (for quick lookup during checkout/return)"""
    query = """
        SELECT i.item_id, i.book_id, i.barcode, i.accession_number,
               i.call_number, i.shelf_location, i.circulation_status,
               i.condition, i.notes,
               b.title, b.subtitle, b.isbn, b.cover_image_url,
               b.content_type, b.media_type, b.carrier_type,
               CASE
                   WHEN EXISTS (
                       SELECT 1 FROM borrowings br
                       WHERE br.item_id = i.item_id AND br.status = 'active'
                   ) THEN true
                   ELSE false
               END as is_borrowed,
               (SELECT json_build_object(
                   'borrowing_id', br.borrowing_id,
                   'patron_id', p.patron_id,
                   'patron_name', u.name,
                   'checkout_date', br.checkout_date,
                   'due_date', br.due_date
               )
                FROM borrowings br
                JOIN patrons p ON br.patron_id = p.patron_id
                JOIN users u ON p.user_id = u.user_id
                WHERE br.item_id = i.item_id AND br.status = 'active'
               ) as active_borrowing
        FROM items i
        JOIN books b ON i.book_id = b.book_id
        WHERE i.barcode = %s
    """

    item = execute_query(query, (barcode,), fetch_one=True)

    if not item:
        return jsonify({"error": "Item not found"}), 404

    return jsonify(dict(item)), 200

@admin_items_bp.route('/items/search', methods=['GET'])
@jwt_required()
def search_items():
    """Search items for autocomplete (by barcode, accession number, or title)"""
    search = request.args.get('q', '')
    status = request.args.get('status', 'available')  # Default to available items

    if len(search) < 2:
        return jsonify([]), 200

    where_clauses = [
        "(i.barcode ILIKE %s OR i.accession_number ILIKE %s OR b.title ILIKE %s)"
    ]
    params = [f'%{search}%', f'%{search}%', f'%{search}%']

    if status:
        where_clauses.append("i.circulation_status = %s")
        params.append(status)

    where_sql = "WHERE " + " AND ".join(where_clauses)

    query = f"""
        SELECT i.item_id, i.barcode, i.accession_number,
               i.circulation_status, i.shelf_location,
               b.book_id, b.title, b.isbn, b.cover_image_url
        FROM items i
        JOIN books b ON i.book_id = b.book_id
        {where_sql}
        ORDER BY i.circulation_status = 'available' DESC, b.title
        LIMIT 20
    """

    items = execute_query(query, tuple(params), fetch_all=True)
    return jsonify([dict(item) for item in (items or [])]), 200

@admin_items_bp.route('/items', methods=['POST'])
@jwt_required()
@admin_required
def add_item():
    """Add a new item (copy) to a book"""
    data = request.get_json()

    required_fields = ['book_id', 'barcode']
    if not all(field in data for field in required_fields):
        return jsonify({"error": "Missing required fields: book_id, barcode"}), 400

    # Check if book exists
    book_check = "SELECT book_id FROM books WHERE book_id = %s"
    book_exists = execute_query(book_check, (data['book_id'],), fetch_one=True)

    if not book_exists:
        return jsonify({"error": "Invalid book_id"}), 400

    # Check if barcode already exists
    barcode_check = "SELECT item_id FROM items WHERE barcode = %s"
    existing_barcode = execute_query(barcode_check, (data['barcode'],), fetch_one=True)

    if existing_barcode:
        return jsonify({"error": "Barcode already exists"}), 400

    query = """
        INSERT INTO items
        (book_id, barcode, accession_number, call_number, shelf_location,
         current_location, circulation_status, condition, condition_notes,
         acquisition_date, acquisition_price, acquisition_source, notes)
        VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
        RETURNING item_id
    """

    with get_db_cursor() as cursor:
        cursor.execute(query, (
            data['book_id'],
            data['barcode'],
            data.get('accession_number'),
            data.get('call_number'),
            data.get('shelf_location'),
            data.get('current_location'),
            data.get('circulation_status', 'available'),
            data.get('condition'),
            data.get('condition_notes'),
            data.get('acquisition_date'),
            data.get('acquisition_price'),
            data.get('acquisition_source'),
            data.get('notes')
        ))

        item_id = cursor.fetchone()['item_id']

        # Refresh materialized view
        cursor.execute("REFRESH MATERIALIZED VIEW mv_book_availability")

        return jsonify({
            "message": "Item added successfully",
            "item_id": item_id
        }), 201

@admin_items_bp.route('/items/<int:item_id>', methods=['PUT'])
@jwt_required()
@admin_required
def update_item(item_id):
    """Update item information"""
    data = request.get_json()

    # Check if item exists
    check_query = "SELECT item_id FROM items WHERE item_id = %s"
    item = execute_query(check_query, (item_id,), fetch_one=True)

    if not item:
        return jsonify({"error": "Item not found"}), 404

    # Build update query dynamically
    update_fields = []
    params = []

    updatable_fields = [
        'barcode', 'accession_number', 'call_number', 'shelf_location',
        'current_location', 'circulation_status', 'condition', 'condition_notes',
        'acquisition_date', 'acquisition_price', 'acquisition_source', 'notes'
    ]

    for field in updatable_fields:
        if field in data:
            # If updating barcode, check for duplicates
            if field == 'barcode':
                barcode_check = "SELECT item_id FROM items WHERE barcode = %s AND item_id != %s"
                existing = execute_query(barcode_check, (data['barcode'], item_id), fetch_one=True)
                if existing:
                    return jsonify({"error": "Barcode already exists"}), 400

            update_fields.append(f"{field} = %s")
            params.append(data[field])

    if not update_fields:
        return jsonify({"error": "No fields to update"}), 400

    params.append(item_id)

    query = f"""
        UPDATE items
        SET {', '.join(update_fields)}
        WHERE item_id = %s
    """

    with get_db_cursor() as cursor:
        cursor.execute(query, tuple(params))

        # If circulation status changed, refresh materialized view
        if 'circulation_status' in data:
            cursor.execute("REFRESH MATERIALIZED VIEW mv_book_availability")

    return jsonify({"message": "Item updated successfully"}), 200

@admin_items_bp.route('/items/<int:item_id>/status', methods=['PATCH'])
@jwt_required()
@admin_required
def update_item_status(item_id):
    """Update item circulation status"""
    data = request.get_json()
    status = data.get('status')

    valid_statuses = [
        'available', 'checked_out', 'on_hold', 'in_transit', 'in_processing',
        'in_repair', 'lost', 'missing', 'damaged', 'withdrawn', 'reference_only'
    ]

    if status not in valid_statuses:
        return jsonify({"error": f"Invalid status. Must be one of: {', '.join(valid_statuses)}"}), 400

    # Check if item is currently borrowed
    if status in ['available', 'withdrawn']:
        check_query = """
            SELECT borrowing_id FROM borrowings
            WHERE item_id = %s AND status = 'active'
        """
        active_borrowing = execute_query(check_query, (item_id,), fetch_one=True)

        if active_borrowing:
            return jsonify({
                "error": "Cannot change status while item is borrowed. Return the item first."
            }), 400

    with get_db_cursor() as cursor:
        query = "UPDATE items SET circulation_status = %s WHERE item_id = %s"
        cursor.execute(query, (status, item_id))

        if cursor.rowcount == 0:
            return jsonify({"error": "Item not found"}), 404

        # Refresh materialized view
        cursor.execute("REFRESH MATERIALIZED VIEW mv_book_availability")

    return jsonify({"message": "Item status updated successfully"}), 200

@admin_items_bp.route('/items/<int:item_id>', methods=['DELETE'])
@jwt_required()
@admin_required
def delete_item(item_id):
    """Delete an item (only if never borrowed)"""
    # Check if item has borrowing history
    check_query = """
        SELECT COUNT(*) as borrowing_count
        FROM borrowings
        WHERE item_id = %s
    """
    result = execute_query(check_query, (item_id,), fetch_one=True)

    if result and result['borrowing_count'] > 0:
        return jsonify({
            "error": f"Cannot delete item. Has borrowing history ({result['borrowing_count']} records)."
        }), 400

    with get_db_cursor() as cursor:
        query = "DELETE FROM items WHERE item_id = %s"
        cursor.execute(query, (item_id,))

        if cursor.rowcount == 0:
            return jsonify({"error": "Item not found"}), 404

        # Refresh materialized view
        cursor.execute("REFRESH MATERIALIZED VIEW mv_book_availability")

    return jsonify({"message": "Item deleted successfully"}), 200

@admin_items_bp.route('/items/statuses', methods=['GET'])
@jwt_required()
def get_item_statuses():
    """Get all valid item circulation statuses"""
    statuses = [
        {'value': 'available', 'label': 'Available'},
        {'value': 'checked_out', 'label': 'Checked Out'},
        {'value': 'on_hold', 'label': 'On Hold'},
        {'value': 'in_transit', 'label': 'In Transit'},
        {'value': 'in_processing', 'label': 'In Processing'},
        {'value': 'in_repair', 'label': 'In Repair'},
        {'value': 'lost', 'label': 'Lost'},
        {'value': 'missing', 'label': 'Missing'},
        {'value': 'damaged', 'label': 'Damaged'},
        {'value': 'withdrawn', 'label': 'Withdrawn'},
        {'value': 'reference_only', 'label': 'Reference Only'}
    ]
    return jsonify(statuses), 200
