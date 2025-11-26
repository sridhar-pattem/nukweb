import os
from datetime import timedelta

class Config:
    # Database
    DATABASE_URL = os.getenv('DATABASE_URL', 'postgresql://user:password@localhost:5432/nuk_library')
    
    # JWT
    JWT_SECRET_KEY = os.getenv('JWT_SECRET_KEY', 'your-secret-key-change-in-production')
    JWT_ACCESS_TOKEN_EXPIRES = timedelta(hours=24)
    
    # Flask
    SECRET_KEY = os.getenv('SECRET_KEY', 'your-flask-secret-key-change-in-production')
    
    # Open Library API
    OPEN_LIBRARY_API_URL = 'https://openlibrary.org/api/books'
    
    # File Upload
    UPLOAD_FOLDER = os.getenv('UPLOAD_FOLDER', '/tmp/uploads')
    MAX_CONTENT_LENGTH = 16 * 1024 * 1024  # 16MB max file size
    
    # Email Configuration (for invoice sending)
    MAIL_SERVER = os.getenv('MAIL_SERVER', 'smtp.gmail.com')
    MAIL_PORT = int(os.getenv('MAIL_PORT', 587))
    MAIL_USE_TLS = True
    MAIL_USERNAME = os.getenv('MAIL_USERNAME', '')
    MAIL_PASSWORD = os.getenv('MAIL_PASSWORD', '')
    MAIL_DEFAULT_SENDER = os.getenv('MAIL_DEFAULT_SENDER', 'noreply@nuklibrary.com')
    
    # Pagination
    ITEMS_PER_PAGE = 20
    
    # Borrowing Settings
    CHECKOUT_DURATION_DAYS = 14
    MAX_RENEWALS = 2
    RENEWAL_EXTENSION_DAYS = 14
    INVOICE_ADVANCE_NOTICE_DAYS = 14

    CORS_ORIGINS = os.getenv('CORS_ORIGINS', 'https://localhost:3001').split(',')
