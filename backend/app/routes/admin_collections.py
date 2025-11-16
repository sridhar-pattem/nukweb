from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required
from app.utils.auth import admin_required
from app.utils.database import execute_query, get_db_cursor

admin_collections_bp = Blueprint('admin_collections', __name__)

@admin_collections_bp.route('/collections', methods=['GET'])
@jwt_required()
@admin_required
def get_collections():
    """Get all collections"""
    query = """
        SELECT c.collection_id, c.collection_name, c.description, c.created_at,
               COUNT(b.book_id) as book_count
        FROM collections c
        LEFT JOIN books b ON c.collection_id = b.collection_id
        GROUP BY c.collection_id, c.collection_name, c.description, c.created_at
        ORDER BY c.collection_name
    """
    collections = execute_query(query, fetch_all=True)
    return jsonify([dict(c) for c in (collections or [])]), 200

@admin_collections_bp.route('/collections', methods=['POST'])
@jwt_required()
@admin_required
def create_collection():
    """Create a new collection"""
    data = request.get_json()

    collection_name = data.get('collection_name', '').strip()
    description = data.get('description', '').strip()

    if not collection_name:
        return jsonify({"error": "Collection name is required"}), 400

    # Check if collection already exists
    check_query = "SELECT collection_id FROM collections WHERE collection_name = %s"
    existing = execute_query(check_query, (collection_name,), fetch_one=True)

    if existing:
        return jsonify({"error": "Collection with this name already exists"}), 400

    query = """
        INSERT INTO collections (collection_name, description)
        VALUES (%s, %s)
        RETURNING collection_id, collection_name, description, created_at
    """

    with get_db_cursor() as cursor:
        cursor.execute(query, (collection_name, description))
        collection = cursor.fetchone()

        return jsonify({
            "message": "Collection created successfully",
            "collection": dict(collection)
        }), 201

@admin_collections_bp.route('/collections/<int:collection_id>', methods=['PUT'])
@jwt_required()
@admin_required
def update_collection(collection_id):
    """Update a collection"""
    data = request.get_json()

    collection_name = data.get('collection_name', '').strip()
    description = data.get('description', '').strip()

    if not collection_name:
        return jsonify({"error": "Collection name is required"}), 400

    # Check if collection exists
    check_query = "SELECT collection_id FROM collections WHERE collection_id = %s"
    collection = execute_query(check_query, (collection_id,), fetch_one=True)

    if not collection:
        return jsonify({"error": "Collection not found"}), 404

    # Check if new name conflicts with another collection
    name_check_query = """
        SELECT collection_id FROM collections
        WHERE collection_name = %s AND collection_id != %s
    """
    name_conflict = execute_query(name_check_query, (collection_name, collection_id), fetch_one=True)

    if name_conflict:
        return jsonify({"error": "Another collection with this name already exists"}), 400

    query = """
        UPDATE collections
        SET collection_name = %s, description = %s
        WHERE collection_id = %s
        RETURNING collection_id, collection_name, description, updated_at
    """

    with get_db_cursor() as cursor:
        cursor.execute(query, (collection_name, description, collection_id))
        updated_collection = cursor.fetchone()

        return jsonify({
            "message": "Collection updated successfully",
            "collection": dict(updated_collection)
        }), 200

@admin_collections_bp.route('/collections/<int:collection_id>', methods=['DELETE'])
@jwt_required()
@admin_required
def delete_collection(collection_id):
    """Delete a collection (only if no books assigned)"""

    # Check if collection exists
    check_query = "SELECT collection_id FROM collections WHERE collection_id = %s"
    collection = execute_query(check_query, (collection_id,), fetch_one=True)

    if not collection:
        return jsonify({"error": "Collection not found"}), 404

    # Check if any books are assigned to this collection
    books_query = "SELECT COUNT(*) as count FROM books WHERE collection_id = %s"
    books_result = execute_query(books_query, (collection_id,), fetch_one=True)

    if books_result and books_result['count'] > 0:
        return jsonify({
            "error": f"Cannot delete collection. {books_result['count']} book(s) are assigned to this collection."
        }), 400

    # Delete the collection
    delete_query = "DELETE FROM collections WHERE collection_id = %s"
    rows_affected = execute_query(delete_query, (collection_id,))

    if rows_affected == 0:
        return jsonify({"error": "Failed to delete collection"}), 500

    return jsonify({"message": "Collection deleted successfully"}), 200
