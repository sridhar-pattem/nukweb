-- ============================================================================
-- FIX PARTIAL MIGRATION - Complete the Enhanced Catalogue Schema
-- ============================================================================
-- This script completes the migration that was partially applied
-- Run this to add missing columns and materialized view
-- ============================================================================

-- ============================================================================
-- SECTION 1: ADD MISSING COLUMNS TO BOOKS TABLE
-- ============================================================================

-- Check and add columns to books table (only if they don't exist)
DO $$
BEGIN
    -- Additional Identifiers
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                   WHERE table_name='books' AND column_name='isbn_10') THEN
        ALTER TABLE books ADD COLUMN isbn_10 VARCHAR(10);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                   WHERE table_name='books' AND column_name='issn') THEN
        ALTER TABLE books ADD COLUMN issn VARCHAR(9);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                   WHERE table_name='books' AND column_name='other_identifier') THEN
        ALTER TABLE books ADD COLUMN other_identifier VARCHAR(255);
    END IF;

    -- Title Information
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                   WHERE table_name='books' AND column_name='subtitle') THEN
        ALTER TABLE books ADD COLUMN subtitle TEXT;
    END IF;

    -- Statement of Responsibility
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                   WHERE table_name='books' AND column_name='statement_of_responsibility') THEN
        ALTER TABLE books ADD COLUMN statement_of_responsibility TEXT;
    END IF;

    -- Edition Information
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                   WHERE table_name='books' AND column_name='edition_statement') THEN
        ALTER TABLE books ADD COLUMN edition_statement VARCHAR(255);
    END IF;

    -- Publication Information
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                   WHERE table_name='books' AND column_name='place_of_publication') THEN
        ALTER TABLE books ADD COLUMN place_of_publication VARCHAR(255);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                   WHERE table_name='books' AND column_name='copyright_year') THEN
        ALTER TABLE books ADD COLUMN copyright_year INTEGER;
    END IF;

    -- Series Information
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                   WHERE table_name='books' AND column_name='series_title') THEN
        ALTER TABLE books ADD COLUMN series_title VARCHAR(500);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                   WHERE table_name='books' AND column_name='series_number') THEN
        ALTER TABLE books ADD COLUMN series_number VARCHAR(100);
    END IF;

    -- Physical Description
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                   WHERE table_name='books' AND column_name='extent') THEN
        ALTER TABLE books ADD COLUMN extent VARCHAR(255);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                   WHERE table_name='books' AND column_name='dimensions') THEN
        ALTER TABLE books ADD COLUMN dimensions VARCHAR(100);
    END IF;

    -- RDA Types
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                   WHERE table_name='books' AND column_name='content_type') THEN
        ALTER TABLE books ADD COLUMN content_type VARCHAR(50) REFERENCES rda_content_types(code);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                   WHERE table_name='books' AND column_name='media_type') THEN
        ALTER TABLE books ADD COLUMN media_type VARCHAR(50) REFERENCES rda_media_types(code);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                   WHERE table_name='books' AND column_name='carrier_type') THEN
        ALTER TABLE books ADD COLUMN carrier_type VARCHAR(50) REFERENCES rda_carrier_types(code);
    END IF;

    -- Subject Access
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                   WHERE table_name='books' AND column_name='subjects') THEN
        ALTER TABLE books ADD COLUMN subjects TEXT[];
    END IF;

    -- Notes
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                   WHERE table_name='books' AND column_name='notes') THEN
        ALTER TABLE books ADD COLUMN notes TEXT[];
    END IF;

    -- Target Audience
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                   WHERE table_name='books' AND column_name='target_audience') THEN
        ALTER TABLE books ADD COLUMN target_audience VARCHAR(100);
    END IF;

    -- Language
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                   WHERE table_name='books' AND column_name='language') THEN
        ALTER TABLE books ADD COLUMN language VARCHAR(10);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                   WHERE table_name='books' AND column_name='additional_languages') THEN
        ALTER TABLE books ADD COLUMN additional_languages VARCHAR(10)[];
    END IF;

    -- Collection & Organization
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                   WHERE table_name='books' AND column_name='call_number') THEN
        ALTER TABLE books ADD COLUMN call_number VARCHAR(100);
    END IF;

    -- Resource Type
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                   WHERE table_name='books' AND column_name='resource_type') THEN
        ALTER TABLE books ADD COLUMN resource_type VARCHAR(50) DEFAULT 'book';
    END IF;

    -- Cover Images
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                   WHERE table_name='books' AND column_name='thumbnail_url') THEN
        ALTER TABLE books ADD COLUMN thumbnail_url TEXT;
    END IF;

    -- System Metadata
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                   WHERE table_name='books' AND column_name='cataloged_by') THEN
        ALTER TABLE books ADD COLUMN cataloged_by VARCHAR(255);
    END IF;

    -- Status (CRITICAL - this is the missing column causing the error)
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                   WHERE table_name='books' AND column_name='is_active') THEN
        ALTER TABLE books ADD COLUMN is_active BOOLEAN DEFAULT TRUE;
    END IF;

    RAISE NOTICE 'Books table columns updated successfully';
END $$;

-- Update existing books with default RDA types
UPDATE books SET
  content_type = 'txt',
  media_type = 'n',
  carrier_type = 'nc',
  resource_type = 'book',
  language = 'eng',
  is_active = TRUE
WHERE content_type IS NULL;

-- ============================================================================
-- SECTION 2: ADD INDEXES FOR NEW BOOKS COLUMNS
-- ============================================================================

CREATE INDEX IF NOT EXISTS idx_books_content_type ON books(content_type);
CREATE INDEX IF NOT EXISTS idx_books_media_type ON books(media_type);
CREATE INDEX IF NOT EXISTS idx_books_carrier_type ON books(carrier_type);
CREATE INDEX IF NOT EXISTS idx_books_resource_type ON books(resource_type);
CREATE INDEX IF NOT EXISTS idx_books_language ON books(language);
CREATE INDEX IF NOT EXISTS idx_books_call_number ON books(call_number);
CREATE INDEX IF NOT EXISTS idx_books_subjects ON books USING gin(subjects);

-- ============================================================================
-- SECTION 3: UPDATE BORROWINGS TABLE (book_id -> item_id)
-- ============================================================================

DO $$
BEGIN
    -- Check if item_id already exists
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                   WHERE table_name='borrowings' AND column_name='item_id') THEN

        -- Add temporary column to store old book_id
        ALTER TABLE borrowings ADD COLUMN old_book_id INTEGER;
        UPDATE borrowings SET old_book_id = book_id;

        -- Add new item_id column (nullable initially)
        ALTER TABLE borrowings ADD COLUMN item_id INTEGER REFERENCES items(item_id);

        -- Map existing active borrowings to items
        UPDATE borrowings br
        SET item_id = (
          SELECT i.item_id
          FROM items i
          WHERE i.book_id = br.old_book_id
            AND i.circulation_status IN ('checked_out', 'available')
          LIMIT 1
        )
        WHERE br.status = 'active';

        -- For returned borrowings, just pick any item from the same book
        UPDATE borrowings br
        SET item_id = (
          SELECT i.item_id
          FROM items i
          WHERE i.book_id = br.old_book_id
          LIMIT 1
        )
        WHERE br.status = 'returned' AND br.item_id IS NULL;

        -- Make item_id NOT NULL
        ALTER TABLE borrowings ALTER COLUMN item_id SET NOT NULL;

        -- Drop old book_id column
        ALTER TABLE borrowings DROP COLUMN book_id;
        ALTER TABLE borrowings DROP COLUMN old_book_id;

        -- Add index
        CREATE INDEX idx_borrowings_item_id ON borrowings(item_id);

        RAISE NOTICE 'Borrowings table migrated to use item_id';
    ELSE
        RAISE NOTICE 'Borrowings table already has item_id column';
    END IF;

    -- Add staff tracking columns if they don't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                   WHERE table_name='borrowings' AND column_name='checked_out_by') THEN
        ALTER TABLE borrowings ADD COLUMN checked_out_by VARCHAR(100);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                   WHERE table_name='borrowings' AND column_name='checked_in_by') THEN
        ALTER TABLE borrowings ADD COLUMN checked_in_by VARCHAR(100);
    END IF;
END $$;

-- ============================================================================
-- SECTION 4: CREATE MATERIALIZED VIEW FOR BOOK AVAILABILITY
-- ============================================================================

-- Drop existing view if it exists (in case of partial creation)
DROP MATERIALIZED VIEW IF EXISTS mv_book_availability;

CREATE MATERIALIZED VIEW mv_book_availability AS
SELECT
  b.book_id,
  b.isbn,
  b.title,
  COUNT(i.item_id) as total_items,
  COUNT(i.item_id) FILTER (WHERE i.circulation_status = 'available') as available_items,
  COUNT(i.item_id) FILTER (WHERE i.circulation_status = 'checked_out') as checked_out_items,
  COUNT(i.item_id) FILTER (WHERE i.circulation_status = 'on_hold') as on_hold_items,
  COUNT(i.item_id) FILTER (WHERE i.circulation_status IN ('lost', 'missing', 'damaged')) as unavailable_items
FROM books b
LEFT JOIN items i ON b.book_id = i.book_id
WHERE b.is_active = TRUE
GROUP BY b.book_id, b.isbn, b.title;

CREATE UNIQUE INDEX idx_mv_book_availability_book_id ON mv_book_availability(book_id);
CREATE INDEX idx_mv_book_availability_isbn ON mv_book_availability(isbn);

-- ============================================================================
-- SECTION 5: CREATE TRIGGERS
-- ============================================================================

-- Trigger to update item circulation_status timestamp
CREATE OR REPLACE FUNCTION update_item_status_changed_at()
RETURNS TRIGGER AS $$
BEGIN
  IF OLD.circulation_status != NEW.circulation_status THEN
    NEW.status_changed_at = CURRENT_TIMESTAMP;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_item_status_trigger ON items;
CREATE TRIGGER update_item_status_trigger
  BEFORE UPDATE ON items
  FOR EACH ROW
  EXECUTE FUNCTION update_item_status_changed_at();

-- Trigger to update item status when borrowings change
CREATE OR REPLACE FUNCTION sync_item_circulation_status()
RETURNS TRIGGER AS $$
BEGIN
  -- When a new borrowing is created (checkout)
  IF TG_OP = 'INSERT' AND NEW.status = 'active' THEN
    UPDATE items
    SET circulation_status = 'checked_out',
        status_changed_at = CURRENT_TIMESTAMP
    WHERE item_id = NEW.item_id;

  -- When a borrowing is returned
  ELSIF TG_OP = 'UPDATE' AND OLD.status = 'active' AND NEW.status = 'returned' THEN
    UPDATE items
    SET circulation_status = 'available',
        status_changed_at = CURRENT_TIMESTAMP
    WHERE item_id = NEW.item_id;

  -- When a borrowing is marked overdue (keep as checked_out)
  ELSIF TG_OP = 'UPDATE' AND OLD.status = 'active' AND NEW.status = 'overdue' THEN
    UPDATE items
    SET status_changed_at = CURRENT_TIMESTAMP
    WHERE item_id = NEW.item_id;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS sync_item_status_trigger ON borrowings;
CREATE TRIGGER sync_item_status_trigger
  AFTER INSERT OR UPDATE ON borrowings
  FOR EACH ROW
  EXECUTE FUNCTION sync_item_circulation_status();

-- ============================================================================
-- SECTION 6: MIGRATE EXISTING DATA
-- ============================================================================

-- Migrate existing authors to contributors (if not already done)
INSERT INTO contributors (name, name_type, created_at)
SELECT DISTINCT
  TRIM(author) as name,
  'person' as name_type,
  MIN(created_at) as created_at
FROM books
WHERE author IS NOT NULL
  AND TRIM(author) != ''
  AND NOT EXISTS (
    SELECT 1 FROM contributors c WHERE c.name = TRIM(books.author)
  )
GROUP BY TRIM(author)
ON CONFLICT DO NOTHING;

-- Link books to their authors via book_contributors (if not already done)
INSERT INTO book_contributors (book_id, contributor_id, role, sequence_number)
SELECT
  b.book_id,
  c.contributor_id,
  'author' as role,
  1 as sequence_number
FROM books b
JOIN contributors c ON TRIM(b.author) = c.name
WHERE b.author IS NOT NULL
  AND TRIM(b.author) != ''
  AND NOT EXISTS (
    SELECT 1 FROM book_contributors bc
    WHERE bc.book_id = b.book_id AND bc.contributor_id = c.contributor_id
  )
ON CONFLICT DO NOTHING;

-- Merge genre and sub_genre into subjects array (if not already done)
UPDATE books
SET subjects = ARRAY(
  SELECT DISTINCT unnest(
    ARRAY[genre, sub_genre]
  )
  WHERE unnest IS NOT NULL AND unnest != ''
)
WHERE (genre IS NOT NULL OR sub_genre IS NOT NULL)
  AND (subjects IS NULL OR array_length(subjects, 1) IS NULL);

-- Create items from existing total_copies if not already done
INSERT INTO items (book_id, barcode, circulation_status, created_at)
SELECT
  b.book_id,
  'TEMP-' || LPAD(b.book_id::TEXT, 6, '0') || '-' || LPAD(series.num::TEXT, 3, '0') as barcode,
  CASE
    WHEN series.num <= COALESCE(b.available_copies, 0) THEN 'available'
    ELSE 'checked_out'
  END as circulation_status,
  b.created_at
FROM books b
CROSS JOIN LATERAL generate_series(1, GREATEST(COALESCE(b.total_copies, 0), 1)) AS series(num)
WHERE NOT EXISTS (
  SELECT 1 FROM items i WHERE i.book_id = b.book_id
)
ON CONFLICT (barcode) DO NOTHING;

-- ============================================================================
-- SECTION 7: REFRESH MATERIALIZED VIEW
-- ============================================================================

REFRESH MATERIALIZED VIEW mv_book_availability;

-- ============================================================================
-- VERIFICATION
-- ============================================================================

DO $$
DECLARE
  book_count INTEGER;
  item_count INTEGER;
  contributor_count INTEGER;
  relationship_count INTEGER;
  has_is_active BOOLEAN;
  has_item_id BOOLEAN;
  has_matview BOOLEAN;
BEGIN
  SELECT COUNT(*) INTO book_count FROM books;
  SELECT COUNT(*) INTO item_count FROM items;
  SELECT COUNT(*) INTO contributor_count FROM contributors;
  SELECT COUNT(*) INTO relationship_count FROM book_contributors;

  SELECT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name='books' AND column_name='is_active'
  ) INTO has_is_active;

  SELECT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name='borrowings' AND column_name='item_id'
  ) INTO has_item_id;

  SELECT EXISTS (
    SELECT 1 FROM pg_matviews WHERE matviewname='mv_book_availability'
  ) INTO has_matview;

  RAISE NOTICE '=================================================';
  RAISE NOTICE 'MIGRATION COMPLETION SUMMARY:';
  RAISE NOTICE '=================================================';
  RAISE NOTICE 'Books: %', book_count;
  RAISE NOTICE 'Items: %', item_count;
  RAISE NOTICE 'Contributors: %', contributor_count;
  RAISE NOTICE 'Book-Contributor Relationships: %', relationship_count;
  RAISE NOTICE '';
  RAISE NOTICE 'CRITICAL COLUMNS:';
  RAISE NOTICE '  books.is_active exists: %', has_is_active;
  RAISE NOTICE '  borrowings.item_id exists: %', has_item_id;
  RAISE NOTICE '  mv_book_availability exists: %', has_matview;
  RAISE NOTICE '=================================================';

  IF has_is_active AND has_item_id AND has_matview THEN
    RAISE NOTICE 'SUCCESS: All critical schema elements are in place!';
  ELSE
    RAISE WARNING 'Some critical elements are missing. Check the logs above.';
  END IF;
END $$;

-- ============================================================================
-- END OF FIX SCRIPT
-- ============================================================================
