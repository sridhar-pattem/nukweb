# Enhanced Catalogue Schema - Quick Reference

## What Changed?

### From This (Current):
```
books table → Everything in one place
  - book_id
  - isbn
  - title
  - author (single string)
  - publisher
  - total_copies (aggregate count)
  - available_copies (aggregate count)
```

### To This (Enhanced):
```
books (enhanced with MARC/RDA fields)
  ├─→ contributors (authors, illustrators, etc.)
  │   └─→ book_contributors (links books to contributors with roles)
  └─→ items (individual physical copies with barcodes)
```

---

## Key Improvements

### 1. Multiple Contributors with Roles ✨
**Before**: One `author` field
**After**: Multiple contributors with specific roles

```sql
-- Example: Book with author and illustrator
Book: "The Wonderful Wizard of Oz"
  Contributors:
    - L. Frank Baum (author)
    - W.W. Denslow (illustrator)
```

### 2. Individual Copy Tracking ✨
**Before**: `total_copies = 3`, `available_copies = 2` (aggregate)
**After**: 3 separate item records with individual barcodes

```sql
Item 1: Barcode 000123456, Status: available, Location: J-FIC-BAU
Item 2: Barcode 000123457, Status: checked_out, Location: J-FIC-BAU
Item 3: Barcode 000123458, Status: available, Location: J-FIC-BAU
```

### 3. RDA Format Types ✨
**NEW**: Classify resources by content/media/carrier type

```sql
-- Print book
content_type: txt (text)
media_type: n (unmediated)
carrier_type: nc (volume)

-- Audiobook CD
content_type: spw (spoken word)
media_type: s (audio)
carrier_type: sd (audio disc)

-- DVD
content_type: tdi (two-dimensional moving image)
media_type: v (video)
carrier_type: vd (videodisc)
```

### 4. Professional MARC Fields ✨
**NEW**: Better cataloging metadata

- `subtitle` - Separate from main title
- `edition_statement` - "2nd edition", "Revised"
- `series_title` + `series_number` - Track book series
- `extent` - "328 pages", "2 audio discs (2 hr., 30 min.)"
- `statement_of_responsibility` - "by Jane Austen ; edited by John Smith"
- `call_number` - Library classification
- `language` - ISO language code

---

## What Stays the Same

✅ `books` table is still the main bibliographic record
✅ Simple to understand and use
✅ Familiar cataloging workflow
✅ Existing APIs continue to work

---

## Example Queries

### Find all books by an author
```sql
SELECT b.title, b.publication_year
FROM books b
JOIN book_contributors bc ON b.book_id = bc.book_id
JOIN contributors c ON bc.contributor_id = c.contributor_id
WHERE c.name = 'Rowling, J.K.'
  AND bc.role = 'author';
```

### Find all audiobooks
```sql
SELECT title, publisher, publication_year
FROM books
WHERE content_type = 'spw'  -- spoken word
  AND media_type = 's';     -- audio
```

### Find available copies of a book
```sql
SELECT i.barcode, i.shelf_location
FROM items i
JOIN books b ON i.book_id = b.book_id
WHERE b.isbn = '9780141439518'
  AND i.circulation_status = 'available';
```

### Get book with all contributors
```sql
SELECT * FROM v_books_with_contributors
WHERE book_id = 1;
-- Returns book with JSON array of all contributors and their roles
```

---

## Migration Impact

### What Gets Migrated Automatically ✅
- ✅ All existing books
- ✅ Authors → contributors table
- ✅ Book copies → items table (with temporary barcodes)
- ✅ Existing borrowings → linked to items
- ✅ Default RDA types assigned (txt/n/nc for books)

### What Needs Manual Work 📝
- 📝 Replace temporary barcodes with real ones
- 📝 Fill in new fields (edition, series, extent) as you catalog
- 📝 Add additional contributors (illustrators, translators, etc.)
- 📝 Assign correct content/media/carrier types for non-book items

---

## New Cataloging Workflow

### Quick Entry (Most Books)
1. **ISBN Lookup** → Auto-fill metadata
2. **Verify Contributors** → Confirm author(s), add illustrators if needed
3. **Add Physical Copies** → Scan barcodes, set shelf locations
4. **Save** → Done!

**Time**: 2-3 minutes

### Detailed Entry (Special Items)
1. **ISBN Lookup** → Get basic metadata
2. **Enhance Metadata**:
   - Add subtitle, edition statement
   - Add series information
   - Fill in physical description
   - Select correct content/media/carrier types
3. **Add All Contributors** → Authors, illustrators, translators, etc. with roles
4. **Add Physical Copies** → Barcodes and locations
5. **Review & Save**

**Time**: 5-10 minutes

---

## Format Type Cheat Sheet

### Common Content Types
| Code | Label | Use For |
|------|-------|---------|
| `txt` | text | Books, printed materials |
| `spw` | spoken word | Audiobooks |
| `prm` | performed music | Music CDs |
| `sti` | still image | Art books, photo collections |
| `tdi` | 2D moving image | DVDs, videos |
| `ntm` | notated music | Sheet music |

### Common Media Types
| Code | Label | Use For |
|------|-------|---------|
| `n` | unmediated | Physical books (no device needed) |
| `s` | audio | Audiobooks, music CDs |
| `v` | video | DVDs, Blu-rays |
| `c` | computer | E-books, software, online resources |

### Common Carrier Types
| Code | Label | Use For |
|------|-------|---------|
| `nc` | volume | Books, bound materials |
| `sd` | audio disc | CDs, vinyl records |
| `vd` | videodisc | DVDs, Blu-rays |
| `cr` | online resource | E-books, streaming, websites |

---

## FAQ

### Q: Can I still search by the old author field?
**A**: Yes! The migration keeps the old `author` column for now. But new searches should use the `contributors` table for better results.

### Q: What happens to my existing borrowings?
**A**: They are automatically linked to item records. If a book has 3 copies, the migration intelligently maps each borrowing to a specific item.

### Q: Do I have to fill in all the new fields?
**A**: No! Only `title` and `isbn` are required. The rest are optional. Add them as you have time or when cataloging new materials.

### Q: Can I still use aggregate copy counts?
**A**: Yes! Use the `mv_book_availability` materialized view or the `get_book_availability()` function to get totals.

### Q: What if I don't know the content/media/carrier type?
**A**: The migration assigns defaults (txt/n/nc) to existing books. For new items, the cataloging interface will suggest types based on the ISBN lookup.

---

## Benefits Summary

| Feature | Old Schema | Enhanced Schema |
|---------|-----------|-----------------|
| **Multiple authors** | ❌ One field | ✅ Unlimited with roles |
| **Individual copies** | ❌ Aggregate count | ✅ Barcode-level tracking |
| **Format filtering** | ❌ None | ✅ Filter by audiobook, DVD, etc. |
| **Series tracking** | ❌ None | ✅ Series title + number |
| **Edition tracking** | ❌ None | ✅ Edition statement |
| **Physical description** | ❌ None | ✅ Extent, dimensions |
| **Language tracking** | ❌ None | ✅ ISO language codes |
| **Professional cataloging** | ❌ Basic | ✅ MARC-compliant |

---

## Next Steps

1. **Review the design**: See `/docs/ENHANCED_CATALOGUE_SCHEMA.md`
2. **Test migration**: Run on development database
3. **Approve for production**: When ready
4. **Train staff**: On new fields and workflows (1-2 hours)
5. **Start using**: Enhanced cataloging immediately!

---

## Files

- **Design Doc**: `/docs/ENHANCED_CATALOGUE_SCHEMA.md` (Complete specification)
- **Migration SQL**: `/database/migrations/003_enhanced_catalogue_schema.sql` (Ready to run)
- **This Guide**: Quick reference for daily use

---

**Questions?** See the full design document for detailed explanations.
