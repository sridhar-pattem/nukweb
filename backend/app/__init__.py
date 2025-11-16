from flask import Flask
from flask_cors import CORS
from flask_jwt_extended import JWTManager
from app.config import Config

def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)
    
    # Initialize extensions
    CORS(app)
    jwt = JWTManager(app)
    
    # Register blueprints
    from app.routes.auth import auth_bp
    from app.routes.admin_patrons import admin_patrons_bp
    from app.routes.admin_books import admin_books_bp
    from app.routes.admin_borrowings import admin_borrowings_bp
    from app.routes.admin_collections import admin_collections_bp
    from app.routes.patron import patron_bp

    app.register_blueprint(auth_bp, url_prefix='/api/auth')
    app.register_blueprint(admin_patrons_bp, url_prefix='/api/admin')
    app.register_blueprint(admin_books_bp, url_prefix='/api/admin')
    app.register_blueprint(admin_borrowings_bp, url_prefix='/api/admin')
    app.register_blueprint(admin_collections_bp, url_prefix='/api/admin')
    app.register_blueprint(patron_bp, url_prefix='/api/patron')
    
    # Health check endpoint
    @app.route('/health')
    def health_check():
        return {"status": "healthy"}, 200
    
    return app
