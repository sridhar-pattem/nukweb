#!/usr/bin/env python3
from dotenv import load_dotenv
load_dotenv()  # Load .env file before importing app

from app import create_app
import os

app = create_app()

if __name__ == '__main__':
    port = int(os.getenv('PORT', 5001))
    debug = os.getenv('FLASK_ENV') == 'development'
    app.run(host='0.0.0.0', port=port, debug=debug)
