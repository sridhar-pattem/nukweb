from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required
from app.utils.auth import admin_required, hash_password
from app.utils.database import execute_query, get_db_cursor
from app.config import Config

admin_patrons_bp = Blueprint('admin_patrons', __name__)

@admin_patrons_bp.route('/patrons', methods=['GET'])
@jwt_required()
@admin_required
def get_patrons():
    """Get all patrons with pagination and search"""
    page = request.args.get('page', 1, type=int)
    search = request.args.get('search', '')
    status = request.args.get('status', '')
    
    offset = (page - 1) * Config.ITEMS_PER_PAGE
    
    # Build query
    where_clauses = []
    params = []
    
    if search:
        where_clauses.append("""
            (p.first_name ILIKE %s OR p.last_name ILIKE %s OR u.email ILIKE %s OR
             CAST(p.patron_id AS TEXT) LIKE %s OR p.phone LIKE %s)
        """)
        search_param = f'%{search}%'
        params.extend([search_param, search_param, search_param, search_param, search_param])

    if status:
        if status == 'inactive':
            # Inactive = active users with expired memberships
            where_clauses.append("u.status = 'active' AND p.membership_end_date < CURRENT_DATE")
        else:
            where_clauses.append("u.status = %s")
            params.append(status)
    
    where_sql = "WHERE " + " AND ".join(where_clauses) if where_clauses else ""
    
    # Get total count
    count_query = f"""
        SELECT COUNT(*) as total
        FROM patrons p
        JOIN users u ON p.user_id = u.user_id
        {where_sql}
    """
    total_result = execute_query(count_query, tuple(params), fetch_one=True)
    total = total_result['total'] if total_result else 0
    
    # Get patrons
    query = f"""
        SELECT p.patron_id, p.first_name, p.last_name, p.membership_start_date,
               p.membership_end_date, p.address, p.phone, p.city, p.state,
               p.national_id, p.national_id_type, p.email as patron_email,
               p.secondary_phone_no, p.secondary_email, p.correspond_language,
               p.last_renewed_on_date,
               u.user_id, u.email, u.status,
               mp.plan_name, mp.duration_months, mp.price, p.membership_plan_id
        FROM patrons p
        JOIN users u ON p.user_id = u.user_id
        LEFT JOIN membership_plans mp ON p.membership_plan_id = mp.plan_id
        {where_sql}
        ORDER BY p.patron_id DESC
        LIMIT %s OFFSET %s
    """
    params.extend([Config.ITEMS_PER_PAGE, offset])
    
    patrons = execute_query(query, tuple(params), fetch_all=True)
    
    return jsonify({
        "patrons": [dict(p) for p in (patrons or [])],
        "total": total,
        "page": page,
        "per_page": Config.ITEMS_PER_PAGE,
        "total_pages": (total + Config.ITEMS_PER_PAGE - 1) // Config.ITEMS_PER_PAGE
    }), 200

@admin_patrons_bp.route('/patrons/<patron_id>', methods=['GET'])
@jwt_required()
@admin_required
def get_patron_details(patron_id):
    """Get detailed information about a patron"""
    query = """
        SELECT p.*, u.email, u.status,
               mp.plan_name, mp.duration_months, mp.price, mp.borrowing_limit
        FROM patrons p
        JOIN users u ON p.user_id = u.user_id
        LEFT JOIN membership_plans mp ON p.membership_plan_id = mp.plan_id
        WHERE p.patron_id = %s
    """
    patron = execute_query(query, (patron_id,), fetch_one=True)
    
    if not patron:
        return jsonify({"error": "Patron not found"}), 404
    
    # Get borrowing history
    borrowing_query = """
        SELECT br.borrowing_id, br.checkout_date, br.due_date, br.return_date,
               br.renewal_count, br.status,
               bk.title, bk.isbn, i.barcode,
               COALESCE((SELECT json_agg(
                   json_build_object('name', c.name, 'role', bc.role)
                   ORDER BY bc.role, bc.sequence_number
               )
                FROM book_contributors bc
                JOIN contributors c ON bc.contributor_id = c.contributor_id
                WHERE bc.book_id = bk.book_id
               ), '[]'::json) as contributors
        FROM borrowings br
        JOIN items i ON br.item_id = i.item_id
        JOIN books bk ON i.book_id = bk.book_id
        WHERE br.patron_id = %s
        ORDER BY br.checkout_date DESC
        LIMIT 10
    """
    borrowings = execute_query(borrowing_query, (patron_id,), fetch_all=True)
    
    return jsonify({
        "patron": dict(patron),
        "recent_borrowings": [dict(b) for b in (borrowings or [])]
    }), 200

@admin_patrons_bp.route('/patrons', methods=['POST'])
@jwt_required()
@admin_required
def create_patron():
    """Create a new patron"""
    data = request.get_json()

    required_fields = ['patron_id', 'email', 'first_name', 'last_name', 'membership_plan_id']
    if not all(field in data for field in required_fields):
        return jsonify({"error": "Missing required fields: patron_id, email, first_name, last_name, membership_plan_id"}), 400

    patron_id = data['patron_id'].strip().upper()

    # Validate patron_id format (alphanumeric only)
    import re
    if not re.match(r'^[A-Z0-9]+$', patron_id):
        return jsonify({"error": "Patron ID must contain only uppercase letters and numbers"}), 400

    with get_db_cursor() as cursor:
        # Check if patron_id already exists
        cursor.execute("SELECT patron_id FROM patrons WHERE patron_id = %s", (patron_id,))
        if cursor.fetchone():
            return jsonify({"error": f"Patron ID '{patron_id}' already exists. Please use a different ID."}), 400

        # Check if email already exists
        cursor.execute("SELECT user_id FROM users WHERE email = %s", (data['email'],))
        if cursor.fetchone():
            return jsonify({"error": "Email already exists"}), 400

        # Create user account
        default_password = "BookNook313"
        password_hash = hash_password(default_password)

        cursor.execute("""
            INSERT INTO users (email, password_hash, role, status)
            VALUES (%s, %s, 'patron', 'active')
            RETURNING user_id
        """, (data['email'], password_hash))

        user_id = cursor.fetchone()['user_id']

        # Get membership plan details
        cursor.execute("""
            SELECT duration_months, plan_name
            FROM membership_plans
            WHERE plan_id = %s
        """, (data['membership_plan_id'],))
        plan = cursor.fetchone()

        if not plan:
            return jsonify({"error": "Invalid membership plan"}), 400

        # Calculate membership end date
        from datetime import date
        from dateutil.relativedelta import relativedelta
        start_date = date.today()
        end_date = start_date + relativedelta(months=plan['duration_months'])

        # Create patron record with admin-provided patron_id
        cursor.execute("""
            INSERT INTO patrons
            (patron_id, user_id, membership_plan_id, first_name, last_name, date_of_birth,
             phone, address, city, state, postal_code, country,
             membership_start_date, membership_end_date,
             national_id, national_id_type, email, secondary_phone_no,
             secondary_email, correspond_language, last_renewed_on_date)
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
            RETURNING patron_id
        """, (patron_id, user_id, data['membership_plan_id'],
              data.get('first_name'), data.get('last_name'), data.get('date_of_birth'),
              data.get('phone'), data.get('address'), data.get('city'),
              data.get('state'), data.get('postal_code'), data.get('country'),
              start_date, end_date,
              data.get('national_id'), data.get('national_id_type'),
              data.get('patron_email'), data.get('secondary_phone_no'),
              data.get('secondary_email'), data.get('correspond_language', 'English'),
              start_date))

        created_patron_id = cursor.fetchone()['patron_id']

        return jsonify({
            "message": "Patron created successfully",
            "patron_id": patron_id,
            "default_password": default_password
        }), 201

@admin_patrons_bp.route('/patrons/<patron_id>', methods=['PUT'])
@jwt_required()
@admin_required
def update_patron(patron_id):
    """Update patron information"""
    data = request.get_json()

    with get_db_cursor() as cursor:
        # Check if patron exists
        cursor.execute("SELECT user_id FROM patrons WHERE patron_id = %s", (patron_id,))
        patron = cursor.fetchone()

        if not patron:
            return jsonify({"error": "Patron not found"}), 404

        # Update user information (only email is in users table)
        if 'email' in data:
            cursor.execute("""
                UPDATE users
                SET email = %s
                WHERE user_id = %s
            """, (data['email'], patron['user_id']))

        # Update patron information
        patron_fields = [
            'first_name', 'last_name', 'phone', 'address', 'city',
            'state', 'postal_code', 'country', 'date_of_birth', 'membership_plan_id',
            'national_id', 'national_id_type', 'patron_email', 'secondary_phone_no',
            'secondary_email', 'correspond_language', 'last_renewed_on_date'
        ]

        if any(k in data for k in patron_fields):
            update_fields = []
            params = []

            if 'first_name' in data:
                update_fields.append("first_name = %s")
                params.append(data['first_name'])
            if 'last_name' in data:
                update_fields.append("last_name = %s")
                params.append(data['last_name'])
            if 'phone' in data:
                update_fields.append("phone = %s")
                params.append(data['phone'])
            if 'address' in data:
                update_fields.append("address = %s")
                params.append(data['address'])
            if 'city' in data:
                update_fields.append("city = %s")
                params.append(data['city'])
            if 'state' in data:
                update_fields.append("state = %s")
                params.append(data['state'])
            if 'postal_code' in data:
                update_fields.append("postal_code = %s")
                params.append(data['postal_code'])
            if 'country' in data:
                update_fields.append("country = %s")
                params.append(data['country'])
            if 'date_of_birth' in data:
                update_fields.append("date_of_birth = %s")
                params.append(data['date_of_birth'])
            if 'membership_plan_id' in data:
                update_fields.append("membership_plan_id = %s")
                params.append(data['membership_plan_id'])
            if 'national_id' in data:
                update_fields.append("national_id = %s")
                params.append(data['national_id'])
            if 'national_id_type' in data:
                update_fields.append("national_id_type = %s")
                params.append(data['national_id_type'])
            if 'patron_email' in data:
                update_fields.append("email = %s")
                params.append(data['patron_email'])
            if 'secondary_phone_no' in data:
                update_fields.append("secondary_phone_no = %s")
                params.append(data['secondary_phone_no'])
            if 'secondary_email' in data:
                update_fields.append("secondary_email = %s")
                params.append(data['secondary_email'])
            if 'correspond_language' in data:
                update_fields.append("correspond_language = %s")
                params.append(data['correspond_language'])
            if 'last_renewed_on_date' in data:
                update_fields.append("last_renewed_on_date = %s")
                params.append(data['last_renewed_on_date'])

            if update_fields:
                params.append(patron_id)

                cursor.execute(f"""
                    UPDATE patrons
                    SET {', '.join(update_fields)}
                    WHERE patron_id = %s
                """, tuple(params))

        return jsonify({"message": "Patron updated successfully"}), 200

@admin_patrons_bp.route('/patrons/<patron_id>/reset-password', methods=['POST'])
@jwt_required()
@admin_required
def reset_patron_password(patron_id):
    """Reset patron password to default"""
    query = "SELECT user_id FROM patrons WHERE patron_id = %s"
    patron = execute_query(query, (patron_id,), fetch_one=True)
    
    if not patron:
        return jsonify({"error": "Patron not found"}), 404
    
    default_password = "BookNook313"
    password_hash = hash_password(default_password)
    
    update_query = "UPDATE users SET password_hash = %s WHERE user_id = %s"
    execute_query(update_query, (password_hash, patron['user_id']))
    
    return jsonify({
        "message": "Password reset successfully",
        "default_password": default_password
    }), 200

@admin_patrons_bp.route('/patrons/<patron_id>/status', methods=['PATCH'])
@jwt_required()
@admin_required
def update_patron_status(patron_id):
    """Update patron status (renew, freeze, close)"""
    data = request.get_json()
    action = data.get('action')  # 'renew', 'freeze', 'close'

    if action not in ['renew', 'freeze', 'close']:
        return jsonify({"error": "Invalid action"}), 400

    query = "SELECT user_id FROM patrons WHERE patron_id = %s"
    patron = execute_query(query, (patron_id,), fetch_one=True)

    if not patron:
        return jsonify({"error": "Patron not found"}), 404

    if action == 'renew':
        status = 'active'
    elif action == 'freeze':
        status = 'frozen'
    else:  # close
        status = 'closed'

    update_query = "UPDATE users SET status = %s WHERE user_id = %s"
    execute_query(update_query, (status, patron['user_id']))

    return jsonify({"message": f"Patron status updated to {status}"}), 200

@admin_patrons_bp.route('/patrons/<patron_id>', methods=['DELETE'])
@jwt_required()
@admin_required
def delete_patron(patron_id):
    """Soft delete a patron by moving to deleted_patrons table"""
    from flask_jwt_extended import get_jwt_identity

    data = request.get_json() or {}
    deletion_reason = data.get('reason', 'No reason provided')
    deleted_by = int(get_jwt_identity())

    with get_db_cursor() as cursor:
        # Get full patron record
        cursor.execute("""
            SELECT p.*, u.email, u.status
            FROM patrons p
            JOIN users u ON p.user_id = u.user_id
            WHERE p.patron_id = %s
        """, (patron_id,))

        patron = cursor.fetchone()

        if not patron:
            return jsonify({"error": "Patron not found"}), 404

        # Check for active borrowings
        cursor.execute("""
            SELECT COUNT(*) as count FROM borrowings
            WHERE patron_id = %s AND status = 'active'
        """, (patron_id,))
        result = cursor.fetchone()

        if result and result['count'] > 0:
            return jsonify({"error": "Cannot delete patron with active borrowings"}), 400

        # Insert into deleted_patrons table
        cursor.execute("""
            INSERT INTO deleted_patrons
            (patron_id, user_id, membership_plan_id, membership_start_date,
             membership_end_date, status, date_of_birth, address, phone_number,
             emergency_contact_name, emergency_contact_phone, notes,
             created_at, updated_at, national_id, national_id_type,
             email, secondary_phone_no, secondary_email, correspond_language,
             last_renewed_on_date, deleted_by, deletion_reason)
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
        """, (
            patron['patron_id'], patron['user_id'], patron['membership_plan_id'],
            patron.get('membership_start_date'), patron.get('membership_end_date'),
            patron['status'], patron.get('date_of_birth'), patron.get('address'),
            patron.get('phone'), patron.get('emergency_contact_name'),
            patron.get('emergency_contact_phone'), patron.get('notes'),
            patron.get('created_at'), patron.get('updated_at'),
            patron.get('national_id'), patron.get('national_id_type'),
            patron.get('email'), patron.get('secondary_phone_no'),
            patron.get('secondary_email'), patron.get('correspond_language'),
            patron.get('last_renewed_on_date'), deleted_by, deletion_reason
        ))

        # Delete from patrons table
        cursor.execute("DELETE FROM patrons WHERE patron_id = %s", (patron_id,))

        # Delete user account
        cursor.execute("DELETE FROM users WHERE user_id = %s", (patron['user_id'],))

        return jsonify({"message": "Patron deleted successfully"}), 200

@admin_patrons_bp.route('/membership-plans', methods=['GET'])
@jwt_required()
@admin_required
def get_membership_plans():
    """Get all available membership plans"""
    query = """
        SELECT plan_id, plan_name, duration_months, price, description, borrowing_limit, is_active
        FROM membership_plans
        WHERE is_active = TRUE
        ORDER BY price ASC
    """
    plans = execute_query(query, fetch_all=True)

    return jsonify({"plans": [dict(p) for p in (plans or [])]}), 200

@admin_patrons_bp.route('/membership-plans', methods=['POST'])
@jwt_required()
@admin_required
def create_membership_plan():
    """Create a new membership plan"""
    data = request.get_json()

    required_fields = ['plan_name', 'duration_months', 'price']
    if not all(field in data for field in required_fields):
        return jsonify({"error": "Missing required fields: plan_name, duration_months, price"}), 400

    with get_db_cursor() as cursor:
        # Check if plan name already exists
        cursor.execute("SELECT plan_id FROM membership_plans WHERE plan_name = %s", (data['plan_name'],))
        if cursor.fetchone():
            return jsonify({"error": "Plan name already exists"}), 400

        cursor.execute("""
            INSERT INTO membership_plans (plan_name, duration_months, price, description, borrowing_limit, is_active)
            VALUES (%s, %s, %s, %s, %s, %s)
            RETURNING plan_id
        """, (data['plan_name'], data['duration_months'], data['price'],
              data.get('description'), data.get('borrowing_limit', 3), data.get('is_active', True)))

        plan_id = cursor.fetchone()['plan_id']

        return jsonify({
            "message": "Membership plan created successfully",
            "plan_id": plan_id
        }), 201

@admin_patrons_bp.route('/membership-plans/<int:plan_id>', methods=['PUT'])
@jwt_required()
@admin_required
def update_membership_plan(plan_id):
    """Update a membership plan"""
    data = request.get_json()

    with get_db_cursor() as cursor:
        # Check if plan exists
        cursor.execute("SELECT plan_id FROM membership_plans WHERE plan_id = %s", (plan_id,))
        if not cursor.fetchone():
            return jsonify({"error": "Membership plan not found"}), 404

        update_fields = []
        params = []

        if 'plan_name' in data:
            update_fields.append("plan_name = %s")
            params.append(data['plan_name'])
        if 'duration_months' in data:
            update_fields.append("duration_months = %s")
            params.append(data['duration_months'])
        if 'price' in data:
            update_fields.append("price = %s")
            params.append(data['price'])
        if 'description' in data:
            update_fields.append("description = %s")
            params.append(data['description'])
        if 'borrowing_limit' in data:
            update_fields.append("borrowing_limit = %s")
            params.append(data['borrowing_limit'])
        if 'is_active' in data:
            update_fields.append("is_active = %s")
            params.append(data['is_active'])

        if not update_fields:
            return jsonify({"error": "No fields to update"}), 400

        params.append(plan_id)

        cursor.execute(f"""
            UPDATE membership_plans
            SET {', '.join(update_fields)}
            WHERE plan_id = %s
        """, tuple(params))

        return jsonify({"message": "Membership plan updated successfully"}), 200

@admin_patrons_bp.route('/membership-plans/<int:plan_id>', methods=['DELETE'])
@jwt_required()
@admin_required
def delete_membership_plan(plan_id):
    """Soft delete a membership plan (set is_active to false)"""
    with get_db_cursor() as cursor:
        # Check if plan is being used by any active patrons
        cursor.execute("""
            SELECT COUNT(*) as count FROM patrons p
            JOIN users u ON p.user_id = u.user_id
            WHERE p.membership_plan_id = %s AND u.status = 'active'
        """, (plan_id,))
        result = cursor.fetchone()

        if result and result['count'] > 0:
            return jsonify({"error": "Cannot delete plan - it is being used by active patrons"}), 400

        # Soft delete - set is_active to false
        cursor.execute("""
            UPDATE membership_plans
            SET is_active = FALSE
            WHERE plan_id = %s
            RETURNING plan_id
        """, (plan_id,))
        deleted = cursor.fetchone()

        if not deleted:
            return jsonify({"error": "Membership plan not found"}), 404

        return jsonify({"message": "Membership plan deactivated successfully"}), 200
