-- ============================================================================
-- ENHANCED CATALOGUE SCHEMA MIGRATION
-- Simplified MARC with Strategic RDA Elements
--
-- Purpose: Upgrade from flat books table to professional cataloging schema
-- Approach: Practical middle ground - MARC fields + RDA vocabularies
-- Complexity: Low (suitable for small-to-medium libraries)
--
-- Version: 1.0
-- Date: 2025-11-17
-- ============================================================================

-- ============================================================================
-- SECTION 1: RDA CONTROLLED VOCABULARIES (Reference Tables)
-- ============================================================================

-- RDA Content Types (simplified list - most common values)
CREATE TABLE rda_content_types (
  code VARCHAR(50) PRIMARY KEY,
  label VARCHAR(255) NOT NULL,
  definition TEXT,
  examples TEXT
);

INSERT INTO rda_content_types (code, label, definition, examples) VALUES
('txt', 'text', 'Content expressed through a form of notation for language intended to be perceived visually', 'Books, articles, printed music'),
('spw', 'spoken word', 'Content expressed through language in an audible form', 'Audiobooks, audio lectures'),
('prm', 'performed music', 'Content expressed through music in an audible form', 'Music CDs, streaming music'),
('sti', 'still image', 'Content expressed through line, shape, shading, etc., intended to be perceived visually', 'Art books, photographs, posters'),
('tdi', 'two-dimensional moving image', 'Content expressed through images intended to be perceived as moving, in two dimensions', 'DVDs, streaming video, films'),
('cod', 'computer dataset', 'Content expressed through digitally encoded data', 'Databases, spreadsheets'),
('cop', 'computer program', 'Content expressed through digitally encoded instructions', 'Software, games'),
('cri', 'cartographic image', 'Content representing the Earth or celestial bodies', 'Maps, atlases, globes'),
('ntm', 'notated music', 'Content expressed through a form of musical notation', 'Sheet music, scores'),
('xxx', 'other', 'Content not covered by other categories', 'Mixed media, unusual formats');

-- RDA Media Types
CREATE TABLE rda_media_types (
  code VARCHAR(50) PRIMARY KEY,
  label VARCHAR(255) NOT NULL,
  definition TEXT
);

INSERT INTO rda_media_types (code, label, definition) VALUES
('n', 'unmediated', 'Media used to store content designed to be perceived directly through human senses without device'),
('s', 'audio', 'Media used to store content designed to be perceived through hearing with playback device'),
('v', 'video', 'Media used to store moving images, designed to be perceived visually with playback device'),
('c', 'computer', 'Media used to store electronic content designed to be processed by computer'),
('g', 'projected', 'Media used to store content designed to be projected for viewing'),
('h', 'microform', 'Media used to store reduced-size images requiring magnification');

-- RDA Carrier Types (simplified list - most common values)
CREATE TABLE rda_carrier_types (
  code VARCHAR(50) PRIMARY KEY,
  label VARCHAR(255) NOT NULL,
  media_type_code VARCHAR(50) REFERENCES rda_media_types(code),
  definition TEXT
);

INSERT INTO rda_carrier_types (code, label, media_type_code, definition) VALUES
-- Unmediated carriers
('nc', 'volume', 'n', 'One or more sheets bound together (books, bound journals)'),
('nb', 'sheet', 'n', 'Flat piece of paper or other material (maps, posters, charts)'),
('no', 'card', 'n', 'Small sheet of opaque material (flashcards, postcards)'),
-- Audio carriers
('sd', 'audio disc', 's', 'Disc on which audio is registered (CD, vinyl record)'),
('ss', 'audiocassette', 's', 'Cassette containing audiotape'),
('sz', 'other audio carrier', 's', 'Audio carrier not covered by specific term'),
-- Video carriers
('vd', 'videodisc', 'v', 'Disc on which video signals are registered (DVD, Blu-ray)'),
('vf', 'videocassette', 'v', 'Cassette containing videotape (VHS)'),
('vz', 'other video carrier', 'v', 'Video carrier not covered by specific term'),
-- Computer carriers
('cr', 'online resource', 'c', 'Digital resource accessed via network (websites, ebooks, streaming)'),
('cd', 'computer disc', 'c', 'Disc on which digital content is stored (CD-ROM, DVD-ROM)'),
('cz', 'other computer carrier', 'c', 'Computer carrier not covered by specific term'),
-- Projected carriers
('gs', 'slide', 'g', 'Transparent material with image for projection'),
('gz', 'other projected carrier', 'g', 'Projected carrier not covered by specific term'),
-- Microform carriers
('hb', 'microfiche', 'h', 'Sheet of film bearing micro-images'),
('hd', 'microfilm reel', 'h', 'Reel of microfilm'),
('hz', 'other microform carrier', 'h', 'Microform carrier not covered by specific term');

-- ============================================================================
-- SECTION 2: CONTRIBUTORS TABLE (Authors, Illustrators, etc.)
-- ============================================================================

CREATE TABLE contributors (
  contributor_id SERIAL PRIMARY KEY,

  -- Name Information
  name VARCHAR(500) NOT NULL,
  name_type VARCHAR(20) NOT NULL CHECK (name_type IN ('person', 'organization')),

  -- Dates (for persons)
  date_of_birth VARCHAR(50),
  date_of_death VARCHAR(50),

  -- Dates (for organizations)
  date_established VARCHAR(50),
  date_terminated VARCHAR(50),

  -- Alternate Names
  alternate_names TEXT[],  -- Pseudonyms, variant spellings, name in other languages

  -- Biographical Information
  biographical_note TEXT,

  -- Authority Control (optional - for future use)
  authority_id VARCHAR(100),     -- VIAF, LCNAF, ISNI, etc.
  authority_source VARCHAR(50),  -- 'VIAF', 'LCNAF', 'ISNI', etc.

  -- System
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_contributors_name ON contributors(name);
CREATE INDEX idx_contributors_type ON contributors(name_type);
CREATE INDEX idx_contributors_authority_id ON contributors(authority_id);

-- ============================================================================
-- SECTION 3: BOOK-CONTRIBUTORS RELATIONSHIP TABLE
-- ============================================================================

CREATE TABLE book_contributors (
  book_contributor_id SERIAL PRIMARY KEY,
  book_id INTEGER NOT NULL REFERENCES books(book_id) ON DELETE CASCADE,
  contributor_id INTEGER NOT NULL REFERENCES contributors(contributor_id) ON DELETE CASCADE,

  -- Role/Relationship
  role VARCHAR(100) NOT NULL,
  -- Common values: author, illustrator, translator, editor, photographer,
  --                narrator, composer, publisher, contributor, etc.

  -- Sequence (for ordering multiple contributors in same role)
  sequence_number INTEGER DEFAULT 1,

  -- System
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT unique_book_contributor_role UNIQUE(book_id, contributor_id, role)
);

CREATE INDEX idx_book_contributors_book_id ON book_contributors(book_id);
CREATE INDEX idx_book_contributors_contributor_id ON book_contributors(contributor_id);
CREATE INDEX idx_book_contributors_role ON book_contributors(role);

-- ============================================================================
-- SECTION 4: ENHANCE BOOKS TABLE
-- ============================================================================

-- Add new columns to existing books table
ALTER TABLE books

-- Additional Identifiers
ADD COLUMN isbn_10 VARCHAR(10),
ADD COLUMN issn VARCHAR(9),
ADD COLUMN other_identifier VARCHAR(255),

-- Title Information
ADD COLUMN subtitle TEXT,

-- Statement of Responsibility (MARC 245$c)
ADD COLUMN statement_of_responsibility TEXT,

-- Edition Information (MARC 250)
ADD COLUMN edition_statement VARCHAR(255),

-- Publication Information (enhanced)
ADD COLUMN place_of_publication VARCHAR(255),
ADD COLUMN copyright_year INTEGER,

-- Series Information (MARC 490)
ADD COLUMN series_title VARCHAR(500),
ADD COLUMN series_number VARCHAR(100),

-- Physical Description (MARC 300)
ADD COLUMN extent VARCHAR(255),
ADD COLUMN dimensions VARCHAR(100),

-- RDA Content/Media/Carrier Types
ADD COLUMN content_type VARCHAR(50) REFERENCES rda_content_types(code),
ADD COLUMN media_type VARCHAR(50) REFERENCES rda_media_types(code),
ADD COLUMN carrier_type VARCHAR(50) REFERENCES rda_carrier_types(code),

-- Subject Access (enhanced)
ADD COLUMN subjects TEXT[],

-- Notes
ADD COLUMN notes TEXT[],

-- Target Audience
ADD COLUMN target_audience VARCHAR(100),

-- Language
ADD COLUMN language VARCHAR(10),
ADD COLUMN additional_languages VARCHAR(10)[],

-- Collection & Organization
ADD COLUMN call_number VARCHAR(100),

-- Resource Type
ADD COLUMN resource_type VARCHAR(50) DEFAULT 'book',

-- Cover Images (enhanced)
ADD COLUMN thumbnail_url TEXT,

-- System Metadata
ADD COLUMN cataloged_by VARCHAR(255),

-- Status (enhanced)
ADD COLUMN is_active BOOLEAN DEFAULT TRUE;

-- Update existing books with default RDA types
UPDATE books SET
  content_type = 'txt',
  media_type = 'n',
  carrier_type = 'nc',
  resource_type = 'book',
  language = 'eng',
  is_active = TRUE
WHERE content_type IS NULL;

-- Add indexes for new fields
CREATE INDEX idx_books_content_type ON books(content_type);
CREATE INDEX idx_books_media_type ON books(media_type);
CREATE INDEX idx_books_carrier_type ON books(carrier_type);
CREATE INDEX idx_books_resource_type ON books(resource_type);
CREATE INDEX idx_books_language ON books(language);
CREATE INDEX idx_books_call_number ON books(call_number);
CREATE INDEX idx_books_subjects ON books USING gin(subjects);

-- ============================================================================
-- SECTION 5: ITEMS TABLE (Individual Copy Tracking)
-- ============================================================================

CREATE TABLE items (
  item_id SERIAL PRIMARY KEY,
  book_id INTEGER NOT NULL REFERENCES books(book_id) ON DELETE CASCADE,

  -- Identification
  barcode VARCHAR(50) UNIQUE NOT NULL,
  accession_number VARCHAR(100),

  -- Location
  call_number VARCHAR(100),  -- Can override book-level call number
  shelf_location VARCHAR(100),
  current_location VARCHAR(100),

  -- Circulation Status
  circulation_status VARCHAR(50) NOT NULL DEFAULT 'available',
  -- Possible values:
  --   available, checked_out, on_hold, in_transit, in_processing,
  --   in_repair, lost, missing, damaged, withdrawn, reference_only

  status_changed_at TIMESTAMP,

  -- Condition
  condition VARCHAR(50),  -- excellent, good, fair, poor
  condition_notes TEXT,

  -- Acquisition
  acquisition_date DATE,
  acquisition_price DECIMAL(10,2),
  acquisition_source VARCHAR(255),

  -- Notes
  notes TEXT,

  -- System
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_items_book_id ON items(book_id);
CREATE INDEX idx_items_barcode ON items(barcode);
CREATE INDEX idx_items_circulation_status ON items(circulation_status);
CREATE INDEX idx_items_shelf_location ON items(shelf_location);

-- ============================================================================
-- SECTION 6: MIGRATE EXISTING DATA
-- ============================================================================

-- Step 1: Migrate existing book copies to items table
-- Create items based on total_copies count
INSERT INTO items (book_id, barcode, circulation_status, created_at)
SELECT
  b.book_id,
  'TEMP-' || LPAD(b.book_id::TEXT, 6, '0') || '-' || LPAD(series.num::TEXT, 3, '0') as barcode,
  CASE
    WHEN series.num <= b.available_copies THEN 'available'
    ELSE 'checked_out'
  END as circulation_status,
  b.created_at
FROM books b
CROSS JOIN LATERAL generate_series(1, GREATEST(b.total_copies, 1)) AS series(num);

-- Step 2: Migrate existing authors to contributors
-- Insert unique authors as contributors
INSERT INTO contributors (name, name_type, created_at)
SELECT DISTINCT
  TRIM(author) as name,
  'person' as name_type,
  MIN(created_at) as created_at
FROM books
WHERE author IS NOT NULL
  AND TRIM(author) != ''
GROUP BY TRIM(author)
ON CONFLICT DO NOTHING;

-- Step 3: Link books to their authors via book_contributors
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
ON CONFLICT DO NOTHING;

-- Step 4: Merge genre and sub_genre into subjects array
UPDATE books
SET subjects = ARRAY(
  SELECT DISTINCT unnest(
    ARRAY[genre, sub_genre]
  )
  WHERE unnest IS NOT NULL AND unnest != ''
)
WHERE genre IS NOT NULL OR sub_genre IS NOT NULL;

-- ============================================================================
-- SECTION 7: UPDATE BORROWINGS TABLE
-- ============================================================================

-- First, create a temporary column to store the old book_id
ALTER TABLE borrowings ADD COLUMN old_book_id INTEGER;
UPDATE borrowings SET old_book_id = book_id;

-- Add new item_id column (nullable initially)
ALTER TABLE borrowings ADD COLUMN item_id INTEGER REFERENCES items(item_id);

-- Map existing active borrowings to items
-- For each active borrowing, find an available or checked_out item
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

-- Now make item_id NOT NULL and drop old book_id column
ALTER TABLE borrowings ALTER COLUMN item_id SET NOT NULL;
ALTER TABLE borrowings DROP COLUMN book_id;
ALTER TABLE borrowings DROP COLUMN old_book_id;

-- Add index for new item_id foreign key
CREATE INDEX idx_borrowings_item_id ON borrowings(item_id);

-- Add columns for staff tracking
ALTER TABLE borrowings
ADD COLUMN checked_out_by VARCHAR(100),
ADD COLUMN checked_in_by VARCHAR(100);

-- ============================================================================
-- SECTION 8: UPDATE RESERVATIONS TABLE
-- ============================================================================

-- Reservations can still reference books (not individual items)
-- No changes needed to reservations table

-- ============================================================================
-- SECTION 9: CREATE MATERIALIZED VIEW FOR BOOK AVAILABILITY
-- ============================================================================

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
-- SECTION 10: CREATE USEFUL VIEWS
-- ============================================================================

-- View: Complete book record with contributors
CREATE OR REPLACE VIEW v_books_with_contributors AS
SELECT
  b.*,
  json_agg(
    json_build_object(
      'contributor_id', c.contributor_id,
      'name', c.name,
      'name_type', c.name_type,
      'role', bc.role,
      'sequence', bc.sequence_number,
      'dates', CASE
        WHEN c.name_type = 'person' THEN
          COALESCE(c.date_of_birth, '') || CASE WHEN c.date_of_death IS NOT NULL THEN '-' || c.date_of_death ELSE '' END
        WHEN c.name_type = 'organization' THEN
          COALESCE(c.date_established, '') || CASE WHEN c.date_terminated IS NOT NULL THEN '-' || c.date_terminated ELSE '' END
        END
    ) ORDER BY bc.role, bc.sequence_number
  ) FILTER (WHERE c.contributor_id IS NOT NULL) as contributors,
  ba.total_items,
  ba.available_items,
  ba.checked_out_items
FROM books b
LEFT JOIN book_contributors bc ON b.book_id = bc.book_id
LEFT JOIN contributors c ON bc.contributor_id = c.contributor_id
LEFT JOIN mv_book_availability ba ON b.book_id = ba.book_id
WHERE b.is_active = TRUE
GROUP BY b.book_id, ba.total_items, ba.available_items, ba.checked_out_items;

-- ============================================================================
-- SECTION 11: UPDATE TRIGGERS
-- ============================================================================

-- Trigger to update contributors updated_at
CREATE TRIGGER update_contributors_updated_at
  BEFORE UPDATE ON contributors
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Trigger to update items updated_at
CREATE TRIGGER update_items_updated_at
  BEFORE UPDATE ON items
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

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
    -- Item remains checked_out, just update the timestamp
    UPDATE items
    SET status_changed_at = CURRENT_TIMESTAMP
    WHERE item_id = NEW.item_id;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER sync_item_status_trigger
  AFTER INSERT OR UPDATE ON borrowings
  FOR EACH ROW
  EXECUTE FUNCTION sync_item_circulation_status();

-- ============================================================================
-- SECTION 12: REMOVE OLD COLUMNS (Optional - run after verification)
-- ============================================================================

-- IMPORTANT: Only run these after verifying migration is successful!
-- Keep commented out for now.

-- Remove old author column (data now in contributors table)
-- ALTER TABLE books DROP COLUMN author;

-- Remove old total_copies and available_copies (data now in items table)
-- ALTER TABLE books DROP COLUMN total_copies;
-- ALTER TABLE books DROP COLUMN available_copies;

-- Remove old status column (status now tracked per item)
-- ALTER TABLE books DROP COLUMN status;

-- Remove old genre and sub_genre (data now in subjects array)
-- ALTER TABLE books DROP COLUMN genre;
-- ALTER TABLE books DROP COLUMN sub_genre;

-- ============================================================================
-- SECTION 13: HELPER FUNCTIONS
-- ============================================================================

-- Function to get book availability
CREATE OR REPLACE FUNCTION get_book_availability(p_book_id INTEGER)
RETURNS TABLE (
  total_items BIGINT,
  available_items BIGINT,
  checked_out_items BIGINT,
  on_hold_items BIGINT
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    COUNT(i.item_id) as total_items,
    COUNT(i.item_id) FILTER (WHERE i.circulation_status = 'available') as available_items,
    COUNT(i.item_id) FILTER (WHERE i.circulation_status = 'checked_out') as checked_out_items,
    COUNT(i.item_id) FILTER (WHERE i.circulation_status = 'on_hold') as on_hold_items
  FROM items i
  WHERE i.book_id = p_book_id;
END;
$$ LANGUAGE plpgsql;

-- Function to get all books by a contributor
CREATE OR REPLACE FUNCTION get_books_by_contributor(p_contributor_id INTEGER, p_role VARCHAR DEFAULT NULL)
RETURNS TABLE (
  book_id INTEGER,
  title VARCHAR,
  isbn VARCHAR,
  publication_year INTEGER,
  role VARCHAR
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    b.book_id,
    b.title,
    b.isbn,
    b.publication_year,
    bc.role
  FROM books b
  JOIN book_contributors bc ON b.book_id = bc.book_id
  WHERE bc.contributor_id = p_contributor_id
    AND (p_role IS NULL OR bc.role = p_role)
    AND b.is_active = TRUE
  ORDER BY b.publication_year DESC;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- SECTION 14: REFRESH MATERIALIZED VIEWS
-- ============================================================================

REFRESH MATERIALIZED VIEW mv_book_availability;

-- ============================================================================
-- VERIFICATION QUERIES
-- ============================================================================

-- Verify migration counts
DO $$
DECLARE
  book_count INTEGER;
  item_count INTEGER;
  contributor_count INTEGER;
  relationship_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO book_count FROM books;
  SELECT COUNT(*) INTO item_count FROM items;
  SELECT COUNT(*) INTO contributor_count FROM contributors;
  SELECT COUNT(*) INTO relationship_count FROM book_contributors;

  RAISE NOTICE 'Migration Summary:';
  RAISE NOTICE '  Books: %', book_count;
  RAISE NOTICE '  Items: %', item_count;
  RAISE NOTICE '  Contributors: %', contributor_count;
  RAISE NOTICE '  Book-Contributor Relationships: %', relationship_count;
  RAISE NOTICE '  Content Types: %', (SELECT COUNT(*) FROM rda_content_types);
  RAISE NOTICE '  Media Types: %', (SELECT COUNT(*) FROM rda_media_types);
  RAISE NOTICE '  Carrier Types: %', (SELECT COUNT(*) FROM rda_carrier_types);
END $$;

-- ============================================================================
-- END OF MIGRATION
-- ============================================================================

-- To rollback this migration (if needed), see rollback script:
-- database/migrations/003_rollback_enhanced_catalogue.sql
