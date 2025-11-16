-- Fresh Start: Drop and recreate database with new schema
-- WARNING: This will DELETE ALL DATA! Use only if you don't have important data.
-- Alternative: Use migrate_patron_id_simple.sql to preserve existing data

-- Drop all tables in correct order (respecting foreign keys)
DROP TABLE IF EXISTS reading_history CASCADE;
DROP TABLE IF EXISTS invoices CASCADE;
DROP TABLE IF EXISTS cowork_subscriptions CASCADE;
DROP TABLE IF EXISTS cowork_bookings CASCADE;
DROP TABLE IF EXISTS reviews CASCADE;
DROP TABLE IF EXISTS reservations CASCADE;
DROP TABLE IF EXISTS borrowings CASCADE;
DROP TABLE IF EXISTS social_media_posts CASCADE;
DROP TABLE IF EXISTS notifications CASCADE;
DROP TABLE IF EXISTS books CASCADE;
DROP TABLE IF EXISTS age_ratings CASCADE;
DROP TABLE IF EXISTS patrons CASCADE;
DROP TABLE IF EXISTS membership_plans CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- Now run the updated schema.sql
\i schema.sql

-- Optionally, insert sample data
\i sample_data.sql

-- Success message
SELECT 'Database recreated successfully with new patron_id format!' as status;
