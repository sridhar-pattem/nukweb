-- Update Age Ratings for Nuk Library
-- This script adds new age ratings and updates books based on collection mappings

-- First, add new age ratings that don't exist yet
INSERT INTO age_ratings (rating_name, min_age, max_age, description) VALUES
('U (All)', 0, NULL, 'Universal - Suitable for all ages'),
('2-4 Yrs', 2, 4, 'For toddlers and preschoolers'),
('2-6 Yrs', 2, 6, 'For toddlers to early readers'),
('6-8 Yrs', 6, 8, 'For early elementary school children'),
('8-11 Yrs', 8, 11, 'For middle elementary school children'),
('6-11 Yrs', 6, 11, 'For elementary school children'),
('8+ Yrs', 8, NULL, 'For children 8 years and above'),
('13+ Yrs', 13, NULL, 'For teens 13 and above'),
('YA (13+)', 13, 17, 'Young Adult - 13 to 17 years'),
('YA (16+)', 16, 17, 'Mature Young Adult - 16 to 17 years'),
('A (Adults)', 18, NULL, 'Adult content - 18 and above'),
('Not Rated Yet', 0, NULL, 'Age rating pending')
ON CONFLICT DO NOTHING;

-- Create a temporary mapping table for collection to age rating
CREATE TEMP TABLE collection_age_mapping (
    collection_name VARCHAR(200),
    age_rating_name VARCHAR(100)
);

-- Insert all the mappings
INSERT INTO collection_age_mapping (collection_name, age_rating_name) VALUES
('Reference', 'U (All)'),
('Popular Science', 'U (All)'),
('Technology', 'U (All)'),
('Western Classics', 'A (Adults)'),
('History (World)', 'U (All)'),
('Self-Improvement', 'A (Adults)'),
('Biography', 'A (Adults)'),
('Toddlers (2-4 years)', '2-4 Yrs'),
('Chemistry', 'U (All)'),
('Physics', 'U (All)'),
('Children''s Classics', '8+ Yrs'),
('Children''s Award Winning Fiction', '6-11 Yrs'),
('Children''s Horror', '8+ Yrs'),
('Early Readers(4-6 yrs)', '2-6 Yrs'),
('Intermediate Reader (6-8)', '6-8 Yrs'),
('Middle Grade Fiction (8-11 years)', '8-11 Yrs'),
('Tween Fiction (11-13 years)', 'YA (13+)'),
('Young Adult Fiction', 'YA (16+)'),
('Contemporary Western Fiction', 'A (Adults)'),
('Contemporary Indian Fiction', 'A (Adults)'),
('Contemporary Eastern Fiction', 'A (Adults)'),
('General Knowledge', 'U (All)'),
('Picture Books', '2-4 Yrs'),
('Manga', 'YA (13+)'),
('Comics', 'YA (13+)'),
('Biology', 'U (All)'),
('Mathematics', 'U (All)'),
('Travel and Adventure', 'U (All)'),
('Philosophy', 'U (All)'),
('Poetry', '13+ Yrs'),
('Modern Classics', 'A (Adults)'),
('Psychology and Neuroscience', 'U (All)'),
('Toddlers (0-4 years)', '2-6 Yrs'),
('Science Fiction (Sci-fi)', '13+ Yrs'),
('History (India)', 'U (All)'),
('Humour in Fiction', 'A (Adults)'),
('Historical Fiction', 'A (Adults)'),
('Biography for Children', '6-8 Yrs'),
('Business and Management', 'A (Adults)'),
('Classic Indian Fiction', 'A (Adults)'),
('Poetry for Children', '8-11 Yrs'),
('Children''s Folktales', '6-8 Yrs'),
('Others', 'Not Rated Yet'),
('Children''s Fiction', '6-11 Yrs'),
('Religion and Spirituality', 'U (All)'),
('Sociology', 'YA (16+)'),
('Murder Mystery (Adults)', 'A (Adults)'),
('Languages', 'U (All)'),
('Romance (Adults)', 'A (Adults)'),
('Cooking and Cuisine', 'U (All)'),
('Fantasy (YA)', 'YA (13+)'),
('Family and Parenting', 'A (Adults)'),
('Economics and Finance', 'U (All)'),
('Health and Nutrition', 'U (All)'),
('Non-Fiction (India)', 'A (Adults)'),
('Non-fiction (World)', 'A (Adults)'),
('World Affairs', 'U (All)'),
('Theatre and Plays', 'U (All)'),
('Contemporary Ideas', 'U (All)'),
('Indian Mythology', 'U (All)'),
-- Fallback for existing collections
('Fiction', 'A (Adults)'),
('Non-Fiction', 'A (Adults)'),
('Children', '6-11 Yrs'),
('Young Adult', 'YA (13+)');

-- Update books table with age ratings based on their collection
UPDATE books b
SET age_rating = ar.rating_name
FROM collections c
JOIN collection_age_mapping cam ON c.collection_name = cam.collection_name
JOIN age_ratings ar ON cam.age_rating_name = ar.rating_name
WHERE b.collection_id = c.collection_id
AND b.is_active = TRUE;

-- Report on the update
SELECT
    c.collection_name,
    ar.rating_name as age_rating,
    COUNT(b.book_id) as books_updated
FROM books b
JOIN collections c ON b.collection_id = c.collection_id
LEFT JOIN age_ratings ar ON b.age_rating = ar.rating_name
WHERE b.is_active = TRUE
GROUP BY c.collection_name, ar.rating_name
ORDER BY c.collection_name;

-- Drop the temporary table
DROP TABLE collection_age_mapping;

-- Show summary
SELECT
    CASE
        WHEN age_rating IS NULL THEN 'No Age Rating'
        ELSE age_rating
    END as age_rating_status,
    COUNT(*) as book_count
FROM books
WHERE is_active = TRUE
GROUP BY age_rating
ORDER BY book_count DESC;
