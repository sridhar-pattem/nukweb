-- Migration: Add Collections Table and Update Books Table
-- This script creates a collections table and migrates existing collection data

-- Step 1: Create collections table
CREATE TABLE IF NOT EXISTS collections (
    collection_id SERIAL PRIMARY KEY,
    collection_name VARCHAR(100) UNIQUE NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Step 2: Insert existing collections from books table
INSERT INTO collections (collection_name)
SELECT DISTINCT collection
FROM books
WHERE collection IS NOT NULL AND collection != ''
ON CONFLICT (collection_name) DO NOTHING;

-- Step 3: Add collection_id column to books table
ALTER TABLE books ADD COLUMN IF NOT EXISTS collection_id INTEGER;

-- Step 4: Update books with collection_id based on collection name
UPDATE books b
SET collection_id = c.collection_id
FROM collections c
WHERE b.collection = c.collection_name;

-- Step 5: Add foreign key constraint
ALTER TABLE books
ADD CONSTRAINT fk_books_collection
FOREIGN KEY (collection_id) REFERENCES collections(collection_id) ON DELETE RESTRICT;

-- Step 6: Make collection_id NOT NULL (after data migration)
ALTER TABLE books ALTER COLUMN collection_id SET NOT NULL;

-- Step 7: Drop old collection column (keep it for now as backup)
-- ALTER TABLE books DROP COLUMN collection;

-- Step 8: Add trigger for updated_at on collections
CREATE TRIGGER update_collections_updated_at BEFORE UPDATE ON collections
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Step 9: Create index on collection_id
CREATE INDEX IF NOT EXISTS idx_books_collection_id ON books(collection_id);

-- Verify migration
SELECT 'Collections created:' as message, COUNT(*) as count FROM collections;
SELECT 'Books with collection_id:' as message, COUNT(*) as count FROM books WHERE collection_id IS NOT NULL;
