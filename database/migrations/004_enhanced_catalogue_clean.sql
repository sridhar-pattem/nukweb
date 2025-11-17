-- ============================================================================
-- ENHANCED CATALOGUE SCHEMA - CLEAN IMPLEMENTATION
-- Simplified MARC with Strategic RDA Elements
--
-- Purpose: Professional cataloging for small-to-medium libraries
-- Approach: Clean slate - no migration from old schema
-- Complexity: Low (easy to learn and use)
--
-- Version: 1.0
-- Date: 2025-11-17
-- ============================================================================

-- ============================================================================
-- SECTION 1: RDA CONTROLLED VOCABULARIES
-- ============================================================================

-- RDA Content Types
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

-- RDA Carrier Types
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
-- SECTION 2: CONTRIBUTORS (Authors, Illustrators, Publishers, etc.)
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
  alternate_names TEXT[],

  -- Biographical Information
  biographical_note TEXT,

  -- Authority Control (optional)
  authority_id VARCHAR(100),
  authority_source VARCHAR(50),

  -- System
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_contributors_name ON contributors(name);
CREATE INDEX idx_contributors_type ON contributors(name_type);
CREATE INDEX idx_contributors_authority_id ON contributors(authority_id);

-- ============================================================================
-- SECTION 3: ENHANCED BOOKS TABLE
-- ============================================================================

CREATE TABLE books (
  book_id SERIAL PRIMARY KEY,

  -- IDENTIFIERS
  isbn VARCHAR(13),
  isbn_10 VARCHAR(10),
  issn VARCHAR(9),
  other_identifier VARCHAR(255),

  -- TITLE INFORMATION (MARC 245)
  title VARCHAR(500) NOT NULL,
  subtitle TEXT,

  -- STATEMENT OF RESPONSIBILITY (MARC 245$c)
  statement_of_responsibility TEXT,

  -- EDITION INFORMATION (MARC 250)
  edition_statement VARCHAR(255),

  -- PUBLICATION INFORMATION (MARC 264)
  place_of_publication VARCHAR(255),
  publisher VARCHAR(255),
  publication_year INTEGER,
  copyright_year INTEGER,

  -- SERIES INFORMATION (MARC 490)
  series_title VARCHAR(500),
  series_number VARCHAR(100),

  -- PHYSICAL DESCRIPTION (MARC 300)
  extent VARCHAR(255),
  dimensions VARCHAR(100),

  -- RDA CONTENT/MEDIA/CARRIER TYPES
  content_type VARCHAR(50) NOT NULL DEFAULT 'txt' REFERENCES rda_content_types(code),
  media_type VARCHAR(50) NOT NULL DEFAULT 'n' REFERENCES rda_media_types(code),
  carrier_type VARCHAR(50) NOT NULL DEFAULT 'nc' REFERENCES rda_carrier_types(code),

  -- SUBJECT ACCESS
  subjects TEXT[],

  -- NOTES
  description TEXT,
  notes TEXT[],

  -- TARGET AUDIENCE
  age_rating VARCHAR(50),
  target_audience VARCHAR(100),

  -- LANGUAGE (ISO 639-2/B)
  language VARCHAR(10) DEFAULT 'eng',
  additional_languages VARCHAR(10)[],

  -- COLLECTION & ORGANIZATION
  collection_id INTEGER REFERENCES collections(collection_id),
  call_number VARCHAR(100),

  -- COVER IMAGES
  cover_image_url TEXT,
  thumbnail_url TEXT,

  -- RESOURCE TYPE
  resource_type VARCHAR(50) DEFAULT 'book',

  -- SYSTEM METADATA
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  cataloged_by VARCHAR(255),

  -- STATUS
  is_active BOOLEAN DEFAULT TRUE
);

CREATE INDEX idx_books_isbn ON books(isbn);
CREATE INDEX idx_books_isbn_10 ON books(isbn_10);
CREATE INDEX idx_books_issn ON books(issn);
CREATE INDEX idx_books_title ON books(title);
CREATE INDEX idx_books_publication_year ON books(publication_year);
CREATE INDEX idx_books_content_type ON books(content_type);
CREATE INDEX idx_books_media_type ON books(media_type);
CREATE INDEX idx_books_carrier_type ON books(carrier_type);
CREATE INDEX idx_books_resource_type ON books(resource_type);
CREATE INDEX idx_books_language ON books(language);
CREATE INDEX idx_books_collection_id ON books(collection_id);
CREATE INDEX idx_books_call_number ON books(call_number);
CREATE INDEX idx_books_subjects ON books USING gin(subjects);

-- ============================================================================
-- SECTION 4: BOOK-CONTRIBUTORS RELATIONSHIP
-- ============================================================================

CREATE TABLE book_contributors (
  book_contributor_id SERIAL PRIMARY KEY,
  book_id INTEGER NOT NULL REFERENCES books(book_id) ON DELETE CASCADE,
  contributor_id INTEGER NOT NULL REFERENCES contributors(contributor_id) ON DELETE CASCADE,

  -- Role/Relationship
  role VARCHAR(100) NOT NULL,
  -- Common values: author, illustrator, translator, editor, photographer,
  --                narrator, composer, publisher, contributor

  -- Sequence (for ordering)
  sequence_number INTEGER DEFAULT 1,

  -- System
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT unique_book_contributor_role UNIQUE(book_id, contributor_id, role)
);

CREATE INDEX idx_book_contributors_book_id ON book_contributors(book_id);
CREATE INDEX idx_book_contributors_contributor_id ON book_contributors(contributor_id);
CREATE INDEX idx_book_contributors_role ON book_contributors(role);

-- ============================================================================
-- SECTION 5: ITEMS (Individual Physical Copies)
-- ============================================================================

CREATE TABLE items (
  item_id SERIAL PRIMARY KEY,
  book_id INTEGER NOT NULL REFERENCES books(book_id) ON DELETE CASCADE,

  -- Identification
  barcode VARCHAR(50) UNIQUE NOT NULL,
  accession_number VARCHAR(100),

  -- Location
  call_number VARCHAR(100),
  shelf_location VARCHAR(100),
  current_location VARCHAR(100),

  -- Circulation Status
  circulation_status VARCHAR(50) NOT NULL DEFAULT 'available',
  -- Possible values:
  --   available, checked_out, on_hold, in_transit, in_processing,
  --   in_repair, lost, missing, damaged, withdrawn, reference_only

  status_changed_at TIMESTAMP,

  -- Condition
  condition VARCHAR(50),
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
-- SECTION 6: BORROWINGS (Updated to use items)
-- ============================================================================

CREATE TABLE borrowings (
  borrowing_id SERIAL PRIMARY KEY,
  patron_id VARCHAR(20) REFERENCES patrons(patron_id) ON DELETE CASCADE,
  item_id INTEGER REFERENCES items(item_id) ON DELETE CASCADE,

  -- Circulation
  checkout_date DATE NOT NULL DEFAULT CURRENT_DATE,
  due_date DATE NOT NULL,
  return_date DATE,

  -- Renewals
  renewal_count INTEGER DEFAULT 0 CHECK (renewal_count <= 2),

  -- Status
  status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'returned', 'overdue')),

  -- Staff
  checked_out_by VARCHAR(100),
  checked_in_by VARCHAR(100),

  -- System
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_borrowings_patron_id ON borrowings(patron_id);
CREATE INDEX idx_borrowings_item_id ON borrowings(item_id);
CREATE INDEX idx_borrowings_status ON borrowings(status);
CREATE INDEX idx_borrowings_due_date ON borrowings(due_date);

-- ============================================================================
-- SECTION 7: MATERIALIZED VIEW FOR BOOK AVAILABILITY
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
-- SECTION 8: USEFUL VIEWS
-- ============================================================================

-- View: Complete book record with contributors
CREATE OR REPLACE VIEW v_books_with_contributors AS
SELECT
  b.book_id,
  b.isbn,
  b.title,
  b.subtitle,
  b.statement_of_responsibility,
  b.edition_statement,
  b.publisher,
  b.publication_year,
  b.series_title,
  b.series_number,
  b.extent,
  b.content_type,
  b.media_type,
  b.carrier_type,
  b.language,
  b.subjects,
  b.description,
  b.age_rating,
  b.collection_id,
  b.call_number,
  b.cover_image_url,
  b.resource_type,

  -- Aggregated contributors as JSON
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

  -- Availability data
  ba.total_items,
  ba.available_items,
  ba.checked_out_items,
  ba.on_hold_items

FROM books b
LEFT JOIN book_contributors bc ON b.book_id = bc.book_id
LEFT JOIN contributors c ON bc.contributor_id = c.contributor_id
LEFT JOIN mv_book_availability ba ON b.book_id = ba.book_id
WHERE b.is_active = TRUE
GROUP BY b.book_id, ba.total_items, ba.available_items, ba.checked_out_items, ba.on_hold_items;

-- ============================================================================
-- SECTION 9: TRIGGERS
-- ============================================================================

-- Trigger to update contributors updated_at
CREATE TRIGGER update_contributors_updated_at
  BEFORE UPDATE ON contributors
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Trigger to update books updated_at
CREATE TRIGGER update_books_updated_at
  BEFORE UPDATE ON books
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
  IF OLD.circulation_status IS DISTINCT FROM NEW.circulation_status THEN
    NEW.status_changed_at = CURRENT_TIMESTAMP;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_item_status_trigger
  BEFORE UPDATE ON items
  FOR EACH ROW
  EXECUTE FUNCTION update_item_status_changed_at();

-- Trigger to sync item status when borrowings change
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

CREATE TRIGGER sync_item_status_trigger
  AFTER INSERT OR UPDATE ON borrowings
  FOR EACH ROW
  EXECUTE FUNCTION sync_item_circulation_status();

-- ============================================================================
-- SECTION 10: HELPER FUNCTIONS
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
CREATE OR REPLACE FUNCTION get_books_by_contributor(
  p_contributor_id INTEGER,
  p_role VARCHAR DEFAULT NULL
)
RETURNS TABLE (
  book_id INTEGER,
  title VARCHAR,
  subtitle TEXT,
  isbn VARCHAR,
  publication_year INTEGER,
  role VARCHAR,
  available_items BIGINT
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    b.book_id,
    b.title,
    b.subtitle,
    b.isbn,
    b.publication_year,
    bc.role,
    ba.available_items
  FROM books b
  JOIN book_contributors bc ON b.book_id = bc.book_id
  LEFT JOIN mv_book_availability ba ON b.book_id = ba.book_id
  WHERE bc.contributor_id = p_contributor_id
    AND (p_role IS NULL OR bc.role = p_role)
    AND b.is_active = TRUE
  ORDER BY b.publication_year DESC NULLS LAST, b.title;
END;
$$ LANGUAGE plpgsql;

-- Function to refresh availability view
CREATE OR REPLACE FUNCTION refresh_book_availability()
RETURNS void AS $$
BEGIN
  REFRESH MATERIALIZED VIEW mv_book_availability;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- SECTION 11: SAMPLE DATA (Optional - for testing)
-- ============================================================================

-- Sample contributor
INSERT INTO contributors (name, name_type, date_of_birth, date_of_death)
VALUES ('Austen, Jane', 'person', '1775', '1817')
RETURNING contributor_id;

-- Sample book
INSERT INTO books (
  isbn,
  title,
  statement_of_responsibility,
  publisher,
  publication_year,
  extent,
  content_type,
  media_type,
  carrier_type,
  language,
  subjects,
  description,
  collection_id,
  resource_type
) VALUES (
  '9780141439518',
  'Pride and Prejudice',
  'by Jane Austen',
  'Penguin Classics',
  2003,
  '328 pages',
  'txt',
  'n',
  'nc',
  'eng',
  ARRAY['Fiction', 'Classic Literature', 'Romance'],
  'A classic novel of manners and romance in early 19th-century England.',
  1,
  'book'
) RETURNING book_id;

-- Link book to author (use actual IDs from above)
-- INSERT INTO book_contributors (book_id, contributor_id, role, sequence_number)
-- VALUES (1, 1, 'author', 1);

-- Sample items
-- INSERT INTO items (book_id, barcode, circulation_status, shelf_location)
-- VALUES
--   (1, '000123456', 'available', 'A-FIC-AUS'),
--   (1, '000123457', 'available', 'A-FIC-AUS'),
--   (1, '000123458', 'available', 'A-FIC-AUS');

-- ============================================================================
-- SECTION 12: INITIAL REFRESH
-- ============================================================================

REFRESH MATERIALIZED VIEW mv_book_availability;

-- ============================================================================
-- VERIFICATION
-- ============================================================================

DO $$
DECLARE
  content_type_count INTEGER;
  media_type_count INTEGER;
  carrier_type_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO content_type_count FROM rda_content_types;
  SELECT COUNT(*) INTO media_type_count FROM rda_media_types;
  SELECT COUNT(*) INTO carrier_type_count FROM rda_carrier_types;

  RAISE NOTICE '========================================';
  RAISE NOTICE 'Enhanced Catalogue Schema - Clean Install';
  RAISE NOTICE '========================================';
  RAISE NOTICE 'RDA Vocabularies:';
  RAISE NOTICE '  Content Types: %', content_type_count;
  RAISE NOTICE '  Media Types: %', media_type_count;
  RAISE NOTICE '  Carrier Types: %', carrier_type_count;
  RAISE NOTICE '';
  RAISE NOTICE 'Tables Created:';
  RAISE NOTICE '  ✓ contributors';
  RAISE NOTICE '  ✓ books (enhanced)';
  RAISE NOTICE '  ✓ book_contributors';
  RAISE NOTICE '  ✓ items';
  RAISE NOTICE '  ✓ borrowings (updated)';
  RAISE NOTICE '';
  RAISE NOTICE 'Views Created:';
  RAISE NOTICE '  ✓ mv_book_availability (materialized)';
  RAISE NOTICE '  ✓ v_books_with_contributors';
  RAISE NOTICE '';
  RAISE NOTICE 'Ready for cataloging!';
  RAISE NOTICE '========================================';
END $$;

-- ============================================================================
-- END OF SCHEMA
-- ============================================================================
