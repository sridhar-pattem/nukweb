# Enhanced Catalogue Schema - Clean Implementation Guide

**Version**: 1.0 (Clean Slate)
**Date**: 2025-11-17
**Approach**: Fresh start with new schema - no data migration

---

## Overview

This is a **clean slate implementation** of the enhanced catalogue schema. No existing data is migrated - you start fresh with professional cataloging from day one.

### Key Features

✅ **Multiple Contributors** - Authors, illustrators, translators with roles
✅ **Individual Item Tracking** - Barcode-level copy management
✅ **RDA Format Types** - Professional classification (audiobooks, DVDs, etc.)
✅ **MARC Fields** - Edition, series, physical description
✅ **Simple to Use** - 2-3 minute cataloging time
✅ **Professional Results** - Library-quality records

---

## Tables Created

### Core Tables

1. **`books`** - Main bibliographic records
2. **`contributors`** - Authors, illustrators, publishers, etc.
3. **`book_contributors`** - Links books to contributors with roles
4. **`items`** - Individual physical copies with barcodes
5. **`borrowings`** - Updated to track item-level checkouts

### Reference Tables

6. **`rda_content_types`** - Text, audio, video, etc. (10 types)
7. **`rda_media_types`** - Unmediated, audio, video, etc. (6 types)
8. **`rda_carrier_types`** - Volume, disc, online resource, etc. (17 types)

### Views

9. **`mv_book_availability`** - Materialized view for quick availability lookup
10. **`v_books_with_contributors`** - Complete records with all contributors

---

## Schema Diagram

```
┌─────────────────────────────────────────────────────────┐
│                    RDA VOCABULARIES                     │
│  • rda_content_types (txt, spw, prm, sti, tdi...)      │
│  • rda_media_types (n, s, v, c...)                     │
│  • rda_carrier_types (nc, sd, vd, cr...)               │
└─────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────┐
│                        BOOKS                            │
│  Enhanced with MARC/RDA fields:                         │
│  • Title, subtitle, edition                             │
│  • Publisher, place, year                               │
│  • Series title/number                                  │
│  • Content/media/carrier types → RDA vocabularies       │
│  • Language, subjects, description                      │
│  • Call number, collection                              │
└──────────────┬──────────────────────────────────────────┘
               │
       ├───────┴──────────┬────────────────┐
       ↓                  ↓                ↓
┌──────────────┐   ┌──────────────┐   ┌──────────────┐
│CONTRIBUTORS  │   │    ITEMS     │   │ BORROWINGS   │
│              │   │              │   │              │
│• Name        │   │• Barcode     │   │• Patron      │
│• Type        │   │• Status      │   │• Item ────┐  │
│• Dates       │   │• Location    │   │• Dates    │  │
│• Bio note    │   │• Condition   │   │• Status   │  │
└──────────────┘   └──────────────┘   └───────────┼──┘
       │                                           │
       └────────────┐                              │
                    ↓                              │
             ┌──────────────┐                      │
             │BOOK_         │                      │
             │CONTRIBUTORS  │                      │
             │              │                      │
             │• Role ───────┼──────────────────────┘
             │• Sequence    │   (tracks which item
             └──────────────┘    is checked out)
```

---

## Installation Steps

### Step 1: Run the Migration Script

```bash
# Assuming you're starting fresh or want to replace old catalogue tables

# Connect to your database
psql -U nukweb_user -d nukweb

# Run the clean installation script
\i /home/user/nukweb/database/migrations/004_enhanced_catalogue_clean.sql
```

**Output**:
```
========================================
Enhanced Catalogue Schema - Clean Install
========================================
RDA Vocabularies:
  Content Types: 10
  Media Types: 6
  Carrier Types: 17

Tables Created:
  ✓ contributors
  ✓ books (enhanced)
  ✓ book_contributors
  ✓ items
  ✓ borrowings (updated)

Views Created:
  ✓ mv_book_availability (materialized)
  ✓ v_books_with_contributors

Ready for cataloging!
========================================
```

### Step 2: Verify Installation

```sql
-- Check tables exist
\dt

-- Check RDA vocabularies loaded
SELECT COUNT(*) FROM rda_content_types;  -- Should be 10
SELECT COUNT(*) FROM rda_media_types;    -- Should be 6
SELECT COUNT(*) FROM rda_carrier_types;  -- Should be 17

-- View content types
SELECT code, label FROM rda_content_types ORDER BY code;

-- View media types
SELECT code, label FROM rda_media_types ORDER BY code;
```

---

## Cataloging Your First Book

### Example: Print Book

```sql
-- 1. Add the author (if not exists)
INSERT INTO contributors (name, name_type, date_of_birth, date_of_death)
VALUES ('Rowling, J.K.', 'person', '1965', NULL)
RETURNING contributor_id;
-- Returns: contributor_id = 1

-- 2. Add the book
INSERT INTO books (
  isbn,
  title,
  subtitle,
  statement_of_responsibility,
  edition_statement,
  publisher,
  place_of_publication,
  publication_year,
  series_title,
  series_number,
  extent,
  content_type,
  media_type,
  carrier_type,
  language,
  subjects,
  description,
  age_rating,
  collection_id,
  call_number,
  cover_image_url,
  resource_type
) VALUES (
  '9780439708180',
  'Harry Potter and the Sorcerer''s Stone',
  NULL,
  'by J.K. Rowling',
  NULL,
  'Scholastic Inc.',
  'New York',
  1998,
  'Harry Potter',
  'Book 1',
  '309 pages',
  'txt',   -- text
  'n',     -- unmediated
  'nc',    -- volume
  'eng',   -- English
  ARRAY['Fantasy', 'Children''s Fiction', 'Magic'],
  'A young wizard begins his magical education at Hogwarts School of Witchcraft and Wizardry.',
  '10+ years',
  1,       -- collection_id (ensure collection exists)
  'J-FIC-ROW',
  'https://example.com/covers/hp1.jpg',
  'book'
)
RETURNING book_id;
-- Returns: book_id = 1

-- 3. Link book to author
INSERT INTO book_contributors (book_id, contributor_id, role, sequence_number)
VALUES (1, 1, 'author', 1);

-- 4. Add physical copies
INSERT INTO items (book_id, barcode, circulation_status, shelf_location, acquisition_date)
VALUES
  (1, 'HP001-001', 'available', 'J-FIC-ROW', '2025-11-17'),
  (1, 'HP001-002', 'available', 'J-FIC-ROW', '2025-11-17'),
  (1, 'HP001-003', 'available', 'J-FIC-ROW', '2025-11-17');

-- 5. Refresh availability view
REFRESH MATERIALIZED VIEW mv_book_availability;

-- 6. View complete record
SELECT * FROM v_books_with_contributors WHERE book_id = 1;
```

### Example: Audiobook

```sql
-- 1. Add narrator
INSERT INTO contributors (name, name_type)
VALUES
  ('King, Stephen', 'person'),
  ('Patton, Will', 'person')
RETURNING contributor_id;
-- Returns: contributor_id = 2, 3

-- 2. Add audiobook
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
  description,
  collection_id,
  resource_type
) VALUES (
  '9781442344983',
  '11/22/63',
  'by Stephen King ; read by Will Patton',
  'Simon & Schuster Audio',
  2011,
  '30 audio discs (approximately 30 hr.)',
  'spw',   -- spoken word
  's',     -- audio
  'sd',    -- audio disc
  'eng',
  'A time-travel thriller about preventing the JFK assassination.',
  1,
  'audiobook'
)
RETURNING book_id;
-- Returns: book_id = 2

-- 3. Link to author and narrator
INSERT INTO book_contributors (book_id, contributor_id, role, sequence_number)
VALUES
  (2, 2, 'author', 1),
  (2, 3, 'narrator', 1);

-- 4. Add physical copy
INSERT INTO items (book_id, barcode, circulation_status, shelf_location)
VALUES (2, 'AUD-001', 'available', 'AUDIOBOOKS-K');
```

### Example: DVD

```sql
-- 1. Add contributors
INSERT INTO contributors (name, name_type)
VALUES
  ('Nolan, Christopher', 'person'),
  ('Warner Home Video', 'organization')
RETURNING contributor_id;
-- Returns: contributor_id = 4, 5

-- 2. Add DVD
INSERT INTO books (
  title,
  statement_of_responsibility,
  publisher,
  publication_year,
  extent,
  content_type,
  media_type,
  carrier_type,
  language,
  description,
  collection_id,
  call_number,
  resource_type
) VALUES (
  'Inception',
  'directed by Christopher Nolan',
  'Warner Home Video',
  2010,
  '1 videodisc (148 min.)',
  'tdi',   -- two-dimensional moving image
  'v',     -- video
  'vd',    -- videodisc
  'eng',
  'A thief who steals corporate secrets through dream-sharing technology.',
  1,
  'DVD-INC',
  'dvd'
)
RETURNING book_id;
-- Returns: book_id = 3

-- 3. Link to director
INSERT INTO book_contributors (book_id, contributor_id, role, sequence_number)
VALUES (3, 4, 'director', 1);

-- 4. Add copy
INSERT INTO items (book_id, barcode, circulation_status, shelf_location)
VALUES (3, 'DVD-001', 'available', 'DVD-SECTION');
```

---

## Common Queries

### Find all books by an author

```sql
SELECT * FROM get_books_by_contributor(1, 'author');

-- Or manually:
SELECT b.title, b.publication_year, ba.available_items
FROM books b
JOIN book_contributors bc ON b.book_id = bc.book_id
JOIN contributors c ON bc.contributor_id = c.contributor_id
LEFT JOIN mv_book_availability ba ON b.book_id = ba.book_id
WHERE c.name = 'Rowling, J.K.'
  AND bc.role = 'author'
ORDER BY b.publication_year;
```

### Find all audiobooks

```sql
SELECT
  b.title,
  b.publisher,
  b.publication_year,
  ba.available_items
FROM books b
LEFT JOIN mv_book_availability ba ON b.book_id = ba.book_id
WHERE b.content_type = 'spw'  -- spoken word
  AND b.media_type = 's'      -- audio
ORDER BY b.title;
```

### Find all items for a specific book

```sql
SELECT
  i.barcode,
  i.circulation_status,
  i.shelf_location,
  i.condition
FROM items i
JOIN books b ON i.book_id = b.book_id
WHERE b.isbn = '9780439708180'
ORDER BY i.barcode;
```

### Get complete book record with all contributors

```sql
SELECT * FROM v_books_with_contributors
WHERE book_id = 1;

-- This returns book with contributors as JSON array:
-- contributors: [
--   {"name": "Rowling, J.K.", "role": "author", "dates": "1965-"},
--   {"name": "GrandPré, Mary", "role": "illustrator", "dates": "1954-"}
-- ]
```

### Check availability of a book

```sql
SELECT * FROM get_book_availability(1);

-- Or use materialized view:
SELECT * FROM mv_book_availability WHERE book_id = 1;
```

### Search books by subject

```sql
SELECT title, publication_year
FROM books
WHERE 'Fantasy' = ANY(subjects)
ORDER BY publication_year DESC;
```

### Find all books in a series

```sql
SELECT
  b.title,
  b.series_number,
  b.publication_year,
  ba.available_items
FROM books b
LEFT JOIN mv_book_availability ba ON b.book_id = ba.book_id
WHERE b.series_title = 'Harry Potter'
ORDER BY b.series_number;
```

---

## Circulation Workflows

### Check Out an Item

```sql
-- 1. Find available item
SELECT item_id, barcode
FROM items
WHERE book_id = 1
  AND circulation_status = 'available'
LIMIT 1;
-- Returns: item_id = 1, barcode = 'HP001-001'

-- 2. Create borrowing
INSERT INTO borrowings (
  patron_id,
  item_id,
  checkout_date,
  due_date,
  checked_out_by
) VALUES (
  'PAT001',
  1,
  CURRENT_DATE,
  CURRENT_DATE + INTERVAL '14 days',
  'admin@nuklibrary.com'
);

-- Item status automatically updates to 'checked_out' via trigger
```

### Return an Item

```sql
-- Update borrowing
UPDATE borrowings
SET
  status = 'returned',
  return_date = CURRENT_DATE,
  checked_in_by = 'admin@nuklibrary.com'
WHERE borrowing_id = 1;

-- Item status automatically updates to 'available' via trigger

-- Refresh availability
REFRESH MATERIALIZED VIEW mv_book_availability;
```

---

## RDA Format Type Quick Reference

### Content Types

| Code | Label | Use For |
|------|-------|---------|
| `txt` | text | Books, articles, printed materials |
| `spw` | spoken word | Audiobooks, lectures |
| `prm` | performed music | Music CDs, records |
| `sti` | still image | Art books, photograph collections |
| `tdi` | 2D moving image | DVDs, videos, films |
| `ntm` | notated music | Sheet music, scores |
| `cod` | computer dataset | Databases |
| `cop` | computer program | Software |
| `cri` | cartographic image | Maps, atlases |

### Media Types

| Code | Label | Use For |
|------|-------|---------|
| `n` | unmediated | Physical books (no device needed) |
| `s` | audio | Audiobooks, music CDs |
| `v` | video | DVDs, Blu-rays, videos |
| `c` | computer | E-books, software, online resources |
| `g` | projected | Slides |
| `h` | microform | Microfilm, microfiche |

### Carrier Types (Common)

| Code | Label | Media | Use For |
|------|-------|-------|---------|
| `nc` | volume | n | Books, bound journals |
| `nb` | sheet | n | Maps, posters |
| `sd` | audio disc | s | CDs, vinyl records |
| `ss` | audiocassette | s | Cassette tapes |
| `vd` | videodisc | v | DVDs, Blu-rays |
| `vf` | videocassette | v | VHS tapes |
| `cr` | online resource | c | E-books, websites, streaming |
| `cd` | computer disc | c | CD-ROMs, DVD-ROMs |

---

## Maintenance Tasks

### Refresh Availability View

```sql
-- Run daily or after batch updates
REFRESH MATERIALIZED VIEW mv_book_availability;

-- Or use helper function
SELECT refresh_book_availability();
```

### Update Book Information

```sql
UPDATE books
SET
  edition_statement = '10th Anniversary Edition',
  publication_year = 2008,
  updated_at = CURRENT_TIMESTAMP
WHERE book_id = 1;
```

### Add New Contributor to Existing Book

```sql
-- Add illustrator
INSERT INTO contributors (name, name_type)
VALUES ('GrandPré, Mary', 'person')
RETURNING contributor_id;

INSERT INTO book_contributors (book_id, contributor_id, role, sequence_number)
VALUES (1, 6, 'illustrator', 1);
```

### Mark Item as Lost

```sql
UPDATE items
SET
  circulation_status = 'lost',
  notes = 'Reported lost by patron on 2025-11-17'
WHERE item_id = 1;
```

---

## Best Practices

### Cataloging

1. **Use ISBN lookup** to auto-fill metadata when possible
2. **Always add contributors** with proper roles (author, illustrator, etc.)
3. **Select correct RDA types** for better discovery
4. **Use standardized call numbers** for easy shelving
5. **Add subjects** for better search results

### Item Management

1. **Use meaningful barcodes** (e.g., prefix by type: BOOK-, AUD-, DVD-)
2. **Record acquisition info** (date, price, source) for inventory
3. **Update condition notes** regularly
4. **Use shelf locations** consistently

### Maintenance

1. **Refresh availability view** daily or after batch operations
2. **Review damaged items** regularly
3. **Clean up withdrawn items** periodically
4. **Verify contributor records** for duplicates

---

## Troubleshooting

### Issue: Borrowing won't save

**Solution**: Check that item exists and is not already checked out:
```sql
SELECT item_id, circulation_status
FROM items
WHERE barcode = 'HP001-001';
```

### Issue: Availability counts seem wrong

**Solution**: Refresh the materialized view:
```sql
REFRESH MATERIALIZED VIEW mv_book_availability;
```

### Issue: Can't delete a book

**Solution**: Check for dependencies:
```sql
-- Check for items
SELECT COUNT(*) FROM items WHERE book_id = 1;

-- Check for active borrowings
SELECT COUNT(*) FROM borrowings b
JOIN items i ON b.item_id = i.item_id
WHERE i.book_id = 1 AND b.status = 'active';
```

---

## Next Steps

1. ✅ **Schema installed** - Database is ready
2. 📚 **Start cataloging** - Add your first books
3. 🔄 **Test circulation** - Check out and return items
4. 🎨 **Update frontend** - Modify UI to use new schema
5. 📊 **Build reports** - Create analytics on your collection

---

## Additional Resources

- **Full Design**: `/docs/ENHANCED_CATALOGUE_SCHEMA.md`
- **Quick Guide**: `/docs/ENHANCED_SCHEMA_QUICK_GUIDE.md`
- **Migration Script**: `/database/migrations/004_enhanced_catalogue_clean.sql`

---

**Version**: 1.0 (Clean Slate)
**Last Updated**: 2025-11-17
**Status**: Ready for production use
