# Content Management System Documentation

## Overview

The Nuk Library Content Management System (CMS) enables both admins and patrons to contribute content to the website. Patrons can submit blog posts, book reviews, suggestions, and testimonials, while admins can moderate and publish this content.

## Features

### For Patrons
- ✍️ **Blog Posts**: Write and submit blog posts about reading experiences
- ⭐ **Book Reviews**: Review books from the library collection
- 💡 **Book Suggestions**: Suggest books to add to the collection
- 🎯 **Testimonials**: Share experiences with the library
- 🔔 **Notifications**: Receive updates on content approval status

### For Admins
- ✅ **Content Moderation**: Approve, reject, or request changes
- 📊 **Dashboard**: View pending content and analytics
- 📅 **Event Management**: Create and manage events
- 👥 **User Management**: Track contributor activity
- 📈 **Analytics**: Monitor content performance

## Database Schema

### Main Tables

#### `blog_posts`
Stores blog posts submitted by patrons and admins.

**Fields:**
- `post_id` (PK): Unique identifier
- `author_id` (FK): References users table
- `title`: Post title
- `slug`: URL-friendly slug
- `excerpt`: Short summary
- `content`: Full post content
- `featured_image_url`: Optional cover image
- `category`: Post category
- `tags`: Array of tags
- `status`: draft, pending, approved, published, rejected, changes_requested
- `view_count`: Number of views
- `is_featured`: Boolean for homepage feature
- `rejection_reason`: Reason if rejected
- `admin_notes`: Feedback from moderators
- `published_at`: Publication timestamp
- `approved_by` (FK): Admin who approved
- `created_at`, `updated_at`: Timestamps

#### `book_suggestions`
Book suggestions from patrons.

**Fields:**
- `suggestion_id` (PK)
- `patron_id` (FK)
- `title`, `authors`, `isbn`: Book details
- `category`, `recommended_for`: Classification
- `reason`: Why suggested
- `interest_level`: just_me, few_people, many_people, very_popular
- `status`: pending, approved, rejected, ordered, added
- `admin_response`: Feedback from admin
- `reviewed_at`, `reviewed_by`: Moderation info

#### `testimonials`
Member testimonials.

**Fields:**
- `testimonial_id` (PK)
- `user_id` (FK)
- `testimonial_text`: The testimonial
- `rating`: 1-5 stars
- `display_name`: How to display author
- `user_role`: e.g., "Parent, Member since 2020"
- `status`: pending, approved, rejected
- `is_featured`: Show on homepage
- `approved_at`, `approved_by`: Moderation info

#### `events`
Library events and activities.

**Fields:**
- `event_id` (PK)
- `title`, `slug`, `description`: Event details
- `category`: Event type
- `event_date`, `start_time`, `end_time`: Scheduling
- `location`: Venue
- `max_participants`, `current_participants`: Capacity tracking
- `featured_image_url`: Event image
- `fee`: Registration fee (if any)
- `registration_enabled`: Boolean
- `registration_deadline`: Last date to register
- `status`: draft, published, cancelled, completed
- `created_by` (FK): Admin who created

#### `event_registrations`
Event participant registrations.

**Fields:**
- `registration_id` (PK)
- `event_id` (FK)
- `user_id` (FK), `patron_id` (FK): Registrant
- `attendee_name`, `attendee_email`, `attendee_phone`: Contact info
- `status`: confirmed, cancelled, attended, no_show
- `payment_status`: pending, paid, refunded

#### `notifications`
User notifications.

**Fields:**
- `notification_id` (PK)
- `user_id` (FK)
- `notification_type`: post_approved, post_rejected, changes_requested, etc.
- `title`, `message`: Notification content
- `link_url`: Optional link
- `is_read`: Boolean
- `created_at`: Timestamp

## API Endpoints

### Patron Content APIs (`/api/patron/content`)

#### Blog Posts

```
GET    /blog/posts              # Get user's blog posts
GET    /blog/posts/:id          # Get specific post
POST   /blog/posts              # Create new post
PUT    /blog/posts/:id          # Update post
DELETE /blog/posts/:id          # Delete post
```

**Create/Update Blog Post Request:**
```json
{
  "title": "My Journey with Classic Literature",
  "content": "Full post content...",
  "excerpt": "Short summary...",
  "featured_image_url": "https://...",
  "category": "Book Reviews",
  "tags": ["classics", "reading"],
  "submit": true  // true to submit for review, false for draft
}
```

**Response:**
```json
{
  "message": "Blog post created successfully",
  "post_id": 123,
  "slug": "my-journey-with-classic-literature",
  "status": "pending"
}
```

#### Book Suggestions

```
GET  /suggestions     # Get user's suggestions
POST /suggestions     # Submit new suggestion
```

**Create Suggestion Request:**
```json
{
  "title": "The Hobbit",
  "authors": "J.R.R. Tolkien",
  "isbn": "9780547928227",
  "category": "Fiction",
  "recommended_for": "Children",
  "reason": "Classic fantasy adventure perfect for young readers",
  "interest_level": "many_people"
}
```

#### Testimonials

```
POST /testimonials    # Submit testimonial
```

**Create Testimonial Request:**
```json
{
  "testimonial_text": "Nuk Library has been amazing...",
  "rating": 5,
  "display_name": "Priya S.",
  "user_role": "Parent, Member since 2020"
}
```

#### Notifications

```
GET  /notifications                    # Get all notifications
POST /notifications/:id/read           # Mark as read
POST /notifications/read-all           # Mark all as read
```

### Admin Content APIs (`/api/admin/content`)

#### Blog Post Moderation

```
GET  /blog/pending                      # Get pending posts
GET  /blog/:id/full                     # Get full post for review
POST /blog/:id/approve                  # Approve post
POST /blog/:id/request-changes          # Request changes
POST /blog/:id/reject                   # Reject post
```

**Approve Post Request:**
```json
{
  "publish_immediately": true,
  "is_featured": false,
  "admin_notes": "Great post! Minor typo fixed.",
  "scheduled_for": null  // or ISO timestamp
}
```

**Request Changes:**
```json
{
  "feedback": "Please fix:\n1. Heading formatting\n2. Add one more image"
}
```

**Reject Post:**
```json
{
  "reason": "Duplicate content",
  "explanation": "This topic was recently covered in another post."
}
```

#### Book Suggestions Moderation

```
GET  /suggestions/pending               # Get pending suggestions
POST /suggestions/:id/approve           # Approve suggestion
POST /suggestions/:id/reject            # Reject suggestion
```

**Approve Suggestion:**
```json
{
  "response": "Thank you! We'll add this book to our collection."
}
```

**Reject Suggestion:**
```json
{
  "response": "We already have this book in our collection."
}
```

#### Testimonials Moderation

```
GET  /testimonials/pending              # Get pending testimonials
POST /testimonials/:id/approve          # Approve testimonial
POST /testimonials/:id/reject           # Reject testimonial
```

**Approve Testimonial:**
```json
{
  "is_featured": true
}
```

#### Dashboard

```
GET /dashboard/stats                    # Get moderation statistics
```

**Response:**
```json
{
  "pending_counts": {
    "blog_posts": 15,
    "reviews": 5,
    "suggestions": 3,
    "testimonials": 2
  },
  "total_published_posts": 145,
  "approval_rate": 78.5,
  "top_contributors": [
    {"name": "Priya Sharma", "post_count": 12},
    {"name": "Rajesh Kumar", "post_count": 8}
  ]
}
```

### Event APIs (`/api/events`)

#### Public Routes

```
GET  /                           # Get all published events
GET  /:id                        # Get event details
POST /:id/register               # Register for event
GET  /registrations/my           # Get user's registrations (auth required)
```

**Get Events Query Params:**
- `category`: Filter by category
- `upcoming_only`: true/false (default: true)

**Register for Event:**
```json
{
  "attendee_name": "John Doe",
  "attendee_email": "john@example.com",
  "attendee_phone": "+91 98765 43210"
}
```

#### Admin Routes

```
GET    /admin/all               # Get all events (all statuses)
POST   /admin                   # Create event
PUT    /admin/:id               # Update event
DELETE /admin/:id               # Delete event
GET    /admin/:id/registrations # Get event registrations
```

**Create Event:**
```json
{
  "title": "Toastmasters Public Speaking Session",
  "description": "Join our club for inspiring speeches...",
  "category": "Public Speaking",
  "event_date": "2024-12-05",
  "start_time": "18:00",
  "end_time": "20:00",
  "location": "Nuk Library Main Hall",
  "max_participants": 30,
  "featured_image_url": "https://...",
  "fee": 0,
  "registration_enabled": true,
  "registration_deadline": "2024-12-04T23:59:59",
  "send_confirmation_email": true,
  "publish": true
}
```

## Workflow

### Blog Post Lifecycle

```
1. PATRON CREATES POST
   ├─> Save as Draft (status: draft)
   └─> Submit for Review (status: pending)

2. ADMIN REVIEWS
   ├─> Approve
   │   ├─> Publish immediately (status: published)
   │   └─> Schedule for later (status: approved)
   │
   ├─> Request Changes (status: changes_requested)
   │   └─> Patron edits and resubmits → Back to pending
   │
   └─> Reject (status: rejected)
       └─> End (patron can view rejection reason)

3. PUBLISHED
   ├─> Can be featured on homepage
   └─> View count tracking
   └─> Comments enabled
```

### Event Registration Flow

```
1. ADMIN CREATES EVENT
   ├─> Save as Draft
   └─> Publish immediately

2. PATRON VIEWS & REGISTERS
   ├─> Check availability
   ├─> Fill registration form
   └─> Submit registration

3. CONFIRMATION
   ├─> Registration confirmed
   ├─> Email sent (if enabled)
   └─> Participant count updated

4. EVENT DAY
   ├─> Admin marks attendance
   └─> Status: attended/no_show
```

## Status Values

### Blog Post Status
- `draft`: Saved but not submitted
- `pending`: Submitted, awaiting review
- `changes_requested`: Admin requested revisions
- `approved`: Approved, scheduled for publishing
- `published`: Live on website
- `rejected`: Not approved

### Suggestion Status
- `pending`: Awaiting review
- `approved`: Admin approved
- `rejected`: Admin rejected
- `ordered`: Book ordered
- `added`: Added to collection

### Event Status
- `draft`: Not published
- `published`: Live and accepting registrations
- `cancelled`: Event cancelled
- `completed`: Event finished

### Registration Status
- `confirmed`: Registration successful
- `cancelled`: Cancelled by user/admin
- `attended`: Marked as attended
- `no_show`: Registered but didn't attend

## Notification Types

- `post_approved`: Blog post approved
- `post_rejected`: Blog post rejected
- `changes_requested`: Changes requested on post
- `suggestion_approved`: Book suggestion approved
- `suggestion_rejected`: Book suggestion not approved
- `testimonial_approved`: Testimonial approved
- `new_blog_post`: New post submitted (for admins)
- `new_book_suggestion`: New suggestion (for admins)
- `event_registration`: Event registration received

## Permission Matrix

| Action | Admin | Patron | Guest |
|--------|-------|--------|-------|
| **Blog Posts** |
| Create | ✅ | ✅ | ❌ |
| Edit own | ✅ | ✅ (draft/changes_requested) | ❌ |
| Edit others | ✅ | ❌ | ❌ |
| Delete own | ✅ | ✅ (draft/rejected) | ❌ |
| Delete others | ✅ | ❌ | ❌ |
| Approve/Reject | ✅ | ❌ | ❌ |
| Publish | ✅ | ❌ | ❌ |
| **Suggestions** |
| Submit | ✅ | ✅ | ❌ |
| Approve/Reject | ✅ | ❌ | ❌ |
| **Events** |
| Create | ✅ | ❌ | ❌ |
| View published | ✅ | ✅ | ✅ |
| Register | ✅ | ✅ | ❌ |
| Manage | ✅ | ❌ | ❌ |

## Database Migration

To set up the content management system:

```bash
# Run the migration
psql -U nuklib_user -d nuklib_db -f database/migrations/006_content_management.sql
```

This creates:
- 11 new tables
- 15 indexes for performance
- 4 triggers for automation
- 2 views for analytics
- Proper foreign key constraints

## Integration with Frontend

### Patron Dashboard URL Structure
```
/patron/content/dashboard      # Overview
/patron/content/blog           # My blog posts
/patron/content/blog/new       # Create new post
/patron/content/blog/:id/edit  # Edit post
/patron/content/suggestions    # My suggestions
/patron/content/notifications  # Notifications
```

### Admin Dashboard URL Structure
```
/admin/content/dashboard       # Moderation dashboard
/admin/content/blog/pending    # Pending blog posts
/admin/content/blog/:id/review # Review post
/admin/content/suggestions     # Book suggestions
/admin/content/testimonials    # Testimonials
/admin/content/events          # Event management
/admin/content/events/new      # Create event
/admin/content/analytics       # Analytics
```

## Best Practices

### For Admins
1. **Review Promptly**: Aim to review content within 24-48 hours
2. **Provide Constructive Feedback**: When requesting changes, be specific
3. **Consistent Standards**: Apply moderation rules consistently
4. **Acknowledge Good Work**: Use admin notes to encourage contributors
5. **Monitor Analytics**: Track approval rates and contributor activity

### For Patrons
1. **Follow Guidelines**: Adhere to content quality standards
2. **Proofread**: Check spelling and grammar before submitting
3. **Original Content**: Don't plagiarize
4. **Appropriate Content**: Keep it family-friendly
5. **Be Patient**: Allow time for review
6. **Respond to Feedback**: Address requested changes promptly

## Error Handling

All endpoints return proper HTTP status codes:
- `200`: Success
- `201`: Created
- `400`: Bad request (validation error)
- `401`: Unauthorized
- `403`: Forbidden (permission denied)
- `404`: Not found
- `500`: Server error

Error responses include descriptive messages:
```json
{
  "error": "Title and content are required"
}
```

## Security Considerations

1. **Authentication Required**: All write operations require JWT authentication
2. **Authorization Checks**: Role-based access control (admin vs patron)
3. **Ownership Validation**: Users can only edit/delete their own content
4. **Input Sanitization**: All user input is validated
5. **SQL Injection Prevention**: Parameterized queries
6. **XSS Protection**: Content sanitized before display

## Future Enhancements

- [ ] Rich text editor with image upload
- [ ] Auto-save drafts
- [ ] Version history for posts
- [ ] Collaborative editing
- [ ] Content scheduling
- [ ] Email notifications
- [ ] Advanced analytics
- [ ] Content tagging system
- [ ] Search within user's content
- [ ] Export content to PDF
- [ ] Social sharing integration
- [ ] Comment moderation
- [ ] Spam detection
- [ ] SEO optimization tools

## Support

For technical issues or questions:
- Check API documentation above
- Review error messages carefully
- Contact system administrator

---

**Last Updated**: November 2024
**Version**: 1.0.0
