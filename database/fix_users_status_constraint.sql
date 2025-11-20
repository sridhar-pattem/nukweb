-- Migration: Fix users status constraint to allow 'frozen' status
-- Date: 2025-11-20
-- Description: Updates the users_status_check constraint to allow 'frozen' status for patron imports

BEGIN;

-- Drop the existing constraint
ALTER TABLE users DROP CONSTRAINT IF EXISTS users_status_check;

-- Add new constraint with correct values
ALTER TABLE users ADD CONSTRAINT users_status_check
CHECK (status IN ('active', 'frozen', 'closed'));

COMMIT;

-- Verification
SELECT
    conname AS constraint_name,
    pg_get_constraintdef(oid) AS constraint_definition
FROM pg_constraint
WHERE conrelid = 'users'::regclass
AND conname = 'users_status_check';

-- Check if there are any users with invalid status values
SELECT DISTINCT status FROM users;

RAISE NOTICE 'users_status_check constraint updated successfully';
RAISE NOTICE 'Allowed values: active, frozen, closed';
