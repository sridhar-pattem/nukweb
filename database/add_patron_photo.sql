-- Migration: Add patron_photo column to patrons table
-- Date: 2024-12-25
-- Description: Adds a BYTEA column to store patron photos in the database

-- Add patron_photo column to store binary image data
ALTER TABLE patrons ADD COLUMN IF NOT EXISTS patron_photo BYTEA;

-- Add comment for documentation
COMMENT ON COLUMN patrons.patron_photo IS 'Binary data for patron photo (JPEG/PNG). Stores actual image bytes in database.';

-- Optional: Add a column to track photo content type for proper display
ALTER TABLE patrons ADD COLUMN IF NOT EXISTS photo_content_type VARCHAR(50);

COMMENT ON COLUMN patrons.photo_content_type IS 'MIME type of patron photo (e.g., image/jpeg, image/png)';

-- Optional: Add photo upload timestamp
ALTER TABLE patrons ADD COLUMN IF NOT EXISTS photo_uploaded_at TIMESTAMP;

COMMENT ON COLUMN patrons.photo_uploaded_at IS 'Timestamp when patron photo was last uploaded or updated';
