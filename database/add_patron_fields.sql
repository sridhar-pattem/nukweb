-- Migration to add new fields to patrons table and create deleted_patrons table
-- Date: 2025-12-16

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

-- Step 3: Add index on deleted_patrons for faster lookups
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
