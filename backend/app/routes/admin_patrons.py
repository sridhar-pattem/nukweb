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
            (u.name ILIKE %s OR u.email ILIKE %s OR 
             CAST(p.patron_id AS TEXT) LIKE %s OR p.mobile_number LIKE %s)
        """)
        search_param = f'%{search}%'
        params.extend([search_param, search_param, search_param, search_param])
    
    if status:
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
        SELECT p.patron_id, p.membership_type, p.membership_start_date, 
               p.membership_expiry_date, p.address, p.mobile_number,
               u.user_id, u.email, u.name, u.phone, u.status,
               mp.plan_name, mp.plan_type
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

@admin_patrons_bp.route('/patrons/<int:patron_id>', methods=['GET'])
@jwt_required()
@admin_required
def get_patron_details(patron_id):
    """Get detailed information about a patron"""
    query = """
        SELECT p.*, u.email, u.name, u.phone, u.status,
               mp.plan_name, mp.plan_type, mp.price
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
        SELECT b.borrowing_id, b.checkout_date, b.due_date, b.return_date, 
               b.renewal_count, b.status,
               bk.title, bk.author, bk.isbn
        FROM borrowings b
        JOIN books bk ON b.book_id = bk.book_id
        WHERE b.patron_id = %s
        ORDER BY b.checkout_date DESC
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
    
    required_fields = ['email', 'name', 'membership_plan_id']
    if not all(field in data for field in required_fields):
        return jsonify({"error": "Missing required fields"}), 400
    
    with get_db_cursor() as cursor:
        # Check if email already exists
        cursor.execute("SELECT user_id FROM users WHERE email = %s", (data['email'],))
        if cursor.fetchone():
            return jsonify({"error": "Email already exists"}), 400
        
        # Create user account
        default_password = "BookNook313"
        password_hash = hash_password(default_password)
        
        cursor.execute("""
            INSERT INTO users (email, password_hash, role, name, phone, status)
            VALUES (%s, %s, 'patron', %s, %s, 'active')
            RETURNING user_id
        """, (data['email'], password_hash, data['name'], data.get('phone')))
        
        user_id = cursor.fetchone()['user_id']
        
        # Get membership plan details
        cursor.execute("""
            SELECT duration_days, plan_name 
            FROM membership_plans 
            WHERE plan_id = %s
        """, (data['membership_plan_id'],))
        plan = cursor.fetchone()
        
        if not plan:
            return jsonify({"error": "Invalid membership plan"}), 400
        
        # Create patron record
        cursor.execute("""
            INSERT INTO patrons 
            (user_id, membership_plan_id, membership_type, membership_start_date, 
             membership_expiry_date, address, mobile_number)
            VALUES (%s, %s, %s, CURRENT_DATE, CURRENT_DATE + INTERVAL '%s days', %s, %s)
            RETURNING patron_id
        """, (user_id, data['membership_plan_id'], plan['plan_name'],
              plan['duration_days'], data.get('address'), data.get('mobile_number')))
        
        patron_id = cursor.fetchone()['patron_id']
        
        return jsonify({
            "message": "Patron created successfully",
            "patron_id": patron_id,
            "default_password": default_password
        }), 201

@admin_patrons_bp.route('/patrons/<int:patron_id>', methods=['PUT'])
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
        
        # Update user information
        if any(k in data for k in ['name', 'phone', 'email']):
            update_fields = []
            params = []
            
            if 'name' in data:
                update_fields.append("name = %s")
                params.append(data['name'])
            if 'phone' in data:
                update_fields.append("phone = %s")
                params.append(data['phone'])
            if 'email' in data:
                update_fields.append("email = %s")
                params.append(data['email'])
            
            params.append(patron['user_id'])
            
            cursor.execute(f"""
                UPDATE users 
                SET {', '.join(update_fields)}
                WHERE user_id = %s
            """, tuple(params))
        
        # Update patron information
        if any(k in data for k in ['address', 'mobile_number', 'membership_plan_id']):
            update_fields = []
            params = []
            
            if 'address' in data:
                update_fields.append("address = %s")
                params.append(data['address'])
            if 'mobile_number' in data:
                update_fields.append("mobile_number = %s")
                params.append(data['mobile_number'])
            if 'membership_plan_id' in data:
                update_fields.append("membership_plan_id = %s")
                params.append(data['membership_plan_id'])
            
            params.append(patron_id)
            
            cursor.execute(f"""
                UPDATE patrons 
                SET {', '.join(update_fields)}
                WHERE patron_id = %s
            """, tuple(params))
        
        return jsonify({"message": "Patron updated successfully"}), 200

@admin_patrons_bp.route('/patrons/<int:patron_id>/reset-password', methods=['POST'])
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

@admin_patrons_bp.route('/patrons/<int:patron_id>/status', methods=['PATCH'])
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

@admin_patrons_bp.route('/membership-plans', methods=['GET'])
@jwt_required()
@admin_required
def get_membership_plans():
    """Get all available membership plans"""
    query = """
        SELECT plan_id, plan_name, plan_type, duration_days, price, description
        FROM membership_plans
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

    required_fields = ['plan_name', 'plan_type', 'duration_days', 'price']
    if not all(field in data for field in required_fields):
        return jsonify({"error": "Missing required fields"}), 400

    with get_db_cursor() as cursor:
        # Check if plan name already exists
        cursor.execute("SELECT plan_id FROM membership_plans WHERE plan_name = %s", (data['plan_name'],))
        if cursor.fetchone():
            return jsonify({"error": "Plan name already exists"}), 400

        cursor.execute("""
            INSERT INTO membership_plans (plan_name, plan_type, duration_days, price, description)
            VALUES (%s, %s, %s, %s, %s)
            RETURNING plan_id
        """, (data['plan_name'], data['plan_type'], data['duration_days'],
              data['price'], data.get('description')))

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
        if 'plan_type' in data:
            update_fields.append("plan_type = %s")
            params.append(data['plan_type'])
        if 'duration_days' in data:
            update_fields.append("duration_days = %s")
            params.append(data['duration_days'])
        if 'price' in data:
            update_fields.append("price = %s")
            params.append(data['price'])
        if 'description' in data:
            update_fields.append("description = %s")
            params.append(data['description'])

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
    """Delete a membership plan"""
    with get_db_cursor() as cursor:
        # Check if plan is being used by any patrons
        cursor.execute("SELECT COUNT(*) as count FROM patrons WHERE membership_plan_id = %s", (plan_id,))
        result = cursor.fetchone()

        if result and result['count'] > 0:
            return jsonify({"error": "Cannot delete plan - it is being used by patrons"}), 400

        cursor.execute("DELETE FROM membership_plans WHERE plan_id = %s RETURNING plan_id", (plan_id,))
        deleted = cursor.fetchone()

        if not deleted:
            return jsonify({"error": "Membership plan not found"}), 404

        return jsonify({"message": "Membership plan deleted successfully"}), 200
