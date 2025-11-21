# Website Admin Feature

## Overview

The Website Admin feature provides a comprehensive content management system (CMS) for managing the public-facing website. Admin users can customize the website's appearance, create/edit pages, manage navigation menus, and handle media assets.

## Features

### 1. **Theme & Color Customization**
- Customize primary, secondary, and accent colors
- Configure background and text colors
- Customize header and footer colors
- Adjust button styles and card colors
- Manage typography (fonts and sizes)
- Configure spacing and border radius
- Real-time color picker with hex input
- Bulk update settings
- Reset to default theme

### 2. **Page Management**
- Create custom pages with SEO-friendly slugs
- Add/edit/delete pages
- Publish/unpublish pages
- Set page metadata (title, description)
- Organize pages with display order
- Add sections to pages dynamically

### 3. **Section Management**
- Multiple section types (hero, content, cards, gallery, testimonials, features, CTA, custom)
- Configurable section headers and subheaders
- Custom background and text colors per section
- Display order management
- Show/hide sections
- Custom CSS support for advanced styling

### 4. **Card Management**
- Create cards with or without images
- Add card titles, descriptions, and icons
- Configure card links and call-to-action buttons
- Custom colors for individual cards
- Image preview
- Display order management

### 5. **Content Block Management**
- Multiple block types (text, image, button, HTML)
- Rich content editing
- Add images and links
- Custom attributes via JSON
- Reorder content blocks
- Show/hide blocks

### 6. **Navigation Menu Management**
- Manage multiple menu locations (header, footer, sidebar)
- Add/edit/delete menu items
- Configure menu links and targets (_self/_blank)
- Add icons to menu items
- Display order management
- Show/hide menu items

### 7. **Media Library**
- Upload and manage images
- Organize media by type (image, video, document)
- Add alt text for accessibility
- Add captions to media
- Copy media URLs for use in content
- Filter media by type
- Preview images

### 8. **Global Settings**
- Configure site name and tagline
- Set site logo and favicon
- Manage contact information (email, phone, address)
- Configure social media links (Facebook, Twitter, Instagram, LinkedIn)
- Customize footer text and copyright
- Add analytics code (Google Analytics, etc.)
- Insert custom HTML in head and footer
- Comprehensive site-wide settings

## Installation & Setup

### 1. Database Migration

Run the database migration to create the required tables:

```bash
# Connect to your PostgreSQL database
psql -U your_username -d your_database_name

# Run the migration script
\i database/migrations/007_website_admin.sql
```

Or using Python:

```python
import psycopg2
from app.config import Config

conn = psycopg2.connect(Config.DATABASE_URL)
cur = conn.cursor()

with open('database/migrations/007_website_admin.sql', 'r') as f:
    migration_sql = f.read()
    cur.execute(migration_sql)

conn.commit()
cur.close()
conn.close()
```

### 2. Backend Setup

The backend API routes are automatically registered in `backend/app/__init__.py`. No additional configuration required.

### 3. Frontend Setup

The Website Admin dashboard is automatically integrated into the admin navigation. Access it at:

```
http://localhost:3000/admin/website
```

## Usage Guide

### Accessing Website Admin

1. Log in as an admin user
2. Click on "🌐 Website Admin" in the navigation menu
3. Use the tabs to access different features:
   - **Pages & Sections**: Manage pages and content
   - **Theme & Colors**: Customize visual appearance
   - **Navigation Menu**: Edit menu links
   - **Media Library**: Manage images and files
   - **Global Settings**: Configure site-wide settings

### Creating a New Page

1. Go to "Pages & Sections" tab
2. Click "+ New Page" button
3. Fill in:
   - Page Title (required)
   - URL Slug (auto-generated or custom)
   - Page Description
   - Meta Title (for SEO)
   - Meta Description (for SEO)
   - Publish status
4. Click "Create Page"

### Adding Sections to a Page

1. Select a page from the list
2. Click "+ Add Section"
3. Configure:
   - Section Name
   - Section Type (hero, content, cards, etc.)
   - Section Header and Subheader
   - Background and Text Colors
   - Display Order
   - Custom CSS (optional)
4. Click "Add Section"

### Adding Cards to a Section

1. Navigate to a section
2. In the Cards section, click "+ Add Card"
3. Fill in:
   - Card Title (required)
   - Card Description
   - Card Image URL
   - Card Icon (emoji or class name)
   - Link URL and Link Text
   - Background and Text Colors
4. Click "Add Card"

### Customizing Theme Colors

1. Go to "Theme & Colors" tab
2. Browse through color categories:
   - Colors (primary, secondary, accent, etc.)
   - Backgrounds
   - Text
   - Header
   - Footer
   - Buttons
   - Cards
3. Click on color picker or enter hex code
4. Click "Save Changes" to apply
5. Use "Reset to Defaults" to restore original theme

### Managing Navigation Menus

1. Go to "Navigation Menu" tab
2. Select menu location (Header, Footer, or Sidebar)
3. Click "+ Add Menu Item"
4. Configure:
   - Menu Text (display name)
   - Menu URL (link destination)
   - Display Order
   - Link Target (same window or new window)
   - Icon (optional)
5. Click "Add Menu Item"

### Using Media Library

1. Go to "Media Library" tab
2. Click "+ Add Media"
3. Fill in:
   - Media Name
   - Media URL (currently URL-based, file upload can be added)
   - Media Type (image, video, document)
   - Alt Text (for images)
   - Caption
4. Click "Add Media"
5. Use "📋 Copy URL" button to copy media URLs for use in content

### Updating Global Settings

1. Go to "Global Settings" tab
2. Update sections:
   - Site Information
   - Contact Information
   - Social Media Links
   - Footer Settings
   - Advanced Settings (analytics, custom code)
3. Click "Save Settings"

## API Endpoints

### Theme Settings
- `GET /api/admin/website/theme/settings` - Get all theme settings
- `PUT /api/admin/website/theme/settings/:id` - Update a theme setting
- `PUT /api/admin/website/theme/settings/bulk` - Update multiple settings
- `POST /api/admin/website/theme/reset` - Reset theme to defaults

### Pages
- `GET /api/admin/website/pages` - Get all pages
- `GET /api/admin/website/pages/:id` - Get page with sections
- `POST /api/admin/website/pages` - Create new page
- `PUT /api/admin/website/pages/:id` - Update page
- `DELETE /api/admin/website/pages/:id` - Delete page

### Sections
- `POST /api/admin/website/sections` - Create section
- `PUT /api/admin/website/sections/:id` - Update section
- `DELETE /api/admin/website/sections/:id` - Delete section

### Content Blocks
- `POST /api/admin/website/content-blocks` - Create content block
- `PUT /api/admin/website/content-blocks/:id` - Update content block
- `DELETE /api/admin/website/content-blocks/:id` - Delete content block

### Cards
- `POST /api/admin/website/cards` - Create card
- `PUT /api/admin/website/cards/:id` - Update card
- `DELETE /api/admin/website/cards/:id` - Delete card

### Menu
- `GET /api/admin/website/menu` - Get all menu items
- `GET /api/admin/website/menu/:location` - Get menu by location
- `POST /api/admin/website/menu` - Create menu item
- `PUT /api/admin/website/menu/:id` - Update menu item
- `DELETE /api/admin/website/menu/:id` - Delete menu item

### Media
- `GET /api/admin/website/media` - Get all media
- `GET /api/admin/website/media?type=image` - Get media by type
- `POST /api/admin/website/media` - Add media
- `PUT /api/admin/website/media/:id` - Update media
- `DELETE /api/admin/website/media/:id` - Delete media

### Global Settings
- `GET /api/admin/website/settings/global` - Get global settings
- `PUT /api/admin/website/settings/global` - Update global settings

## Database Schema

### Tables Created

1. **website_theme_settings** - Theme customization settings
2. **website_pages** - Custom pages
3. **website_sections** - Page sections
4. **website_content_blocks** - Content blocks within sections
5. **website_cards** - Reusable card components
6. **website_menu_items** - Navigation menu items
7. **website_media** - Media library
8. **website_global_settings** - Site-wide settings

All tables include:
- Primary keys with auto-increment
- Timestamps (created_at, updated_at)
- Foreign key relationships with cascading deletes
- Indexes for performance optimization
- Triggers for automatic timestamp updates

## Security

- All routes require admin authentication (`@jwt_required()` and `@admin_required`)
- JWT tokens expire after 24 hours
- SQL injection prevention through parameterized queries
- Input validation on all endpoints
- Role-based access control

## Future Enhancements

Potential features to add:

1. **File Upload**: Direct file upload instead of URL-based media
2. **Page Templates**: Pre-built page templates for quick setup
3. **Drag-and-Drop**: Visual page builder with drag-and-drop
4. **Version Control**: Track page revisions and rollback
5. **Preview Mode**: Preview changes before publishing
6. **Scheduled Publishing**: Schedule pages to publish at specific times
7. **Multi-language Support**: Content in multiple languages
8. **SEO Tools**: SEO analysis and recommendations
9. **Analytics Integration**: Built-in analytics dashboard
10. **Backup/Export**: Export and import website configuration

## Troubleshooting

### Common Issues

**Issue**: Website Admin not appearing in navigation
- **Solution**: Ensure you're logged in as an admin user

**Issue**: API endpoints returning 401 Unauthorized
- **Solution**: Check that JWT token is valid and not expired

**Issue**: Theme changes not applying
- **Solution**: Clear browser cache and refresh the page

**Issue**: Database tables not found
- **Solution**: Ensure the migration script has been executed

**Issue**: Images not displaying
- **Solution**: Verify image URLs are publicly accessible

## Support

For issues or questions:
1. Check this documentation
2. Review API endpoint responses for error messages
3. Check browser console for frontend errors
4. Check backend logs for API errors

## License

This feature is part of the Nuk Library Management System.
