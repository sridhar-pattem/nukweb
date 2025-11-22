#!/bin/bash

# ============================================================================
# Data Export Script for Nuk Library
# ============================================================================
# This script exports your current data from PostgreSQL
# Usage: ./export_data.sh
# ============================================================================

# Database connection details (update these for your local database)
DB_HOST="${DB_HOST:-localhost}"
DB_PORT="${DB_PORT:-5432}"
DB_NAME="${DB_NAME:-nukweb}"
DB_USER="${DB_USER:-postgres}"

# Output directory
OUTPUT_DIR="./data_export"
mkdir -p "$OUTPUT_DIR"

# Timestamp for filenames
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
EXPORT_FILE="$OUTPUT_DIR/nukweb_data_${TIMESTAMP}.sql"

echo "============================================"
echo "NUK LIBRARY - DATA EXPORT"
echo "============================================"
echo "Exporting data from database: $DB_NAME"
echo "Output file: $EXPORT_FILE"
echo ""

# Export data only (no schema) from all tables
# This uses pg_dump with --data-only flag

PGPASSWORD="$DB_PASSWORD" pg_dump \
  -h "$DB_HOST" \
  -p "$DB_PORT" \
  -U "$DB_USER" \
  -d "$DB_NAME" \
  --data-only \
  --no-owner \
  --no-privileges \
  --column-inserts \
  --disable-triggers \
  --exclude-table=mv_book_availability \
  --file="$EXPORT_FILE"

if [ $? -eq 0 ]; then
    echo "✓ Data export completed successfully!"
    echo ""
    echo "Export file: $EXPORT_FILE"
    echo "File size: $(du -h "$EXPORT_FILE" | cut -f1)"
    echo ""
    echo "You can now upload this file to Railway and import it after"
    echo "running the railway_complete_schema.sql"
    echo ""
else
    echo "✗ Error exporting data"
    exit 1
fi

# Also create a compressed version
gzip -c "$EXPORT_FILE" > "${EXPORT_FILE}.gz"
echo "✓ Compressed export created: ${EXPORT_FILE}.gz"
echo "  Size: $(du -h "${EXPORT_FILE}.gz" | cut -f1)"
echo ""
echo "============================================"
echo "NEXT STEPS:"
echo "============================================"
echo "1. Upload railway_complete_schema.sql to Railway first"
echo "2. Then upload $EXPORT_FILE to Railway"
echo "3. Run both files in Railway's PostgreSQL"
echo "============================================"
