from flask import Flask
from flask_cors import CORS
from flask_jwt_extended import JWTManager
from app.config import Config

def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)

    # Initialize extensions with explicit CORS configuration
    # Allow all origins during development
    CORS(app, origins="*", supports_credentials=False)
    jwt = JWTManager(app)
    
    # Register blueprints
    from app.routes.auth import auth_bp
    from app.routes.admin_patrons import admin_patrons_bp
    from app.routes.admin_books import admin_books_bp
    from app.routes.admin_borrowings import admin_borrowings_bp
    from app.routes.admin_collections import admin_collections_bp
    from app.routes.admin_dashboard import admin_dashboard_bp
    from app.routes.admin_cowork_invoices import admin_cowork_invoices_bp
    from app.routes.admin_contributors import admin_contributors_bp
    from app.routes.admin_items import admin_items_bp
    from app.routes.admin_rda_vocabularies import admin_rda_vocabularies_bp
    from app.routes.admin_import import admin_import_bp
    from app.routes.patron import patron_bp
    # Content Management
    from app.routes.patron_content import patron_content_bp
    from app.routes.admin_content import admin_content_bp
    from app.routes.event_management import event_bp
    # Website Admin
    from app.routes.admin_website import admin_website_bp
    # AI Chatbot
    from app.routes.chatbot import chatbot_bp

    app.register_blueprint(auth_bp, url_prefix='/api/auth')
    app.register_blueprint(admin_patrons_bp, url_prefix='/api/admin')
    app.register_blueprint(admin_books_bp, url_prefix='/api/admin')
    app.register_blueprint(admin_borrowings_bp, url_prefix='/api/admin')
    app.register_blueprint(admin_collections_bp, url_prefix='/api/admin')
    app.register_blueprint(admin_dashboard_bp, url_prefix='/api/admin')
    app.register_blueprint(admin_cowork_invoices_bp, url_prefix='/api/admin')
    app.register_blueprint(admin_contributors_bp, url_prefix='/api/admin')
    app.register_blueprint(admin_items_bp, url_prefix='/api/admin')
    app.register_blueprint(admin_rda_vocabularies_bp, url_prefix='/api/admin')
    app.register_blueprint(admin_import_bp, url_prefix='/api/admin')
    app.register_blueprint(patron_bp, url_prefix='/api/patron')
    # Content Management
    app.register_blueprint(patron_content_bp, url_prefix='/api/patron/content')
    app.register_blueprint(admin_content_bp, url_prefix='/api/admin/content')
    app.register_blueprint(event_bp, url_prefix='/api/events')
    # Website Admin
    app.register_blueprint(admin_website_bp, url_prefix='/api/admin/website')
    # AI Chatbot
    app.register_blueprint(chatbot_bp, url_prefix='/api/chatbot')

    # Health check endpoint
    @app.route('/health')
    def health_check():
        return {"status": "healthy"}, 200
    
    # Temporary: Print all routes for debugging
    print("=== REGISTERED ROUTES ===")
    for rule in app.url_map.iter_rules():
        print(f"{rule.methods} {rule.rule}")
    print("========================")

    return app
