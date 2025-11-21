-- Website Admin Database Schema
-- This migration creates tables for website content management system

-- ============================================
-- 1. Website Theme Settings
-- ============================================
CREATE TABLE IF NOT EXISTS website_theme_settings (
    setting_id SERIAL PRIMARY KEY,
    setting_key VARCHAR(100) UNIQUE NOT NULL,
    setting_value TEXT NOT NULL,
    setting_type VARCHAR(50) DEFAULT 'color', -- color, font, size, etc.
    category VARCHAR(50) DEFAULT 'general', -- general, header, footer, buttons, etc.
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- 2. Custom Pages
-- ============================================
CREATE TABLE IF NOT EXISTS website_pages (
    page_id SERIAL PRIMARY KEY,
    page_title VARCHAR(255) NOT NULL,
    page_slug VARCHAR(255) UNIQUE NOT NULL,
    page_description TEXT,
    meta_title VARCHAR(255),
    meta_description TEXT,
    is_published BOOLEAN DEFAULT false,
    display_order INTEGER DEFAULT 0,
    created_by INTEGER REFERENCES users(user_id) ON DELETE SET NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- 3. Page Sections
-- ============================================
CREATE TABLE IF NOT EXISTS website_sections (
    section_id SERIAL PRIMARY KEY,
    page_id INTEGER REFERENCES website_pages(page_id) ON DELETE CASCADE,
    section_name VARCHAR(255) NOT NULL,
    section_type VARCHAR(50) NOT NULL, -- hero, text, cards, gallery, testimonials, etc.
    section_header TEXT,
    section_subheader TEXT,
    background_color VARCHAR(50),
    text_color VARCHAR(50),
    display_order INTEGER DEFAULT 0,
    is_visible BOOLEAN DEFAULT true,
    custom_css TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- 4. Content Blocks (Flexible content within sections)
-- ============================================
CREATE TABLE IF NOT EXISTS website_content_blocks (
    block_id SERIAL PRIMARY KEY,
    section_id INTEGER REFERENCES website_sections(section_id) ON DELETE CASCADE,
    block_type VARCHAR(50) NOT NULL, -- text, image, card, button, etc.
    block_title VARCHAR(255),
    block_content TEXT,
    image_url TEXT,
    link_url TEXT,
    link_text VARCHAR(255),
    display_order INTEGER DEFAULT 0,
    is_visible BOOLEAN DEFAULT true,
    custom_attributes JSONB, -- Store additional attributes like icon, color, size, etc.
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- 5. Cards (Reusable card components)
-- ============================================
CREATE TABLE IF NOT EXISTS website_cards (
    card_id SERIAL PRIMARY KEY,
    section_id INTEGER REFERENCES website_sections(section_id) ON DELETE CASCADE,
    card_title VARCHAR(255) NOT NULL,
    card_description TEXT,
    card_image_url TEXT,
    card_icon VARCHAR(100), -- Icon class or name
    link_url TEXT,
    link_text VARCHAR(100),
    background_color VARCHAR(50),
    text_color VARCHAR(50),
    display_order INTEGER DEFAULT 0,
    is_visible BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- 6. Navigation Menu Items
-- ============================================
CREATE TABLE IF NOT EXISTS website_menu_items (
    menu_item_id SERIAL PRIMARY KEY,
    menu_location VARCHAR(50) NOT NULL, -- header, footer, sidebar
    menu_text VARCHAR(255) NOT NULL,
    menu_url VARCHAR(500) NOT NULL,
    parent_id INTEGER REFERENCES website_menu_items(menu_item_id) ON DELETE CASCADE,
    display_order INTEGER DEFAULT 0,
    is_visible BOOLEAN DEFAULT true,
    target VARCHAR(20) DEFAULT '_self', -- _self, _blank
    icon VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- 7. Media Library (Image/File Management)
-- ============================================
CREATE TABLE IF NOT EXISTS website_media (
    media_id SERIAL PRIMARY KEY,
    media_name VARCHAR(255) NOT NULL,
    media_url TEXT NOT NULL,
    media_type VARCHAR(50) NOT NULL, -- image, video, document
    file_size INTEGER, -- in bytes
    mime_type VARCHAR(100),
    alt_text VARCHAR(255),
    caption TEXT,
    uploaded_by INTEGER REFERENCES users(user_id) ON DELETE SET NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- 8. Website Global Settings
-- ============================================
CREATE TABLE IF NOT EXISTS website_global_settings (
    setting_id SERIAL PRIMARY KEY,
    site_name VARCHAR(255) DEFAULT 'Nuk Library',
    site_tagline VARCHAR(500),
    site_logo_url TEXT,
    site_favicon_url TEXT,
    contact_email VARCHAR(255),
    contact_phone VARCHAR(50),
    contact_address TEXT,
    social_media_links JSONB, -- Store social media URLs as JSON
    footer_text TEXT,
    copyright_text VARCHAR(500),
    analytics_code TEXT, -- Google Analytics, etc.
    custom_head_code TEXT, -- Custom HTML for <head>
    custom_footer_code TEXT, -- Custom HTML before </body>
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- Indexes for Performance
-- ============================================
CREATE INDEX idx_website_pages_slug ON website_pages(page_slug);
CREATE INDEX idx_website_pages_published ON website_pages(is_published);
CREATE INDEX idx_website_sections_page ON website_sections(page_id);
CREATE INDEX idx_website_sections_order ON website_sections(display_order);
CREATE INDEX idx_website_content_blocks_section ON website_content_blocks(section_id);
CREATE INDEX idx_website_cards_section ON website_cards(section_id);
CREATE INDEX idx_website_menu_location ON website_menu_items(menu_location);
CREATE INDEX idx_website_menu_parent ON website_menu_items(parent_id);
CREATE INDEX idx_website_media_type ON website_media(media_type);

-- ============================================
-- Insert Default Theme Settings
-- ============================================
INSERT INTO website_theme_settings (setting_key, setting_value, setting_type, category, description) VALUES
    -- Primary Colors
    ('primary_color', '#2c3e50', 'color', 'colors', 'Primary brand color'),
    ('secondary_color', '#3498db', 'color', 'colors', 'Secondary brand color'),
    ('accent_color', '#e74c3c', 'color', 'colors', 'Accent color for highlights'),
    ('success_color', '#27ae60', 'color', 'colors', 'Success message color'),
    ('warning_color', '#f39c12', 'color', 'colors', 'Warning message color'),
    ('danger_color', '#e74c3c', 'color', 'colors', 'Error/danger color'),

    -- Background Colors
    ('background_primary', '#ffffff', 'color', 'backgrounds', 'Main background color'),
    ('background_secondary', '#f8f9fa', 'color', 'backgrounds', 'Secondary background color'),
    ('background_dark', '#2c3e50', 'color', 'backgrounds', 'Dark background color'),

    -- Text Colors
    ('text_primary', '#333333', 'color', 'text', 'Primary text color'),
    ('text_secondary', '#666666', 'color', 'text', 'Secondary text color'),
    ('text_light', '#999999', 'color', 'text', 'Light text color'),
    ('text_white', '#ffffff', 'color', 'text', 'White text color'),

    -- Header Colors
    ('header_background', '#2c3e50', 'color', 'header', 'Header background color'),
    ('header_text', '#ffffff', 'color', 'header', 'Header text color'),
    ('header_hover', '#3498db', 'color', 'header', 'Header link hover color'),

    -- Footer Colors
    ('footer_background', '#34495e', 'color', 'footer', 'Footer background color'),
    ('footer_text', '#ecf0f1', 'color', 'footer', 'Footer text color'),
    ('footer_link', '#3498db', 'color', 'footer', 'Footer link color'),

    -- Button Colors
    ('button_primary_bg', '#3498db', 'color', 'buttons', 'Primary button background'),
    ('button_primary_text', '#ffffff', 'color', 'buttons', 'Primary button text'),
    ('button_primary_hover', '#2980b9', 'color', 'buttons', 'Primary button hover'),
    ('button_secondary_bg', '#95a5a6', 'color', 'buttons', 'Secondary button background'),
    ('button_secondary_text', '#ffffff', 'color', 'buttons', 'Secondary button text'),

    -- Card Colors
    ('card_background', '#ffffff', 'color', 'cards', 'Card background color'),
    ('card_border', '#e0e0e0', 'color', 'cards', 'Card border color'),
    ('card_shadow', 'rgba(0,0,0,0.1)', 'color', 'cards', 'Card shadow color'),

    -- Typography
    ('font_family_primary', '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif', 'font', 'typography', 'Primary font family'),
    ('font_family_heading', 'Georgia, "Times New Roman", serif', 'font', 'typography', 'Heading font family'),
    ('font_size_base', '16px', 'size', 'typography', 'Base font size'),
    ('font_size_h1', '2.5rem', 'size', 'typography', 'H1 font size'),
    ('font_size_h2', '2rem', 'size', 'typography', 'H2 font size'),
    ('font_size_h3', '1.75rem', 'size', 'typography', 'H3 font size'),

    -- Spacing
    ('spacing_section', '80px', 'size', 'spacing', 'Section padding'),
    ('spacing_container', '1200px', 'size', 'spacing', 'Max container width'),
    ('border_radius', '8px', 'size', 'spacing', 'Default border radius')
ON CONFLICT (setting_key) DO NOTHING;

-- ============================================
-- Insert Default Global Settings
-- ============================================
INSERT INTO website_global_settings (
    site_name,
    site_tagline,
    contact_email,
    contact_phone,
    contact_address,
    footer_text,
    copyright_text,
    social_media_links
) VALUES (
    'Nuk Library',
    'Your Gateway to Knowledge and Learning',
    'info@nuklibrary.com',
    '+1-234-567-8900',
    '123 Library Street, Book City, BC 12345',
    'Empowering minds through books and community learning.',
    '© 2025 Nuk Library. All rights reserved.',
    '{"facebook": "", "twitter": "", "instagram": "", "linkedin": ""}'::jsonb
) ON CONFLICT DO NOTHING;

-- ============================================
-- Insert Default Menu Items
-- ============================================
INSERT INTO website_menu_items (menu_location, menu_text, menu_url, display_order, is_visible) VALUES
    ('header', 'Home', '/', 1, true),
    ('header', 'Services', '/services', 2, true),
    ('header', 'Catalogue', '/catalogue', 3, true),
    ('header', 'Events', '/events', 4, true),
    ('header', 'Blog', '/blog', 5, true),
    ('header', 'Membership', '/membership', 6, true),
    ('header', 'Contact', '/contact', 7, true),

    ('footer', 'About Us', '/about', 1, true),
    ('footer', 'Services', '/services', 2, true),
    ('footer', 'Privacy Policy', '/privacy', 3, true),
    ('footer', 'Terms of Service', '/terms', 4, true),
    ('footer', 'Contact', '/contact', 5, true)
ON CONFLICT DO NOTHING;

-- ============================================
-- Triggers for updated_at timestamps
-- ============================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_website_theme_settings_updated_at BEFORE UPDATE ON website_theme_settings FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_website_pages_updated_at BEFORE UPDATE ON website_pages FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_website_sections_updated_at BEFORE UPDATE ON website_sections FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_website_content_blocks_updated_at BEFORE UPDATE ON website_content_blocks FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_website_cards_updated_at BEFORE UPDATE ON website_cards FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_website_menu_items_updated_at BEFORE UPDATE ON website_menu_items FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_website_media_updated_at BEFORE UPDATE ON website_media FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_website_global_settings_updated_at BEFORE UPDATE ON website_global_settings FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- Comments
-- ============================================
COMMENT ON TABLE website_theme_settings IS 'Stores theme customization settings like colors, fonts, and styles';
COMMENT ON TABLE website_pages IS 'Custom pages created by website admin';
COMMENT ON TABLE website_sections IS 'Sections within pages (hero, content areas, etc.)';
COMMENT ON TABLE website_content_blocks IS 'Flexible content blocks within sections';
COMMENT ON TABLE website_cards IS 'Reusable card components for grid layouts';
COMMENT ON TABLE website_menu_items IS 'Navigation menu items for header, footer, etc.';
COMMENT ON TABLE website_media IS 'Media library for uploaded images and files';
COMMENT ON TABLE website_global_settings IS 'Global website settings and configuration';
