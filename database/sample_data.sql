-- Sample Membership Plans for Nuk Library
-- Insert these after running schema.sql to have default membership plans
-- Prices are in Indian Rupees (₹)

INSERT INTO membership_plans (plan_name, plan_type, duration_days, price, description) VALUES
('Monthly Basic', 'Active', 30, 500.00, 'Basic monthly membership with access to general collection'),
('Quarterly Standard', 'Active', 90, 1350.00, 'Three-month membership with access to all collections'),
('Annual Premium', 'Active', 365, 5000.00, 'Full year membership with priority borrowing and extended loan periods'),
('Weekly Trial', 'Active', 7, 150.00, 'One-week trial membership for new members'),
('Student Monthly', 'Active', 30, 350.00, 'Discounted monthly plan for students'),
('Family Annual', 'Active', 365, 7000.00, 'Annual family membership for up to 4 members')
ON CONFLICT DO NOTHING;

-- Note: After creating patrons with these plans, you can use the Membership Plans
-- management interface to add, edit, or remove plans as needed.
