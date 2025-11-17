# Clean Database Setup Instructions

## ⚠️ WARNING
**This script will DELETE ALL EXISTING DATA in your database!**

Use this only for:
- Fresh installations
- Development/testing environments
- Complete database resets

**DO NOT run this on a production database with real data!**

---

## What This Script Does

The `database/clean_setup.sql` script will:

1. ✅ **Drop all existing tables, views, triggers, and functions**
2. ✅ **Create fresh enhanced RDA catalogue schema**
3. ✅ **Set up all relationships and indexes**
4. ✅ **Create materialized view for book availability**
5. ✅ **Set up triggers for automatic status synchronization**
6. ✅ **Insert default data** (admin user, collections, membership plans)

---

## How to Run

### Step 1: Backup (if needed)

If you have any data you want to keep, backup first:

```bash
pg_dump YOUR_DATABASE_NAME > backup_$(date +%Y%m%d).sql
```

### Step 2: Run the Clean Setup Script

**Option A: Using psql with database name**
```bash
psql YOUR_DATABASE_NAME -f database/clean_setup.sql
```

**Option B: Using DATABASE_URL environment variable**
```bash
psql $DATABASE_URL -f database/clean_setup.sql
```

**Option C: Using psql interactive**
```bash
psql YOUR_DATABASE_NAME

# Then inside psql:
\i database/clean_setup.sql
```

### Step 3: Verify Success

You should see output like:

```
NOTICE: =================================================
NOTICE: CLEAN SETUP COMPLETED SUCCESSFULLY
NOTICE: =================================================
NOTICE: Tables created: 16
NOTICE: Materialized views: 1
NOTICE: Triggers: 11
NOTICE:
NOTICE: Default admin user: admin@nuklib.com / admin123
NOTICE: Membership plans: 3
NOTICE: Collections: 7
NOTICE: Age ratings: 7
NOTICE: =================================================
NOTICE: Ready to add books, patrons, and items via UI!
NOTICE: =================================================
```

### Step 4: Restart Backend

```bash
# Kill existing Flask process
pkill -f flask

# Start backend
cd backend
python run.py
```

### Step 5: Login to UI

Open your application and login with:
- **Email:** `admin@nuklib.com`
- **Password:** `admin123`

**🔒 IMPORTANT:** Change the admin password immediately after first login!

---

## What's Included in the Clean Setup

### Tables Created (16 tables)

**Core Tables:**
- `users` - User authentication
- `patrons` - Library members
- `membership_plans` - Membership types and pricing

**Catalogue Tables:**
- `books` - Book records with full MARC + RDA fields
- `contributors` - Authors, illustrators, translators, etc.
- `book_contributors` - Many-to-many relationship
- `items` - Individual physical copies with barcodes
- `collections` - Book collections (Fiction, Non-Fiction, etc.)
- `age_ratings` - Age appropriateness ratings

**RDA Vocabularies:**
- `rda_content_types` - 10 content types (text, audio, video, etc.)
- `rda_media_types` - 6 media types (unmediated, audio, video, etc.)
- `rda_carrier_types` - 16 carrier types (volume, disc, online, etc.)

**Circulation Tables:**
- `borrowings` - Item checkouts (uses item_id, not book_id)
- `reservations` - Book holds
- `reviews` - Patron reviews and ratings

### Materialized View

- `mv_book_availability` - Fast lookups for book availability counts

### Triggers

- **Auto-update timestamps** - All tables with `updated_at` columns
- **Item status sync** - Automatically updates item circulation_status when borrowed/returned
- **Status timestamp tracking** - Records when item status changes

### Default Data

**Collections (7):**
- Fiction
- Non-Fiction
- Children
- Young Adult
- Reference
- Popular Science
- Technology

**Membership Plans (3):**
- Basic (6 months, $50, 3 book limit)
- Premium (12 months, $80, 5 book limit)
- Student (12 months, $40, 4 book limit)

**Age Ratings (7):**
- Toddlers (0-3)
- Preschool (2-4)
- Early Readers (5-6)
- Children (7-9)
- Middle Grade (10-12)
- Young Adult (13-17)
- Adult (18+)

**Admin User:**
- Email: admin@nuklib.com
- Password: admin123
- Role: admin

---

## After Setup - Add Your Data

### 1. Add Books

Navigate to **Book Catalogue** and:
- Use ISBN lookup to fetch book data from Google Books
- Or manually enter book details
- Click on book to add contributors and physical items

### 2. Add Contributors

Navigate to **Contributors** (if you created this page) and:
- Add authors, illustrators, translators, etc.
- Link them to books via book detail page

### 3. Add Items (Physical Copies)

For each book:
- Click on the book in catalogue
- Add items with barcodes
- Set shelf location and circulation status

### 4. Add Patrons

Navigate to **Patrons** and:
- Create patron accounts
- Assign membership plans
- Set membership dates

### 5. Circulation

Navigate to **Borrowings** to:
- Issue items to patrons (by barcode)
- Return items
- Renew borrowings
- Track overdue items

---

## Schema Features

### ✅ Enhanced Cataloging
- Full MARC fields (subtitle, edition, series, extent, dimensions)
- RDA controlled vocabularies for precise description
- Multiple contributors per book with roles
- Subject headings as arrays
- Multi-language support

### ✅ Item-Level Circulation
- Individual barcode tracking
- Per-item circulation status
- Shelf location management
- Condition tracking
- Acquisition metadata

### ✅ Automatic Synchronization
- Item status auto-updates when borrowed/returned
- Materialized view for fast availability queries
- Timestamp tracking for all changes

### ✅ Professional Library Features
- Membership plans with borrowing limits
- Book reservations/holds
- Patron reviews and ratings
- Fine management
- Staff tracking (who checked out/in)

---

## Troubleshooting

### Script Fails with "Permission Denied"

You may need superuser privileges:
```bash
psql -U postgres YOUR_DATABASE_NAME -f database/clean_setup.sql
```

### "Database does not exist"

Create the database first:
```bash
createdb YOUR_DATABASE_NAME
# Then run the script
```

### Backend Still Shows Errors

1. Make sure backend is restarted after running script
2. Check that DATABASE_URL environment variable is correct
3. Verify connection to the correct database

### Tables Already Exist

The script drops all tables first, so this shouldn't happen. If it does, you may be connected to the wrong database.

---

## Next Steps

1. ✅ Change admin password
2. ✅ Add your book collections if defaults don't fit
3. ✅ Customize membership plans and pricing
4. ✅ Add age ratings specific to your library
5. ✅ Start adding books via ISBN lookup or manual entry
6. ✅ Create patron accounts
7. ✅ Begin circulation operations

---

## Support

If you encounter issues:
1. Check the NOTICE messages from the script
2. Verify all 16 tables were created
3. Ensure materialized view exists
4. Restart backend server
5. Clear browser cache if UI shows old data

---

**You're now ready to use the enhanced RDA catalogue system!**
