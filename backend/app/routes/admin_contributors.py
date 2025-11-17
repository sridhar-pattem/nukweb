from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required
from app.utils.auth import admin_required
from app.utils.database import execute_query, get_db_cursor
from app.config import Config

admin_contributors_bp = Blueprint('admin_contributors', __name__)

@admin_contributors_bp.route('/contributors', methods=['GET'])
@jwt_required()
@admin_required
def get_contributors():
    """Get all contributors with pagination and search"""
    page = request.args.get('page', 1, type=int)
    search = request.args.get('search', '')
    name_type = request.args.get('type', '')  # 'person' or 'organization'

    offset = (page - 1) * Config.ITEMS_PER_PAGE

    # Build query
    where_clauses = []
    params = []

    if search:
        where_clauses.append("(c.name ILIKE %s OR c.alternate_names::text ILIKE %s)")
        search_param = f'%{search}%'
        params.extend([search_param, search_param])

    if name_type in ['person', 'organization']:
        where_clauses.append("c.name_type = %s")
        params.append(name_type)

    where_sql = "WHERE " + " AND ".join(where_clauses) if where_clauses else ""

    # Get total count
    count_query = f"""
        SELECT COUNT(*) as total
        FROM contributors c
        {where_sql}
    """
    total_result = execute_query(count_query, tuple(params) if params else None, fetch_one=True)
    total = total_result['total'] if total_result else 0

    # Get contributors with book count
    query = f"""
        SELECT c.contributor_id, c.name, c.name_type,
               c.date_of_birth, c.date_of_death,
               c.date_established, c.date_terminated,
               c.alternate_names, c.biographical_note,
               c.authority_id, c.authority_source,
               c.created_at, c.updated_at,
               COUNT(DISTINCT bc.book_id) as book_count
        FROM contributors c
        LEFT JOIN book_contributors bc ON c.contributor_id = bc.contributor_id
        {where_sql}
        GROUP BY c.contributor_id
        ORDER BY c.name
        LIMIT %s OFFSET %s
    """
    params.extend([Config.ITEMS_PER_PAGE, offset])

    contributors = execute_query(query, tuple(params), fetch_all=True)

    return jsonify({
        "contributors": [dict(c) for c in (contributors or [])],
        "total": total,
        "page": page,
        "per_page": Config.ITEMS_PER_PAGE,
        "total_pages": (total + Config.ITEMS_PER_PAGE - 1) // Config.ITEMS_PER_PAGE
    }), 200

@admin_contributors_bp.route('/contributors/<int:contributor_id>', methods=['GET'])
@jwt_required()
@admin_required
def get_contributor_details(contributor_id):
    """Get detailed information about a specific contributor"""
    query = """
        SELECT c.contributor_id, c.name, c.name_type,
               c.date_of_birth, c.date_of_death,
               c.date_established, c.date_terminated,
               c.alternate_names, c.biographical_note,
               c.authority_id, c.authority_source,
               c.created_at, c.updated_at
        FROM contributors c
        WHERE c.contributor_id = %s
    """

    contributor = execute_query(query, (contributor_id,), fetch_one=True)

    if not contributor:
        return jsonify({"error": "Contributor not found"}), 404

    # Get books by this contributor
    books_query = """
        SELECT b.book_id, b.title, b.subtitle, b.isbn,
               b.publication_year, bc.role, bc.sequence_number,
               ba.available_items, ba.total_items
        FROM book_contributors bc
        JOIN books b ON bc.book_id = b.book_id
        LEFT JOIN mv_book_availability ba ON b.book_id = ba.book_id
        WHERE bc.contributor_id = %s
        ORDER BY bc.role, bc.sequence_number, b.publication_year DESC
    """
    books = execute_query(books_query, (contributor_id,), fetch_all=True)

    result = dict(contributor)
    result['books'] = [dict(b) for b in (books or [])]

    return jsonify(result), 200

@admin_contributors_bp.route('/contributors/search', methods=['GET'])
@jwt_required()
def search_contributors():
    """Search contributors for autocomplete"""
    search = request.args.get('q', '')
    name_type = request.args.get('type', '')

    if len(search) < 2:
        return jsonify([]), 200

    where_clauses = ["c.name ILIKE %s"]
    params = [f'%{search}%']

    if name_type in ['person', 'organization']:
        where_clauses.append("c.name_type = %s")
        params.append(name_type)

    where_sql = "WHERE " + " AND ".join(where_clauses)

    query = f"""
        SELECT c.contributor_id, c.name, c.name_type,
               c.date_of_birth, c.date_of_death,
               c.date_established, c.date_terminated
        FROM contributors c
        {where_sql}
        ORDER BY c.name
        LIMIT 20
    """

    contributors = execute_query(query, tuple(params), fetch_all=True)
    return jsonify([dict(c) for c in (contributors or [])]), 200

@admin_contributors_bp.route('/contributors', methods=['POST'])
@jwt_required()
@admin_required
def add_contributor():
    """Add a new contributor"""
    data = request.get_json()

    required_fields = ['name', 'name_type']
    if not all(field in data for field in required_fields):
        return jsonify({"error": "Missing required fields: name, name_type"}), 400

    if data['name_type'] not in ['person', 'organization']:
        return jsonify({"error": "name_type must be 'person' or 'organization'"}), 400

    # Check for duplicate
    check_query = """
        SELECT contributor_id FROM contributors
        WHERE LOWER(name) = LOWER(%s) AND name_type = %s
    """
    existing = execute_query(check_query, (data['name'], data['name_type']), fetch_one=True)

    if existing:
        return jsonify({
            "error": "Contributor with this name already exists",
            "contributor_id": existing['contributor_id']
        }), 400

    query = """
        INSERT INTO contributors
        (name, name_type, date_of_birth, date_of_death,
         date_established, date_terminated, alternate_names,
         biographical_note, authority_id, authority_source)
        VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
        RETURNING contributor_id
    """

    with get_db_cursor() as cursor:
        cursor.execute(query, (
            data['name'],
            data['name_type'],
            data.get('date_of_birth'),
            data.get('date_of_death'),
            data.get('date_established'),
            data.get('date_terminated'),
            data.get('alternate_names'),
            data.get('biographical_note'),
            data.get('authority_id'),
            data.get('authority_source')
        ))

        contributor_id = cursor.fetchone()['contributor_id']

        return jsonify({
            "message": "Contributor added successfully",
            "contributor_id": contributor_id
        }), 201

@admin_contributors_bp.route('/contributors/<int:contributor_id>', methods=['PUT'])
@jwt_required()
@admin_required
def update_contributor(contributor_id):
    """Update contributor information"""
    data = request.get_json()

    # Check if contributor exists
    check_query = "SELECT contributor_id FROM contributors WHERE contributor_id = %s"
    contributor = execute_query(check_query, (contributor_id,), fetch_one=True)

    if not contributor:
        return jsonify({"error": "Contributor not found"}), 404

    # Build update query dynamically
    update_fields = []
    params = []

    updatable_fields = [
        'name', 'name_type', 'date_of_birth', 'date_of_death',
        'date_established', 'date_terminated', 'alternate_names',
        'biographical_note', 'authority_id', 'authority_source'
    ]

    for field in updatable_fields:
        if field in data:
            update_fields.append(f"{field} = %s")
            params.append(data[field])

    if not update_fields:
        return jsonify({"error": "No fields to update"}), 400

    if 'name_type' in data and data['name_type'] not in ['person', 'organization']:
        return jsonify({"error": "name_type must be 'person' or 'organization'"}), 400

    params.append(contributor_id)

    query = f"""
        UPDATE contributors
        SET {', '.join(update_fields)}
        WHERE contributor_id = %s
    """

    execute_query(query, tuple(params))

    return jsonify({"message": "Contributor updated successfully"}), 200

@admin_contributors_bp.route('/contributors/<int:contributor_id>', methods=['DELETE'])
@jwt_required()
@admin_required
def delete_contributor(contributor_id):
    """Delete a contributor (only if not linked to any books)"""
    # Check if contributor has books
    check_query = """
        SELECT COUNT(*) as book_count
        FROM book_contributors
        WHERE contributor_id = %s
    """
    result = execute_query(check_query, (contributor_id,), fetch_one=True)

    if result and result['book_count'] > 0:
        return jsonify({
            "error": f"Cannot delete contributor. Linked to {result['book_count']} book(s)."
        }), 400

    query = "DELETE FROM contributors WHERE contributor_id = %s"
    rows_affected = execute_query(query, (contributor_id,))

    if rows_affected == 0:
        return jsonify({"error": "Contributor not found"}), 404

    return jsonify({"message": "Contributor deleted successfully"}), 200

@admin_contributors_bp.route('/contributors/roles', methods=['GET'])
@jwt_required()
def get_contributor_roles():
    """Get all unique contributor roles used in the system"""
    query = """
        SELECT DISTINCT role
        FROM book_contributors
        ORDER BY role
    """
    roles = execute_query(query, fetch_all=True)

    # Also include common roles that might not be in use yet
    common_roles = [
        'author', 'illustrator', 'translator', 'editor',
        'photographer', 'narrator', 'composer', 'publisher',
        'contributor'
    ]

    existing_roles = [r['role'] for r in (roles or [])]
    all_roles = sorted(set(common_roles + existing_roles))

    return jsonify(all_roles), 200
