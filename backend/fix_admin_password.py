#!/usr/bin/env python3
"""Fix admin password by updating database directly"""
import sys
import os

# Add backend to path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from app.utils.auth import hash_password
from app.utils.database import execute_query

def fix_admin_password():
    """Update admin password hash to bcrypt format"""
    password = "admin123"
    hashed = hash_password(password)

    print(f"Generated bcrypt hash: {hashed}")
    print("Updating database...")

    try:
        # Update the password
        execute_query(
            "UPDATE users SET password_hash = %s WHERE email = 'admin@nuklib.com'",
            (hashed,)
        )
        print("✓ Password updated successfully!")
        print("\nYou can now login with:")
        print("  Email: admin@nuklib.com")
        print("  Password: admin123")
    except Exception as e:
        print(f"✗ Error updating password: {e}")
        print("\nManually run this SQL command:")
        print(f"UPDATE users SET password_hash = '{hashed}' WHERE email = 'admin@nuklib.com';")

if __name__ == '__main__':
    fix_admin_password()
