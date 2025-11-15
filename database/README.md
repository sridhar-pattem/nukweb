# Database Setup and Migration Guide

## Quick Reference

| File | Purpose | When to Use |
|------|---------|-------------|
| `schema.sql` | Complete database schema | New database setup |
| `sample_data.sql` | Sample membership plans | After running schema.sql |
| `fresh_start.sql` | Drop and recreate everything | **No important data** |
| `migrate_patron_id_simple.sql` | Migrate patron_id to VARCHAR | **Preserve existing data** |

---

## Option 1: Fresh Installation (No Existing Data)

If you're starting fresh or don't have important data:

```bash
# Navigate to database directory
cd database

# Connect to PostgreSQL and run fresh start
psql -d nuk_library -f fresh_start.sql
```

This will:
1. Drop all existing tables
2. Create new schema with VARCHAR patron_id
3. Insert sample membership plans

---

## Option 2: Migrate Existing Database

If you have existing patrons and want to preserve data:

```bash
cd database
psql -d nuk_library -f migrate_patron_id_simple.sql
```

This will:
1. Convert patron_id from INTEGER to VARCHAR(20) in all tables
2. Convert existing IDs (e.g., `1` → `NUKG0001000`)
3. Update all foreign key relationships
4. Preserve all existing data (patrons, borrowings, reviews, etc.)

**Note:** This migration converts old numeric IDs like:
- `1` → `NUKG0001000`
- `2` → `NUKG0002000`
- `25` → `NUKG0000025`

---

## Option 3: Manual Setup (Step by Step)

### For New Database:

```bash
# 1. Create database
createdb nuk_library

# 2. Run schema
psql -d nuk_library -f schema.sql

# 3. Add sample data (optional)
psql -d nuk_library -f sample_data.sql
```

### For Existing Database:

```bash
# Run migration
psql -d nuk_library -f migrate_patron_id_simple.sql
```

---

## Verification

After migration or setup, verify the changes:

```sql
-- Check patron_id data type
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'patrons' AND column_name = 'patron_id';

-- Expected result: data_type = 'character varying'

-- Check sample patron IDs
SELECT patron_id, name, email FROM patrons LIMIT 5;

-- Expected format: NUKG0001000, NUKG0002000, etc.
```

---

## Troubleshooting

### Error: "invalid input syntax for type integer"

**Problem:** Database still has INTEGER patron_id type

**Solution:** Run the migration:
```bash
psql -d nuk_library -f migrate_patron_id_simple.sql
```

### Error: Migration fails with foreign key constraint

**Problem:** Other tables have data referencing patron_id

**Solution:** The migration script handles this automatically by:
1. Dropping constraints
2. Converting all tables
3. Recreating constraints

If it still fails, use Option 1 (fresh_start.sql)

### Want to start completely fresh

**Solution:**
```bash
dropdb nuk_library
createdb nuk_library
psql -d nuk_library -f schema.sql
psql -d nuk_library -f sample_data.sql
```

---

## Important Notes

1. **Backup First:** Always backup your database before running migrations:
   ```bash
   pg_dump nuk_library > backup_$(date +%Y%m%d).sql
   ```

2. **Patron ID Format:** New patron IDs must be:
   - Alphanumeric (A-Z, 0-9)
   - Uppercase only
   - Example: NUKG0001000, NUK2025001, etc.

3. **Currency:** All prices are now in Indian Rupees (₹)

4. **Sample Plans:** The sample_data.sql provides 6 membership plans ranging from ₹150 to ₹7,000

---

## Files Description

### schema.sql
Complete database schema with:
- Users and patrons tables
- Membership plans
- Books catalogue
- Borrowings, reviews, reservations
- Cowork bookings
- Invoices and notifications
- Default admin account
- Triggers and constraints

### sample_data.sql
Sample membership plans:
- Weekly Trial: ₹150
- Student Monthly: ₹350
- Monthly Basic: ₹500
- Quarterly Standard: ₹1,350
- Annual Premium: ₹5,000
- Family Annual: ₹7,000

### migrate_patron_id_simple.sql
Production-safe migration that:
- Preserves all existing data
- Handles foreign keys properly
- Converts IDs to new format
- Runs in a transaction (all or nothing)

### fresh_start.sql
Quick reset for development:
- Drops all tables
- Recreates with new schema
- Optionally adds sample data
- **WARNING:** Deletes everything!

---

## Need Help?

See the main SETUP_GUIDE.md in the project root for complete setup instructions.
