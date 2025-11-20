import requests
import os
import time
from app.config import Config

# Rate limit tracking - ISBNDB allows 1 request per second
_last_request_time = 0
_rate_limit_delay = 1.0  # seconds

def _respect_rate_limit():
    """Ensure we don't exceed ISBNDB's rate limit of 1 request per second"""
    global _last_request_time
    current_time = time.time()
    time_since_last_request = current_time - _last_request_time

    if time_since_last_request < _rate_limit_delay:
        sleep_time = _rate_limit_delay - time_since_last_request
        time.sleep(sleep_time)

    _last_request_time = time.time()


def fetch_book_from_isbndb(isbn):
    """
    Fetch book details from ISBNDB API using ISBN
    Returns a dictionary with book information

    Handles:
    - 404 Not Found: ISBN doesn't exist in ISBNDB
    - 429 Too Many Requests: Rate limit exceeded
    - Rate limiting: Respects 1 request per second limit
    """
    try:
        # Get API key from environment
        api_key = os.getenv('ISBNDB_API_KEY')

        if not api_key:
            print("ISBNDB_API_KEY not found in environment variables")
            return None

        # Clean ISBN (remove hyphens and spaces)
        clean_isbn = isbn.replace('-', '').replace(' ', '')

        # Respect rate limit
        _respect_rate_limit()

        # ISBNDB API endpoint
        url = f"https://api2.isbndb.com/book/{clean_isbn}"

        headers = {
            'Authorization': api_key,
            'Content-Type': 'application/json'
        }

        response = requests.get(url, headers=headers, timeout=10)

        # Handle different status codes
        if response.status_code == 404:
            print(f"ISBN {clean_isbn} not found in ISBNDB")
            return None

        if response.status_code == 429:
            print(f"ISBNDB API rate limit exceeded for ISBN {clean_isbn}")
            return None

        response.raise_for_status()

        data = response.json()

        # Check if book data exists
        if not data.get('book'):
            return None

        book_data = data['book']

        # Extract relevant information and map to our schema
        book_info = {
            'isbn': book_data.get('isbn13') or book_data.get('isbn10') or clean_isbn,
            'title': book_data.get('title', ''),
            'title_long': book_data.get('title_long', ''),
            'author': ', '.join(book_data.get('authors', [])) if book_data.get('authors') else '',
            'publisher': book_data.get('publisher', ''),
            'publication_year': book_data.get('date_published', '').split('-')[0] if book_data.get('date_published') else None,
            'description': book_data.get('synopsis', ''),
            'cover_image_url': book_data.get('image', ''),
            'cover_image_original': book_data.get('image_original', ''),
            'page_count': book_data.get('pages'),
            'language': book_data.get('language', 'en'),
            'edition': book_data.get('edition', ''),
            'binding': book_data.get('binding', ''),
            'dewey_decimal': book_data.get('dewey_decimal', []),
            'subjects': book_data.get('subjects', []),
            'dimensions': book_data.get('dimensions', ''),
            'msrp': book_data.get('msrp'),
            'isbn10': book_data.get('isbn10', ''),
            'isbn13': book_data.get('isbn13', ''),
            'other_isbns': book_data.get('other_isbns', [])
        }

        # Try to extract genre from subjects
        if book_info['subjects']:
            book_info['genre'] = book_info['subjects'][0]

        return book_info

    except requests.RequestException as e:
        print(f"Error fetching book data from ISBNDB: {e}")
        return None
    except Exception as e:
        print(f"Unexpected error in ISBNDB fetch: {e}")
        return None


def fetch_books_batch_isbndb(isbns):
    """
    Fetch multiple books in a single or multiple requests from ISBNDB
    This is much more efficient than individual requests, especially with rate limiting

    Note: ISBNDB has a limit of 100 ISBNs per batch request. This function
    automatically chunks large requests into multiple batches.

    Args:
        isbns: List of ISBN strings

    Returns:
        Dictionary mapping ISBN to book info, or None for ISBNs not found
        Example: {'9781234567890': {...book_info...}, '9780987654321': None}
    """
    try:
        api_key = os.getenv('ISBNDB_API_KEY')

        if not api_key:
            print("ISBNDB_API_KEY not found in environment variables")
            return {}

        if not isbns:
            return {}

        # Clean ISBNs
        clean_isbns = [isbn.replace('-', '').replace(' ', '') for isbn in isbns]

        # ISBNDB limit: 100 ISBNs per batch request
        batch_size = 100
        all_results = {}

        # Process in chunks of 100
        for i in range(0, len(clean_isbns), batch_size):
            batch = clean_isbns[i:i + batch_size]

            # Respect rate limit (1 request per second)
            _respect_rate_limit()

            url = 'https://api2.isbndb.com/books'

            headers = {
                'Authorization': api_key
            }

            # Format: isbns=isbn1,isbn2,isbn3 (send as raw string body)
            # ISBNDB expects this format exactly as shown in their documentation
            payload = 'isbns=' + ','.join(batch)

            print(f"Fetching batch of {len(batch)} ISBNs from ISBNDB (batch {i//batch_size + 1} of {(len(clean_isbns) + batch_size - 1)//batch_size})...")
            print(f"Sending payload: {payload[:200]}...")  # Show first 200 chars

            try:
                response = requests.post(url, headers=headers, data=payload.encode('utf-8'), timeout=30)

                print(f"ISBNDB API Response Status: {response.status_code}")

                if response.status_code == 404:
                    print(f"ISBNDB returned 404 - ISBNs not found")
                    print(f"Response body: {response.text[:500]}")
                    # Mark all as not found
                    for isbn in batch:
                        all_results[isbn] = None
                    continue

                if response.status_code == 429:
                    print(f"ISBNDB API rate limit exceeded (429)")
                    print(f"Response body: {response.text[:500]}")
                    # Mark all as not found (will fallback to other sources)
                    for isbn in batch:
                        all_results[isbn] = None
                    continue

                if response.status_code == 401:
                    print(f"ISBNDB API authentication failed (401) - Check API key")
                    print(f"Response body: {response.text[:500]}")
                    # Mark all as not found
                    for isbn in batch:
                        all_results[isbn] = None
                    continue

                if response.status_code != 200:
                    print(f"ISBNDB API returned error status {response.status_code}")
                    print(f"Response body: {response.text[:500]}")
                    response.raise_for_status()

                data = response.json()

                # ISBNDB batch endpoint returns: {'total': X, 'requested': Y, 'data': [...]}
                # Not 'books' array
                books_data = data.get('data', [])

                # Handle if 'data' is a list of books
                if isinstance(books_data, list):
                    books_list = books_data
                else:
                    # If 'data' is a single object or dict, wrap it in a list
                    books_list = [books_data] if books_data else []

                print(f"ISBNDB response: total={data.get('total')}, requested={data.get('requested')}")
                print(f"ISBNDB returned {len(books_list)} books in response")

                # If no books returned, show the response to debug
                if len(books_list) == 0:
                    print(f"Response JSON keys: {list(data.keys())}")
                    print(f"Response JSON: {str(data)[:500]}")
                    if 'error' in data or 'errorMessage' in data:
                        print(f"ISBNDB API Error: {data.get('error') or data.get('errorMessage')}")

                # If no books returned, show the response to debug
                if len(data.get('books', [])) == 0:
                    print(f"Response JSON: {data}")
                    if 'error' in data or 'errorMessage' in data:
                        print(f"ISBNDB API Error: {data.get('error') or data.get('errorMessage')}")

            except requests.Timeout:
                print(f"ISBNDB API request timed out after 30 seconds")
                for isbn in batch:
                    all_results[isbn] = None
                continue
            except requests.ConnectionError as e:
                print(f"ISBNDB API connection error: {e}")
                for isbn in batch:
                    all_results[isbn] = None
                continue
            except Exception as e:
                print(f"ISBNDB API request failed: {e}")
                for isbn in batch:
                    all_results[isbn] = None
                continue

            # Map results by ISBN for this batch
            batch_results = {}

            for book_data in books_list:
                # Map to our schema
                book_info = {
                    'isbn': book_data.get('isbn13') or book_data.get('isbn10'),
                    'title': book_data.get('title', ''),
                    'title_long': book_data.get('title_long', ''),
                    'author': ', '.join(book_data.get('authors', [])) if book_data.get('authors') else '',
                    'publisher': book_data.get('publisher', ''),
                    'publication_year': book_data.get('date_published', '').split('-')[0] if book_data.get('date_published') else None,
                    'description': book_data.get('synopsis', ''),
                    'cover_image_url': book_data.get('image', ''),
                    'cover_image_original': book_data.get('image_original', ''),
                    'page_count': book_data.get('pages'),
                    'language': book_data.get('language', 'en'),
                    'edition': book_data.get('edition', ''),
                    'binding': book_data.get('binding', ''),
                    'dewey_decimal': book_data.get('dewey_decimal', []),
                    'subjects': book_data.get('subjects', []),
                    'dimensions': book_data.get('dimensions', ''),
                    'msrp': book_data.get('msrp'),
                    'isbn10': book_data.get('isbn10', ''),
                    'isbn13': book_data.get('isbn13', ''),
                    'other_isbns': book_data.get('other_isbns', [])
                }

                # Try to extract genre from subjects
                if book_info['subjects']:
                    book_info['genre'] = book_info['subjects'][0]

                # Store by both ISBN-10 and ISBN-13 for better matching
                isbn13 = book_data.get('isbn13', '').replace('-', '').replace(' ', '')
                isbn10 = book_data.get('isbn10', '').replace('-', '').replace(' ', '')

                if isbn13:
                    batch_results[isbn13] = book_info
                if isbn10:
                    batch_results[isbn10] = book_info

            # Mark ISBNs in this batch that weren't found
            for isbn in batch:
                if isbn not in batch_results:
                    # ISBN not found, mark as None
                    batch_results[isbn] = None
                    print(f"ISBN {isbn} not found in ISBNDB batch response")

            # Merge batch results into all results
            all_results.update(batch_results)

        # Print summary
        found_count = len([v for v in all_results.values() if v is not None])
        not_found_isbns = [k for k, v in all_results.items() if v is None]
        not_found_count = len(not_found_isbns)

        print(f"\nISBNDB Batch Fetch Summary:")
        print(f"  Total ISBNs requested: {len(clean_isbns)}")
        print(f"  Found in ISBNDB: {found_count}")
        print(f"  Not found in ISBNDB: {not_found_count}")
        print(f"  Success rate: {(found_count / len(clean_isbns) * 100):.1f}%")

        if not_found_count > 0:
            print(f"\n  ISBNs not found in ISBNDB (first 10):")
            for isbn in not_found_isbns[:10]:
                print(f"    - {isbn}")
            if not_found_count > 10:
                print(f"    ... and {not_found_count - 10} more")
        print()

        return all_results

    except requests.RequestException as e:
        print(f"Error fetching books batch from ISBNDB: {e}")
        return {}
    except Exception as e:
        print(f"Unexpected error in ISBNDB batch fetch: {e}")
        return {}


def search_books_isbndb(query, page=1, page_size=20):
    """
    Search for books on ISBNDB by title, author, or ISBN

    Args:
        query: Search term
        page: Page number (default 1)
        page_size: Results per page (default 20, max 1000)

    Returns:
        List of book dictionaries
    """
    try:
        api_key = os.getenv('ISBNDB_API_KEY')

        if not api_key:
            print("ISBNDB_API_KEY not found in environment variables")
            return []

        # Respect rate limit
        _respect_rate_limit()

        url = f"https://api2.isbndb.com/books/{query}"

        headers = {
            'Authorization': api_key,
            'Content-Type': 'application/json'
        }

        params = {
            'page': page,
            'pageSize': min(page_size, 1000)
        }

        response = requests.get(url, headers=headers, params=params, timeout=10)

        if response.status_code == 429:
            print("ISBNDB API rate limit exceeded")
            return []

        response.raise_for_status()

        data = response.json()
        books = []

        for book_data in data.get('books', []):
            book = {
                'title': book_data.get('title', ''),
                'title_long': book_data.get('title_long', ''),
                'author': ', '.join(book_data.get('authors', [])) if book_data.get('authors') else '',
                'isbn': book_data.get('isbn13') or book_data.get('isbn10', ''),
                'isbn13': book_data.get('isbn13', ''),
                'isbn10': book_data.get('isbn10', ''),
                'publication_year': book_data.get('date_published', '').split('-')[0] if book_data.get('date_published') else '',
                'publisher': book_data.get('publisher', ''),
                'cover_image_url': book_data.get('image', ''),
                'description': book_data.get('synopsis', ''),
                'pages': book_data.get('pages'),
                'edition': book_data.get('edition', ''),
                'binding': book_data.get('binding', '')
            }

            books.append(book)

        return books

    except Exception as e:
        print(f"Error searching books on ISBNDB: {e}")
        return []
