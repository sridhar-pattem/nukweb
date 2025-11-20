-- Migration: Make barcode column nullable in items table
-- Purpose: Allow creating items without barcodes initially
--          Barcodes can be added manually later

-- Drop the NOT NULL constraint from barcode column
ALTER TABLE items ALTER COLUMN barcode DROP NOT NULL;

-- Keep the UNIQUE constraint but allow NULL values
-- PostgreSQL treats NULL values as unique, so multiple items can have NULL barcode
-- This is the desired behavior

-- Add a comment to document the change
COMMENT ON COLUMN items.barcode IS 'Barcode for the item. Can be NULL initially and assigned later. Must be unique when assigned.';
