-- =====================================================
-- COMPLETE Migration: Change patron_id from INTEGER to VARCHAR(20)
-- This script handles ALL foreign key constraints including
-- book_suggestions and event_registrations
-- =====================================================

-- Check current patron_id type before running:
-- SELECT column_name, data_type FROM information_schema.columns
-- WHERE table_name = 'patrons' AND column_name = 'patron_id';

BEGIN;

-- =====================================================
-- STEP 1: Drop all foreign key constraints that reference patron_id
-- =====================================================

-- Original tables from schema.sql
ALTER TABLE borrowings DROP CONSTRAINT IF EXISTS borrowings_patron_id_fkey;
ALTER TABLE reservations DROP CONSTRAINT IF EXISTS reservations_patron_id_fkey;
ALTER TABLE reviews DROP CONSTRAINT IF EXISTS reviews_patron_id_fkey;
ALTER TABLE cowork_bookings DROP CONSTRAINT IF EXISTS cowork_bookings_patron_id_fkey;
ALTER TABLE cowork_subscriptions DROP CONSTRAINT IF EXISTS cowork_subscriptions_patron_id_fkey;
ALTER TABLE invoices DROP CONSTRAINT IF EXISTS invoices_patron_id_fkey;
ALTER TABLE reading_history DROP CONSTRAINT IF EXISTS reading_history_patron_id_fkey;

-- Additional tables from content management migration
ALTER TABLE book_suggestions DROP CONSTRAINT IF EXISTS book_suggestions_patron_id_fkey;
ALTER TABLE event_registrations DROP CONSTRAINT IF EXISTS event_registrations_patron_id_fkey;

-- =====================================================
-- STEP 2: Drop the primary key constraint on patrons table
-- Use CASCADE to automatically drop dependent constraints
-- =====================================================

ALTER TABLE patrons DROP CONSTRAINT IF EXISTS patrons_pkey CASCADE;

-- Also drop the format constraint if it exists
ALTER TABLE patrons DROP CONSTRAINT IF EXISTS patron_id_format;

-- =====================================================
-- STEP 3: Alter column types to VARCHAR(20) in all tables
-- =====================================================

-- Main patrons table
ALTER TABLE patrons ALTER COLUMN patron_id TYPE VARCHAR(20);

-- Child tables
ALTER TABLE borrowings ALTER COLUMN patron_id TYPE VARCHAR(20);
ALTER TABLE reservations ALTER COLUMN patron_id TYPE VARCHAR(20);
ALTER TABLE reviews ALTER COLUMN patron_id TYPE VARCHAR(20);
ALTER TABLE cowork_bookings ALTER COLUMN patron_id TYPE VARCHAR(20);
ALTER TABLE cowork_subscriptions ALTER COLUMN patron_id TYPE VARCHAR(20);
ALTER TABLE invoices ALTER COLUMN patron_id TYPE VARCHAR(20);
ALTER TABLE reading_history ALTER COLUMN patron_id TYPE VARCHAR(20);
ALTER TABLE book_suggestions ALTER COLUMN patron_id TYPE VARCHAR(20);
ALTER TABLE event_registrations ALTER COLUMN patron_id TYPE VARCHAR(20);

-- =====================================================
-- STEP 4: Update existing values to new format
-- Convert numeric IDs to NUKG format (e.g., 1 -> NUKG0001000)
-- Only update if the value is purely numeric
-- =====================================================

-- Update patrons table first
UPDATE patrons
SET patron_id = 'NUKG' || LPAD(patron_id, 7, '0')
WHERE patron_id ~ '^[0-9]+$';

-- Update child tables
UPDATE borrowings
SET patron_id = 'NUKG' || LPAD(patron_id, 7, '0')
WHERE patron_id ~ '^[0-9]+$';

UPDATE reservations
SET patron_id = 'NUKG' || LPAD(patron_id, 7, '0')
WHERE patron_id ~ '^[0-9]+$';

UPDATE reviews
SET patron_id = 'NUKG' || LPAD(patron_id, 7, '0')
WHERE patron_id ~ '^[0-9]+$';

UPDATE cowork_bookings
SET patron_id = 'NUKG' || LPAD(patron_id, 7, '0')
WHERE patron_id ~ '^[0-9]+$';

UPDATE cowork_subscriptions
SET patron_id = 'NUKG' || LPAD(patron_id, 7, '0')
WHERE patron_id ~ '^[0-9]+$';

UPDATE invoices
SET patron_id = 'NUKG' || LPAD(patron_id, 7, '0')
WHERE patron_id ~ '^[0-9]+$';

UPDATE reading_history
SET patron_id = 'NUKG' || LPAD(patron_id, 7, '0')
WHERE patron_id ~ '^[0-9]+$';

UPDATE book_suggestions
SET patron_id = 'NUKG' || LPAD(patron_id, 7, '0')
WHERE patron_id ~ '^[0-9]+$';

UPDATE event_registrations
SET patron_id = 'NUKG' || LPAD(patron_id, 7, '0')
WHERE patron_id ~ '^[0-9]+$' AND patron_id IS NOT NULL;

-- =====================================================
-- STEP 5: Recreate primary key and constraints
-- =====================================================

-- Add primary key back to patrons table
ALTER TABLE patrons ADD PRIMARY KEY (patron_id);

-- Add format constraint to ensure patron_id follows alphanumeric pattern
ALTER TABLE patrons ADD CONSTRAINT patron_id_format CHECK (patron_id ~ '^[A-Z0-9]+$');

-- =====================================================
-- STEP 6: Recreate all foreign key constraints
-- =====================================================

-- borrowings table
ALTER TABLE borrowings
    ADD CONSTRAINT borrowings_patron_id_fkey
    FOREIGN KEY (patron_id) REFERENCES patrons(patron_id) ON DELETE CASCADE;

-- reservations table
ALTER TABLE reservations
    ADD CONSTRAINT reservations_patron_id_fkey
    FOREIGN KEY (patron_id) REFERENCES patrons(patron_id) ON DELETE CASCADE;

-- reviews table
ALTER TABLE reviews
    ADD CONSTRAINT reviews_patron_id_fkey
    FOREIGN KEY (patron_id) REFERENCES patrons(patron_id) ON DELETE CASCADE;

-- cowork_bookings table
ALTER TABLE cowork_bookings
    ADD CONSTRAINT cowork_bookings_patron_id_fkey
    FOREIGN KEY (patron_id) REFERENCES patrons(patron_id) ON DELETE CASCADE;

-- cowork_subscriptions table
ALTER TABLE cowork_subscriptions
    ADD CONSTRAINT cowork_subscriptions_patron_id_fkey
    FOREIGN KEY (patron_id) REFERENCES patrons(patron_id) ON DELETE CASCADE;

-- invoices table
ALTER TABLE invoices
    ADD CONSTRAINT invoices_patron_id_fkey
    FOREIGN KEY (patron_id) REFERENCES patrons(patron_id) ON DELETE CASCADE;

-- reading_history table
ALTER TABLE reading_history
    ADD CONSTRAINT reading_history_patron_id_fkey
    FOREIGN KEY (patron_id) REFERENCES patrons(patron_id) ON DELETE CASCADE;

-- book_suggestions table
ALTER TABLE book_suggestions
    ADD CONSTRAINT book_suggestions_patron_id_fkey
    FOREIGN KEY (patron_id) REFERENCES patrons(patron_id) ON DELETE CASCADE;

-- event_registrations table (uses ON DELETE SET NULL instead of CASCADE)
ALTER TABLE event_registrations
    ADD CONSTRAINT event_registrations_patron_id_fkey
    FOREIGN KEY (patron_id) REFERENCES patrons(patron_id) ON DELETE SET NULL;

COMMIT;

-- =====================================================
-- Verification queries (run after migration):
-- =====================================================

-- Check patron_id column type
SELECT
    table_name,
    column_name,
    data_type,
    character_maximum_length
FROM information_schema.columns
WHERE column_name = 'patron_id'
ORDER BY table_name;

-- Check sample patron IDs
SELECT patron_id, user_id FROM patrons LIMIT 5;

-- Check foreign key constraints
SELECT
    tc.table_name,
    tc.constraint_name,
    tc.constraint_type
FROM information_schema.table_constraints tc
WHERE tc.constraint_name LIKE '%patron_id%'
ORDER BY tc.table_name;

-- =====================================================
-- SUCCESS MESSAGE
-- =====================================================
DO $$
BEGIN
    RAISE NOTICE '=====================================================';
    RAISE NOTICE 'MIGRATION COMPLETED SUCCESSFULLY!';
    RAISE NOTICE '=====================================================';
    RAISE NOTICE 'patron_id has been migrated from INTEGER to VARCHAR(20)';
    RAISE NOTICE 'All foreign key constraints have been recreated';
    RAISE NOTICE 'Existing numeric IDs have been converted to NUKG format';
    RAISE NOTICE '=====================================================';
END $$;
