# Website Admin Setup Guide

**Date:** November 29, 2025

This guide explains how to enable the **Theme & Colors** customization feature and other Website Admin functionality.

---

## 🎯 What This Enables

After running the database migration, you'll be able to:

1. **🎨 Theme & Colors** - Customize your website's color scheme
   - Change primary, secondary, and accent colors
   - Modify text, button, and navigation colors
   - Live color picker with hex code input
   - Save and reset to defaults

2. **📄 Pages & Sections** - Manage website pages and content

3. **📋 Navigation Menu** - Edit navigation menus

4. **🖼️ Media Library** - Manage uploaded images

5. **⚙️ Global Settings** - Site-wide configuration

---

## 📦 Prerequisites

- PostgreSQL database running
- Admin access to database
- Backend and frontend code updated (already done ✅)

---

## 🚀 Installation Steps

### Step 1: Run Database Migration on Local

```bash
# Navigate to project root
cd /Users/sridharpattem/Projects/nuk-library

# Connect to your local PostgreSQL database
psql nuk_library  # Replace with your database name

# Run the migration script
\i database/website_admin_tables.sql

# Verify tables were created
\dt website_*

# You should see:
# website_cards
# website_content_blocks
# website_global_settings
# website_media
# website_menu_items
# website_pages
# website_sections
# website_theme_settings

# Exit psql
\q
```

### Step 2: Run Database Migration on Railway

**Option A: Using Railway CLI** (Recommended)

```bash
# Install Railway CLI if not already installed
npm install -g @railway/cli

# Login to Railway
railway login

# Link to your project
railway link

# Run the migration
railway run psql < database/website_admin_tables.sql
```

**Option B: Using Railway Dashboard**

1. Go to Railway Dashboard
2. Open your PostgreSQL database
3. Click on "Data" tab
4. Click "Query" or "SQL Editor"
5. Copy and paste the entire contents of `database/website_admin_tables.sql`
6. Execute the query

**Option C: Using psql with Railway Connection String**

```bash
# Get your Railway PostgreSQL connection string from dashboard
# Format: postgresql://user:password@host:port/database

psql "postgresql://user:password@host:port/database" < database/website_admin_tables.sql
```

---

## ✅ Verify Installation

### Check Tables Were Created

```sql
-- In psql
SELECT tablename FROM pg_tables WHERE tablename LIKE 'website_%';
```

Should return 8 tables.

### Check Theme Settings Were Inserted

```sql
-- In psql
SELECT COUNT(*) FROM website_theme_settings;
```

Should return ~35 theme settings.

### Check Global Settings Were Inserted

```sql
-- In psql
SELECT * FROM website_global_settings;
```

Should return 1 row with default site settings.

---

## 🎨 Access Website Admin

### 1. Login as Admin

- Go to: `https://www.mynuk.com/login` (or `http://localhost:3000/login`)
- Login with admin credentials

### 2. Navigate to Website Admin

- Click on **"Website Admin"** in the navigation menu
- Or go directly to: `https://www.mynuk.com/admin/website`

### 3. Select Theme & Colors Tab

- You'll see the **Theme & Colors** tab (second tab)
- Click it to open the color customization interface

---

## 🎨 Using Theme & Colors

### Color Customization

The theme is organized into categories:

**Colors Category:**
- Primary color (charcoal)
- Secondary color (brown)
- Accent color (peru)
- Background color (beige)
- Light gray
- White

**Text Category:**
- Primary text
- Secondary text
- Light text
- Charcoal text

**Buttons Category:**
- Primary button (background, text, hover)
- Outline button (border, text, hover)
- Dark button (background, text)

**Navigation Category:**
- Background, text, hover, active colors
- Border color

**Cards Category:**
- Background, border, shadow colors

**Hero Category:**
- Overlay and text colors

**Badges, Links:**
- Badge colors
- Link colors and hover states

### How to Customize

1. **Pick a Color:** Click on the color picker for any setting
2. **Or Enter Hex:** Type hex code directly (e.g., `#FF5733`)
3. **Preview:** Changes show in real-time
4. **Save:** Click "Save Changes" button
5. **Reset:** Click "Reset to Defaults" to restore original colors

---

## 🛠️ Troubleshooting

### Theme & Colors Tab Shows Error

**Symptom:** Error message when opening Theme & Colors

**Cause:** Database tables not created

**Fix:**
```bash
# Run the migration again
psql nuk_library < database/website_admin_tables.sql
```

### No Settings Showing

**Symptom:** Tab loads but shows empty

**Cause:** Default settings not inserted

**Fix:**
```sql
-- Check if settings exist
SELECT COUNT(*) FROM website_theme_settings;

-- If 0, insert defaults manually (see migration file)
```

### Changes Not Saving

**Symptom:** "Save Changes" button doesn't save

**Cause:**
1. Backend not running
2. Not logged in as admin
3. Database permissions issue

**Fix:**
1. Ensure backend is running
2. Verify admin login
3. Check database user has UPDATE permissions

---

## 📝 What Was Created

### 8 Database Tables

1. **website_theme_settings**
   - 35+ color settings
   - Organized by category
   - Hex color values

2. **website_pages**
   - Page management
   - SEO meta fields
   - Publish status

3. **website_sections**
   - Page sections
   - Layout and styling
   - Display order

4. **website_content_blocks**
   - Content blocks
   - Images and links
   - Custom attributes

5. **website_cards**
   - Card components
   - Icons and images
   - Links

6. **website_menu_items**
   - Navigation menus
   - Hierarchy support
   - Icons

7. **website_media**
   - Media library
   - File metadata
   - Upload tracking

8. **website_global_settings**
   - Site name and tagline
   - Contact information
   - Social media links
   - Analytics code

### Default Theme Settings (35 colors)

All current website colors are now in the database:
- Primary: `#2D3E50` (charcoal)
- Secondary: `#8B4513` (brown)
- Accent: `#D2691E` (peru)
- Background: `#F5F5F0` (beige)
- Plus 31 more...

---

## 🔄 Update Workflow

### Changing Colors

1. Go to `/admin/website`
2. Click "Theme & Colors" tab
3. Modify colors using picker or hex input
4. Click "Save Changes"
5. Refresh frontend to see changes

### Resetting to Defaults

1. Click "Reset to Defaults" button
2. Confirm the action
3. All colors restored to original values

---

## 📊 Database Schema

```sql
-- Example: Theme Settings Table
CREATE TABLE website_theme_settings (
    setting_id SERIAL PRIMARY KEY,
    setting_key VARCHAR(100) UNIQUE NOT NULL,  -- e.g., 'primary_color'
    setting_value VARCHAR(50) NOT NULL,        -- e.g., '#2D3E50'
    setting_type VARCHAR(20) DEFAULT 'color',
    category VARCHAR(50) NOT NULL,             -- e.g., 'colors', 'buttons'
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

Full schema available in: `database/website_admin_tables.sql`

---

## 🎯 Next Steps

After setup:

1. **Test Theme Customization**
   - Change a few colors
   - Save and verify they persist
   - Test reset functionality

2. **Explore Other Tabs**
   - Pages & Sections
   - Navigation Menu
   - Media Library
   - Global Settings

3. **Customize Your Theme**
   - Match your brand colors
   - Adjust button styles
   - Customize navigation appearance

---

## 📋 Summary

- ✅ Database migration script created
- ✅ Run migration on local database
- ✅ Run migration on Railway database
- ✅ Access `/admin/website`
- ✅ Start customizing theme & colors

**Migration File:** `database/website_admin_tables.sql`

**Access URL:** `https://www.mynuk.com/admin/website`

---

**Last Updated:** November 29, 2025
