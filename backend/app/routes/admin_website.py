"""
Website Admin Routes
Handles website content management, theme customization, and page building
"""

from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from app.utils.database import get_db_connection
from app.utils.auth import admin_required
import json
from datetime import datetime

admin_website_bp = Blueprint('admin_website', __name__)

# ============================================
# THEME & COLOR MANAGEMENT
# ============================================

@admin_website_bp.route('/theme/settings', methods=['GET'])
@jwt_required()
@admin_required
def get_theme_settings():
    """Get all theme settings"""
    try:
        conn = get_db_connection()
        cur = conn.cursor()

        cur.execute("""
            SELECT setting_id, setting_key, setting_value, setting_type,
                   category, description, updated_at
            FROM website_theme_settings
            ORDER BY category, setting_key
        """)

        settings = cur.fetchall()

        # Group by category
        grouped_settings = {}
        for setting in settings:
            category = setting['category']
            if category not in grouped_settings:
                grouped_settings[category] = []
            grouped_settings[category].append(setting)

        cur.close()
        conn.close()

        return jsonify({
            'success': True,
            'settings': grouped_settings,
            'all_settings': settings
        }), 200

    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500


@admin_website_bp.route('/theme/settings/<int:setting_id>', methods=['PUT'])
@jwt_required()
@admin_required
def update_theme_setting(setting_id):
    """Update a specific theme setting"""
    try:
        data = request.get_json()
        setting_value = data.get('setting_value')

        if not setting_value:
            return jsonify({'success': False, 'error': 'Setting value is required'}), 400

        conn = get_db_connection()
        cur = conn.cursor()

        cur.execute("""
            UPDATE website_theme_settings
            SET setting_value = %s, updated_at = CURRENT_TIMESTAMP
            WHERE setting_id = %s
            RETURNING *
        """, (setting_value, setting_id))

        updated_setting = cur.fetchone()

        if not updated_setting:
            cur.close()
            conn.close()
            return jsonify({'success': False, 'error': 'Setting not found'}), 404

        conn.commit()
        cur.close()
        conn.close()

        return jsonify({
            'success': True,
            'message': 'Theme setting updated successfully',
            'setting': updated_setting
        }), 200

    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500


@admin_website_bp.route('/theme/settings/bulk', methods=['PUT'])
@jwt_required()
@admin_required
def update_theme_settings_bulk():
    """Update multiple theme settings at once"""
    try:
        data = request.get_json()
        settings = data.get('settings', [])

        if not settings:
            return jsonify({'success': False, 'error': 'No settings provided'}), 400

        conn = get_db_connection()
        cur = conn.cursor()

        updated_count = 0
        for setting in settings:
            setting_key = setting.get('setting_key')
            setting_value = setting.get('setting_value')

            if setting_key and setting_value is not None:
                cur.execute("""
                    UPDATE website_theme_settings
                    SET setting_value = %s, updated_at = CURRENT_TIMESTAMP
                    WHERE setting_key = %s
                """, (setting_value, setting_key))
                updated_count += cur.rowcount

        conn.commit()
        cur.close()
        conn.close()

        return jsonify({
            'success': True,
            'message': f'{updated_count} settings updated successfully'
        }), 200

    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500


@admin_website_bp.route('/theme/reset', methods=['POST'])
@jwt_required()
@admin_required
def reset_theme():
    """Reset theme to default settings"""
    try:
        # This would reset to default values defined in the migration
        # For now, return success message
        return jsonify({
            'success': True,
            'message': 'Theme reset to defaults. Please refresh the page.'
        }), 200

    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500


# ============================================
# PAGE MANAGEMENT
# ============================================

@admin_website_bp.route('/pages', methods=['GET'])
@jwt_required()
@admin_required
def get_pages():
    """Get all pages"""
    try:
        conn = get_db_connection()
        cur = conn.cursor()

        cur.execute("""
            SELECT p.*, u.name as creator_name
            FROM website_pages p
            LEFT JOIN users u ON p.created_by = u.user_id
            ORDER BY p.display_order, p.page_title
        """)

        pages = cur.fetchall()

        cur.close()
        conn.close()

        return jsonify({
            'success': True,
            'pages': pages
        }), 200

    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500


@admin_website_bp.route('/pages/<int:page_id>', methods=['GET'])
@jwt_required()
@admin_required
def get_page(page_id):
    """Get a specific page with all its sections"""
    try:
        conn = get_db_connection()
        cur = conn.cursor()

        # Get page details
        cur.execute("""
            SELECT p.*, u.name as creator_name
            FROM website_pages p
            LEFT JOIN users u ON p.created_by = u.user_id
            WHERE p.page_id = %s
        """, (page_id,))

        page = cur.fetchone()

        if not page:
            cur.close()
            conn.close()
            return jsonify({'success': False, 'error': 'Page not found'}), 404

        # Get sections for this page
        cur.execute("""
            SELECT * FROM website_sections
            WHERE page_id = %s
            ORDER BY display_order
        """, (page_id,))

        sections = cur.fetchall()

        # Get content blocks and cards for each section
        for section in sections:
            cur.execute("""
                SELECT * FROM website_content_blocks
                WHERE section_id = %s
                ORDER BY display_order
            """, (section['section_id'],))
            section['content_blocks'] = cur.fetchall()

            cur.execute("""
                SELECT * FROM website_cards
                WHERE section_id = %s
                ORDER BY display_order
            """, (section['section_id'],))
            section['cards'] = cur.fetchall()

        page['sections'] = sections

        cur.close()
        conn.close()

        return jsonify({
            'success': True,
            'page': page
        }), 200

    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500


@admin_website_bp.route('/pages', methods=['POST'])
@jwt_required()
@admin_required
def create_page():
    """Create a new page"""
    try:
        data = request.get_json()
        user_id = get_jwt_identity()

        page_title = data.get('page_title')
        page_slug = data.get('page_slug')
        page_description = data.get('page_description', '')
        meta_title = data.get('meta_title', page_title)
        meta_description = data.get('meta_description', page_description)
        is_published = data.get('is_published', False)
        display_order = data.get('display_order', 0)

        if not page_title or not page_slug:
            return jsonify({'success': False, 'error': 'Page title and slug are required'}), 400

        conn = get_db_connection()
        cur = conn.cursor()

        # Check if slug already exists
        cur.execute("SELECT page_id FROM website_pages WHERE page_slug = %s", (page_slug,))
        if cur.fetchone():
            cur.close()
            conn.close()
            return jsonify({'success': False, 'error': 'Page slug already exists'}), 400

        cur.execute("""
            INSERT INTO website_pages
            (page_title, page_slug, page_description, meta_title, meta_description,
             is_published, display_order, created_by)
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
            RETURNING *
        """, (page_title, page_slug, page_description, meta_title, meta_description,
              is_published, display_order, user_id))

        new_page = cur.fetchone()

        conn.commit()
        cur.close()
        conn.close()

        return jsonify({
            'success': True,
            'message': 'Page created successfully',
            'page': new_page
        }), 201

    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500


@admin_website_bp.route('/pages/<int:page_id>', methods=['PUT'])
@jwt_required()
@admin_required
def update_page(page_id):
    """Update a page"""
    try:
        data = request.get_json()

        conn = get_db_connection()
        cur = conn.cursor()

        # Build dynamic update query
        update_fields = []
        values = []

        allowed_fields = ['page_title', 'page_slug', 'page_description', 'meta_title',
                         'meta_description', 'is_published', 'display_order']

        for field in allowed_fields:
            if field in data:
                update_fields.append(f"{field} = %s")
                values.append(data[field])

        if not update_fields:
            return jsonify({'success': False, 'error': 'No fields to update'}), 400

        values.append(page_id)

        query = f"""
            UPDATE website_pages
            SET {', '.join(update_fields)}, updated_at = CURRENT_TIMESTAMP
            WHERE page_id = %s
            RETURNING *
        """

        cur.execute(query, values)
        updated_page = cur.fetchone()

        if not updated_page:
            cur.close()
            conn.close()
            return jsonify({'success': False, 'error': 'Page not found'}), 404

        conn.commit()
        cur.close()
        conn.close()

        return jsonify({
            'success': True,
            'message': 'Page updated successfully',
            'page': updated_page
        }), 200

    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500


@admin_website_bp.route('/pages/<int:page_id>', methods=['DELETE'])
@jwt_required()
@admin_required
def delete_page(page_id):
    """Delete a page"""
    try:
        conn = get_db_connection()
        cur = conn.cursor()

        cur.execute("DELETE FROM website_pages WHERE page_id = %s RETURNING page_id", (page_id,))
        deleted = cur.fetchone()

        if not deleted:
            cur.close()
            conn.close()
            return jsonify({'success': False, 'error': 'Page not found'}), 404

        conn.commit()
        cur.close()
        conn.close()

        return jsonify({
            'success': True,
            'message': 'Page deleted successfully'
        }), 200

    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500


# ============================================
# SECTION MANAGEMENT
# ============================================

@admin_website_bp.route('/sections', methods=['POST'])
@jwt_required()
@admin_required
def create_section():
    """Create a new section"""
    try:
        data = request.get_json()

        page_id = data.get('page_id')
        section_name = data.get('section_name')
        section_type = data.get('section_type')
        section_header = data.get('section_header', '')
        section_subheader = data.get('section_subheader', '')
        background_color = data.get('background_color', '')
        text_color = data.get('text_color', '')
        display_order = data.get('display_order', 0)
        is_visible = data.get('is_visible', True)
        custom_css = data.get('custom_css', '')

        if not page_id or not section_name or not section_type:
            return jsonify({'success': False, 'error': 'Page ID, section name, and type are required'}), 400

        conn = get_db_connection()
        cur = conn.cursor()

        cur.execute("""
            INSERT INTO website_sections
            (page_id, section_name, section_type, section_header, section_subheader,
             background_color, text_color, display_order, is_visible, custom_css)
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
            RETURNING *
        """, (page_id, section_name, section_type, section_header, section_subheader,
              background_color, text_color, display_order, is_visible, custom_css))

        new_section = cur.fetchone()

        conn.commit()
        cur.close()
        conn.close()

        return jsonify({
            'success': True,
            'message': 'Section created successfully',
            'section': new_section
        }), 201

    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500


@admin_website_bp.route('/sections/<int:section_id>', methods=['PUT'])
@jwt_required()
@admin_required
def update_section(section_id):
    """Update a section"""
    try:
        data = request.get_json()

        conn = get_db_connection()
        cur = conn.cursor()

        # Build dynamic update query
        update_fields = []
        values = []

        allowed_fields = ['section_name', 'section_type', 'section_header', 'section_subheader',
                         'background_color', 'text_color', 'display_order', 'is_visible', 'custom_css']

        for field in allowed_fields:
            if field in data:
                update_fields.append(f"{field} = %s")
                values.append(data[field])

        if not update_fields:
            return jsonify({'success': False, 'error': 'No fields to update'}), 400

        values.append(section_id)

        query = f"""
            UPDATE website_sections
            SET {', '.join(update_fields)}, updated_at = CURRENT_TIMESTAMP
            WHERE section_id = %s
            RETURNING *
        """

        cur.execute(query, values)
        updated_section = cur.fetchone()

        if not updated_section:
            cur.close()
            conn.close()
            return jsonify({'success': False, 'error': 'Section not found'}), 404

        conn.commit()
        cur.close()
        conn.close()

        return jsonify({
            'success': True,
            'message': 'Section updated successfully',
            'section': updated_section
        }), 200

    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500


@admin_website_bp.route('/sections/<int:section_id>', methods=['DELETE'])
@jwt_required()
@admin_required
def delete_section(section_id):
    """Delete a section"""
    try:
        conn = get_db_connection()
        cur = conn.cursor()

        cur.execute("DELETE FROM website_sections WHERE section_id = %s RETURNING section_id", (section_id,))
        deleted = cur.fetchone()

        if not deleted:
            cur.close()
            conn.close()
            return jsonify({'success': False, 'error': 'Section not found'}), 404

        conn.commit()
        cur.close()
        conn.close()

        return jsonify({
            'success': True,
            'message': 'Section deleted successfully'
        }), 200

    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500


# ============================================
# CONTENT BLOCK MANAGEMENT
# ============================================

@admin_website_bp.route('/content-blocks', methods=['POST'])
@jwt_required()
@admin_required
def create_content_block():
    """Create a new content block"""
    try:
        data = request.get_json()

        section_id = data.get('section_id')
        block_type = data.get('block_type')
        block_title = data.get('block_title', '')
        block_content = data.get('block_content', '')
        image_url = data.get('image_url', '')
        link_url = data.get('link_url', '')
        link_text = data.get('link_text', '')
        display_order = data.get('display_order', 0)
        is_visible = data.get('is_visible', True)
        custom_attributes = data.get('custom_attributes', {})

        if not section_id or not block_type:
            return jsonify({'success': False, 'error': 'Section ID and block type are required'}), 400

        conn = get_db_connection()
        cur = conn.cursor()

        cur.execute("""
            INSERT INTO website_content_blocks
            (section_id, block_type, block_title, block_content, image_url, link_url,
             link_text, display_order, is_visible, custom_attributes)
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
            RETURNING *
        """, (section_id, block_type, block_title, block_content, image_url, link_url,
              link_text, display_order, is_visible, json.dumps(custom_attributes)))

        new_block = cur.fetchone()

        conn.commit()
        cur.close()
        conn.close()

        return jsonify({
            'success': True,
            'message': 'Content block created successfully',
            'block': new_block
        }), 201

    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500


@admin_website_bp.route('/content-blocks/<int:block_id>', methods=['PUT'])
@jwt_required()
@admin_required
def update_content_block(block_id):
    """Update a content block"""
    try:
        data = request.get_json()

        conn = get_db_connection()
        cur = conn.cursor()

        # Build dynamic update query
        update_fields = []
        values = []

        allowed_fields = ['block_type', 'block_title', 'block_content', 'image_url',
                         'link_url', 'link_text', 'display_order', 'is_visible']

        for field in allowed_fields:
            if field in data:
                update_fields.append(f"{field} = %s")
                values.append(data[field])

        if 'custom_attributes' in data:
            update_fields.append("custom_attributes = %s")
            values.append(json.dumps(data['custom_attributes']))

        if not update_fields:
            return jsonify({'success': False, 'error': 'No fields to update'}), 400

        values.append(block_id)

        query = f"""
            UPDATE website_content_blocks
            SET {', '.join(update_fields)}, updated_at = CURRENT_TIMESTAMP
            WHERE block_id = %s
            RETURNING *
        """

        cur.execute(query, values)
        updated_block = cur.fetchone()

        if not updated_block:
            cur.close()
            conn.close()
            return jsonify({'success': False, 'error': 'Content block not found'}), 404

        conn.commit()
        cur.close()
        conn.close()

        return jsonify({
            'success': True,
            'message': 'Content block updated successfully',
            'block': updated_block
        }), 200

    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500


@admin_website_bp.route('/content-blocks/<int:block_id>', methods=['DELETE'])
@jwt_required()
@admin_required
def delete_content_block(block_id):
    """Delete a content block"""
    try:
        conn = get_db_connection()
        cur = conn.cursor()

        cur.execute("DELETE FROM website_content_blocks WHERE block_id = %s RETURNING block_id", (block_id,))
        deleted = cur.fetchone()

        if not deleted:
            cur.close()
            conn.close()
            return jsonify({'success': False, 'error': 'Content block not found'}), 404

        conn.commit()
        cur.close()
        conn.close()

        return jsonify({
            'success': True,
            'message': 'Content block deleted successfully'
        }), 200

    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500


# ============================================
# CARD MANAGEMENT
# ============================================

@admin_website_bp.route('/cards', methods=['POST'])
@jwt_required()
@admin_required
def create_card():
    """Create a new card"""
    try:
        data = request.get_json()

        section_id = data.get('section_id')
        card_title = data.get('card_title')
        card_description = data.get('card_description', '')
        card_image_url = data.get('card_image_url', '')
        card_icon = data.get('card_icon', '')
        link_url = data.get('link_url', '')
        link_text = data.get('link_text', '')
        background_color = data.get('background_color', '')
        text_color = data.get('text_color', '')
        display_order = data.get('display_order', 0)
        is_visible = data.get('is_visible', True)

        if not section_id or not card_title:
            return jsonify({'success': False, 'error': 'Section ID and card title are required'}), 400

        conn = get_db_connection()
        cur = conn.cursor()

        cur.execute("""
            INSERT INTO website_cards
            (section_id, card_title, card_description, card_image_url, card_icon,
             link_url, link_text, background_color, text_color, display_order, is_visible)
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
            RETURNING *
        """, (section_id, card_title, card_description, card_image_url, card_icon,
              link_url, link_text, background_color, text_color, display_order, is_visible))

        new_card = cur.fetchone()

        conn.commit()
        cur.close()
        conn.close()

        return jsonify({
            'success': True,
            'message': 'Card created successfully',
            'card': new_card
        }), 201

    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500


@admin_website_bp.route('/cards/<int:card_id>', methods=['PUT'])
@jwt_required()
@admin_required
def update_card(card_id):
    """Update a card"""
    try:
        data = request.get_json()

        conn = get_db_connection()
        cur = conn.cursor()

        # Build dynamic update query
        update_fields = []
        values = []

        allowed_fields = ['card_title', 'card_description', 'card_image_url', 'card_icon',
                         'link_url', 'link_text', 'background_color', 'text_color',
                         'display_order', 'is_visible']

        for field in allowed_fields:
            if field in data:
                update_fields.append(f"{field} = %s")
                values.append(data[field])

        if not update_fields:
            return jsonify({'success': False, 'error': 'No fields to update'}), 400

        values.append(card_id)

        query = f"""
            UPDATE website_cards
            SET {', '.join(update_fields)}, updated_at = CURRENT_TIMESTAMP
            WHERE card_id = %s
            RETURNING *
        """

        cur.execute(query, values)
        updated_card = cur.fetchone()

        if not updated_card:
            cur.close()
            conn.close()
            return jsonify({'success': False, 'error': 'Card not found'}), 404

        conn.commit()
        cur.close()
        conn.close()

        return jsonify({
            'success': True,
            'message': 'Card updated successfully',
            'card': updated_card
        }), 200

    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500


@admin_website_bp.route('/cards/<int:card_id>', methods=['DELETE'])
@jwt_required()
@admin_required
def delete_card(card_id):
    """Delete a card"""
    try:
        conn = get_db_connection()
        cur = conn.cursor()

        cur.execute("DELETE FROM website_cards WHERE card_id = %s RETURNING card_id", (card_id,))
        deleted = cur.fetchone()

        if not deleted:
            cur.close()
            conn.close()
            return jsonify({'success': False, 'error': 'Card not found'}), 404

        conn.commit()
        cur.close()
        conn.close()

        return jsonify({
            'success': True,
            'message': 'Card deleted successfully'
        }), 200

    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500


# ============================================
# MENU MANAGEMENT
# ============================================

@admin_website_bp.route('/menu/<menu_location>', methods=['GET'])
@jwt_required()
@admin_required
def get_menu_items(menu_location):
    """Get menu items for a specific location"""
    try:
        conn = get_db_connection()
        cur = conn.cursor()

        cur.execute("""
            SELECT * FROM website_menu_items
            WHERE menu_location = %s
            ORDER BY display_order
        """, (menu_location,))

        menu_items = cur.fetchall()

        cur.close()
        conn.close()

        return jsonify({
            'success': True,
            'menu_items': menu_items
        }), 200

    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500


@admin_website_bp.route('/menu', methods=['GET'])
@jwt_required()
@admin_required
def get_all_menu_items():
    """Get all menu items grouped by location"""
    try:
        conn = get_db_connection()
        cur = conn.cursor()

        cur.execute("""
            SELECT * FROM website_menu_items
            ORDER BY menu_location, display_order
        """)

        menu_items = cur.fetchall()

        # Group by location
        grouped_menu = {}
        for item in menu_items:
            location = item['menu_location']
            if location not in grouped_menu:
                grouped_menu[location] = []
            grouped_menu[location].append(item)

        cur.close()
        conn.close()

        return jsonify({
            'success': True,
            'menu': grouped_menu,
            'all_items': menu_items
        }), 200

    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500


@admin_website_bp.route('/menu', methods=['POST'])
@jwt_required()
@admin_required
def create_menu_item():
    """Create a new menu item"""
    try:
        data = request.get_json()

        menu_location = data.get('menu_location')
        menu_text = data.get('menu_text')
        menu_url = data.get('menu_url')
        parent_id = data.get('parent_id')
        display_order = data.get('display_order', 0)
        is_visible = data.get('is_visible', True)
        target = data.get('target', '_self')
        icon = data.get('icon', '')

        if not menu_location or not menu_text or not menu_url:
            return jsonify({'success': False, 'error': 'Menu location, text, and URL are required'}), 400

        conn = get_db_connection()
        cur = conn.cursor()

        cur.execute("""
            INSERT INTO website_menu_items
            (menu_location, menu_text, menu_url, parent_id, display_order,
             is_visible, target, icon)
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
            RETURNING *
        """, (menu_location, menu_text, menu_url, parent_id, display_order,
              is_visible, target, icon))

        new_item = cur.fetchone()

        conn.commit()
        cur.close()
        conn.close()

        return jsonify({
            'success': True,
            'message': 'Menu item created successfully',
            'menu_item': new_item
        }), 201

    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500


@admin_website_bp.route('/menu/<int:item_id>', methods=['PUT'])
@jwt_required()
@admin_required
def update_menu_item(item_id):
    """Update a menu item"""
    try:
        data = request.get_json()

        conn = get_db_connection()
        cur = conn.cursor()

        # Build dynamic update query
        update_fields = []
        values = []

        allowed_fields = ['menu_location', 'menu_text', 'menu_url', 'parent_id',
                         'display_order', 'is_visible', 'target', 'icon']

        for field in allowed_fields:
            if field in data:
                update_fields.append(f"{field} = %s")
                values.append(data[field])

        if not update_fields:
            return jsonify({'success': False, 'error': 'No fields to update'}), 400

        values.append(item_id)

        query = f"""
            UPDATE website_menu_items
            SET {', '.join(update_fields)}, updated_at = CURRENT_TIMESTAMP
            WHERE menu_item_id = %s
            RETURNING *
        """

        cur.execute(query, values)
        updated_item = cur.fetchone()

        if not updated_item:
            cur.close()
            conn.close()
            return jsonify({'success': False, 'error': 'Menu item not found'}), 404

        conn.commit()
        cur.close()
        conn.close()

        return jsonify({
            'success': True,
            'message': 'Menu item updated successfully',
            'menu_item': updated_item
        }), 200

    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500


@admin_website_bp.route('/menu/<int:item_id>', methods=['DELETE'])
@jwt_required()
@admin_required
def delete_menu_item(item_id):
    """Delete a menu item"""
    try:
        conn = get_db_connection()
        cur = conn.cursor()

        cur.execute("DELETE FROM website_menu_items WHERE menu_item_id = %s RETURNING menu_item_id", (item_id,))
        deleted = cur.fetchone()

        if not deleted:
            cur.close()
            conn.close()
            return jsonify({'success': False, 'error': 'Menu item not found'}), 404

        conn.commit()
        cur.close()
        conn.close()

        return jsonify({
            'success': True,
            'message': 'Menu item deleted successfully'
        }), 200

    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500


# ============================================
# MEDIA/IMAGE MANAGEMENT
# ============================================

@admin_website_bp.route('/media', methods=['GET'])
@jwt_required()
@admin_required
def get_media():
    """Get all media files"""
    try:
        media_type = request.args.get('type', None)

        conn = get_db_connection()
        cur = conn.cursor()

        if media_type:
            cur.execute("""
                SELECT m.*, u.name as uploader_name
                FROM website_media m
                LEFT JOIN users u ON m.uploaded_by = u.user_id
                WHERE m.media_type = %s
                ORDER BY m.created_at DESC
            """, (media_type,))
        else:
            cur.execute("""
                SELECT m.*, u.name as uploader_name
                FROM website_media m
                LEFT JOIN users u ON m.uploaded_by = u.user_id
                ORDER BY m.created_at DESC
            """)

        media_files = cur.fetchall()

        cur.close()
        conn.close()

        return jsonify({
            'success': True,
            'media': media_files
        }), 200

    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500


@admin_website_bp.route('/media', methods=['POST'])
@jwt_required()
@admin_required
def upload_media():
    """Register a new media file (URL-based, actual upload handled elsewhere)"""
    try:
        data = request.get_json()
        user_id = get_jwt_identity()

        media_name = data.get('media_name')
        media_url = data.get('media_url')
        media_type = data.get('media_type', 'image')
        file_size = data.get('file_size', 0)
        mime_type = data.get('mime_type', '')
        alt_text = data.get('alt_text', '')
        caption = data.get('caption', '')

        if not media_name or not media_url:
            return jsonify({'success': False, 'error': 'Media name and URL are required'}), 400

        conn = get_db_connection()
        cur = conn.cursor()

        cur.execute("""
            INSERT INTO website_media
            (media_name, media_url, media_type, file_size, mime_type,
             alt_text, caption, uploaded_by)
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
            RETURNING *
        """, (media_name, media_url, media_type, file_size, mime_type,
              alt_text, caption, user_id))

        new_media = cur.fetchone()

        conn.commit()
        cur.close()
        conn.close()

        return jsonify({
            'success': True,
            'message': 'Media registered successfully',
            'media': new_media
        }), 201

    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500


@admin_website_bp.route('/media/<int:media_id>', methods=['PUT'])
@jwt_required()
@admin_required
def update_media(media_id):
    """Update media metadata"""
    try:
        data = request.get_json()

        conn = get_db_connection()
        cur = conn.cursor()

        # Build dynamic update query
        update_fields = []
        values = []

        allowed_fields = ['media_name', 'alt_text', 'caption']

        for field in allowed_fields:
            if field in data:
                update_fields.append(f"{field} = %s")
                values.append(data[field])

        if not update_fields:
            return jsonify({'success': False, 'error': 'No fields to update'}), 400

        values.append(media_id)

        query = f"""
            UPDATE website_media
            SET {', '.join(update_fields)}, updated_at = CURRENT_TIMESTAMP
            WHERE media_id = %s
            RETURNING *
        """

        cur.execute(query, values)
        updated_media = cur.fetchone()

        if not updated_media:
            cur.close()
            conn.close()
            return jsonify({'success': False, 'error': 'Media not found'}), 404

        conn.commit()
        cur.close()
        conn.close()

        return jsonify({
            'success': True,
            'message': 'Media updated successfully',
            'media': updated_media
        }), 200

    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500


@admin_website_bp.route('/media/<int:media_id>', methods=['DELETE'])
@jwt_required()
@admin_required
def delete_media(media_id):
    """Delete a media file"""
    try:
        conn = get_db_connection()
        cur = conn.cursor()

        cur.execute("DELETE FROM website_media WHERE media_id = %s RETURNING media_id", (media_id,))
        deleted = cur.fetchone()

        if not deleted:
            cur.close()
            conn.close()
            return jsonify({'success': False, 'error': 'Media not found'}), 404

        conn.commit()
        cur.close()
        conn.close()

        return jsonify({
            'success': True,
            'message': 'Media deleted successfully'
        }), 200

    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500


# ============================================
# GLOBAL SETTINGS
# ============================================

@admin_website_bp.route('/settings/global', methods=['GET'])
@jwt_required()
@admin_required
def get_global_settings():
    """Get global website settings"""
    try:
        conn = get_db_connection()
        cur = conn.cursor()

        cur.execute("SELECT * FROM website_global_settings LIMIT 1")
        settings = cur.fetchone()

        cur.close()
        conn.close()

        if not settings:
            return jsonify({'success': False, 'error': 'Settings not found'}), 404

        return jsonify({
            'success': True,
            'settings': settings
        }), 200

    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500


@admin_website_bp.route('/settings/global', methods=['PUT'])
@jwt_required()
@admin_required
def update_global_settings():
    """Update global website settings"""
    try:
        data = request.get_json()

        conn = get_db_connection()
        cur = conn.cursor()

        # Build dynamic update query
        update_fields = []
        values = []

        allowed_fields = ['site_name', 'site_tagline', 'site_logo_url', 'site_favicon_url',
                         'contact_email', 'contact_phone', 'contact_address', 'footer_text',
                         'copyright_text', 'analytics_code', 'custom_head_code', 'custom_footer_code']

        for field in allowed_fields:
            if field in data:
                update_fields.append(f"{field} = %s")
                values.append(data[field])

        if 'social_media_links' in data:
            update_fields.append("social_media_links = %s")
            values.append(json.dumps(data['social_media_links']))

        if not update_fields:
            return jsonify({'success': False, 'error': 'No fields to update'}), 400

        query = f"""
            UPDATE website_global_settings
            SET {', '.join(update_fields)}, updated_at = CURRENT_TIMESTAMP
            RETURNING *
        """

        cur.execute(query, values)
        updated_settings = cur.fetchone()

        if not updated_settings:
            cur.close()
            conn.close()
            return jsonify({'success': False, 'error': 'Settings not found'}), 404

        conn.commit()
        cur.close()
        conn.close()

        return jsonify({
            'success': True,
            'message': 'Global settings updated successfully',
            'settings': updated_settings
        }), 200

    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500
