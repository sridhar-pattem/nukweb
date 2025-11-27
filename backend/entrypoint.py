#!/usr/bin/env python3
"""
Railway entrypoint that reads PORT environment variable
"""
import os
import sys

port = os.getenv('PORT', '5001')

# Execute gunicorn with the correct port
os.execvp('gunicorn', [
    'gunicorn',
    '--workers', '4',
    '--bind', f'0.0.0.0:{port}',
    '--timeout', '120',
    '--access-logfile', '-',
    '--error-logfile', '-',
    'app:create_app()'
])
