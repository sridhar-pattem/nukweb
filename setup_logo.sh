#!/bin/bash

# Quick Logo Setup Script for Nuk Library Invoice Generation
# Run this from your nukweb project root directory

echo "🎨 Setting up Nuk Library Logo for Invoice PDFs"
echo "================================================"
echo ""

# Source logo path (update if your path is different)
SOURCE_LOGO="/Users/sridharpattem/Projects/nuk-library/frontend/static/Nuk_Logo.png"

# Destination path
DEST_LOGO="backend/uploads/logo/logo.png"

# Check if source logo exists
if [ ! -f "$SOURCE_LOGO" ]; then
    echo "❌ Logo not found at: $SOURCE_LOGO"
    echo ""
    echo "Please update the SOURCE_LOGO variable in this script"
    echo "or manually copy your logo to: $DEST_LOGO"
    echo ""
    echo "Supported logo formats:"
    echo "  - logo.png (recommended)"
    echo "  - logo.jpg"
    echo "  - nuk_logo.png"
    echo ""
    exit 1
fi

# Ensure destination directory exists
mkdir -p "backend/uploads/logo"
mkdir -p "backend/uploads/invoices"

# Copy the logo
echo "📋 Copying logo from: $SOURCE_LOGO"
echo "                  to: $DEST_LOGO"
cp "$SOURCE_LOGO" "$DEST_LOGO"

if [ $? -eq 0 ]; then
    echo "✅ Logo copied successfully!"
    echo ""

    # Show logo info
    echo "📊 Logo file details:"
    ls -lh "$DEST_LOGO"

    # Check image dimensions if ImageMagick is available
    if command -v identify &> /dev/null; then
        echo ""
        echo "📐 Image dimensions:"
        identify "$DEST_LOGO" | awk '{print "   ", $3}'
    fi

    echo ""
    echo "✨ Setup complete! Your invoices will now include the Nuk Library logo."
    echo ""
    echo "Next steps:"
    echo "1. Run database migration: psql -U username -d nuk_library -f database/add_invoice_line_items.sql"
    echo "2. Start your backend: cd backend && python run.py"
    echo "3. Start your frontend: cd frontend && npm start"
    echo "4. Navigate to: Cowork > Invoices & Receipts in the admin panel"
    echo ""
else
    echo "❌ Failed to copy logo"
    exit 1
fi
