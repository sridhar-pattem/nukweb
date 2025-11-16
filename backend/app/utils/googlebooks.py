import requests
from app.config import Config

def fetch_book_by_isbn(isbn):
    """
    Fetch book details from Google Books API using ISBN
    Returns a dictionary with book information
    """
    try:
        # Clean ISBN (remove hyphens and spaces)
        clean_isbn = isbn.replace('-', '').replace(' ', '')

        # Google Books API endpoint
        url = f"https://www.googleapis.com/books/v1/volumes?q=isbn:{clean_isbn}"

        response = requests.get(url, timeout=10)
        response.raise_for_status()

        data = response.json()

        if data.get('totalItems', 0) == 0:
            return None

        # Get the first book result
        book_data = data['items'][0]['volumeInfo']

        # Extract relevant information
        book_info = {
            'isbn': clean_isbn,
            'title': book_data.get('title', ''),
            'author': ', '.join(book_data.get('authors', [])),
            'publisher': book_data.get('publisher', ''),
            'publication_year': book_data.get('publishedDate', '').split('-')[0] if book_data.get('publishedDate') else None,
            'description': book_data.get('description', ''),
            'cover_image_url': book_data.get('imageLinks', {}).get('thumbnail', '').replace('http://', 'https://'),
            'page_count': book_data.get('pageCount'),
            'categories': book_data.get('categories', []),
            'language': book_data.get('language', ''),
            'average_rating': book_data.get('averageRating'),
            'ratings_count': book_data.get('ratingsCount')
        }

        # Try to extract genre from categories
        if book_info['categories']:
            book_info['genre'] = book_info['categories'][0]

        return book_info

    except requests.RequestException as e:
        print(f"Error fetching book data from Google Books: {e}")
        return None
    except Exception as e:
        print(f"Unexpected error: {e}")
        return None

def search_books_google(query, limit=10):
    """
    Search for books on Google Books
    """
    try:
        url = f"https://www.googleapis.com/books/v1/volumes?q={query}&maxResults={limit}"
        response = requests.get(url, timeout=10)
        response.raise_for_status()

        data = response.json()
        books = []

        for item in data.get('items', []):
            volume_info = item.get('volumeInfo', {})

            # Get ISBN
            isbn = ''
            for identifier in volume_info.get('industryIdentifiers', []):
                if identifier.get('type') in ['ISBN_13', 'ISBN_10']:
                    isbn = identifier.get('identifier', '')
                    break

            book = {
                'title': volume_info.get('title', ''),
                'author': ', '.join(volume_info.get('authors', [])),
                'isbn': isbn,
                'publication_year': volume_info.get('publishedDate', '').split('-')[0] if volume_info.get('publishedDate') else '',
                'cover_image_url': volume_info.get('imageLinks', {}).get('thumbnail', '').replace('http://', 'https://'),
                'description': volume_info.get('description', ''),
            }

            books.append(book)

        return books

    except Exception as e:
        print(f"Error searching books on Google Books: {e}")
        return []
