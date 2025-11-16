-- Migration: Add support for line items and custom member details in invoices
-- Date: 2025-11-16

-- Step 1: Modify invoices table to support custom member details (not tied to patron_id)
-- Make patron_id nullable to allow manual entry of member details
ALTER TABLE invoices
    ALTER COLUMN patron_id DROP NOT NULL;

-- Add columns for custom member details
ALTER TABLE invoices
    ADD COLUMN custom_member_name VARCHAR(255),
    ADD COLUMN custom_member_email VARCHAR(255),
    ADD COLUMN custom_member_phone VARCHAR(20),
    ADD COLUMN custom_member_address TEXT,
    ADD COLUMN notes TEXT;

-- Step 2: Create invoice_line_items table
CREATE TABLE IF NOT EXISTS invoice_line_items (
    line_item_id SERIAL PRIMARY KEY,
    invoice_id INTEGER REFERENCES invoices(invoice_id) ON DELETE CASCADE,
    description VARCHAR(500) NOT NULL,
    quantity DECIMAL(10, 2) DEFAULT 1,
    unit_price DECIMAL(10, 2) NOT NULL,
    amount DECIMAL(10, 2) NOT NULL,
    item_order INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Add index for faster queries
CREATE INDEX idx_invoice_line_items_invoice_id ON invoice_line_items(invoice_id);

-- Add comments for documentation
COMMENT ON TABLE invoice_line_items IS 'Stores line items for invoices, supporting multiple items per invoice';
COMMENT ON COLUMN invoices.custom_member_name IS 'Custom member name when not linked to a patron';
COMMENT ON COLUMN invoices.custom_member_email IS 'Custom member email when not linked to a patron';
COMMENT ON COLUMN invoices.custom_member_phone IS 'Custom member phone when not linked to a patron';
COMMENT ON COLUMN invoices.custom_member_address IS 'Custom member address when not linked to a patron';
COMMENT ON COLUMN invoices.notes IS 'Additional notes for the invoice';
