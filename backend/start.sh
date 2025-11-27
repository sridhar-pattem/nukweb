#!/bin/bash
# Railway startup script
# Uses $PORT environment variable provided by Railway

PORT=${PORT:-5001}

exec gunicorn --workers 4 --bind 0.0.0.0:$PORT --timeout 120 --access-logfile - --error-logfile - "app:create_app()"
