-- ============================================
-- Website Admin Database Tables
-- Created: November 29, 2025
-- Purpose: Enable Theme & Colors customization and full Website Admin functionality
-- ============================================

-- Table 1: Theme Settings (for color customization)
-- ============================================
CREATE TABLE IF NOT EXISTS website_theme_settings (
    setting_id SERIAL PRIMARY KEY,
    setting_key VARCHAR(100) UNIQUE NOT NULL,
    setting_value VARCHAR(50) NOT NULL,
    setting_type VARCHAR(20) DEFAULT 'color',
    category VARCHAR(50) NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Table 2: Pages Management
-- ============================================
CREATE TABLE IF NOT EXISTS website_pages (
    page_id SERIAL PRIMARY KEY,
    page_title VARCHAR(200) NOT NULL,
    page_slug VARCHAR(200) UNIQUE NOT NULL,
    page_description TEXT,
    meta_title VARCHAR(200),
    meta_description TEXT,
    is_published BOOLEAN DEFAULT FALSE,
    display_order INT DEFAULT 0,
    created_by INT REFERENCES users(user_id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Table 3: Page Sections
-- ============================================
CREATE TABLE IF NOT EXISTS website_sections (
    section_id SERIAL PRIMARY KEY,
    page_id INT REFERENCES website_pages(page_id) ON DELETE CASCADE,
    section_name VARCHAR(100) NOT NULL,
    section_type VARCHAR(50) NOT NULL,
    section_header VARCHAR(200),
    section_subheader TEXT,
    background_color VARCHAR(50),
    text_color VARCHAR(50),
    display_order INT DEFAULT 0,
    is_visible BOOLEAN DEFAULT TRUE,
    custom_css TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Table 4: Content Blocks
-- ============================================
CREATE TABLE IF NOT EXISTS website_content_blocks (
    block_id SERIAL PRIMARY KEY,
    section_id INT REFERENCES website_sections(section_id) ON DELETE CASCADE,
    block_type VARCHAR(50) NOT NULL,
    block_title VARCHAR(200),
    block_content TEXT,
    image_url VARCHAR(500),
    link_url VARCHAR(500),
    link_text VARCHAR(100),
    display_order INT DEFAULT 0,
    is_visible BOOLEAN DEFAULT TRUE,
    custom_attributes JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Table 5: Cards
-- ============================================
CREATE TABLE IF NOT EXISTS website_cards (
    card_id SERIAL PRIMARY KEY,
    section_id INT REFERENCES website_sections(section_id) ON DELETE CASCADE,
    card_title VARCHAR(200) NOT NULL,
    card_description TEXT,
    card_image_url VARCHAR(500),
    card_icon VARCHAR(100),
    link_url VARCHAR(500),
    link_text VARCHAR(100),
    background_color VARCHAR(50),
    text_color VARCHAR(50),
    display_order INT DEFAULT 0,
    is_visible BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Table 6: Menu Items
-- ============================================
CREATE TABLE IF NOT EXISTS website_menu_items (
    menu_item_id SERIAL PRIMARY KEY,
    menu_location VARCHAR(50) NOT NULL,
    menu_text VARCHAR(100) NOT NULL,
    menu_url VARCHAR(500) NOT NULL,
    parent_id INT REFERENCES website_menu_items(menu_item_id) ON DELETE CASCADE,
    display_order INT DEFAULT 0,
    is_visible BOOLEAN DEFAULT TRUE,
    target VARCHAR(20) DEFAULT '_self',
    icon VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Table 7: Media Library
-- ============================================
CREATE TABLE IF NOT EXISTS website_media (
    media_id SERIAL PRIMARY KEY,
    media_name VARCHAR(200) NOT NULL,
    media_url VARCHAR(500) NOT NULL,
    media_type VARCHAR(50) DEFAULT 'image',
    file_size BIGINT DEFAULT 0,
    mime_type VARCHAR(100),
    alt_text VARCHAR(200),
    caption TEXT,
    uploaded_by INT REFERENCES users(user_id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Table 8: Global Website Settings
-- ============================================
CREATE TABLE IF NOT EXISTS website_global_settings (
    setting_id SERIAL PRIMARY KEY,
    site_name VARCHAR(200),
    site_tagline VARCHAR(200),
    site_logo_url VARCHAR(500),
    site_favicon_url VARCHAR(500),
    contact_email VARCHAR(200),
    contact_phone VARCHAR(50),
    contact_address TEXT,
    footer_text TEXT,
    copyright_text VARCHAR(200),
    social_media_links JSONB,
    analytics_code TEXT,
    custom_head_code TEXT,
    custom_footer_code TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- Insert Default Theme Settings
-- ============================================

INSERT INTO website_theme_settings (setting_key, setting_value, category, description) VALUES
-- Primary Colors
('primary_color', '#2D3E50', 'colors', 'Primary brand color (charcoal)'),
('secondary_color', '#8B4513', 'colors', 'Secondary brand color (brown)'),
('accent_color', '#D2691E', 'colors', 'Accent color (peru)'),
('background_color', '#F5F5F0', 'colors', 'Light beige background'),
('light_gray', '#E8E8E8', 'colors', 'Light gray for borders'),
('white', '#FFFFFF', 'colors', 'Pure white'),

-- Text Colors
('text_primary', '#111111', 'text', 'Primary text color'),
('text_secondary', '#666666', 'text', 'Secondary text color'),
('text_light', '#999999', 'text', 'Light text color'),
('text_charcoal', '#2D3E50', 'text', 'Charcoal text'),

-- Button Colors
('button_primary_bg', '#2D3E50', 'buttons', 'Primary button background'),
('button_primary_text', '#FFFFFF', 'buttons', 'Primary button text'),
('button_primary_hover', '#1a2633', 'buttons', 'Primary button hover'),
('button_outline_border', '#2D3E50', 'buttons', 'Outline button border'),
('button_outline_text', '#2D3E50', 'buttons', 'Outline button text'),
('button_outline_hover_bg', '#2D3E50', 'buttons', 'Outline button hover background'),
('button_outline_hover_text', '#FFFFFF', 'buttons', 'Outline button hover text'),
('button_dark_bg', '#1a1a1a', 'buttons', 'Dark button background'),
('button_dark_text', '#FFFFFF', 'buttons', 'Dark button text'),

-- Navigation
('nav_background', '#FFFFFF', 'navigation', 'Navigation background'),
('nav_text', '#2D3E50', 'navigation', 'Navigation text color'),
('nav_hover', '#8B4513', 'navigation', 'Navigation hover color'),
('nav_active', '#8B4513', 'navigation', 'Navigation active color'),
('nav_border', '#E8E8E8', 'navigation', 'Navigation border color'),

-- Cards & Containers
('card_background', '#FFFFFF', 'cards', 'Card background'),
('card_border', '#E8E8E8', 'cards', 'Card border color'),
('card_shadow', 'rgba(0,0,0,0.1)', 'cards', 'Card shadow color'),
('card_hover_shadow', 'rgba(0,0,0,0.15)', 'cards', 'Card hover shadow'),

-- Hero Section
('hero_overlay', 'rgba(0,0,0,0.4)', 'hero', 'Hero section overlay'),
('hero_text', '#FFFFFF', 'hero', 'Hero section text color'),

-- Badge Colors
('badge_background', '#8B4513', 'badges', 'Badge background color'),
('badge_text', '#FFFFFF', 'badges', 'Badge text color'),

-- Links
('link_color', '#8B4513', 'links', 'Link color'),
('link_hover', '#6a3410', 'links', 'Link hover color')
ON CONFLICT (setting_key) DO NOTHING;

-- ============================================
-- Insert Default Global Settings
-- ============================================

INSERT INTO website_global_settings (
    site_name,
    site_tagline,
    contact_email,
    contact_phone,
    footer_text,
    copyright_text,
    social_media_links
) VALUES (
    'Nuk Library, Cowork & Café',
    'Your Community Reading Space in Bangalore',
    'info@mynuk.com',
    '+91 1234567890',
    'Join us at Nuk Library for books, coworking, and community events.',
    '© 2025 Nuk Library. All rights reserved.',
    '{"facebook": "", "instagram": "", "twitter": "", "linkedin": ""}'::jsonb
)
ON CONFLICT DO NOTHING;

-- ============================================
-- Create Indexes for Performance
-- ============================================

CREATE INDEX IF NOT EXISTS idx_theme_settings_category ON website_theme_settings(category);
CREATE INDEX IF NOT EXISTS idx_pages_slug ON website_pages(page_slug);
CREATE INDEX IF NOT EXISTS idx_pages_published ON website_pages(is_published);
CREATE INDEX IF NOT EXISTS idx_sections_page ON website_sections(page_id);
CREATE INDEX IF NOT EXISTS idx_content_blocks_section ON website_content_blocks(section_id);
CREATE INDEX IF NOT EXISTS idx_cards_section ON website_cards(section_id);
CREATE INDEX IF NOT EXISTS idx_menu_location ON website_menu_items(menu_location);
CREATE INDEX IF NOT EXISTS idx_media_type ON website_media(media_type);

-- ============================================
-- Success Message
-- ============================================

DO $$
BEGIN
    RAISE NOTICE 'Website Admin tables created successfully!';
    RAISE NOTICE 'You can now use the Theme & Colors customization feature.';
    RAISE NOTICE 'Access it at: /admin/website';
END $$;
