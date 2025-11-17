#!/bin/bash

# Database Migration Checker for Cowork Invoices Feature
# This script checks if the required database columns exist

echo "🔍 Checking Cowork Invoice Database Migration Status"
echo "===================================================="
echo ""

# Check if .env file exists
if [ ! -f "backend/.env" ]; then
    echo "⚠️  No backend/.env file found"
    echo ""
    echo "Please create backend/.env with your database connection:"
    echo "DATABASE_URL=postgresql://username:password@localhost:5432/nuk_library"
    echo ""
    exit 1
fi

# Extract database URL from .env
DB_URL=$(grep "^DATABASE_URL=" backend/.env | cut -d '=' -f2-)

if [ -z "$DB_URL" ]; then
    echo "⚠️  DATABASE_URL not found in backend/.env"
    exit 1
fi

echo "📊 Checking database columns..."
echo ""

# Check if custom_member_name column exists
CHECK_QUERY="SELECT column_name FROM information_schema.columns WHERE table_name='invoices' AND column_name IN ('custom_member_name', 'custom_member_email', 'custom_member_phone', 'custom_member_address', 'notes');"

RESULT=$(psql "$DB_URL" -t -c "$CHECK_QUERY" 2>&1)

if [ $? -ne 0 ]; then
    echo "❌ Failed to connect to database"
    echo "$RESULT"
    echo ""
    echo "Please check your DATABASE_URL in backend/.env"
    exit 1
fi

COLUMN_COUNT=$(echo "$RESULT" | grep -c "custom_member")

if [ "$COLUMN_COUNT" -ge 4 ]; then
    echo "✅ Invoice columns are up to date!"
    echo ""

    # Check if line items table exists
    LINE_ITEMS_CHECK=$(psql "$DB_URL" -t -c "SELECT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'invoice_line_items');" 2>&1)

    if echo "$LINE_ITEMS_CHECK" | grep -q "t"; then
        echo "✅ invoice_line_items table exists!"
        echo ""
        echo "🎉 Database migration is complete! You're ready to create invoices."
    else
        echo "❌ invoice_line_items table is missing"
        echo ""
        echo "Please run the migration:"
        echo "  psql \$DATABASE_URL -f database/add_invoice_line_items.sql"
    fi
else
    echo "❌ Missing required columns in invoices table"
    echo ""
    echo "Found $COLUMN_COUNT/5 required columns"
    echo ""
    echo "Please run the database migration:"
    echo ""
    echo "  psql \"$DB_URL\" -f database/add_invoice_line_items.sql"
    echo ""
    echo "Or if using environment variable:"
    echo "  psql \$DATABASE_URL -f database/add_invoice_line_items.sql"
fi

echo ""
