-- Nuk Library Database Schema

-- Users table (base for both admin and patrons)
CREATE TABLE users (
    user_id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(20) NOT NULL CHECK (role IN ('admin', 'patron')),
    name VARCHAR(255) NOT NULL,
    phone VARCHAR(20),
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'frozen', 'closed')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Membership Plans
CREATE TABLE membership_plans (
    plan_id SERIAL PRIMARY KEY,
    plan_name VARCHAR(100) NOT NULL,
    plan_type VARCHAR(50) NOT NULL CHECK (plan_type IN ('Active', 'Renewal Due', 'Freeze', 'Closed')),
    duration_days INTEGER NOT NULL,
    price DECIMAL(10, 2) NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Patrons (extends users)
CREATE TABLE patrons (
    patron_id VARCHAR(20) PRIMARY KEY,
    user_id INTEGER UNIQUE REFERENCES users(user_id) ON DELETE CASCADE,
    membership_plan_id INTEGER REFERENCES membership_plans(plan_id),
    membership_type VARCHAR(50),
    membership_start_date DATE,
    membership_expiry_date DATE,
    address TEXT,
    join_date DATE DEFAULT CURRENT_DATE,
    mobile_number VARCHAR(20),
    CONSTRAINT patron_id_format CHECK (patron_id ~ '^[A-Z0-9]+$')
);

-- Collections
CREATE TABLE collections (
    collection_id SERIAL PRIMARY KEY,
    collection_name VARCHAR(100) UNIQUE NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Books Catalogue
CREATE TABLE books (
    book_id SERIAL PRIMARY KEY,
    isbn VARCHAR(13) UNIQUE NOT NULL,
    title VARCHAR(500) NOT NULL,
    author VARCHAR(255),
    genre VARCHAR(100),
    sub_genre VARCHAR(100),
    publisher VARCHAR(255),
    publication_year INTEGER,
    description TEXT,
    collection_id INTEGER NOT NULL REFERENCES collections(collection_id) ON DELETE RESTRICT,
    total_copies INTEGER DEFAULT 1,
    available_copies INTEGER DEFAULT 1,
    age_rating VARCHAR(50),
    cover_image_url TEXT,
    status VARCHAR(20) DEFAULT 'Available' CHECK (status IN ('Available', 'Lost', 'Damaged', 'Phased Out')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Age Ratings
CREATE TABLE age_ratings (
    rating_id SERIAL PRIMARY KEY,
    rating_name VARCHAR(50) UNIQUE NOT NULL,
    min_age INTEGER NOT NULL,
    max_age INTEGER,
    description TEXT
);

-- Borrowings
CREATE TABLE borrowings (
    borrowing_id SERIAL PRIMARY KEY,
    patron_id INTEGER REFERENCES patrons(patron_id) ON DELETE CASCADE,
    book_id INTEGER REFERENCES books(book_id) ON DELETE CASCADE,
    checkout_date DATE NOT NULL DEFAULT CURRENT_DATE,
    due_date DATE NOT NULL,
    return_date DATE,
    renewal_count INTEGER DEFAULT 0 CHECK (renewal_count <= 2),
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'returned', 'overdue')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Reservations
CREATE TABLE reservations (
    reservation_id SERIAL PRIMARY KEY,
    patron_id INTEGER REFERENCES patrons(patron_id) ON DELETE CASCADE,
    book_id INTEGER REFERENCES books(book_id) ON DELETE CASCADE,
    reservation_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    expiry_date TIMESTAMP,
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'fulfilled', 'cancelled')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Reviews
CREATE TABLE reviews (
    review_id SERIAL PRIMARY KEY,
    patron_id INTEGER REFERENCES patrons(patron_id) ON DELETE CASCADE,
    book_id INTEGER REFERENCES books(book_id) ON DELETE CASCADE,
    rating INTEGER CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(patron_id, book_id)
);

-- Coworking Space Bookings
CREATE TABLE cowork_bookings (
    booking_id SERIAL PRIMARY KEY,
    patron_id INTEGER REFERENCES patrons(patron_id) ON DELETE CASCADE,
    booking_date DATE NOT NULL,
    time_slot VARCHAR(50) NOT NULL,
    booking_type VARCHAR(20) CHECK (booking_type IN ('day', 'half-day')),
    desk_number VARCHAR(20),
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'completed')),
    request_message TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Coworking Subscriptions
CREATE TABLE cowork_subscriptions (
    subscription_id SERIAL PRIMARY KEY,
    patron_id INTEGER REFERENCES patrons(patron_id) ON DELETE CASCADE,
    subscription_type VARCHAR(50) NOT NULL CHECK (subscription_type IN ('full-day', 'half-day', 'weekend-only')),
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    price DECIMAL(10, 2) NOT NULL,
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'expired', 'cancelled')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Invoices
CREATE TABLE invoices (
    invoice_id SERIAL PRIMARY KEY,
    patron_id INTEGER REFERENCES patrons(patron_id) ON DELETE CASCADE,
    invoice_number VARCHAR(50) UNIQUE NOT NULL,
    invoice_type VARCHAR(50) NOT NULL CHECK (invoice_type IN ('membership', 'cowork')),
    amount DECIMAL(10, 2) NOT NULL,
    payment_mode VARCHAR(50) CHECK (payment_mode IN ('UPI', 'Cash', 'Credit/Debit Card', 'Bank Transfer', 'Gift Coupon')),
    payment_status VARCHAR(20) DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid', 'overdue')),
    issue_date DATE DEFAULT CURRENT_DATE,
    due_date DATE NOT NULL,
    payment_date DATE,
    pdf_url TEXT,
    sent_via_email BOOLEAN DEFAULT FALSE,
    custom_member_name VARCHAR(255),
    custom_member_email VARCHAR(255),
    custom_member_phone VARCHAR(20),
    custom_member_address TEXT,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Invoice Line Items
CREATE TABLE invoice_line_items (
    line_item_id SERIAL PRIMARY KEY,
    invoice_id INTEGER REFERENCES invoices(invoice_id) ON DELETE CASCADE,
    description VARCHAR(500) NOT NULL,
    quantity DECIMAL(10, 2) DEFAULT 1,
    unit_price DECIMAL(10, 2) NOT NULL,
    amount DECIMAL(10, 2) NOT NULL,
    item_order INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_invoice_line_items_invoice_id ON invoice_line_items(invoice_id);

-- Notifications
CREATE TABLE notifications (
    notification_id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(user_id) ON DELETE CASCADE,
    notification_type VARCHAR(50) NOT NULL,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Social Media Content
CREATE TABLE social_media_posts (
    post_id SERIAL PRIMARY KEY,
    platform VARCHAR(50) CHECK (platform IN ('Instagram', 'Facebook')),
    post_content TEXT,
    post_url TEXT,
    image_url TEXT,
    published_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Reading History (for recommendations)
CREATE TABLE reading_history (
    history_id SERIAL PRIMARY KEY,
    patron_id INTEGER REFERENCES patrons(patron_id) ON DELETE CASCADE,
    book_id INTEGER REFERENCES books(book_id) ON DELETE CASCADE,
    read_date DATE DEFAULT CURRENT_DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for performance
CREATE INDEX idx_patrons_user_id ON patrons(user_id);
CREATE INDEX idx_borrowings_patron_id ON borrowings(patron_id);
CREATE INDEX idx_borrowings_book_id ON borrowings(book_id);
CREATE INDEX idx_borrowings_status ON borrowings(status);
CREATE INDEX idx_borrowings_due_date ON borrowings(due_date);
CREATE INDEX idx_books_isbn ON books(isbn);
CREATE INDEX idx_books_collection_id ON books(collection_id);
CREATE INDEX idx_books_genre ON books(genre);
CREATE INDEX idx_reviews_book_id ON reviews(book_id);
CREATE INDEX idx_invoices_patron_id ON invoices(patron_id);
CREATE INDEX idx_users_email ON users(email);

-- Insert default age ratings
INSERT INTO age_ratings (rating_name, min_age, max_age, description) VALUES
('2-4 years', 2, 4, 'Toddlers and preschoolers'),
('5-6 years', 5, 6, 'Early readers'),
('7-9 years', 7, 9, 'Young readers'),
('10+ years', 10, NULL, 'Pre-teens and older');

-- Insert default admin user (password: admin123 - should be changed)
-- Password hash for 'admin123' using bcrypt
INSERT INTO users (email, password_hash, role, name, phone, status) VALUES
('admin@nuklibrary.com', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TT5WJQYpZx6i9Gx7qbqQ8QmW8WmG', 'admin', 'Admin User', '9999999999', 'active');

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_books_updated_at BEFORE UPDATE ON books
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_collections_updated_at BEFORE UPDATE ON collections
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to auto-update available_copies
CREATE OR REPLACE FUNCTION update_book_availability()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' AND NEW.status = 'active' THEN
        UPDATE books SET available_copies = available_copies - 1 WHERE book_id = NEW.book_id;
    ELSIF TG_OP = 'UPDATE' AND OLD.status = 'active' AND NEW.status = 'returned' THEN
        UPDATE books SET available_copies = available_copies + 1 WHERE book_id = NEW.book_id;
    END IF;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger for borrowings to update book availability
CREATE TRIGGER update_book_availability_trigger
AFTER INSERT OR UPDATE ON borrowings
FOR EACH ROW EXECUTE FUNCTION update_book_availability();
