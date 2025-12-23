-- Migration: Add tags column to books table
-- Date: 2025-12-24
-- Description: Add tags array column to books table for enhanced searchability and categorization

-- Add tags column to books table
ALTER TABLE books ADD COLUMN IF NOT EXISTS tags TEXT[];

-- Create GIN index for efficient array searching
CREATE INDEX IF NOT EXISTS idx_books_tags ON books USING GIN (tags);

-- Add comment to document the column
COMMENT ON COLUMN books.tags IS 'Searchable tags for categorization and discovery. Array of text values.';

-- Verify the changes
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'books' AND column_name = 'tags';
