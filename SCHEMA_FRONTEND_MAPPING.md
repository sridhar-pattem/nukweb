# Database Schema to Frontend Mapping

This document maps the enhanced RDA catalogue database schema to frontend components and fields.

---

## 1. Books Table → BookCatalogue Component

**File:** `frontend/src/components/BookCatalogue.js`

### Core Identification Fields

| Database Column | Frontend Field/Display | Component Location | Notes |
|----------------|----------------------|-------------------|-------|
| `book_id` | Hidden (used for navigation) | Line 75, 369, 382 | Primary key |
| `isbn` | Input: "ISBN" | Line 199-205 | Optional |
| `isbn_10` | *(Not displayed in catalogue)* | - | Backend only |
| `title` | Input: "Title *" | Line 207-214 | **Required** |
| `subtitle` | Input: "Subtitle" | Line 216-222 | Optional |

### Publication Information

| Database Column | Frontend Field/Display | Component Location | Notes |
|----------------|----------------------|-------------------|-------|
| `publisher` | Input: "Publisher" | Line 240-245 | Optional |
| `publication_year` | Input: "Publication Year" | Line 247-254 | Number input |
| `place_of_publication` | *(Not in add form)* | - | For book details |
| `copyright_year` | *(Not in add form)* | - | For book details |

### Collection & Classification

| Database Column | Frontend Field/Display | Component Location | Notes |
|----------------|----------------------|-------------------|-------|
| `collection_id` | Select: "Collection *" | Line 224-238 | **Required**, FK to collections |
| `collection_name` | Table column: "Collection" | Line 350, 400 | Joined from collections table |
| `call_number` | *(Not in add form)* | - | For librarian use |

### Content Description

| Database Column | Frontend Field/Display | Component Location | Notes |
|----------------|----------------------|-------------------|-------|
| `description` | Textarea: "Description" | Line 293-300 | Optional, from ISBN lookup |
| `age_rating` | Select: "Age Rating" | Line 271-283 | Values: 2-4, 5-6, 7-9, 10+ years |
| `language` | Select: "Language" | Line 256-270 | Default: 'eng' (English) |

### RDA Controlled Vocabularies

| Database Column | Frontend Field/Display | Component Location | Notes |
|----------------|----------------------|-------------------|-------|
| `content_type` | *(Not in add form)* | - | FK to rda_content_types, default: 'txt' |
| `media_type` | *(Not in add form)* | - | FK to rda_media_types, default: 'n' |
| `carrier_type` | *(Not in add form)* | - | FK to rda_carrier_types, default: 'nc' |

### Visual Assets

| Database Column | Frontend Field/Display | Component Location | Notes |
|----------------|----------------------|-------------------|-------|
| `cover_image_url` | Input: "Cover Image URL" | Line 285-292 | Optional, from ISBN lookup |
|  | Display: Cover thumbnail | Line 359-371 | 60x90px with error fallback |

### Advanced Fields (Not in Basic Add Form)

| Database Column | Frontend Display | Usage |
|----------------|-----------------|-------|
| `statement_of_responsibility` | *(Book detail view)* | MARC 245$c |
| `edition_statement` | *(Book detail view)* | MARC 250 |
| `series_title` | *(Book detail view)* | MARC 490 |
| `series_number` | *(Book detail view)* | MARC 490 |
| `extent` | *(Book detail view)* | Physical description |
| `dimensions` | *(Book detail view)* | Physical description |
| `subjects` | *(Book detail view)* | Array of subject headings |
| `notes` | *(Book detail view)* | Array of notes |
| `target_audience` | *(Book detail view)* | Target demographic |
| `additional_languages` | *(Book detail view)* | Array of language codes |
| `resource_type` | *(Not displayed)* | Default: 'book' |
| `cataloged_by` | *(Not displayed)* | Staff metadata |
| `is_active` | *(Not displayed)* | Soft delete flag |

---

## 2. Contributors → Book Display

**Files:**
- `frontend/src/components/BookCatalogue.js` (line 141-150, 392-399)
- `backend/app/routes/admin_books.py` (line 72-83)

### Contributors Table Structure

| Database Column | Frontend Display | Notes |
|----------------|-----------------|-------|
| `contributor_id` | Hidden | Primary key |
| `name` | Display: "Contributors" column | Line 393 |
| `name_type` | *(Not displayed in catalogue)* | Values: 'person', 'organization' |
| `date_of_birth` | *(Book detail view)* | For persons |
| `date_of_death` | *(Book detail view)* | For persons |
| `date_established` | *(Book detail view)* | For organizations |
| `date_terminated` | *(Book detail view)* | For organizations |
| `alternate_names` | *(Book detail view)* | Array of alternate names |
| `biographical_note` | *(Book detail view)* | Text field |
| `authority_id` | *(Not displayed)* | VIAF, LCNAF, ISNI, etc. |
| `authority_source` | *(Not displayed)* | Authority control |

### Book-Contributors Relationship

| Database Column | Frontend Display | Notes |
|----------------|-----------------|-------|
| `book_contributor_id` | Hidden | Primary key |
| `book_id` | Hidden | FK to books |
| `contributor_id` | Hidden | FK to contributors |
| `role` | Used for filtering | Common: author, illustrator, translator, editor, photographer, narrator |
| `sequence_number` | Ordering | For ordering multiple contributors with same role |

### Display Logic (`getContributorDisplay` helper)

```javascript
// Line 141-150 in BookCatalogue.js
Priority order:
1. If contributors array has authors → Display author names
2. Else if contributors array has any other role → Display first contributor
3. Else → Display "Unknown"

Display format:
- Single author: "John Doe"
- Multiple authors: "John Doe, Jane Smith"
- With additional contributors: "John Doe +2 more" (line 394-398)
```

---

## 3. Items Table → Availability Display

**Files:**
- `frontend/src/components/BookCatalogue.js` (line 401-472)
- `backend/app/routes/admin_items.py`

### Items Table to Frontend

| Database Column | Frontend Display | Component Location | Notes |
|----------------|-----------------|-------------------|-------|
| `item_id` | Hidden | - | Primary key |
| `book_id` | Hidden | - | FK to books |
| `barcode` | *(Book detail view)* | - | Unique identifier |
| `accession_number` | *(Book detail view)* | - | Library accession # |
| `call_number` | *(Book detail view)* | - | Shelving location |
| `shelf_location` | *(Book detail view)* | - | Physical location |
| `current_location` | *(Book detail view)* | - | Current location |
| `circulation_status` | Aggregated to availability | Line 417-471 | See status mapping below |
| `condition` | *(Book detail view)* | - | excellent, good, fair, poor |
| `acquisition_date` | *(Book detail view)* | - | Date acquired |
| `acquisition_price` | *(Book detail view)* | - | Purchase price |
| `acquisition_source` | *(Book detail view)* | - | Vendor/donor |

### Materialized View: mv_book_availability

| Computed Column | Frontend Display | Component Location | Notes |
|----------------|-----------------|-------------------|-------|
| `total_items` | Display: "X/Y" format | Line 403 | Total copies of this book |
| `available_items` | Display: "X/Y" format | Line 403 | Items with status='available' |
| `checked_out_items` | *(Used for status badge)* | Line 420 | Items with status='checked_out' |
| `on_hold_items` | *(Not displayed)* | - | Items with status='on_hold' |
| `unavailable_items` | *(Not displayed)* | - | Items lost/missing/damaged |

### Availability Status Badge Logic

**Component:** `BookCatalogue.js` (line 417-471)

| Condition | Badge Display | Badge Color | Logic |
|-----------|--------------|-------------|-------|
| `total_items === 0` | "No Items" | Orange (#ff9800) | No physical copies created |
| `available_items > 0` | "Available (X)" | Green (#27ae60) | At least one copy available |
| `available_items === 0 && checked_out_items > 0` | "All Out" | Red (#e74c3c) | All copies checked out |
| Other | "Unavailable" | Gray (#95a5a6) | Lost, damaged, etc. |

### Items Column Display

**Component:** `BookCatalogue.js` (line 401-414)

```
Format: "X/Y" where X=available, Y=total

Additional indicators:
- "No items added" (orange) if total_items = 0
- "All checked out" (red) if available_items = 0 and total_items > 0
```

---

## 4. Borrowings Table → BorrowingsManagement

**File:** `frontend/src/components/BorrowingsManagement.js`

### Key Schema Change

**OLD SCHEMA:**
```sql
borrowings.book_id → books.book_id
```

**NEW SCHEMA:**
```sql
borrowings.item_id → items.item_id → books.book_id
```

### Borrowings Table Mapping

| Database Column | Frontend Field/Display | Notes |
|----------------|----------------------|-------|
| `borrowing_id` | Hidden | Primary key |
| `patron_id` | Patron search/select | FK to patrons |
| `item_id` | Item search/select | **Changed from book_id** |
| `checkout_date` | Display: "Checkout Date" | Auto-set on issue |
| `due_date` | Display: "Due Date" | Calculated from membership plan |
| `return_date` | Display: "Return Date" | Set on return |
| `status` | Display: Status badge | Values: active, returned, overdue |
| `renewal_count` | Display: "Renewals" | Number of times renewed |
| `fine_amount` | Display: "Fine" | Calculated late fees |
| `fine_paid` | Display: "Paid" | Boolean |
| `notes` | Display: "Notes" | Staff notes |
| `checked_out_by` | *(Not displayed)* | Staff who issued |
| `checked_in_by` | *(Not displayed)* | Staff who returned |

### Item Search for Checkout

**Component:** `BorrowingsManagement.js` (search functionality)

Display format:
```
Book Title
Barcode: XXXX | Status: available | Location: Shelf A1
```

Only items with `circulation_status = 'available'` can be checked out.

---

## 5. RDA Vocabularies → Controlled Value Lists

**Backend:** `backend/app/routes/admin_rda_vocabularies.py`

### RDA Content Types (rda_content_types)

| Database Column | API Response | Usage |
|----------------|-------------|-------|
| `code` | Value: 'txt', 'spw', etc. | Select option value |
| `label` | Label: 'text', 'spoken word', etc. | Select option display |
| `definition` | Tooltip/help text | User guidance |
| `examples` | Tooltip/help text | User guidance |

**Common Values:**
- `txt` - text (books, articles)
- `spw` - spoken word (audiobooks)
- `prm` - performed music (music CDs)
- `sti` - still image (art books)
- `tdi` - two-dimensional moving image (DVDs)

### RDA Media Types (rda_media_types)

| Database Column | API Response | Usage |
|----------------|-------------|-------|
| `code` | Value: 'n', 's', 'v', 'c' | Select option value |
| `label` | Label: 'unmediated', 'audio', etc. | Select option display |
| `definition` | Tooltip/help text | User guidance |

**Common Values:**
- `n` - unmediated (print books)
- `s` - audio (CDs, cassettes)
- `v` - video (DVDs, Blu-ray)
- `c` - computer (e-books, online)

### RDA Carrier Types (rda_carrier_types)

| Database Column | API Response | Usage |
|----------------|-------------|-------|
| `code` | Value: 'nc', 'sd', 'vd', 'cr' | Select option value |
| `label` | Label: 'volume', 'audio disc', etc. | Select option display |
| `media_type_code` | FK to media types | Filtering carrier types by media |
| `definition` | Tooltip/help text | User guidance |

**Common Values:**
- `nc` - volume (books)
- `sd` - audio disc (CDs)
- `vd` - videodisc (DVDs)
- `cr` - online resource (e-books)

---

## 6. Collections Table → Filtering

**Files:**
- `frontend/src/components/BookCatalogue.js` (line 310-329)
- `backend/app/routes/admin_collections.py`

| Database Column | Frontend Display | Notes |
|----------------|-----------------|-------|
| `collection_id` | Select option value | Primary key |
| `collection_name` | Select option label | Display name |
| `book_count` | Display: "(X books)" | Computed count |
| `description` | *(Collection management)* | Not shown in filter |

Default collection: "Popular Science" is auto-selected on load (line 62-68)

---

## 7. API Response Formats

### GET /api/admin/books (Catalogue List)

```javascript
{
  books: [
    {
      book_id: 1,
      isbn: "978...",
      title: "Book Title",
      subtitle: "Book Subtitle",
      publisher: "Publisher Name",
      publication_year: 2024,
      collection_id: 1,
      collection_name: "Popular Science",
      content_type: "txt",
      media_type: "n",
      carrier_type: "nc",
      language: "eng",
      age_rating: "10+ years",
      cover_image_url: "https://...",
      total_items: 5,                    // From mv_book_availability
      available_items: 3,                // From mv_book_availability
      checked_out_items: 2,              // From mv_book_availability
      contributors: [                    // COALESCE returns [] if null
        {
          contributor_id: 1,
          name: "Author Name",
          role: "author",
          sequence: 1
        }
      ]
    }
  ],
  total: 100,
  page: 1,
  per_page: 20,
  total_pages: 5
}
```

### ISBN Lookup Response

**Endpoint:** `POST /api/admin/books/fetch-by-isbn`

```javascript
{
  isbn: "978...",
  title: "Book Title",
  subtitle: "Book Subtitle",
  publisher: "Publisher Name",
  publication_year: 2024,
  description: "Book description...",
  cover_image_url: "https://..."
  // Frontend maps these to newBook state (line 90-101)
}
```

---

## 8. Frontend State to Database Mapping

### BookCatalogue `newBook` State (line 18-29)

| State Property | Database Column | Table | Required |
|---------------|----------------|-------|----------|
| `isbn` | `isbn` | books | No |
| `title` | `title` | books | **Yes** |
| `subtitle` | `subtitle` | books | No |
| `publisher` | `publisher` | books | No |
| `publication_year` | `publication_year` | books | No |
| `description` | `description` | books | No |
| `collection_id` | `collection_id` | books | **Yes** |
| `language` | `language` | books | No (default: 'eng') |
| `age_rating` | `age_rating` | books | No |
| `cover_image_url` | `cover_image_url` | books | No |

**Note:** Contributors and Items are added AFTER book creation via book detail view.

---

## 9. Search Functionality

### Search Query Scope

**Component:** `BookCatalogue.js` (line 332-338)
**Backend:** `admin_books.py` (line 27-37)

Search covers:
- `books.title` (ILIKE)
- `books.subtitle` (ILIKE)
- `books.isbn` (ILIKE)
- `contributors.name` (ILIKE) - via EXISTS subquery

---

## 10. Navigation & Actions

### Book Click Actions

| UI Element | Action | Destination | Line |
|-----------|--------|------------|------|
| Cover image | `handleBookClick(book_id)` | `/admin/books/${book_id}` | Line 369 |
| Title link | `handleBookClick(book_id)` | `/admin/books/${book_id}` | Line 382 |

**Purpose:** Navigate to book detail page for:
- Managing contributors (add/edit/remove)
- Managing items/barcodes (add/edit/delete)
- Editing full book metadata
- Viewing borrowing history

---

## 11. Data Flow Summary

```
User Action: Add Book via ISBN
├─ Frontend: BookCatalogue.js
│  ├─ User enters ISBN (line 180)
│  ├─ Click "Fetch from Google Books" (line 184-192)
│  ├─ API: POST /api/admin/books/fetch-by-isbn
│  └─ Maps response to newBook state (line 90-101)
│
├─ User selects collection + reviews data
│  └─ Click "Add Book to Catalogue" (line 302)
│
├─ API: POST /api/admin/books
│  └─ Creates record in books table with minimal data
│
├─ Backend: admin_books.py (line 199-318)
│  ├─ Validates collection_id exists
│  ├─ Validates RDA types if provided
│  ├─ Inserts into books table
│  ├─ Sets defaults: content_type='txt', media_type='n', carrier_type='nc'
│  └─ Returns book_id
│
└─ User instruction: "Click on the book to add contributors and items"
   └─ Navigate to /admin/books/:book_id
      ├─ Add contributors (via book_contributors join table)
      └─ Add items/barcodes (creates records in items table)
```

---

## 12. Important Notes

### Null Handling
- **Contributors:** Backend uses `COALESCE(..., '[]'::json)` to always return empty array instead of null
- **Frontend:** Additional defensive checks in `getContributorDisplay()` (line 142)

### Computed Fields
- `total_items`, `available_items`, `checked_out_items` are computed from items table via `mv_book_availability` materialized view
- Must run `REFRESH MATERIALIZED VIEW mv_book_availability` after item changes

### Database Triggers
- **Item Status Sync:** When borrowing status changes (active ↔ returned), item circulation_status automatically updates via trigger
- **Timestamp Updates:** `updated_at` and `status_changed_at` automatically maintained

### Deprecated Fields (Still in database, not used)
- `books.author` - now in contributors table
- `books.total_copies` - now COUNT(items)
- `books.available_copies` - now COUNT(items WHERE status='available')
- `books.genre` - now in subjects array
- `books.sub_genre` - now in subjects array
- `books.status` - now per-item circulation_status

---

## End of Mapping Document
