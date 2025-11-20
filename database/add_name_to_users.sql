-- Migration: Add name column to users table
-- Date: 2025-11-20
-- Description: Adds name column to users table for patron imports

BEGIN;

-- Check if name column exists, if not add it
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'users' AND column_name = 'name'
    ) THEN
        -- Add name column
        ALTER TABLE users ADD COLUMN name VARCHAR(255);

        RAISE NOTICE 'Added name column to users table';
    ELSE
        RAISE NOTICE 'Name column already exists in users table';
    END IF;
END $$;

-- For existing users without a name, set a default value based on email
-- (Users can update their name later through the profile)
UPDATE users u
SET name = SPLIT_PART(u.email, '@', 1)
WHERE u.name IS NULL OR u.name = '';

-- Make name NOT NULL after populating existing records
ALTER TABLE users ALTER COLUMN name SET NOT NULL;

COMMIT;

-- Verification
SELECT
    column_name,
    data_type,
    is_nullable,
    character_maximum_length
FROM information_schema.columns
WHERE table_name = 'users' AND column_name = 'name';

-- Show sample data
SELECT user_id, email, name, role FROM users LIMIT 5;
