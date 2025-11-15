from app.utils.database import execute_query

def get_recommendations_for_patron(patron_id, limit=10):
    """
    Get personalized book recommendations for a patron
    Based on:
    1. Age-appropriate content (from patron's age or reading history)
    2. Genre preferences (from reading history)
    3. Popular books
    """
    
    # Get patron's reading history
    history_query = """
        SELECT DISTINCT b.genre, b.age_rating, b.sub_genre
        FROM reading_history rh
        JOIN books b ON rh.book_id = b.book_id
        WHERE rh.patron_id = %s
        ORDER BY rh.read_date DESC
        LIMIT 20
    """
    reading_history = execute_query(history_query, (patron_id,), fetch_all=True)
    
    # Extract genres and age ratings from history
    preferred_genres = list(set([book['genre'] for book in reading_history if book['genre']]))
    age_ratings = list(set([book['age_rating'] for book in reading_history if book['age_rating']]))
    
    # Get books already read or borrowed
    excluded_books_query = """
        SELECT DISTINCT book_id FROM (
            SELECT book_id FROM reading_history WHERE patron_id = %s
            UNION
            SELECT book_id FROM borrowings WHERE patron_id = %s
        ) AS read_or_borrowed
    """
    excluded = execute_query(excluded_books_query, (patron_id, patron_id), fetch_all=True)
    excluded_ids = [book['book_id'] for book in excluded] if excluded else [-1]
    
    recommendations = []
    
    # Strategy 1: Genre-based recommendations (if we have genre preferences)
    if preferred_genres:
        genre_query = """
            SELECT b.*, 
                   COUNT(DISTINCT rh.patron_id) as popularity_score,
                   AVG(r.rating) as avg_rating
            FROM books b
            LEFT JOIN reading_history rh ON b.book_id = rh.book_id
            LEFT JOIN reviews r ON b.book_id = r.book_id
            WHERE b.genre = ANY(%s)
              AND b.age_rating = ANY(%s)
              AND b.book_id != ALL(%s)
              AND b.available_copies > 0
              AND b.status = 'Available'
            GROUP BY b.book_id
            ORDER BY popularity_score DESC, avg_rating DESC NULLS LAST
            LIMIT %s
        """
        genre_recs = execute_query(
            genre_query, 
            (preferred_genres, age_ratings or [None], excluded_ids, limit // 2),
            fetch_all=True
        )
        recommendations.extend(genre_recs or [])
    
    # Strategy 2: Popular books (age-appropriate)
    remaining = limit - len(recommendations)
    if remaining > 0:
        popular_query = """
            SELECT b.*, 
                   COUNT(DISTINCT rh.patron_id) as popularity_score,
                   AVG(r.rating) as avg_rating
            FROM books b
            LEFT JOIN reading_history rh ON b.book_id = rh.book_id
            LEFT JOIN reviews r ON b.book_id = r.book_id
            WHERE b.book_id != ALL(%s)
              AND b.available_copies > 0
              AND b.status = 'Available'
              AND (b.age_rating = ANY(%s) OR %s = 0)
            GROUP BY b.book_id
            ORDER BY popularity_score DESC, avg_rating DESC NULLS LAST
            LIMIT %s
        """
        popular_recs = execute_query(
            popular_query,
            (excluded_ids, age_ratings or [None], len(age_ratings), remaining),
            fetch_all=True
        )
        
        # Avoid duplicates
        existing_ids = {book['book_id'] for book in recommendations}
        for book in (popular_recs or []):
            if book['book_id'] not in existing_ids:
                recommendations.append(book)
                existing_ids.add(book['book_id'])
    
    # Strategy 3: If still not enough, get highest rated books
    remaining = limit - len(recommendations)
    if remaining > 0:
        rated_query = """
            SELECT b.*, 
                   AVG(r.rating) as avg_rating,
                   COUNT(r.review_id) as review_count
            FROM books b
            JOIN reviews r ON b.book_id = r.book_id
            WHERE b.book_id != ALL(%s)
              AND b.available_copies > 0
              AND b.status = 'Available'
            GROUP BY b.book_id
            HAVING COUNT(r.review_id) >= 3
            ORDER BY avg_rating DESC, review_count DESC
            LIMIT %s
        """
        rated_recs = execute_query(
            rated_query,
            (excluded_ids, remaining),
            fetch_all=True
        )
        
        existing_ids = {book['book_id'] for book in recommendations}
        for book in (rated_recs or []):
            if book['book_id'] not in existing_ids:
                recommendations.append(book)
    
    return recommendations[:limit]

def get_similar_books(book_id, limit=5):
    """
    Get books similar to a given book
    Based on genre, sub-genre, and author
    """
    # Get the book details
    book_query = """
        SELECT genre, sub_genre, author, age_rating
        FROM books
        WHERE book_id = %s
    """
    book = execute_query(book_query, (book_id,), fetch_one=True)
    
    if not book:
        return []
    
    # Find similar books
    similar_query = """
        SELECT b.*, 
               AVG(r.rating) as avg_rating,
               COUNT(DISTINCT rh.patron_id) as popularity_score
        FROM books b
        LEFT JOIN reviews r ON b.book_id = r.book_id
        LEFT JOIN reading_history rh ON b.book_id = rh.book_id
        WHERE b.book_id != %s
          AND (
              b.genre = %s 
              OR b.sub_genre = %s 
              OR b.author = %s
          )
          AND b.available_copies > 0
          AND b.status = 'Available'
        GROUP BY b.book_id
        ORDER BY 
            CASE 
                WHEN b.genre = %s AND b.sub_genre = %s THEN 1
                WHEN b.genre = %s THEN 2
                WHEN b.author = %s THEN 3
                ELSE 4
            END,
            popularity_score DESC,
            avg_rating DESC NULLS LAST
        LIMIT %s
    """
    
    similar_books = execute_query(
        similar_query,
        (book_id, book['genre'], book['sub_genre'], book['author'],
         book['genre'], book['sub_genre'], book['genre'], book['author'],
         limit),
        fetch_all=True
    )
    
    return similar_books or []
