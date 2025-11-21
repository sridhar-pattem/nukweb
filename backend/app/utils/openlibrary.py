import requests
import json
from app.config import Config

def fetch_book_by_isbn(isbn):
    """
    Fetch book details from Open Library API using ISBN
    Returns a dictionary with book information
    """
    try:
        # Clean ISBN (remove hyphens and spaces)
        clean_isbn = isbn.replace('-', '').replace(' ', '')

        # Open Library API endpoint
        url = f"{Config.OPEN_LIBRARY_API_URL}?bibkeys=ISBN:{clean_isbn}&format=json&jscmd=data"

        response = requests.get(url, timeout=10)
        response.raise_for_status()

        data = response.json()

        # Print raw API response for debugging
        print("=" * 80)
        print(f"OPENLIBRARY RAW API RESPONSE for ISBN {clean_isbn}:")
        print(json.dumps(data, indent=2))
        print("=" * 80)

        book_key = f"ISBN:{clean_isbn}"

        if book_key not in data:
            print(f"OpenLibrary: No results found for ISBN {clean_isbn}")
            return None

        book_data = data[book_key]

        # Extract relevant information
        book_info = {
            'isbn': clean_isbn,
            'title': book_data.get('title', ''),
            'author': ', '.join([author.get('name', '') for author in book_data.get('authors', [])]),
            'publisher': ', '.join([pub.get('name', '') for pub in book_data.get('publishers', [])]),
            'publication_year': book_data.get('publish_date', '').split()[-1] if book_data.get('publish_date') else None,
            'description': book_data.get('notes') or book_data.get('subtitle', ''),
            'cover_image_url': book_data.get('cover', {}).get('large') or book_data.get('cover', {}).get('medium', ''),
            'number_of_pages': book_data.get('number_of_pages'),
            'subjects': book_data.get('subjects', [])
        }

        # Try to extract genre from subjects
        if book_info['subjects']:
            book_info['genre'] = book_info['subjects'][0].get('name', '') if isinstance(book_info['subjects'][0], dict) else book_info['subjects'][0]

        # Print parsed data for debugging
        print(f"OPENLIBRARY PARSED DATA for ISBN {clean_isbn}:")
        print(json.dumps(book_info, indent=2))
        print("=" * 80)

        return book_info

    except requests.RequestException as e:
        print(f"Error fetching book data from OpenLibrary: {e}")
        return None
    except Exception as e:
        print(f"Unexpected error in OpenLibrary fetch: {e}")
        import traceback
        traceback.print_exc()
        return None

def search_books_openlibrary(query, limit=10):
    """
    Search for books on Open Library
    """
    try:
        url = f"https://openlibrary.org/search.json?q={query}&limit={limit}"
        response = requests.get(url, timeout=10)
        response.raise_for_status()
        
        data = response.json()
        books = []
        
        for doc in data.get('docs', []):
            book = {
                'title': doc.get('title', ''),
                'author': ', '.join(doc.get('author_name', [])),
                'isbn': doc.get('isbn', [''])[0] if doc.get('isbn') else '',
                'publication_year': doc.get('first_publish_year'),
                'cover_id': doc.get('cover_i'),
            }
            
            if book['cover_id']:
                book['cover_image_url'] = f"https://covers.openlibrary.org/b/id/{book['cover_id']}-L.jpg"
            
            books.append(book)
        
        return books
        
    except Exception as e:
        print(f"Error searching books: {e}")
        return []
