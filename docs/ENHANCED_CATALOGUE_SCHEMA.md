# Enhanced Catalogue Schema Design
## Simplified MARC with Strategic RDA Elements

**For**: Small-to-Medium Libraries (Nuk Library)
**Approach**: Practical enhancement without full RDA complexity
**Status**: Recommended Schema

---

## Philosophy

This design takes a **pragmatic middle ground**:
- ✅ Keeps your current book-centric model (simple to understand)
- ✅ Adds professional cataloging fields from MARC
- ✅ Incorporates high-value RDA elements (content/media/carrier types)
- ✅ Enables individual copy tracking (items)
- ✅ Improves author/contributor handling
- ❌ Avoids full WEMI complexity
- ❌ No expression/manifestation separation
- ❌ No elaborate relationship graphs

---

## Schema Overview

### Current Structure
```
books (flat table with everything)
  ↓
Simple but limited
```

### Enhanced Structure
```
books (enhanced bibliographic record)
  ↓
  ├─→ items (individual physical copies)
  ├─→ contributors (authors, illustrators, etc.)
  └─→ book_contributors (many-to-many relationship)
```

**Key Benefit**: Each book can have multiple contributors with roles, and multiple physical copies with individual tracking.

---

## Enhanced Tables

### 1. Enhanced Books Table

**Philosophy**: Keep one main bibliographic record per publication, but add professional cataloging fields.

```sql
CREATE TABLE books (
  book_id SERIAL PRIMARY KEY,

  -- IDENTIFIERS
  isbn VARCHAR(13) UNIQUE,
  isbn_10 VARCHAR(10),
  issn VARCHAR(9),  -- For magazines, journals
  other_identifier VARCHAR(255),  -- LCCN, OCLC, publisher number, etc.

  -- TITLE INFORMATION (MARC 245)
  title VARCHAR(500) NOT NULL,
  subtitle TEXT,  -- Parallel to "other title information"

  -- STATEMENT OF RESPONSIBILITY (MARC 245$c)
  -- "by Jane Austen ; illustrated by Hugh Thomson"
  statement_of_responsibility TEXT,

  -- EDITION INFORMATION (MARC 250)
  edition_statement VARCHAR(255),  -- "2nd edition", "Revised and updated"

  -- PUBLICATION INFORMATION (MARC 264)
  place_of_publication VARCHAR(255),
  publisher VARCHAR(255),
  publication_year INTEGER,
  copyright_year INTEGER,  -- Sometimes different from publication year

  -- SERIES INFORMATION (MARC 490)
  series_title VARCHAR(500),
  series_number VARCHAR(100),  -- "Book 3", "Volume 12", etc.

  -- PHYSICAL DESCRIPTION (MARC 300)
  extent VARCHAR(255),  -- "328 pages", "1 audio disc (2 hr., 30 min.)"
  dimensions VARCHAR(100),  -- "23 cm", "12 inch diameter"

  -- RDA CONTENT/MEDIA/CARRIER TYPES
  -- These are VERY useful for filtering and discovery
  content_type VARCHAR(50),  -- txt, spw, sti, prm, etc. (from RDA)
  media_type VARCHAR(50),    -- n (unmediated), s (audio), v (video), c (computer)
  carrier_type VARCHAR(50),  -- nc (volume), sd (audio disc), cr (online resource)

  -- SUBJECT ACCESS
  genre VARCHAR(100),
  sub_genre VARCHAR(100),
  subjects TEXT[],  -- Array of subject headings

  -- NOTES
  description TEXT,  -- Summary/abstract
  notes TEXT[],  -- Array of various notes

  -- TARGET AUDIENCE
  age_rating VARCHAR(50),
  target_audience VARCHAR(100),  -- juvenile, adolescent, adult, general, specialized

  -- LANGUAGE (MARC 008/35-37, 041)
  language VARCHAR(10),  -- ISO 639-2/B: eng, spa, fre, etc.
  additional_languages VARCHAR(10)[],  -- For multilingual resources

  -- COLLECTION & ORGANIZATION
  collection_id INTEGER NOT NULL REFERENCES collections(collection_id),
  call_number VARCHAR(100),  -- Shelf location classification

  -- COVER IMAGES
  cover_image_url TEXT,
  thumbnail_url TEXT,

  -- RESOURCE TYPE
  resource_type VARCHAR(50) DEFAULT 'book',
  -- book, audiobook, ebook, magazine, journal, dvd, music_cd, etc.

  -- SYSTEM METADATA
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  cataloged_by VARCHAR(255),  -- Who cataloged this

  -- STATUS
  -- Note: Individual copy status moved to items table
  is_active BOOLEAN DEFAULT TRUE
);
```

**What's New**:
- ✅ `subtitle` - Separate from main title
- ✅ `statement_of_responsibility` - Professional attribution
- ✅ `edition_statement` - Track different editions
- ✅ `series_title` and `series_number` - For book series
- ✅ `extent` and `dimensions` - Physical description
- ✅ `content_type`, `media_type`, `carrier_type` - **RDA vocabularies** (high value!)
- ✅ `subjects` array - Better subject access
- ✅ `language` - ISO codes
- ✅ `call_number` - Shelf classification
- ✅ `resource_type` - Not just books anymore

**What's Removed from This Table**:
- ❌ `author` field - Moved to contributors table (better handling)
- ❌ `total_copies`, `available_copies` - Moved to items table (accurate tracking)
- ❌ `status` - Each item has its own status

---

### 2. Contributors Table (Simplified Agents)

**Philosophy**: Track people and organizations separately, with basic authority control.

```sql
CREATE TABLE contributors (
  contributor_id SERIAL PRIMARY KEY,

  -- NAME INFORMATION
  name VARCHAR(500) NOT NULL,  -- "Austen, Jane" or "Penguin Books"
  name_type VARCHAR(20) NOT NULL CHECK (name_type IN ('person', 'organization')),

  -- DATES (for persons)
  date_of_birth VARCHAR(50),  -- "1775"
  date_of_death VARCHAR(50),  -- "1817"
  date_active VARCHAR(100),   -- "1950-1985" for organizations

  -- ALTERNATE NAMES
  alternate_names TEXT[],  -- Pseudonyms, variant spellings, translations

  -- BIOGRAPHICAL INFO
  biographical_note TEXT,

  -- AUTHORITY CONTROL (optional, can be added later)
  authority_id VARCHAR(100),  -- VIAF, LCNAF, ISNI if you want
  authority_source VARCHAR(50),

  -- SYSTEM
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_contributors_name ON contributors(name);
CREATE INDEX idx_contributors_type ON contributors(name_type);
```

**Benefits**:
- Reusable across books
- Track birth/death dates
- Handle pseudonyms and variant names
- Room for authority control later

---

### 3. Book-Contributors Relationship

**Philosophy**: Link books to contributors with specific roles.

```sql
CREATE TABLE book_contributors (
  book_contributor_id SERIAL PRIMARY KEY,
  book_id INTEGER NOT NULL REFERENCES books(book_id) ON DELETE CASCADE,
  contributor_id INTEGER NOT NULL REFERENCES contributors(contributor_id) ON DELETE CASCADE,

  -- ROLE/RELATIONSHIP
  role VARCHAR(100) NOT NULL,
  -- Common values: author, illustrator, translator, editor,
  --                photographer, narrator, composer, publisher, etc.

  -- SEQUENCE (for ordering)
  sequence_number INTEGER DEFAULT 1,

  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT unique_book_contributor_role UNIQUE(book_id, contributor_id, role)
);

CREATE INDEX idx_book_contributors_book_id ON book_contributors(book_id);
CREATE INDEX idx_book_contributors_contributor_id ON book_contributors(contributor_id);
CREATE INDEX idx_book_contributors_role ON book_contributors(role);
```

**Benefits**:
- Multiple authors per book
- Clear role attribution (author vs illustrator vs translator)
- Proper ordering (first author, second author)
- Can query "all books by Jane Austen" easily

---

### 4. Items Table (Individual Copy Tracking)

**Philosophy**: Each physical copy is tracked individually.

```sql
CREATE TABLE items (
  item_id SERIAL PRIMARY KEY,
  book_id INTEGER NOT NULL REFERENCES books(book_id) ON DELETE CASCADE,

  -- IDENTIFICATION
  barcode VARCHAR(50) UNIQUE NOT NULL,  -- Physical barcode on book
  accession_number VARCHAR(100),  -- Internal library number

  -- LOCATION
  call_number VARCHAR(100),  -- Can override book-level call number
  shelf_location VARCHAR(100),  -- "A-123", "Children's Section - Shelf 5"
  current_location VARCHAR(100),  -- "Main Floor", "In Repair", "Lost", etc.

  -- CIRCULATION STATUS
  circulation_status VARCHAR(50) NOT NULL DEFAULT 'available',
  -- Values: available, checked_out, on_hold, in_transit, in_repair,
  --         lost, missing, damaged, withdrawn, reference_only

  status_changed_at TIMESTAMP,

  -- CONDITION
  condition_notes TEXT,  -- "Good condition", "Cover damaged", etc.

  -- ACQUISITION
  acquisition_date DATE,
  acquisition_price DECIMAL(10,2),
  acquisition_source VARCHAR(255),  -- Vendor, donor, etc.

  -- NOTES
  notes TEXT,  -- Item-specific notes

  -- SYSTEM
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_items_book_id ON items(book_id);
CREATE INDEX idx_items_barcode ON items(barcode);
CREATE INDEX idx_items_circulation_status ON items(circulation_status);
CREATE INDEX idx_items_shelf_location ON items(shelf_location);
```

**Benefits**:
- Track each physical copy individually
- Know exactly which copy is checked out
- Track condition and location
- Accurate availability (count WHERE circulation_status = 'available')
- Can mark individual copies as lost/damaged without affecting others

---

### 5. Updated Borrowings Table

**Philosophy**: Borrow specific items, not just book records.

```sql
-- DROP the old borrowings table
DROP TABLE IF EXISTS borrowings CASCADE;

-- Create new borrowings table that references items
CREATE TABLE borrowings (
  borrowing_id SERIAL PRIMARY KEY,
  patron_id VARCHAR(20) REFERENCES patrons(patron_id) ON DELETE CASCADE,
  item_id INTEGER REFERENCES items(item_id) ON DELETE CASCADE,  -- Changed from book_id

  -- CIRCULATION
  checkout_date DATE NOT NULL DEFAULT CURRENT_DATE,
  due_date DATE NOT NULL,
  return_date DATE,

  -- RENEWALS
  renewal_count INTEGER DEFAULT 0 CHECK (renewal_count <= 2),

  -- STATUS
  status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'returned', 'overdue')),

  -- STAFF
  checked_out_by VARCHAR(100),  -- Staff member who processed checkout
  checked_in_by VARCHAR(100),   -- Staff member who processed return

  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_borrowings_patron_id ON borrowings(patron_id);
CREATE INDEX idx_borrowings_item_id ON borrowings(item_id);
CREATE INDEX idx_borrowings_status ON borrowings(status);
CREATE INDEX idx_borrowings_due_date ON borrowings(due_date);
```

**Benefits**:
- Know exactly which physical copy was borrowed
- Better auditing
- Handle cases where one copy is damaged but others are available

---

### 6. RDA Vocabulary Tables (Reference Data)

**Philosophy**: Controlled vocabularies improve search and filtering.

```sql
-- Content Types (most common ones)
CREATE TABLE rda_content_types (
  code VARCHAR(50) PRIMARY KEY,
  label VARCHAR(255) NOT NULL,
  definition TEXT,
  examples TEXT
);

INSERT INTO rda_content_types (code, label, definition, examples) VALUES
('txt', 'text', 'Content expressed through a form of notation for language', 'Books, articles'),
('spw', 'spoken word', 'Content expressed through language in audible form', 'Audiobooks'),
('prm', 'performed music', 'Content expressed through music in audible form', 'Music CDs'),
('sti', 'still image', 'Content expressed through line, shape, shading', 'Art books, photo collections'),
('tdi', 'two-dimensional moving image', 'Content expressed through moving images', 'DVDs, videos'),
('cod', 'computer dataset', 'Content expressed through digitally encoded data', 'Databases'),
('cop', 'computer program', 'Content expressed through instructions', 'Software'),
('xxx', 'other', 'Content not covered by other categories', '');

-- Media Types
CREATE TABLE rda_media_types (
  code VARCHAR(50) PRIMARY KEY,
  label VARCHAR(255) NOT NULL,
  definition TEXT
);

INSERT INTO rda_media_types (code, label, definition) VALUES
('n', 'unmediated', 'Media requiring no device (physical books)'),
('s', 'audio', 'Media requiring audio playback device'),
('v', 'video', 'Media requiring video playback device'),
('c', 'computer', 'Media requiring computer'),
('g', 'projected', 'Media requiring projector'),
('h', 'microform', 'Media requiring magnification device');

-- Carrier Types (most common ones)
CREATE TABLE rda_carrier_types (
  code VARCHAR(50) PRIMARY KEY,
  label VARCHAR(255) NOT NULL,
  media_type_code VARCHAR(50) REFERENCES rda_media_types(code),
  definition TEXT
);

INSERT INTO rda_carrier_types (code, label, media_type_code, definition) VALUES
('nc', 'volume', 'n', 'Sheets bound together (books)'),
('nb', 'sheet', 'n', 'Flat piece of paper (maps, posters)'),
('sd', 'audio disc', 's', 'Disc with sound (CD, vinyl)'),
('ss', 'audiocassette', 's', 'Cassette with sound'),
('vd', 'videodisc', 'v', 'Disc with video (DVD, Blu-ray)'),
('vf', 'videocassette', 'v', 'Cassette with video (VHS)'),
('cr', 'online resource', 'c', 'Digital content accessed via network'),
('cd', 'computer disc', 'c', 'Disc for computer (CD-ROM, DVD-ROM)');
```

---

## Migration from Current Schema

### Step 1: Add New Tables

```sql
-- Create contributors table
-- Create book_contributors table
-- Create items table
-- Create RDA vocabulary tables
```

### Step 2: Migrate Existing Data

```sql
-- 1. Create items from existing books
INSERT INTO items (book_id, barcode, circulation_status, created_at)
SELECT
  book_id,
  'TEMP-' || book_id || '-' || generate_series,  -- Temporary barcodes
  CASE
    WHEN generate_series <= available_copies THEN 'available'
    ELSE 'checked_out'
  END,
  created_at
FROM books,
  generate_series(1, total_copies);

-- 2. Migrate authors to contributors
INSERT INTO contributors (name, name_type)
SELECT DISTINCT
  author,
  'person'
FROM books
WHERE author IS NOT NULL AND author != '';

-- 3. Link books to contributors
INSERT INTO book_contributors (book_id, contributor_id, role, sequence_number)
SELECT
  b.book_id,
  c.contributor_id,
  'author',
  1
FROM books b
JOIN contributors c ON b.author = c.name
WHERE b.author IS NOT NULL AND b.author != '';

-- 4. Add default RDA types to existing books
UPDATE books SET
  content_type = 'txt',
  media_type = 'n',
  carrier_type = 'nc',
  resource_type = 'book',
  language = 'eng'
WHERE content_type IS NULL;
```

### Step 3: Update Borrowings

```sql
-- Update borrowings to reference items instead of books
-- This requires manual review if multiple copies exist
```

### Step 4: Add New Fields Gradually

Books table changes can be added incrementally:
1. Add new columns to books table
2. Populate from external APIs (Open Library, Google Books)
3. Fill in manually during cataloging

---

## Key Benefits Summary

### Compared to Current Schema

| Feature | Current | Enhanced | Benefit |
|---------|---------|----------|---------|
| **Multiple authors** | One author field | Contributors table | Handle multiple authors, illustrators, etc. |
| **Copy tracking** | Aggregate count | Individual items | Know exactly which copy, where it is |
| **Edition tracking** | None | Edition statement | Track 1st ed, 2nd ed, etc. |
| **Series tracking** | None | Series fields | Group series books |
| **Physical description** | None | Extent, dimensions | Better cataloging |
| **Format types** | None | RDA content/media/carrier | Filter by audiobook, ebook, DVD, etc. |
| **Language** | None | ISO language codes | Support multilingual collections |
| **Borrowing** | Book-level | Item-level | Accurate circulation tracking |
| **Subject access** | Genre + sub_genre | Subject array | Better search and discovery |

### Compared to Full RDA

| Feature | Full RDA (WEMI) | Enhanced Schema | Notes |
|---------|-----------------|-----------------|-------|
| **Complexity** | Very high (4+ entity levels) | Low (1 book level) | Much easier to understand |
| **Tables** | 10+ tables | 4 new tables | Manageable |
| **Learning curve** | Steep (weeks of training) | Gentle (hours) | Staff can learn quickly |
| **Cataloging time** | Significantly longer | Slightly longer | Minimal impact |
| **Professional value** | Highest | Good | 80% of benefit, 20% of effort |
| **Future-proof** | Most | Moderate | Room to grow if needed |

---

## Example Records

### Example 1: Simple Book

**Before (Current Schema)**:
```sql
INSERT INTO books (isbn, title, author, publisher, publication_year, total_copies, available_copies)
VALUES ('9780141439518', 'Pride and Prejudice', 'Jane Austen', 'Penguin Classics', 2003, 3, 2);
```

**After (Enhanced Schema)**:
```sql
-- 1. Book record
INSERT INTO books (
  isbn, title, subtitle, statement_of_responsibility,
  edition_statement, publisher, publication_year,
  extent, content_type, media_type, carrier_type,
  language, collection_id, resource_type
) VALUES (
  '9780141439518',
  'Pride and Prejudice',
  NULL,
  'by Jane Austen ; with an introduction by Vivien Jones',
  'Penguin Classics edition',
  'Penguin Books',
  2003,
  '328 pages',
  'txt',  -- text
  'n',    -- unmediated
  'nc',   -- volume
  'eng',  -- English
  1,
  'book'
);

-- 2. Contributor
INSERT INTO contributors (name, name_type, date_of_birth, date_of_death)
VALUES ('Austen, Jane', 'person', '1775', '1817');

-- 3. Link book to author
INSERT INTO book_contributors (book_id, contributor_id, role, sequence_number)
VALUES (1, 1, 'author', 1);

-- 4. Create 3 physical copies
INSERT INTO items (book_id, barcode, circulation_status, shelf_location)
VALUES
  (1, '000123456', 'available', 'A-FIC-AUS'),
  (1, '000123457', 'available', 'A-FIC-AUS'),
  (1, '000123458', 'checked_out', 'A-FIC-AUS');
```

### Example 2: Audiobook

```sql
-- 1. Book record
INSERT INTO books (
  isbn, title, statement_of_responsibility,
  publisher, publication_year,
  extent, content_type, media_type, carrier_type,
  language, collection_id, resource_type
) VALUES (
  '9781524756338',
  'Educated',
  'by Tara Westover ; read by Julia Whelan',
  'Random House Audio',
  2018,
  '12 audio discs (approximately 12 hr., 10 min.)',
  'spw',  -- spoken word
  's',    -- audio
  'sd',   -- audio disc
  'eng',
  1,
  'audiobook'
);

-- 2. Contributors
INSERT INTO contributors (name, name_type)
VALUES
  ('Westover, Tara', 'person'),
  ('Whelan, Julia', 'person');

-- 3. Link book to contributors with roles
INSERT INTO book_contributors (book_id, contributor_id, role, sequence_number)
VALUES
  (2, 2, 'author', 1),
  (2, 3, 'narrator', 1);

-- 4. Create physical copy
INSERT INTO items (book_id, barcode, circulation_status, shelf_location)
VALUES (2, '000234567', 'available', 'AUDIO-WES');
```

### Example 3: Book with Multiple Authors

```sql
-- 1. Book record
INSERT INTO books (
  isbn, title, statement_of_responsibility,
  publisher, publication_year,
  extent, content_type, media_type, carrier_type,
  language, collection_id, resource_type
) VALUES (
  '9780393978285',
  'Good Omens',
  'by Neil Gaiman and Terry Pratchett',
  'William Morrow',
  2019,
  '383 pages',
  'txt', 'n', 'nc', 'eng', 1, 'book'
);

-- 2. Contributors
INSERT INTO contributors (name, name_type, date_of_birth)
VALUES
  ('Gaiman, Neil', 'person', '1960'),
  ('Pratchett, Terry', 'person', '1948');

-- 3. Link book to both authors
INSERT INTO book_contributors (book_id, contributor_id, role, sequence_number)
VALUES
  (3, 4, 'author', 1),  -- First author
  (3, 5, 'author', 2);  -- Second author
```

---

## Implementation Recommendations

### Phase 1: Core Structure (Week 1-2)
- ✅ Create new tables (contributors, book_contributors, items, RDA vocabularies)
- ✅ Migrate existing data
- ✅ Update borrowings to use items
- ✅ Test thoroughly

### Phase 2: Enhanced Fields (Week 3-4)
- ✅ Add new columns to books table
- ✅ Update cataloging forms
- ✅ Populate RDA types for existing books
- ✅ Train staff on new fields

### Phase 3: API Integration (Week 5-6)
- ✅ Enhance ISBN lookup to populate new fields
- ✅ Use Open Library + Google Books for metadata
- ✅ Auto-populate content/media/carrier types

### Phase 4: Frontend Updates (Week 7-8)
- ✅ Update admin cataloging interface
- ✅ Update patron search/browse
- ✅ Add filtering by format (books, audiobooks, DVDs)
- ✅ Show all contributors with roles

---

## Catalog Entry Workflow

### New Book Cataloging Workflow

1. **ISBN Lookup** → Get basic metadata from API
2. **Book Record** → Fill in:
   - Title, subtitle
   - Publisher, place, year
   - Edition, series
   - Physical description
   - Content/media/carrier types
   - Language
3. **Contributors** → Add authors, illustrators, etc. with roles
4. **Items** → Create physical copies with barcodes
5. **Review** → Verify and save

### Quick Entry (for most books)
- ISBN lookup → Auto-fill most fields
- Confirm contributors
- Add barcodes for physical copies
- Done!

**Time**: 2-3 minutes for standard books (vs. 15+ minutes for full RDA)

---

## Querying Examples

### Find all books by an author
```sql
SELECT b.*, c.name as author_name
FROM books b
JOIN book_contributors bc ON b.book_id = bc.book_id
JOIN contributors c ON bc.contributor_id = c.contributor_id
WHERE c.name = 'Austen, Jane'
  AND bc.role = 'author';
```

### Find all audiobooks
```sql
SELECT * FROM books
WHERE content_type = 'spw'  -- spoken word
  AND media_type = 's';     -- audio
```

### Find available copies of a book
```sql
SELECT i.*
FROM items i
JOIN books b ON i.book_id = b.book_id
WHERE b.isbn = '9780141439518'
  AND i.circulation_status = 'available';
```

### Get complete book record with contributors
```sql
SELECT
  b.*,
  json_agg(
    json_build_object(
      'name', c.name,
      'role', bc.role,
      'dates', c.date_of_birth || '-' || c.date_of_death
    ) ORDER BY bc.sequence_number
  ) as contributors,
  COUNT(i.item_id) as total_copies,
  COUNT(i.item_id) FILTER (WHERE i.circulation_status = 'available') as available_copies
FROM books b
LEFT JOIN book_contributors bc ON b.book_id = bc.book_id
LEFT JOIN contributors c ON bc.contributor_id = c.contributor_id
LEFT JOIN items i ON b.book_id = i.book_id
WHERE b.book_id = 1
GROUP BY b.book_id;
```

---

## Conclusion

This enhanced schema gives you **80% of the professional cataloging benefits with 20% of the complexity** of full RDA.

### What You Get
✅ Professional MARC-based structure
✅ Multiple contributors with roles
✅ Individual copy tracking
✅ Better physical description
✅ RDA format types (huge win for discovery!)
✅ Series tracking
✅ Edition tracking
✅ Language support
✅ Room to grow

### What You Avoid
❌ WEMI complexity
❌ Multiple abstraction levels
❌ Steep learning curve
❌ Lengthy cataloging time
❌ Confusing relationship graphs

### Perfect For
- Small to medium libraries
- Libraries with limited cataloging staff
- Collections up to 50,000 items
- Standard materials (books, audiobooks, DVDs)
- Libraries wanting professional standards without enterprise complexity

---

**Next Steps**: Review this proposal and approve for implementation.
