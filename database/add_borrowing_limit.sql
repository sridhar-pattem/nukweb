-- Add borrowing_limit to membership_plans table
ALTER TABLE membership_plans ADD COLUMN IF NOT EXISTS borrowing_limit INTEGER DEFAULT 3;

-- Update existing plans to have a default borrowing limit
UPDATE membership_plans SET borrowing_limit = 3 WHERE borrowing_limit IS NULL;

-- Add a check constraint to ensure borrowing_limit is positive
ALTER TABLE membership_plans ADD CONSTRAINT borrowing_limit_positive CHECK (borrowing_limit > 0);
