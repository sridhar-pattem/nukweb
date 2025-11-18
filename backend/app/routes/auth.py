from flask import Blueprint, request, jsonify
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity
from app.utils.database import execute_query
from app.utils.auth import verify_password, hash_password

auth_bp = Blueprint('auth', __name__)

@auth_bp.route('/login', methods=['POST'])
def login():
    """User login endpoint"""
    data = request.get_json()
    
    if not data or not data.get('email') or not data.get('password'):
        return jsonify({"error": "Email and password are required"}), 400
    
    email = data['email']
    password = data['password']
    
    # Get user from database
    query = """
        SELECT u.user_id, u.email, u.password_hash, u.role, u.status,
               p.patron_id, p.first_name, p.last_name
        FROM users u
        LEFT JOIN patrons p ON u.user_id = p.user_id
        WHERE u.email = %s
    """
    user = execute_query(query, (email,), fetch_one=True)

    if not user:
        return jsonify({"error": "Invalid credentials"}), 401

    # Check if account is active
    if user['status'] != 'active':
        return jsonify({"error": f"Account is {user['status']}"}), 403

    # Verify password
    if not verify_password(password, user['password_hash']):
        return jsonify({"error": "Invalid credentials"}), 401

    # Create access token
    access_token = create_access_token(identity=str(user['user_id']))

    # Build display name
    if user.get('first_name') and user.get('last_name'):
        display_name = f"{user['first_name']} {user['last_name']}"
    else:
        # For admin users without patron records, use email prefix
        display_name = user['email'].split('@')[0]

    return jsonify({
        "access_token": access_token,
        "user": {
            "user_id": user['user_id'],
            "email": user['email'],
            "name": display_name,
            "role": user['role'],
            "patron_id": user.get('patron_id')
        }
    }), 200

@auth_bp.route('/change-password', methods=['POST'])
@jwt_required()
def change_password():
    """Change user password"""
    user_id = int(get_jwt_identity())
    data = request.get_json()
    
    if not data or not data.get('old_password') or not data.get('new_password'):
        return jsonify({"error": "Old and new passwords are required"}), 400
    
    # Get current password hash
    query = "SELECT password_hash FROM users WHERE user_id = %s"
    user = execute_query(query, (user_id,), fetch_one=True)
    
    if not user:
        return jsonify({"error": "User not found"}), 404
    
    # Verify old password
    if not verify_password(data['old_password'], user['password_hash']):
        return jsonify({"error": "Invalid old password"}), 401
    
    # Update password
    new_password_hash = hash_password(data['new_password'])
    update_query = "UPDATE users SET password_hash = %s WHERE user_id = %s"
    execute_query(update_query, (new_password_hash, user_id))
    
    return jsonify({"message": "Password changed successfully"}), 200

@auth_bp.route('/me', methods=['GET'])
@jwt_required()
def get_current_user_info():
    """Get current user information"""
    user_id = int(get_jwt_identity())

    query = """
        SELECT u.user_id, u.email, u.role, u.status,
               p.patron_id, p.first_name, p.last_name, p.phone,
               p.address, p.city, p.state, p.postal_code, p.country,
               p.membership_plan_id, p.membership_start_date, p.membership_end_date,
               mp.plan_name, mp.duration_months, mp.price
        FROM users u
        LEFT JOIN patrons p ON u.user_id = p.user_id
        LEFT JOIN membership_plans mp ON p.membership_plan_id = mp.plan_id
        WHERE u.user_id = %s
    """
    user = execute_query(query, (user_id,), fetch_one=True)

    if not user:
        return jsonify({"error": "User not found"}), 404

    # Build display name
    if user.get('first_name') and user.get('last_name'):
        user['name'] = f"{user['first_name']} {user['last_name']}"
    else:
        user['name'] = user['email'].split('@')[0]

    return jsonify(dict(user)), 200
