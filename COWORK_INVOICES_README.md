# Cowork Invoice & Receipt Generation Feature

## Overview
This feature allows administrators to create and manage invoices and receipts for coworking space payments. It supports manual entry of member details and line items, with automatic PDF generation.

## Features
- ✅ Manual entry of member details (name, email, phone, address)
- ✅ Multiple line items with quantity, unit price, and amount
- ✅ Support for both invoices and receipts
- ✅ Multiple payment modes (UPI, Cash, Credit/Debit Card, Bank Transfer, Gift Coupon)
- ✅ Automatic PDF generation with company logo
- ✅ Download PDFs directly from the interface
- ✅ Filter invoices by payment status
- ✅ Search by invoice number, member name, or email
- ✅ No payment gateway required - manual payment tracking

## Setup Instructions

### 1. Database Migration

Run the migration script to add the necessary database tables and columns:

```bash
# Apply the migration to your PostgreSQL database
psql -U your_username -d nuk_library -f database/add_invoice_line_items.sql
```

Or if you're setting up a fresh database, the updated schema is already in `database/schema.sql`.

### 2. Add Your Logo

Place your Nuk Library logo in the following directory:

```
backend/uploads/logo/
```

**Supported file names:**
- `logo.png` (recommended)
- `logo.jpg`
- `logo.jpeg`
- `nuk_logo.png`
- `nuk_logo.jpg`

**Logo specifications:**
- Format: PNG (for transparency) or JPG
- Dimensions: Square aspect ratio (300x300px to 500x500px recommended)
- Maximum file size: 2MB
- Resolution: 72-150 DPI

The logo will automatically appear on all generated invoices and receipts.

### 3. Verify Directories

Ensure the following directories exist and are writable:

```bash
mkdir -p backend/uploads/logo
mkdir -p backend/uploads/invoices
chmod 755 backend/uploads/logo
chmod 755 backend/uploads/invoices
```

### 4. Start the Application

**Backend:**
```bash
cd backend
source venv/bin/activate  # or activate your virtual environment
python run.py
```

**Frontend:**
```bash
cd frontend
npm install  # if not already done
npm start
```

## Usage Guide

### Accessing the Feature

1. Log in as an admin
2. Navigate to **Cowork** > **Invoices & Receipts** in the sidebar menu

### Creating a New Invoice/Receipt

1. Click **+ Create New Invoice** button
2. Fill in the member details:
   - Member Name (required)
   - Email (required)
   - Phone (optional)
   - Address (optional)

3. Add line items:
   - Description (e.g., "Coworking Day Pass - Nov 1-5")
   - Quantity (default: 1)
   - Unit Price (in ₹)
   - Amount (auto-calculated: Quantity × Unit Price)
   - Click **+ Add Line Item** to add more items
   - Click **Remove** to delete a line item

4. Set payment details:
   - **Document Type**: Invoice or Receipt
   - **Payment Status**: Pending, Paid, or Overdue
   - **Payment Mode**: UPI, Cash, Credit/Debit Card, Bank Transfer, or Gift Coupon
   - **Due Date**: For pending payments (optional)
   - **Payment Date**: For paid invoices (auto-enabled when status is "Paid")
   - **Notes**: Any additional information (optional)

5. Click **Create Invoice** to generate the invoice and PDF

### Viewing Invoices

- Use the **search bar** to find invoices by invoice number, member name, or email
- Use the **status filter** to show only Pending, Paid, or Overdue invoices
- Click **View** to see full invoice details with all line items
- Click **PDF** to download the PDF version
- Click **Delete** to remove an invoice (with confirmation)

### Managing Invoices

**Viewing Details:**
- Click the **View** button on any invoice
- See member information, line items breakdown, and payment details
- Download PDF directly from the detail view

**Downloading PDFs:**
- PDFs are automatically generated when an invoice is created
- Click the **PDF** button to download
- File name format: `INV-CW-YYYYMMDDHHMMSS.pdf`

**Deleting Invoices:**
- Click the **Delete** button
- Confirm the deletion
- Both database record and PDF file will be removed

## PDF Invoice Format

Generated PDFs include:
- **Header**: Nuk Library logo and contact information
- **Document Type**: INVOICE or RECEIPT (color-coded)
- **Invoice Number**: Unique identifier (format: INV-CW-TIMESTAMP)
- **Member Details**: Name, email, phone, address
- **Invoice Details**: Issue date, due date, payment date, payment mode
- **Line Items Table**: Description, quantity, unit price, and amount for each item
- **Total Amount**: Calculated sum of all line items
- **Payment Status**: Visual indicator (PAID in green or PAYMENT PENDING in red)
- **Notes**: Any additional information entered
- **Footer**: Thank you message and contact information

## API Endpoints

### Admin - Cowork Invoices

**Create Invoice**
```
POST /api/admin/cowork-invoices
```

**Get All Invoices (with pagination and filters)**
```
GET /api/admin/cowork-invoices?page=1&per_page=20&payment_status=paid&search=john
```

**Get Single Invoice**
```
GET /api/admin/cowork-invoices/{invoice_id}
```

**Update Invoice**
```
PUT /api/admin/cowork-invoices/{invoice_id}
```

**Delete Invoice**
```
DELETE /api/admin/cowork-invoices/{invoice_id}
```

**Download PDF**
```
GET /api/admin/cowork-invoices/{invoice_id}/pdf
```

## Database Schema

### `invoices` table (updated)
```sql
- invoice_id (SERIAL PRIMARY KEY)
- patron_id (INTEGER, nullable - allows custom members)
- invoice_number (VARCHAR UNIQUE)
- invoice_type (VARCHAR - 'membership' or 'cowork')
- amount (DECIMAL)
- payment_mode (VARCHAR)
- payment_status (VARCHAR)
- issue_date, due_date, payment_date (DATE)
- pdf_url (TEXT)
- sent_via_email (BOOLEAN)
- custom_member_name (VARCHAR) - NEW
- custom_member_email (VARCHAR) - NEW
- custom_member_phone (VARCHAR) - NEW
- custom_member_address (TEXT) - NEW
- notes (TEXT) - NEW
- created_at (TIMESTAMP)
```

### `invoice_line_items` table (new)
```sql
- line_item_id (SERIAL PRIMARY KEY)
- invoice_id (INTEGER FK)
- description (VARCHAR)
- quantity (DECIMAL)
- unit_price (DECIMAL)
- amount (DECIMAL)
- item_order (INTEGER)
- created_at (TIMESTAMP)
```

## Troubleshooting

### Logo not appearing on PDFs
- Ensure logo file is placed in `backend/uploads/logo/`
- Check file permissions (should be readable)
- Verify file name matches one of the supported names
- Check backend logs for image loading errors

### PDF download not working
- Verify `backend/uploads/invoices/` directory exists and is writable
- Check browser console for errors
- Ensure Flask backend is running
- Check network tab in browser dev tools for API response

### Database errors
- Ensure migration script has been run
- Verify PostgreSQL connection in `.env` file
- Check database user has necessary permissions
- Review backend logs for SQL errors

### Invoice not creating
- Check all required fields are filled (member name, email, line items)
- Ensure at least one line item has a description and amount > 0
- Check browser console and network tab for error messages
- Review backend logs for validation errors

## File Structure

```
nukweb/
├── backend/
│   ├── app/
│   │   ├── routes/
│   │   │   └── admin_cowork_invoices.py  (NEW - API endpoints)
│   │   └── utils/
│   │       └── cowork_invoice_generator.py  (NEW - PDF generator)
│   └── uploads/
│       ├── logo/                          (NEW - Logo storage)
│       └── invoices/                      (NEW - Generated PDFs)
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   └── CoworkInvoices.js         (NEW - React component)
│   │   ├── services/
│   │   │   └── api.js                    (UPDATED - Added API methods)
│   │   ├── styles/
│   │   │   └── App.css                   (UPDATED - Added styles)
│   │   └── App.js                        (UPDATED - Added route & menu)
└── database/
    ├── schema.sql                         (UPDATED - New tables/columns)
    └── add_invoice_line_items.sql        (NEW - Migration script)
```

## Support Payment Modes

The following payment modes are supported:
- **UPI**: For UPI payments (Google Pay, PhonePe, Paytm, etc.)
- **Cash**: For cash payments
- **Credit/Debit Card**: For card payments
- **Bank Transfer**: For NEFT/RTGS/IMPS transfers
- **Gift Coupon**: For gift voucher redemptions

## Future Enhancements

Potential improvements for future versions:
- Email sending capability for invoices
- Bulk invoice generation
- Invoice templates customization
- Tax calculation support (GST)
- Recurring invoice generation
- Invoice payment reminders
- Export to Excel/CSV
- Integration with payment gateways
- Multi-currency support

## License

This feature is part of the Nuk Library management system.
