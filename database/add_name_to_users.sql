-- Migration: Add phone column to users table
-- Date: 2025-11-20
-- Description: Adds phone column to users table for patron imports

BEGIN;

-- Check if phone column exists, if not add it
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'users' AND column_name = 'phone'
    ) THEN
        -- Add phone column (nullable - it's optional)
        ALTER TABLE users ADD COLUMN phone VARCHAR(20);

        RAISE NOTICE 'Added phone column to users table';
    ELSE
        RAISE NOTICE 'Phone column already exists in users table';
    END IF;
END $$;

COMMIT;

-- Verification
SELECT
    column_name,
    data_type,
    is_nullable,
    character_maximum_length
FROM information_schema.columns
WHERE table_name = 'users' AND column_name = 'phone';

-- Show sample data
SELECT user_id, email, name, phone, role FROM users LIMIT 5;
