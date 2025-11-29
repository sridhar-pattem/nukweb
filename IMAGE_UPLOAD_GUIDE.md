# Image Upload and Usage Guide

**Last Updated:** November 29, 2025

---

## 📸 How to Upload Images

You have **TWO** methods for uploading images:

### Method 1: Banner Image Upload (Recommended for Page Banners)

This is currently the **ONLY working upload method** because it has a backend endpoint.

**Use For:**
- Home page banner
- About page banner
- Events page banner
- Blog page banner
- Contact page banner

**How to Upload:**

1. **As Admin**, visit any public page that has a hero section (Home, About, Events, Blog, Contact)
2. You'll see a **"Replace Image"** button in the bottom-right corner of the banner
3. Click the button and select an image file (PNG, JPG, JPEG, GIF, WEBP)
4. Maximum file size: **5MB**
5. Image is automatically saved to: `website/public/assets/images/`

**File Naming Convention:**
- Home page: `Home_Banner.{ext}`
- About page: `Nuk-10.{ext}`
- Contact page: `Nuk-15.{ext}`
- Events page: `Nuk-17.{ext}`
- Blog page: `Nuk-20.{ext}`

**Backend Endpoint:**
```
POST /api/admin/website/upload-banner
```

**Code Location:**
- Frontend: `website/src/components/admin/BannerImageManager.js`
- Backend: `backend/app/routes/admin_website.py` (lines 1120-1183)

---

### Method 2: Media Library Upload (NOT YET FUNCTIONAL)

**Status:** ⚠️ UI exists but backend endpoint incomplete

**Why Not Working:**
- Media Manager UI exists: `website/src/components/admin/WebsiteAdmin/MediaManager.js`
- Backend endpoints exist: `/api/admin/website/media`
- BUT: No actual file upload handling - it only accepts URLs
- Line 198 says: "Note: Actual file upload functionality should be implemented separately"

**To Make This Work (Future Enhancement):**
You would need to:
1. Add file upload handling to the MediaManager component
2. Create a new backend endpoint similar to `upload-banner`
3. Store uploaded file paths in the `website_media` table (requires creating this table first)

---

## 🖼️ How to Use Images in Blog Posts

### Option 1: Use Existing Images (WORKS NOW)

**Step 1: Find Your Image**

Look in `website/public/assets/images/` folder. You have these images available:

```bash
Home_Banner.jpeg
Home_Banner.png
Nuk-02.jpeg through Nuk-20.jpeg
... and more
```

**Step 2: Construct the Image URL**

Format: `/assets/images/{filename}`

Examples:
```
/assets/images/Home_Banner.jpeg
/assets/images/Nuk-10.jpeg
/assets/images/Nuk-15.jpeg
```

**Step 3: Enter in Blog Post Editor**

When creating/editing a blog post, paste the URL into the **"Featured Image URL"** field:

```
Featured Image URL: /assets/images/Nuk-10.jpeg
```

### Option 2: Use External Images (WORKS NOW)

You can also use images hosted elsewhere:

```
https://via.placeholder.com/600x400?text=Blog+Image
https://images.unsplash.com/photo-xxx
https://i.imgur.com/xxx.jpg
```

Just paste the full URL into the Featured Image URL field.

### Option 3: Upload New Images via Banner Manager (WORKAROUND)

**Temporary workaround until Media Library is functional:**

1. Visit any page with a banner (e.g., `/about`)
2. Use "Replace Image" to upload your image
3. The image goes to `/assets/images/` with a specific name
4. Use that path in your blog post

**Example:**
- Upload image on About page → saved as `Nuk-10.jpeg`
- Use in blog: `/assets/images/Nuk-10.jpeg`

**Limitation:** File gets a fixed name based on the page, so you might overwrite existing banners.

---

## 📁 Current Image Directory Structure

```
website/public/assets/images/
├── Home_Banner.jpeg       (Home page banner)
├── Home_Banner.png        (Alternative home banner)
├── Nuk-02.jpeg           (Library interior photo)
├── Nuk-03.jpeg           (Reading area)
├── Nuk-10.jpeg           (About page banner)
├── Nuk-15.jpeg           (Contact page banner)
├── Nuk-17.jpeg           (Events page banner)
├── Nuk-20.jpeg           (Blog page banner)
└── ... more images
```

**URL Format:**
All these images are accessible at: `/assets/images/{filename}`

---

## 🔧 How Images Work Technically

### Frontend Path Resolution

When you use `/assets/images/photo.jpg` in your React components:

1. React serves from `website/public/` directory
2. Path `/assets/images/photo.jpg` maps to `website/public/assets/images/photo.jpg`
3. When deployed, Nginx/hosting serves these as static files

### Backend Upload Process

When you upload via Banner Manager:

```javascript
// 1. Frontend sends FormData
formData.append('image', file);
formData.append('pageName', 'blog');

// 2. Backend receives and saves
POST /api/admin/website/upload-banner

// 3. File saved to:
{project_root}/website/public/assets/images/{filename}

// 4. Returns path:
{ imagePath: '/assets/images/Nuk-20.jpeg' }
```

---

## ✅ QUICK REFERENCE: Blog Post Image URLs

### For Blog Featured Images, Use:

**Existing Library Photos:**
```
/assets/images/Nuk-10.jpeg   (Interior view - good for blog headers)
/assets/images/Nuk-15.jpeg   (Seating area)
/assets/images/Nuk-17.jpeg   (Events/community space)
/assets/images/Nuk-20.jpeg   (Blog-specific banner)
```

**External Stock Photos:**
```
https://via.placeholder.com/800x400?text=Your+Blog+Title
https://images.unsplash.com/photo-1481627834876-b7833e8f5570  (Books)
https://images.unsplash.com/photo-1524995997946-a1c2e315a42f  (Library)
```

**After Uploading New Image:**
```
/assets/images/{filename}
```

---

## 🚀 RECOMMENDED WORKFLOW FOR BLOG POSTS

### Current Best Practice:

1. **For Featured Images:**
   - Use existing images from `/assets/images/` folder
   - OR use external URLs (Unsplash, Placeholder, etc.)
   - OR upload via banner manager as temporary workaround

2. **Image URL Format:**
   ```
   Local: /assets/images/Nuk-XX.jpeg
   External: https://full-url-to-image.com/image.jpg
   ```

3. **In Blog Editor:**
   - Paste URL into "Featured Image URL" field
   - No need for quotes or additional formatting
   - Just the raw URL

### Example Blog Post Creation:

```
Title: My Reading Journey
Excerpt: How I discovered classic literature
Featured Image URL: /assets/images/Nuk-10.jpeg
Content: [Your blog content here]
```

---

## ⚠️ LIMITATIONS & KNOWN ISSUES

### Current Limitations:

1. **No Direct Upload in Blog Editor**
   - Blog post editor doesn't have image upload button
   - Must use URLs only

2. **Media Library Not Functional**
   - UI exists but can't upload files
   - Only accepts URLs (manual entry)

3. **Banner Upload Overwrites**
   - Uploading on a page replaces that page's banner
   - Can't upload arbitrary images with custom names

### Workaround Solutions:

**Need to Upload Blog Images?**

**Option A: Use External Hosting**
- Upload to Imgur, Cloudinary, or Google Drive
- Get public URL
- Use in blog post

**Option B: Manually Add to Assets Folder**
```bash
# On your local machine:
cd website/public/assets/images/
# Copy your image file here
cp ~/Downloads/my-blog-image.jpg ./
# Now use: /assets/images/my-blog-image.jpg
```

**Option C: Deploy Media Library** (Requires work)
- Create database table: `website_media`
- Implement file upload in MediaManager component
- Add upload endpoint similar to banner upload

---

## 🎯 FUTURE ENHANCEMENTS

To make image uploading more robust:

### 1. Add Blog Image Upload Button

**In `BlogPostEditor.js`:**
- Add image upload button near Featured Image URL field
- Upload to `/assets/images/blog/`
- Auto-fill the URL field after upload

### 2. Complete Media Library

**Requirements:**
- Create `website_media` database table (see ADMIN_FIXES_SUMMARY.md)
- Add file upload handling to MediaManager
- Create general-purpose `/api/admin/website/upload-media` endpoint
- Allow browsing and selecting from media library

### 3. Rich Text Editor with Image Insertion

**Upgrade to:**
- TinyMCE or Quill editor
- Inline image upload and insertion
- Drag-and-drop image support

---

## 📋 SUMMARY

### ✅ What Works NOW:

- Uploading page banners via "Replace Image" button
- Using existing images with `/assets/images/{filename}` format
- Using external image URLs in blog posts

### ⚠️ What Doesn't Work YET:

- Media Library file uploads
- Direct blog image upload
- Custom filename uploads

### 🔑 For Your Blog Posts:

**Use this format for Featured Image URL:**
```
/assets/images/Nuk-10.jpeg
```

or

```
https://images.unsplash.com/photo-xxxx
```

That's it! No additional syntax needed.

---

**Last Updated:** November 29, 2025
**Questions?** Check `ADMIN_FIXES_SUMMARY.md` for related information about Website Admin features.
