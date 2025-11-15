import bcrypt
from functools import wraps
from flask import jsonify, request
from flask_jwt_extended import verify_jwt_in_request, get_jwt_identity
from app.utils.database import execute_query

def hash_password(password):
    """Hash a password using bcrypt"""
    return bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')

def verify_password(password, hashed_password):
    """Verify a password against its hash"""
    return bcrypt.checkpw(password.encode('utf-8'), hashed_password.encode('utf-8'))

def admin_required(fn):
    """Decorator to require admin role"""
    @wraps(fn)
    def wrapper(*args, **kwargs):
        verify_jwt_in_request()
        user_id = get_jwt_identity()
        
        query = "SELECT role FROM users WHERE user_id = %s"
        user = execute_query(query, (user_id,), fetch_one=True)
        
        if not user or user['role'] != 'admin':
            return jsonify({"error": "Admin access required"}), 403
        
        return fn(*args, **kwargs)
    return wrapper

def patron_required(fn):
    """Decorator to require patron role"""
    @wraps(fn)
    def wrapper(*args, **kwargs):
        verify_jwt_in_request()
        user_id = get_jwt_identity()
        
        query = "SELECT role FROM users WHERE user_id = %s"
        user = execute_query(query, (user_id,), fetch_one=True)
        
        if not user or user['role'] != 'patron':
            return jsonify({"error": "Patron access required"}), 403
        
        return fn(*args, **kwargs)
    return wrapper

def get_current_user():
    """Get current user from JWT token"""
    verify_jwt_in_request()
    user_id = get_jwt_identity()
    
    query = """
        SELECT user_id, email, role, name, phone, status 
        FROM users 
        WHERE user_id = %s
    """
    return execute_query(query, (user_id,), fetch_one=True)
