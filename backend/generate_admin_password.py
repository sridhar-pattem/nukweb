#!/usr/bin/env python3
"""Generate a bcrypt hash for the admin password"""
import sys
sys.path.insert(0, '/home/user/nukweb/backend')

from app.utils.auth import hash_password

password = "admin123"
hashed = hash_password(password)

print("Generated bcrypt hash for 'admin123':")
print(hashed)
print("\nRun this SQL command to update the admin password:")
print(f"UPDATE users SET password_hash = '{hashed}' WHERE email = 'admin@nuklib.com';")
