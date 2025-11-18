-- =====================================================
-- NUK LIBRARY - CONTENT MANAGEMENT SYSTEM
-- Schema for Admin and Patron Content Contribution
-- =====================================================

-- =====================================================
-- BLOG POSTS
-- =====================================================

CREATE TABLE blog_posts (
    post_id SERIAL PRIMARY KEY,
    author_id INTEGER NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,
    excerpt TEXT,
    content TEXT NOT NULL,
    featured_image_url TEXT,
    category VARCHAR(100),
    tags TEXT[], -- Array of tags
    status VARCHAR(50) DEFAULT 'draft', -- draft, pending, approved, published, rejected
    rejection_reason TEXT,
    admin_notes TEXT,
    view_count INTEGER DEFAULT 0,
    is_featured BOOLEAN DEFAULT FALSE,
    published_at TIMESTAMP,
    scheduled_for TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    approved_by INTEGER REFERENCES users(user_id),
    approved_at TIMESTAMP
);

-- Index for better query performance
CREATE INDEX idx_blog_posts_author ON blog_posts(author_id);
CREATE INDEX idx_blog_posts_status ON blog_posts(status);
CREATE INDEX idx_blog_posts_published ON blog_posts(published_at DESC);
CREATE INDEX idx_blog_posts_category ON blog_posts(category);
CREATE INDEX idx_blog_posts_tags ON blog_posts USING GIN(tags);

-- =====================================================
-- BLOG COMMENTS
-- =====================================================

CREATE TABLE blog_comments (
    comment_id SERIAL PRIMARY KEY,
    post_id INTEGER NOT NULL REFERENCES blog_posts(post_id) ON DELETE CASCADE,
    user_id INTEGER NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    parent_comment_id INTEGER REFERENCES blog_comments(comment_id) ON DELETE CASCADE,
    comment_text TEXT NOT NULL,
    is_approved BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_blog_comments_post ON blog_comments(post_id);
CREATE INDEX idx_blog_comments_user ON blog_comments(user_id);

-- =====================================================
-- BLOG POST LIKES
-- =====================================================

CREATE TABLE blog_post_likes (
    like_id SERIAL PRIMARY KEY,
    post_id INTEGER NOT NULL REFERENCES blog_posts(post_id) ON DELETE CASCADE,
    user_id INTEGER NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(post_id, user_id)
);

CREATE INDEX idx_blog_likes_post ON blog_post_likes(post_id);

-- =====================================================
-- BOOK SUGGESTIONS
-- =====================================================

CREATE TABLE book_suggestions (
    suggestion_id SERIAL PRIMARY KEY,
    patron_id INTEGER NOT NULL REFERENCES patrons(patron_id) ON DELETE CASCADE,
    title VARCHAR(500) NOT NULL,
    authors TEXT NOT NULL,
    isbn VARCHAR(20),
    category VARCHAR(100),
    recommended_for VARCHAR(100), -- age group
    reason TEXT NOT NULL,
    interest_level VARCHAR(50), -- just_me, few_people, many_people, very_popular
    status VARCHAR(50) DEFAULT 'pending', -- pending, approved, rejected, ordered, added
    admin_response TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    reviewed_at TIMESTAMP,
    reviewed_by INTEGER REFERENCES users(user_id)
);

CREATE INDEX idx_book_suggestions_patron ON book_suggestions(patron_id);
CREATE INDEX idx_book_suggestions_status ON book_suggestions(status);

-- =====================================================
-- TESTIMONIALS
-- =====================================================

CREATE TABLE testimonials (
    testimonial_id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    testimonial_text TEXT NOT NULL,
    rating INTEGER CHECK (rating >= 1 AND rating <= 5),
    display_name VARCHAR(255), -- How they want to be displayed
    user_role VARCHAR(100), -- e.g., "Parent, Member since 2020"
    status VARCHAR(50) DEFAULT 'pending', -- pending, approved, rejected
    is_featured BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    approved_at TIMESTAMP,
    approved_by INTEGER REFERENCES users(user_id)
);

CREATE INDEX idx_testimonials_status ON testimonials(status);
CREATE INDEX idx_testimonials_featured ON testimonials(is_featured);

-- =====================================================
-- EVENTS (Enhanced from website requirements)
-- =====================================================

CREATE TABLE events (
    event_id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,
    description TEXT NOT NULL,
    category VARCHAR(100),
    event_date DATE NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    location VARCHAR(255),
    max_participants INTEGER,
    current_participants INTEGER DEFAULT 0,
    featured_image_url TEXT,
    fee DECIMAL(10, 2) DEFAULT 0,
    registration_enabled BOOLEAN DEFAULT TRUE,
    registration_deadline TIMESTAMP,
    send_confirmation_email BOOLEAN DEFAULT TRUE,
    status VARCHAR(50) DEFAULT 'draft', -- draft, published, cancelled, completed
    created_by INTEGER NOT NULL REFERENCES users(user_id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    published_at TIMESTAMP
);

CREATE INDEX idx_events_date ON events(event_date DESC);
CREATE INDEX idx_events_status ON events(status);
CREATE INDEX idx_events_category ON events(category);

-- =====================================================
-- EVENT REGISTRATIONS
-- =====================================================

CREATE TABLE event_registrations (
    registration_id SERIAL PRIMARY KEY,
    event_id INTEGER NOT NULL REFERENCES events(event_id) ON DELETE CASCADE,
    user_id INTEGER REFERENCES users(user_id) ON DELETE SET NULL,
    patron_id INTEGER REFERENCES patrons(patron_id) ON DELETE SET NULL,
    attendee_name VARCHAR(255) NOT NULL,
    attendee_email VARCHAR(255) NOT NULL,
    attendee_phone VARCHAR(20),
    status VARCHAR(50) DEFAULT 'confirmed', -- confirmed, cancelled, attended, no_show
    payment_status VARCHAR(50) DEFAULT 'pending', -- pending, paid, refunded
    confirmation_sent BOOLEAN DEFAULT FALSE,
    registered_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(event_id, user_id)
);

CREATE INDEX idx_event_registrations_event ON event_registrations(event_id);
CREATE INDEX idx_event_registrations_user ON event_registrations(user_id);

-- =====================================================
-- NEW ARRIVALS (Enhanced)
-- =====================================================

CREATE TABLE new_arrivals (
    arrival_id SERIAL PRIMARY KEY,
    book_id INTEGER NOT NULL REFERENCES books(book_id) ON DELETE CASCADE,
    added_date DATE DEFAULT CURRENT_DATE,
    is_featured BOOLEAN DEFAULT FALSE,
    added_by INTEGER NOT NULL REFERENCES users(user_id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(book_id)
);

CREATE INDEX idx_new_arrivals_date ON new_arrivals(added_date DESC);

-- =====================================================
-- BOOK RECOMMENDATIONS (Curated Lists)
-- =====================================================

CREATE TABLE recommendation_lists (
    list_id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    category VARCHAR(100), -- age_group, genre, theme, etc.
    display_order INTEGER DEFAULT 0,
    created_by INTEGER NOT NULL REFERENCES users(user_id),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE recommendation_list_books (
    id SERIAL PRIMARY KEY,
    list_id INTEGER NOT NULL REFERENCES recommendation_lists(list_id) ON DELETE CASCADE,
    book_id INTEGER NOT NULL REFERENCES books(book_id) ON DELETE CASCADE,
    display_order INTEGER DEFAULT 0,
    added_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(list_id, book_id)
);

-- =====================================================
-- CONTENT MODERATION LOG
-- =====================================================

CREATE TABLE content_moderation_log (
    log_id SERIAL PRIMARY KEY,
    content_type VARCHAR(50) NOT NULL, -- blog_post, review, suggestion, testimonial
    content_id INTEGER NOT NULL,
    action VARCHAR(50) NOT NULL, -- approved, rejected, changes_requested
    moderator_id INTEGER NOT NULL REFERENCES users(user_id),
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_moderation_log_content ON content_moderation_log(content_type, content_id);
CREATE INDEX idx_moderation_log_moderator ON content_moderation_log(moderator_id);

-- =====================================================
-- NOTIFICATIONS
-- =====================================================

CREATE TABLE notifications (
    notification_id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    notification_type VARCHAR(50) NOT NULL, -- post_approved, post_rejected, changes_requested, comment, etc.
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    link_url TEXT,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_notifications_user ON notifications(user_id);
CREATE INDEX idx_notifications_read ON notifications(user_id, is_read);
CREATE INDEX idx_notifications_created ON notifications(created_at DESC);

-- =====================================================
-- TRIGGERS
-- =====================================================

-- Auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_content_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER blog_posts_updated_at
    BEFORE UPDATE ON blog_posts
    FOR EACH ROW
    EXECUTE FUNCTION update_content_updated_at();

CREATE TRIGGER events_updated_at
    BEFORE UPDATE ON events
    FOR EACH ROW
    EXECUTE FUNCTION update_content_updated_at();

CREATE TRIGGER recommendation_lists_updated_at
    BEFORE UPDATE ON recommendation_lists
    FOR EACH ROW
    EXECUTE FUNCTION update_content_updated_at();

-- Auto-update participant count for events
CREATE OR REPLACE FUNCTION update_event_participant_count()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE events
        SET current_participants = current_participants + 1
        WHERE event_id = NEW.event_id;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE events
        SET current_participants = current_participants - 1
        WHERE event_id = OLD.event_id;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER event_participant_counter
    AFTER INSERT OR DELETE ON event_registrations
    FOR EACH ROW
    EXECUTE FUNCTION update_event_participant_count();

-- =====================================================
-- VIEWS FOR ANALYTICS
-- =====================================================

-- Blog post stats
CREATE VIEW blog_post_stats AS
SELECT
    bp.post_id,
    bp.title,
    bp.author_id,
    u.email as author_email,
    p.first_name || ' ' || p.last_name as author_name,
    bp.status,
    bp.view_count,
    COUNT(DISTINCT bc.comment_id) as comment_count,
    COUNT(DISTINCT bpl.like_id) as like_count,
    bp.published_at,
    bp.created_at
FROM blog_posts bp
LEFT JOIN users u ON bp.author_id = u.user_id
LEFT JOIN patrons p ON u.user_id = p.user_id
LEFT JOIN blog_comments bc ON bp.post_id = bc.post_id
LEFT JOIN blog_post_likes bpl ON bp.post_id = bpl.post_id
GROUP BY bp.post_id, u.email, p.first_name, p.last_name;

-- Pending content count for admins
CREATE VIEW pending_content_summary AS
SELECT
    'blog_posts' as content_type,
    COUNT(*) as pending_count
FROM blog_posts
WHERE status = 'pending'
UNION ALL
SELECT
    'reviews' as content_type,
    COUNT(*) as pending_count
FROM reviews
WHERE is_approved = FALSE
UNION ALL
SELECT
    'suggestions' as content_type,
    COUNT(*) as pending_count
FROM book_suggestions
WHERE status = 'pending'
UNION ALL
SELECT
    'testimonials' as content_type,
    COUNT(*) as pending_count
FROM testimonials
WHERE status = 'pending';

-- =====================================================
-- DEFAULT DATA
-- =====================================================

-- Blog post categories
INSERT INTO blog_posts (post_id, author_id, title, slug, content, status) VALUES
(0, 1, 'Welcome to Nuk Library Blog', 'welcome', 'Sample post', 'published')
ON CONFLICT DO NOTHING;

-- Recommendation list categories
INSERT INTO recommendation_lists (title, description, category, created_by, is_active) VALUES
('Toddler Favorites', 'Perfect books for ages 0-3', 'toddlers', 1, true),
('Children''s Classics', 'Timeless books for ages 6-12', 'children', 1, true),
('Young Adult Must-Reads', 'Essential books for teens', 'young_adult', 1, true),
('Adult Fiction Favorites', 'Popular fiction for adults', 'adult_fiction', 1, true),
('Non-Fiction Gems', 'Enlightening non-fiction', 'non_fiction', 1, true)
ON CONFLICT DO NOTHING;

-- Grant permissions
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO nuklib_user;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO nuklib_user;

COMMENT ON TABLE blog_posts IS 'Blog posts submitted by patrons and admins';
COMMENT ON TABLE book_suggestions IS 'Book suggestions from patrons';
COMMENT ON TABLE testimonials IS 'Member testimonials';
COMMENT ON TABLE events IS 'Library events and activities';
COMMENT ON TABLE notifications IS 'User notifications for content updates';
