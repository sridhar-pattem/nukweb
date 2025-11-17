from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required
from app.utils.auth import admin_required
from app.utils.database import execute_query

admin_rda_vocabularies_bp = Blueprint('admin_rda_vocabularies', __name__)

@admin_rda_vocabularies_bp.route('/rda/content-types', methods=['GET'])
@jwt_required()
def get_content_types():
    """Get all RDA content types"""
    query = """
        SELECT code, label, definition, examples
        FROM rda_content_types
        ORDER BY label
    """
    content_types = execute_query(query, fetch_all=True)
    return jsonify([dict(ct) for ct in (content_types or [])]), 200

@admin_rda_vocabularies_bp.route('/rda/content-types/<string:code>', methods=['GET'])
@jwt_required()
def get_content_type(code):
    """Get a specific RDA content type by code"""
    query = """
        SELECT code, label, definition, examples
        FROM rda_content_types
        WHERE code = %s
    """
    content_type = execute_query(query, (code,), fetch_one=True)

    if not content_type:
        return jsonify({"error": "Content type not found"}), 404

    return jsonify(dict(content_type)), 200

@admin_rda_vocabularies_bp.route('/rda/media-types', methods=['GET'])
@jwt_required()
def get_media_types():
    """Get all RDA media types"""
    query = """
        SELECT code, label, definition
        FROM rda_media_types
        ORDER BY label
    """
    media_types = execute_query(query, fetch_all=True)
    return jsonify([dict(mt) for mt in (media_types or [])]), 200

@admin_rda_vocabularies_bp.route('/rda/media-types/<string:code>', methods=['GET'])
@jwt_required()
def get_media_type(code):
    """Get a specific RDA media type by code"""
    query = """
        SELECT code, label, definition
        FROM rda_media_types
        WHERE code = %s
    """
    media_type = execute_query(query, (code,), fetch_one=True)

    if not media_type:
        return jsonify({"error": "Media type not found"}), 404

    return jsonify(dict(media_type)), 200

@admin_rda_vocabularies_bp.route('/rda/carrier-types', methods=['GET'])
@jwt_required()
def get_carrier_types():
    """Get all RDA carrier types, optionally filtered by media type"""
    media_type = request.args.get('media_type')

    if media_type:
        query = """
            SELECT code, label, media_type_code, definition
            FROM rda_carrier_types
            WHERE media_type_code = %s
            ORDER BY label
        """
        carrier_types = execute_query(query, (media_type,), fetch_all=True)
    else:
        query = """
            SELECT code, label, media_type_code, definition
            FROM rda_carrier_types
            ORDER BY media_type_code, label
        """
        carrier_types = execute_query(query, fetch_all=True)

    return jsonify([dict(ct) for ct in (carrier_types or [])]), 200

@admin_rda_vocabularies_bp.route('/rda/carrier-types/<string:code>', methods=['GET'])
@jwt_required()
def get_carrier_type(code):
    """Get a specific RDA carrier type by code"""
    query = """
        SELECT code, label, media_type_code, definition
        FROM rda_carrier_types
        WHERE code = %s
    """
    carrier_type = execute_query(query, (code,), fetch_one=True)

    if not carrier_type:
        return jsonify({"error": "Carrier type not found"}), 404

    return jsonify(dict(carrier_type)), 200

@admin_rda_vocabularies_bp.route('/rda/vocabularies', methods=['GET'])
@jwt_required()
def get_all_vocabularies():
    """Get all RDA vocabularies (content, media, carrier) in one response"""
    content_query = "SELECT code, label, definition, examples FROM rda_content_types ORDER BY label"
    media_query = "SELECT code, label, definition FROM rda_media_types ORDER BY label"
    carrier_query = "SELECT code, label, media_type_code, definition FROM rda_carrier_types ORDER BY media_type_code, label"

    content_types = execute_query(content_query, fetch_all=True)
    media_types = execute_query(media_query, fetch_all=True)
    carrier_types = execute_query(carrier_query, fetch_all=True)

    return jsonify({
        "content_types": [dict(ct) for ct in (content_types or [])],
        "media_types": [dict(mt) for mt in (media_types or [])],
        "carrier_types": [dict(ct) for ct in (carrier_types or [])]
    }), 200
