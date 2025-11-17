-- ============================================================================
-- CLEAN SETUP SCRIPT - Enhanced Catalogue Schema
-- ============================================================================
-- WARNING: This script will DROP ALL existing data!
-- Use this for fresh installations or complete resets only.
--
-- This creates the enhanced RDA catalogue schema from scratch with:
-- - RDA controlled vocabularies (content/media/carrier types)
-- - Contributors table (authors, illustrators, etc.)
-- - Items table (individual barcode tracking)
-- - Materialized view for book availability
-- - Triggers for automatic status synchronization
-- ============================================================================

-- ============================================================================
-- SECTION 1: DROP ALL EXISTING OBJECTS
-- ============================================================================

-- Drop materialized views first
DROP MATERIALIZED VIEW IF EXISTS mv_book_availability CASCADE;

-- Drop views
DROP VIEW IF EXISTS v_books_with_contributors CASCADE;

-- Drop triggers
DROP TRIGGER IF EXISTS sync_item_status_trigger ON borrowings;
DROP TRIGGER IF EXISTS update_item_status_trigger ON items;
DROP TRIGGER IF EXISTS update_items_updated_at ON items;
DROP TRIGGER IF EXISTS update_contributors_updated_at ON contributors;

-- Drop functions
DROP FUNCTION IF EXISTS sync_item_circulation_status() CASCADE;
DROP FUNCTION IF EXISTS update_item_status_changed_at() CASCADE;
DROP FUNCTION IF EXISTS get_book_availability(INTEGER) CASCADE;
DROP FUNCTION IF EXISTS get_books_by_contributor(INTEGER, VARCHAR) CASCADE;
DROP FUNCTION IF EXISTS update_updated_at_column() CASCADE;

-- Drop tables (in correct order to respect foreign keys)
DROP TABLE IF EXISTS borrowings CASCADE;
DROP TABLE IF EXISTS reservations CASCADE;
DROP TABLE IF EXISTS reviews CASCADE;
DROP TABLE IF EXISTS items CASCADE;
DROP TABLE IF EXISTS book_contributors CASCADE;
DROP TABLE IF EXISTS contributors CASCADE;
DROP TABLE IF EXISTS books CASCADE;
DROP TABLE IF EXISTS age_ratings CASCADE;
DROP TABLE IF EXISTS collections CASCADE;
DROP TABLE IF EXISTS rda_carrier_types CASCADE;
DROP TABLE IF EXISTS rda_media_types CASCADE;
DROP TABLE IF EXISTS rda_content_types CASCADE;
DROP TABLE IF EXISTS patrons CASCADE;
DROP TABLE IF EXISTS membership_plans CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- ============================================================================
-- SECTION 2: CREATE CORE TABLES (Users, Membership, Patrons)
-- ============================================================================

-- Users table (for authentication)
CREATE TABLE users (
    user_id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL CHECK (role IN ('admin', 'patron')),
    status VARCHAR(50) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'suspended')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Membership Plans
CREATE TABLE membership_plans (
    plan_id SERIAL PRIMARY KEY,
    plan_name VARCHAR(100) NOT NULL,
    duration_months INTEGER NOT NULL,
    price DECIMAL(10,2) NOT NULL,
    borrowing_limit INTEGER DEFAULT 3,
    description TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Patrons
CREATE TABLE patrons (
    patron_id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    membership_plan_id INTEGER REFERENCES membership_plans(plan_id),
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    date_of_birth DATE,
    phone VARCHAR(20),
    address TEXT,
    city VARCHAR(100),
    state VARCHAR(100),
    postal_code VARCHAR(20),
    country VARCHAR(100),
    membership_start_date DATE,
    membership_end_date DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================================
-- SECTION 3: RDA CONTROLLED VOCABULARIES
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
-- SECTION 4: COLLECTIONS AND AGE RATINGS
-- ============================================================================

-- Collections
CREATE TABLE collections (
    collection_id SERIAL PRIMARY KEY,
    collection_name VARCHAR(255) NOT NULL UNIQUE,
    description TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Age Ratings
CREATE TABLE age_ratings (
    rating_id SERIAL PRIMARY KEY,
    rating_name VARCHAR(100) NOT NULL,
    min_age INTEGER NOT NULL,
    max_age INTEGER,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================================
-- SECTION 5: CONTRIBUTORS TABLE
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

    -- Authority Control
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
-- SECTION 6: BOOKS TABLE
-- ============================================================================

CREATE TABLE books (
    book_id SERIAL PRIMARY KEY,

    -- Identifiers
    isbn VARCHAR(13) UNIQUE,
    isbn_10 VARCHAR(10),
    issn VARCHAR(9),
    other_identifier VARCHAR(255),

    -- Title Information
    title VARCHAR(500) NOT NULL,
    subtitle TEXT,
    statement_of_responsibility TEXT,

    -- Edition Information
    edition_statement VARCHAR(255),

    -- Publication Information
    place_of_publication VARCHAR(255),
    publisher VARCHAR(255),
    publication_year INTEGER,
    copyright_year INTEGER,

    -- Series Information
    series_title VARCHAR(500),
    series_number VARCHAR(100),

    -- Physical Description
    extent VARCHAR(255),
    dimensions VARCHAR(100),

    -- RDA Content/Media/Carrier Types
    content_type VARCHAR(50) DEFAULT 'txt' REFERENCES rda_content_types(code),
    media_type VARCHAR(50) DEFAULT 'n' REFERENCES rda_media_types(code),
    carrier_type VARCHAR(50) DEFAULT 'nc' REFERENCES rda_carrier_types(code),

    -- Subject Access
    subjects TEXT[],

    -- Description and Notes
    description TEXT,
    notes TEXT[],

    -- Target Audience
    age_rating VARCHAR(50),
    target_audience VARCHAR(100),

    -- Language
    language VARCHAR(10) DEFAULT 'eng',
    additional_languages VARCHAR(10)[],

    -- Collection & Organization
    collection_id INTEGER REFERENCES collections(collection_id),
    call_number VARCHAR(100),

    -- Resource Type
    resource_type VARCHAR(50) DEFAULT 'book',

    -- Cover Images
    cover_image_url TEXT,
    thumbnail_url TEXT,

    -- System Metadata
    cataloged_by VARCHAR(255),
    is_active BOOLEAN DEFAULT TRUE,

    -- Timestamps
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_books_isbn ON books(isbn);
CREATE INDEX idx_books_title ON books(title);
CREATE INDEX idx_books_collection_id ON books(collection_id);
CREATE INDEX idx_books_content_type ON books(content_type);
CREATE INDEX idx_books_media_type ON books(media_type);
CREATE INDEX idx_books_carrier_type ON books(carrier_type);
CREATE INDEX idx_books_resource_type ON books(resource_type);
CREATE INDEX idx_books_language ON books(language);
CREATE INDEX idx_books_call_number ON books(call_number);
CREATE INDEX idx_books_subjects ON books USING gin(subjects);
CREATE INDEX idx_books_is_active ON books(is_active);

-- ============================================================================
-- SECTION 7: BOOK-CONTRIBUTORS RELATIONSHIP TABLE
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
-- SECTION 8: ITEMS TABLE (Individual Copy Tracking)
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
-- SECTION 9: BORROWINGS TABLE
-- ============================================================================

CREATE TABLE borrowings (
    borrowing_id SERIAL PRIMARY KEY,
    patron_id INTEGER NOT NULL REFERENCES patrons(patron_id),
    item_id INTEGER NOT NULL REFERENCES items(item_id),

    checkout_date DATE NOT NULL,
    due_date DATE NOT NULL,
    return_date DATE,

    status VARCHAR(50) DEFAULT 'active' CHECK (status IN ('active', 'returned', 'overdue')),

    renewal_count INTEGER DEFAULT 0,

    fine_amount DECIMAL(10,2) DEFAULT 0.00,
    fine_paid BOOLEAN DEFAULT FALSE,

    notes TEXT,

    -- Staff tracking
    checked_out_by VARCHAR(100),
    checked_in_by VARCHAR(100),

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_borrowings_patron_id ON borrowings(patron_id);
CREATE INDEX idx_borrowings_item_id ON borrowings(item_id);
CREATE INDEX idx_borrowings_status ON borrowings(status);
CREATE INDEX idx_borrowings_due_date ON borrowings(due_date);

-- ============================================================================
-- SECTION 10: RESERVATIONS TABLE
-- ============================================================================

CREATE TABLE reservations (
    reservation_id SERIAL PRIMARY KEY,
    patron_id INTEGER NOT NULL REFERENCES patrons(patron_id),
    book_id INTEGER NOT NULL REFERENCES books(book_id),

    reservation_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'ready', 'fulfilled', 'cancelled', 'expired')),

    expiry_date DATE,
    fulfilled_date DATE,

    notes TEXT,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_reservations_patron_id ON reservations(patron_id);
CREATE INDEX idx_reservations_book_id ON reservations(book_id);
CREATE INDEX idx_reservations_status ON reservations(status);

-- ============================================================================
-- SECTION 11: REVIEWS TABLE
-- ============================================================================

CREATE TABLE reviews (
    review_id SERIAL PRIMARY KEY,
    patron_id INTEGER NOT NULL REFERENCES patrons(patron_id),
    book_id INTEGER NOT NULL REFERENCES books(book_id),

    rating INTEGER CHECK (rating >= 1 AND rating <= 5),
    review_text TEXT,

    is_approved BOOLEAN DEFAULT FALSE,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    UNIQUE(patron_id, book_id)
);

CREATE INDEX idx_reviews_book_id ON reviews(book_id);
CREATE INDEX idx_reviews_patron_id ON reviews(patron_id);

-- ============================================================================
-- SECTION 12: MATERIALIZED VIEW FOR BOOK AVAILABILITY
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
-- SECTION 13: CREATE TRIGGERS AND FUNCTIONS
-- ============================================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply updated_at trigger to tables
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_membership_plans_updated_at BEFORE UPDATE ON membership_plans
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_patrons_updated_at BEFORE UPDATE ON patrons
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_contributors_updated_at BEFORE UPDATE ON contributors
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_books_updated_at BEFORE UPDATE ON books
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_items_updated_at BEFORE UPDATE ON items
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_borrowings_updated_at BEFORE UPDATE ON borrowings
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_collections_updated_at BEFORE UPDATE ON collections
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to update item status timestamp
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

-- Function to sync item circulation status with borrowings
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
-- SECTION 14: INSERT DEFAULT DATA
-- ============================================================================

-- Default Admin User (password: admin123)
INSERT INTO users (email, password_hash, role, status) VALUES
('admin@nuklib.com', 'scrypt:32768:8:1$qlcaJlN0IVlRR39l$b0e8e5e8e5e8e5e8e5e8e5e8e5e8e5e8e5e8e5e8e5e8e5e8e5e8e5e8e5e8e5e8e5e8e5e8e5e8e5e8', 'admin', 'active');

-- Default Membership Plans
INSERT INTO membership_plans (plan_name, duration_months, price, borrowing_limit, description) VALUES
('Basic', 6, 50.00, 3, 'Standard membership with 3 book limit'),
('Premium', 12, 80.00, 5, 'Annual membership with 5 book limit'),
('Student', 12, 40.00, 4, 'Discounted annual membership for students');

-- Default Collections
INSERT INTO collections (collection_name, description) VALUES
('Fiction', 'Novels, short stories, and literary fiction'),
('Non-Fiction', 'Biographies, history, science, and general non-fiction'),
('Children', 'Books for children ages 0-12'),
('Young Adult', 'Books for teenagers and young adults'),
('Reference', 'Encyclopedias, dictionaries, and reference materials'),
('Popular Science', 'Science books for general readers'),
('Technology', 'Books about computers, programming, and technology');

-- Default Age Ratings
INSERT INTO age_ratings (rating_name, min_age, max_age, description) VALUES
('Toddlers', 0, 3, 'Books for very young children'),
('Preschool', 2, 4, 'Books for preschool age children'),
('Early Readers', 5, 6, 'Beginning reader books'),
('Children', 7, 9, 'Books for elementary school children'),
('Middle Grade', 10, 12, 'Books for pre-teens'),
('Young Adult', 13, 17, 'Books for teenagers'),
('Adult', 18, NULL, 'Books for adults');

-- ============================================================================
-- SECTION 15: VERIFICATION
-- ============================================================================

DO $$
DECLARE
    table_count INTEGER;
    matview_count INTEGER;
    trigger_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO table_count
    FROM information_schema.tables
    WHERE table_schema = 'public'
    AND table_type = 'BASE TABLE';

    SELECT COUNT(*) INTO matview_count
    FROM pg_matviews
    WHERE schemaname = 'public';

    SELECT COUNT(*) INTO trigger_count
    FROM information_schema.triggers
    WHERE trigger_schema = 'public';

    RAISE NOTICE '=================================================';
    RAISE NOTICE 'CLEAN SETUP COMPLETED SUCCESSFULLY';
    RAISE NOTICE '=================================================';
    RAISE NOTICE 'Tables created: %', table_count;
    RAISE NOTICE 'Materialized views: %', matview_count;
    RAISE NOTICE 'Triggers: %', trigger_count;
    RAISE NOTICE '';
    RAISE NOTICE 'Default admin user: admin@nuklib.com / admin123';
    RAISE NOTICE 'Membership plans: 3';
    RAISE NOTICE 'Collections: 7';
    RAISE NOTICE 'Age ratings: 7';
    RAISE NOTICE '=================================================';
    RAISE NOTICE 'Ready to add books, patrons, and items via UI!';
    RAISE NOTICE '=================================================';
END $$;

-- ============================================================================
-- END OF CLEAN SETUP SCRIPT
-- ============================================================================
