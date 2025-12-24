-- Migration: Add ON UPDATE CASCADE to patron_id foreign keys
-- Date: 2024-12-25
-- Description: Allow patron_id updates to cascade to all related tables

-- Find all tables with patron_id foreign keys
-- borrowings, reservations, reviews, cowork_bookings, cowork_subscriptions,
-- invoices, reading_history, book_suggestions, event_registrations

-- 1. borrowings table
ALTER TABLE borrowings DROP CONSTRAINT IF EXISTS borrowings_patron_id_fkey;
ALTER TABLE borrowings ADD CONSTRAINT borrowings_patron_id_fkey
  FOREIGN KEY (patron_id) REFERENCES patrons(patron_id)
  ON DELETE CASCADE ON UPDATE CASCADE;

-- 2. reservations table
ALTER TABLE reservations DROP CONSTRAINT IF EXISTS reservations_patron_id_fkey;
ALTER TABLE reservations ADD CONSTRAINT reservations_patron_id_fkey
  FOREIGN KEY (patron_id) REFERENCES patrons(patron_id)
  ON DELETE CASCADE ON UPDATE CASCADE;

-- 3. reviews table
ALTER TABLE reviews DROP CONSTRAINT IF EXISTS reviews_patron_id_fkey;
ALTER TABLE reviews ADD CONSTRAINT reviews_patron_id_fkey
  FOREIGN KEY (patron_id) REFERENCES patrons(patron_id)
  ON DELETE CASCADE ON UPDATE CASCADE;

-- 4. cowork_bookings table
ALTER TABLE cowork_bookings DROP CONSTRAINT IF EXISTS cowork_bookings_patron_id_fkey;
ALTER TABLE cowork_bookings ADD CONSTRAINT cowork_bookings_patron_id_fkey
  FOREIGN KEY (patron_id) REFERENCES patrons(patron_id)
  ON DELETE CASCADE ON UPDATE CASCADE;

-- 5. cowork_subscriptions table
ALTER TABLE cowork_subscriptions DROP CONSTRAINT IF EXISTS cowork_subscriptions_patron_id_fkey;
ALTER TABLE cowork_subscriptions ADD CONSTRAINT cowork_subscriptions_patron_id_fkey
  FOREIGN KEY (patron_id) REFERENCES patrons(patron_id)
  ON DELETE CASCADE ON UPDATE CASCADE;

-- 6. invoices table
ALTER TABLE invoices DROP CONSTRAINT IF EXISTS invoices_patron_id_fkey;
ALTER TABLE invoices ADD CONSTRAINT invoices_patron_id_fkey
  FOREIGN KEY (patron_id) REFERENCES patrons(patron_id)
  ON DELETE CASCADE ON UPDATE CASCADE;

-- 7. reading_history table
ALTER TABLE reading_history DROP CONSTRAINT IF EXISTS reading_history_patron_id_fkey;
ALTER TABLE reading_history ADD CONSTRAINT reading_history_patron_id_fkey
  FOREIGN KEY (patron_id) REFERENCES patrons(patron_id)
  ON DELETE CASCADE ON UPDATE CASCADE;

-- 8. book_suggestions table
ALTER TABLE book_suggestions DROP CONSTRAINT IF EXISTS book_suggestions_patron_id_fkey;
ALTER TABLE book_suggestions ADD CONSTRAINT book_suggestions_patron_id_fkey
  FOREIGN KEY (patron_id) REFERENCES patrons(patron_id)
  ON DELETE CASCADE ON UPDATE CASCADE;

-- 9. event_registrations table (uses SET NULL on delete, keep that but add CASCADE on update)
ALTER TABLE event_registrations DROP CONSTRAINT IF EXISTS event_registrations_patron_id_fkey;
ALTER TABLE event_registrations ADD CONSTRAINT event_registrations_patron_id_fkey
  FOREIGN KEY (patron_id) REFERENCES patrons(patron_id)
  ON DELETE SET NULL ON UPDATE CASCADE;

-- Verify changes
SELECT
    tc.table_name,
    kcu.column_name,
    rc.update_rule,
    rc.delete_rule
FROM information_schema.table_constraints tc
JOIN information_schema.key_column_usage kcu
    ON tc.constraint_name = kcu.constraint_name
JOIN information_schema.referential_constraints rc
    ON tc.constraint_name = rc.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY'
    AND kcu.column_name = 'patron_id'
ORDER BY tc.table_name;
