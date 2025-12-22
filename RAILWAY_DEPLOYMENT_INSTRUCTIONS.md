# Railway Platform Deployment Instructions

## Prerequisites
- Railway account with PostgreSQL database provisioned
- Database connection credentials from Railway dashboard
- Access to Railway project settings

## Database Schema Updates Required

### 1. Add New Patron Fields Migration
This migration adds 7 new fields to the `patrons` table and creates the `deleted_patrons` archive table.

**File:** `/database/add_patron_fields.sql`

**Run this script on Railway PostgreSQL:**

```sql
-- Step 1: Add new fields to patrons table
ALTER TABLE patrons
ADD COLUMN IF NOT EXISTS national_id VARCHAR(20),
ADD COLUMN IF NOT EXISTS national_id_type VARCHAR(20) CHECK (national_id_type IN ('Aadhaar', 'Driving License', 'PAN', 'Passport No', 'Voter Id')),
ADD COLUMN IF NOT EXISTS email VARCHAR(50),
ADD COLUMN IF NOT EXISTS secondary_phone_no VARCHAR(10),
ADD COLUMN IF NOT EXISTS secondary_email VARCHAR(50),
ADD COLUMN IF NOT EXISTS correspond_language VARCHAR(20) CHECK (correspond_language IN ('English', 'Kannada', 'Hindi')) DEFAULT 'English',
ADD COLUMN IF NOT EXISTS last_renewed_on_date DATE;

-- Step 2: Create deleted_patrons table with same structure as patrons
CREATE TABLE IF NOT EXISTS deleted_patrons (
    patron_id VARCHAR(20) PRIMARY KEY,
    user_id INTEGER,
    membership_plan_id INTEGER,
    membership_start_date DATE,
    membership_end_date DATE,
    status VARCHAR(20),
    date_of_birth DATE,
    address TEXT,
    phone_number VARCHAR(15),
    emergency_contact_name VARCHAR(100),
    emergency_contact_phone VARCHAR(15),
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    national_id VARCHAR(20),
    national_id_type VARCHAR(20) CHECK (national_id_type IN ('Aadhaar', 'Driving License', 'PAN', 'Passport No', 'Voter Id')),
    email VARCHAR(50),
    secondary_phone_no VARCHAR(10),
    secondary_email VARCHAR(50),
    correspond_language VARCHAR(20) CHECK (correspond_language IN ('English', 'Kannada', 'Hindi')),
    last_renewed_on_date DATE,
    deleted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted_by INTEGER,
    deletion_reason TEXT
);

-- Step 3: Add indexes on deleted_patrons for faster lookups
CREATE INDEX IF NOT EXISTS idx_deleted_patrons_user_id ON deleted_patrons(user_id);
CREATE INDEX IF NOT EXISTS idx_deleted_patrons_deleted_at ON deleted_patrons(deleted_at);

-- Step 4: Add comments to document the new fields
COMMENT ON COLUMN patrons.national_id IS 'National identification number';
COMMENT ON COLUMN patrons.national_id_type IS 'Type of national ID: Aadhaar, Driving License, PAN, Passport No, Voter Id';
COMMENT ON COLUMN patrons.email IS 'Primary email address';
COMMENT ON COLUMN patrons.secondary_phone_no IS 'Secondary/alternate phone number';
COMMENT ON COLUMN patrons.secondary_email IS 'Secondary/alternate email address';
COMMENT ON COLUMN patrons.correspond_language IS 'Preferred language for correspondence: English, Kannada, Hindi';
COMMENT ON COLUMN patrons.last_renewed_on_date IS 'Date when membership was last renewed';

COMMENT ON TABLE deleted_patrons IS 'Archive table for deleted patron records';
COMMENT ON COLUMN deleted_patrons.deleted_at IS 'Timestamp when the patron was deleted';
COMMENT ON COLUMN deleted_patrons.deleted_by IS 'User ID of admin who deleted the patron';
COMMENT ON COLUMN deleted_patrons.deletion_reason IS 'Reason for deletion';
```

### 2. Verify Patron Table Structure

Ensure the `patrons` table has the correct structure with VARCHAR patron_id:

```sql
-- Check if patrons table has VARCHAR patron_id
SELECT column_name, data_type, character_maximum_length
FROM information_schema.columns
WHERE table_name = 'patrons'
AND column_name = 'patron_id';

-- Should return: patron_id | character varying | 20
```

If patron_id is still SERIAL/INTEGER, you need to run the patron_id migration first (see below).

### 3. Patron ID Migration (If Needed)

**Only run this if patron_id is currently INTEGER/SERIAL instead of VARCHAR(20)**

**Warning:** This is a destructive migration. Backup your data first!

```sql
-- Backup existing patrons
CREATE TABLE patrons_backup AS SELECT * FROM patrons;

-- Drop foreign key constraints
ALTER TABLE borrowings DROP CONSTRAINT IF EXISTS borrowings_patron_id_fkey;
ALTER TABLE reservations DROP CONSTRAINT IF EXISTS reservations_patron_id_fkey;
ALTER TABLE reviews DROP CONSTRAINT IF EXISTS reviews_patron_id_fkey;
ALTER TABLE cowork_bookings DROP CONSTRAINT IF EXISTS cowork_bookings_patron_id_fkey;
ALTER TABLE cowork_subscriptions DROP CONSTRAINT IF EXISTS cowork_subscriptions_patron_id_fkey;
ALTER TABLE invoices DROP CONSTRAINT IF EXISTS invoices_patron_id_fkey;
ALTER TABLE reading_history DROP CONSTRAINT IF EXISTS reading_history_patron_id_fkey;

-- Drop and recreate patrons table with VARCHAR patron_id
DROP TABLE patrons;

CREATE TABLE patrons (
    patron_id VARCHAR(20) PRIMARY KEY,
    user_id INTEGER UNIQUE REFERENCES users(user_id) ON DELETE CASCADE,
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
    status VARCHAR(20) DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT patron_id_format CHECK (patron_id ~ '^[A-Z0-9]+$')
);

-- Migrate existing data with NUKG prefix
INSERT INTO patrons (patron_id, user_id, membership_plan_id, first_name, last_name,
                     date_of_birth, phone, address, city, state, postal_code, country,
                     membership_start_date, membership_end_date, status, created_at, updated_at)
SELECT
    'NUKG' || LPAD(patron_id::TEXT, 7, '0') as patron_id,
    user_id, membership_plan_id, first_name, last_name,
    date_of_birth, phone, address, city, state, postal_code, country,
    membership_start_date, membership_end_date, status, created_at, updated_at
FROM patrons_backup;

-- Recreate foreign key constraints (adjust table/column names as needed)
ALTER TABLE borrowings ADD CONSTRAINT borrowings_patron_id_fkey
    FOREIGN KEY (patron_id) REFERENCES patrons(patron_id);
ALTER TABLE reservations ADD CONSTRAINT reservations_patron_id_fkey
    FOREIGN KEY (patron_id) REFERENCES patrons(patron_id);
-- Add other foreign keys as needed...
```

## Environment Variables Setup on Railway

### Backend Service Environment Variables

Set these in Railway Dashboard → Your Backend Service → Variables:

```bash
# Database (automatically provided by Railway)
DATABASE_URL=postgresql://[automatically_set_by_railway]

# Secret Keys (IMPORTANT: Generate new secure keys!)
JWT_SECRET_KEY=[generate-32-char-random-string]
SECRET_KEY=[generate-32-char-random-string]

# CORS Origins (allow all origins or specific domains)
# Option 1: Allow all origins (for testing)
CORS_ORIGINS=*

# Option 2: Specific domains (for production)
CORS_ORIGINS=https://your-frontend-domain.railway.app,https://your-website-domain.railway.app

# Flask Configuration
FLASK_ENV=production
PORT=5001

# Upload Configuration
UPLOAD_FOLDER=/tmp/uploads

# Email Configuration (Optional - configure if needed)
# MAIL_SERVER=smtp.gmail.com
# MAIL_PORT=587
# MAIL_USERNAME=your-email@gmail.com
# MAIL_PASSWORD=your-app-password
# MAIL_DEFAULT_SENDER=noreply@nuklibrary.com

# API Keys (if using external services)
# ISBNDB_API_KEY=your-key-here
# OPENAI_API_KEY=your-key-here
# ANTHROPIC_API_KEY=your-key-here
```

### Frontend Admin Service Environment Variables

```bash
# Backend API URL
REACT_APP_API_URL=https://your-backend-service.railway.app/api
```

### Website Service Environment Variables

```bash
# Backend API URL
REACT_APP_API_URL=https://your-backend-service.railway.app/api
```

## Deployment Steps

### Step 1: Database Migration

1. Connect to Railway PostgreSQL database using the Railway CLI or a PostgreSQL client
2. Run the schema migration script from Section 1 above
3. Verify the migration:
   ```sql
   -- Check new columns exist
   SELECT column_name FROM information_schema.columns
   WHERE table_name = 'patrons'
   ORDER BY ordinal_position;

   -- Check deleted_patrons table exists
   SELECT table_name FROM information_schema.tables
   WHERE table_name = 'deleted_patrons';
   ```

### Step 2: Deploy Backend Service

1. Push your code to the connected Git repository
2. Railway will automatically build and deploy
3. Check deployment logs for any errors
4. Verify CORS configuration in logs (should show correct origins)

### Step 3: Deploy Frontend Services

1. Push frontend code changes
2. Railway will rebuild and deploy both frontend and website services
3. Verify services are accessible

### Step 4: Test Deployment

1. **Test Patron Management:**
   - Login to admin panel
   - Navigate to Patron Management
   - Click "Add Patron"
   - Enter patron details with Patron ID (e.g., NUKG0000001)
   - Verify patron is created successfully
   - Try creating patron with same ID - should show error

2. **Test Edit Patron:**
   - Click Edit on a patron
   - Verify all new fields are displayed
   - Verify Patron ID is read-only
   - Update some fields and save

3. **Test Delete Patron:**
   - Click Delete on a patron
   - Enter deletion reason
   - Verify patron is moved to deleted_patrons table

4. **Test Navigation Dropdown:**
   - Hover over Library, Lending, Patrons, Cowork menus
   - Verify dropdowns stay open when moving mouse to child items

## Post-Deployment Verification

### Database Verification

```sql
-- Check patron count
SELECT COUNT(*) FROM patrons;

-- Check new fields are populated
SELECT patron_id, national_id, national_id_type, email,
       secondary_phone_no, correspond_language
FROM patrons
LIMIT 5;

-- Check deleted_patrons table structure
\d deleted_patrons;
```

### API Endpoint Testing

Test these endpoints using curl or Postman:

```bash
# Get patrons list
curl https://your-backend.railway.app/api/admin/patrons \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"

# Create patron (should reject if patron_id already exists)
curl -X POST https://your-backend.railway.app/api/admin/patrons \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "patron_id": "NUKG0000001",
    "email": "test@example.com",
    "first_name": "Test",
    "last_name": "User",
    "membership_plan_id": 1
  }'
```

## Rollback Plan

If deployment fails:

### Database Rollback

```sql
-- Drop new columns if needed
ALTER TABLE patrons
DROP COLUMN IF EXISTS national_id,
DROP COLUMN IF EXISTS national_id_type,
DROP COLUMN IF EXISTS email,
DROP COLUMN IF EXISTS secondary_phone_no,
DROP COLUMN IF EXISTS secondary_email,
DROP COLUMN IF EXISTS correspond_language,
DROP COLUMN IF EXISTS last_renewed_on_date;

-- Drop deleted_patrons table
DROP TABLE IF EXISTS deleted_patrons;
```

### Application Rollback

1. Revert to previous Git commit
2. Railway will automatically redeploy previous version

## Troubleshooting

### CORS Issues
- Check CORS_ORIGINS environment variable has no square brackets
- Verify format: `http://domain1.com,http://domain2.com` or `*`
- Check Railway logs for CORS configuration output

### Database Connection Issues
- Verify DATABASE_URL is set correctly by Railway
- Check PostgreSQL service is running in Railway dashboard
- Ensure database migrations completed successfully

### Patron ID Validation Errors
- Verify patron_id format matches: `^[A-Z0-9]+$`
- Check patron_id is unique before creating
- Ensure NUKG prefix is included in submitted value

## Security Checklist

- [ ] Generate and set new JWT_SECRET_KEY (min 32 characters)
- [ ] Generate and set new SECRET_KEY (min 32 characters)
- [ ] Set FLASK_ENV=production
- [ ] Configure appropriate CORS_ORIGINS (avoid * in production)
- [ ] Ensure DATABASE_URL uses SSL connection
- [ ] Remove any .env files from Git repository
- [ ] Set up environment variables in Railway dashboard only

## Monitoring

After deployment, monitor:
- Railway deployment logs for errors
- Database query performance
- API response times
- Frontend console for CORS or API errors
- User feedback on new patron management features

---

**Last Updated:** 2025-12-22

**Applied Migrations:**
1. ✅ add_patron_fields.sql - Added 7 new patron fields and deleted_patrons table
2. ✅ Patron ID format enforcement (admin-entered, NUKG prefix)
3. ✅ Navigation dropdown hover fix
4. ✅ CORS configuration update

**Pending Tasks:**
- None - all patron enhancement features completed
