# Multi-stage build for optimized image size
# Stage 1: Builder - Install dependencies
FROM python:3.12-slim as builder

WORKDIR /build

# Install build dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    gcc \
    g++ \
    libpq-dev \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements first for better layer caching
COPY requirements.txt .

# Install Python packages in user directory
# Add PyTorch CPU index explicitly for CPU-only builds
RUN pip install --no-cache-dir --user \
    --extra-index-url https://download.pytorch.org/whl/cpu \
    -r requirements.txt

# Stage 2: Runtime - Minimal final image
FROM python:3.12-slim

WORKDIR /app

# Install only runtime dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    libpq5 \
    && rm -rf /var/lib/apt/lists/*

# Copy installed packages from builder stage
COPY --from=builder /root/.local /root/.local

# Copy application code
COPY . .

# Set PATH to include user-installed packages
ENV PATH=/root/.local/bin:$PATH

# Note: Sentence transformer model will download on first use (~758MB)
# This happens at runtime to avoid build timeouts
# First semantic search request will be slower (~30s)

# Create uploads directory
RUN mkdir -p /app/uploads

# Set environment variables
ENV PYTHONUNBUFFERED=1
ENV FLASK_APP=app

# Expose port
EXPOSE 5001

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
    CMD python3 -c "import requests; requests.get('http://localhost:5001/health')" || exit 1

# Run with gunicorn (4 workers)
# Use shell form to support Railway's $PORT environment variable
CMD gunicorn --workers 4 --bind 0.0.0.0:${PORT:-5001} --timeout 120 --access-logfile - --error-logfile - "app:create_app()"
