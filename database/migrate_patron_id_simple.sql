-- Simple Migration: Change patron_id from INTEGER to VARCHAR(20)
-- This script handles all foreign key constraints properly

-- Step 1: Check current patron_id type
-- Run this first to see if migration is needed:
-- SELECT column_name, data_type FROM information_schema.columns
-- WHERE table_name = 'patrons' AND column_name = 'patron_id';

BEGIN;

-- Step 2: Drop all foreign key constraints that reference patron_id
ALTER TABLE borrowings DROP CONSTRAINT IF EXISTS borrowings_patron_id_fkey;
ALTER TABLE reservations DROP CONSTRAINT IF EXISTS reservations_patron_id_fkey;
ALTER TABLE reviews DROP CONSTRAINT IF EXISTS reviews_patron_id_fkey;
ALTER TABLE cowork_bookings DROP CONSTRAINT IF EXISTS cowork_bookings_patron_id_fkey;
ALTER TABLE cowork_subscriptions DROP CONSTRAINT IF EXISTS cowork_subscriptions_patron_id_fkey;
ALTER TABLE invoices DROP CONSTRAINT IF EXISTS invoices_patron_id_fkey;
ALTER TABLE reading_history DROP CONSTRAINT IF EXISTS reading_history_patron_id_fkey;

-- Step 3: Alter the column type in all tables
-- First, change patron_id in child tables to VARCHAR
ALTER TABLE borrowings ALTER COLUMN patron_id TYPE VARCHAR(20);
ALTER TABLE reservations ALTER COLUMN patron_id TYPE VARCHAR(20);
ALTER TABLE reviews ALTER COLUMN patron_id TYPE VARCHAR(20);
ALTER TABLE cowork_bookings ALTER COLUMN patron_id TYPE VARCHAR(20);
ALTER TABLE cowork_subscriptions ALTER COLUMN patron_id TYPE VARCHAR(20);
ALTER TABLE invoices ALTER COLUMN patron_id TYPE VARCHAR(20);
ALTER TABLE reading_history ALTER COLUMN patron_id TYPE VARCHAR(20);

-- Step 4: Update existing values in child tables to new format
-- Convert numeric IDs to NUKG format (e.g., 1 -> NUKG0001000)
UPDATE borrowings SET patron_id = 'NUKG' || LPAD(patron_id, 7, '0')
WHERE patron_id ~ '^[0-9]+$';

UPDATE reservations SET patron_id = 'NUKG' || LPAD(patron_id, 7, '0')
WHERE patron_id ~ '^[0-9]+$';

UPDATE reviews SET patron_id = 'NUKG' || LPAD(patron_id, 7, '0')
WHERE patron_id ~ '^[0-9]+$';

UPDATE cowork_bookings SET patron_id = 'NUKG' || LPAD(patron_id, 7, '0')
WHERE patron_id ~ '^[0-9]+$';

UPDATE cowork_subscriptions SET patron_id = 'NUKG' || LPAD(patron_id, 7, '0')
WHERE patron_id ~ '^[0-9]+$';

UPDATE invoices SET patron_id = 'NUKG' || LPAD(patron_id, 7, '0')
WHERE patron_id ~ '^[0-9]+$';

UPDATE reading_history SET patron_id = 'NUKG' || LPAD(patron_id, 7, '0')
WHERE patron_id ~ '^[0-9]+$';

-- Step 5: Now change the main patrons table
-- First drop the primary key constraint
ALTER TABLE patrons DROP CONSTRAINT IF EXISTS patrons_pkey;

-- Change the column type
ALTER TABLE patrons ALTER COLUMN patron_id TYPE VARCHAR(20);

-- Update existing values in patrons table
UPDATE patrons SET patron_id = 'NUKG' || LPAD(patron_id, 7, '0')
WHERE patron_id ~ '^[0-9]+$';

-- Add the primary key back
ALTER TABLE patrons ADD PRIMARY KEY (patron_id);

-- Add the format constraint
ALTER TABLE patrons ADD CONSTRAINT patron_id_format CHECK (patron_id ~ '^[A-Z0-9]+$');

-- Step 6: Recreate all foreign key constraints
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

COMMIT;

-- Verification queries (run after migration):
-- SELECT patron_id FROM patrons LIMIT 5;
-- SELECT column_name, data_type FROM information_schema.columns
-- WHERE table_name = 'patrons' AND column_name = 'patron_id';
