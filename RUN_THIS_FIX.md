# Fix Partial Migration

## Problem
The enhanced catalogue migration was partially applied:
- ✅ New tables created (contributors, items, etc.)
- ❌ Missing columns on books table (is_active, subtitle, etc.)
- ❌ Missing borrowings.item_id column
- ❌ Missing mv_book_availability materialized view

## Solution

Run this command to complete the migration:

```bash
psql YOUR_DATABASE_NAME -f database/migrations/003_fix_partial_migration.sql
```

**Replace `YOUR_DATABASE_NAME` with your actual database name.**

Or if you have a DATABASE_URL environment variable:

```bash
psql $DATABASE_URL -f database/migrations/003_fix_partial_migration.sql
```

## What This Script Does

1. Adds all missing columns to books table (is_active, subtitle, content_type, etc.)
2. Migrates borrowings table from book_id to item_id
3. Creates mv_book_availability materialized view
4. Sets up triggers for automatic item status sync
5. Migrates existing data (authors → contributors, copies → items)
6. Provides verification summary at the end

## After Running

You should see output like:

```
NOTICE:  Books table columns updated successfully
NOTICE:  Borrowings table migrated to use item_id
NOTICE:  =================================================
NOTICE:  MIGRATION COMPLETION SUMMARY:
NOTICE:  =================================================
NOTICE:  Books: 50
NOTICE:  Items: 150
NOTICE:  Contributors: 35
NOTICE:  Book-Contributor Relationships: 55
NOTICE:  
NOTICE:  CRITICAL COLUMNS:
NOTICE:    books.is_active exists: t
NOTICE:    borrowings.item_id exists: t
NOTICE:    mv_book_availability exists: t
NOTICE:  =================================================
NOTICE:  SUCCESS: All critical schema elements are in place!
```

## Then Restart Backend

After the migration completes successfully:

```bash
# Kill existing Flask process
pkill -f flask

# Start backend again
cd backend
python run.py
```

The "Failed to load books" error will be resolved!
