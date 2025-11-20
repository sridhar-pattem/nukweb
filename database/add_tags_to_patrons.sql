-- Migration: Add tags column to patrons table
-- Date: 2025-11-20
-- Description: Adds a tags column to store patron classification tags from CSV imports

BEGIN;

-- Add tags column to patrons table
ALTER TABLE patrons
ADD COLUMN IF NOT EXISTS tags TEXT;

-- Add comment for documentation
COMMENT ON COLUMN patrons.tags IS 'Comma-separated tags for patron classification (e.g., "student,regular,vip")';

-- Create index for tag searches (optional but recommended for performance)
CREATE INDEX IF NOT EXISTS idx_patrons_tags ON patrons USING gin(to_tsvector('english', tags));

COMMIT;

-- Verification queries
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'patrons' AND column_name = 'tags';
