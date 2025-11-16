-- Migration script to change patron_id from SERIAL to VARCHAR(20)
-- This script should be run on existing databases

-- WARNING: This will drop and recreate the patrons table
-- Make sure to backup your data before running this migration!

-- Step 1: Create a temporary table to store existing patron data
CREATE TABLE patrons_backup AS
SELECT * FROM patrons;

-- Step 2: Drop dependent constraints and tables temporarily
ALTER TABLE borrowings DROP CONSTRAINT IF EXISTS borrowings_patron_id_fkey;
ALTER TABLE reservations DROP CONSTRAINT IF EXISTS reservations_patron_id_fkey;
ALTER TABLE reviews DROP CONSTRAINT IF EXISTS reviews_patron_id_fkey;
ALTER TABLE cowork_bookings DROP CONSTRAINT IF EXISTS cowork_bookings_patron_id_fkey;
ALTER TABLE cowork_subscriptions DROP CONSTRAINT IF EXISTS cowork_subscriptions_patron_id_fkey;
ALTER TABLE invoices DROP CONSTRAINT IF EXISTS invoices_patron_id_fkey;
ALTER TABLE reading_history DROP CONSTRAINT IF EXISTS reading_history_patron_id_fkey;

-- Step 3: Drop the old patrons table
DROP TABLE patrons;

-- Step 4: Create new patrons table with VARCHAR patron_id
CREATE TABLE patrons (
    patron_id VARCHAR(20) PRIMARY KEY,
    user_id INTEGER UNIQUE REFERENCES users(user_id) ON DELETE CASCADE,
    membership_plan_id INTEGER REFERENCES membership_plans(plan_id),
    membership_type VARCHAR(50),
    membership_start_date DATE,
    membership_expiry_date DATE,
    address TEXT,
    join_date DATE DEFAULT CURRENT_DATE,
    mobile_number VARCHAR(20),
    CONSTRAINT patron_id_format CHECK (patron_id ~ '^[A-Z0-9]+$')
);

-- Step 5: Migrate existing data with new patron_id format
-- This will convert old numeric IDs to new format like NUKG0001000, NUKG0002000, etc.
INSERT INTO patrons (patron_id, user_id, membership_plan_id, membership_type,
                     membership_start_date, membership_expiry_date, address,
                     join_date, mobile_number)
SELECT
    'NUKG' || LPAD(patron_id::TEXT, 7, '0') as patron_id,
    user_id,
    membership_plan_id,
    membership_type,
    membership_start_date,
    membership_expiry_date,
    address,
    join_date,
    mobile_number
FROM patrons_backup
ORDER BY patron_id;

-- Step 6: Update foreign key references in other tables
-- Note: You'll need to update these tables' patron_id columns as well
-- This is a complex migration - consider your data carefully

-- For now, we'll recreate the foreign key constraints
-- You may need to manually update the patron_id values in these tables

ALTER TABLE borrowings
    ADD CONSTRAINT borrowings_patron_id_fkey
    FOREIGN KEY (patron_id) REFERENCES patrons(patron_id) ON DELETE CASCADE;

ALTER TABLE reservations
    ADD CONSTRAINT reservations_patron_id_fkey
    FOREIGN KEY (patron_id) REFERENCES patrons(patron_id) ON DELETE CASCADE;

ALTER TABLE reviews
    ADD CONSTRAINT reviews_patron_id_fkey
    FOREIGN KEY (patron_id) REFERENCES patrons(patron_id) ON DELETE CASCADE;

ALTER TABLE cowork_bookings
    ADD CONSTRAINT cowork_bookings_patron_id_fkey
    FOREIGN KEY (patron_id) REFERENCES patrons(patron_id) ON DELETE CASCADE;

ALTER TABLE cowork_subscriptions
    ADD CONSTRAINT cowork_subscriptions_patron_id_fkey
    FOREIGN KEY (patron_id) REFERENCES patrons(patron_id) ON DELETE CASCADE;

ALTER TABLE invoices
    ADD CONSTRAINT invoices_patron_id_fkey
    FOREIGN KEY (patron_id) REFERENCES patrons(patron_id) ON DELETE CASCADE;

ALTER TABLE reading_history
    ADD CONSTRAINT reading_history_patron_id_fkey
    FOREIGN KEY (patron_id) REFERENCES patrons(patron_id) ON DELETE CASCADE;

-- Step 7: Clean up backup table (optional - comment out if you want to keep it)
-- DROP TABLE patrons_backup;

-- Migration complete!
-- Note: If you have existing data in borrowings, reviews, etc., you'll need to
-- update those tables' patron_id columns to match the new format.
