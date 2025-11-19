from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required
from app.utils.auth import admin_required
from app.utils.database import execute_query, get_db_cursor
from app.utils.googlebooks import fetch_book_by_isbn as fetch_google
from app.utils.openlibrary import fetch_book_by_isbn as fetch_openlibrary
import csv
import io

admin_import_bp = Blueprint('admin_import', __name__)

@admin_import_bp.route('/import/books/preview', methods=['POST'])
@jwt_required()
@admin_required
def preview_book_import():
    """Preview books from CSV file before importing"""
    if 'file' not in request.files:
        return jsonify({"error": "No file provided"}), 400

    file = request.files['file']

    if file.filename == '':
        return jsonify({"error": "No file selected"}), 400

    if not file.filename.endswith('.csv'):
        return jsonify({"error": "Only CSV files are supported"}), 400

    try:
        # Read CSV file
        stream = io.StringIO(file.stream.read().decode("UTF8"), newline=None)
        csv_reader = csv.DictReader(stream)

        books_preview = []
        errors = []
        column_names = []

        for idx, row in enumerate(csv_reader, start=1):
            # Store column names from first row
            if idx == 1:
                column_names = list(row.keys())
                print(f"CSV Columns found: {column_names}")

            # Try to find ISBN column with various possible names
            # Priority: ean_isbn13 first, then upc_isbn10, then others
            isbn = (row.get('ean_isbn13') or row.get('upc_isbn10') or
                   row.get('ean_isbn10') or row.get('ISBN') or row.get('ISBN13') or
                   row.get('isbn') or row.get('isbn13') or row.get('ISBN 13') or
                   row.get('isbn 13') or row.get('Isbn') or row.get('Isbn13') or
                   row.get('Primary ISBN') or row.get('primary_isbn') or
                   row.get('ean') or row.get('EAN'))

            # Clean ISBN - remove hyphens and spaces
            if isbn:
                isbn = isbn.strip().replace('-', '').replace(' ', '')

            if not isbn:
                errors.append(f"Row {idx}: No ISBN found in columns {column_names[:5]}")
                continue

            # Skip if ISBN is too short (likely invalid)
            if len(isbn) < 10:
                errors.append(f"Row {idx}: ISBN too short ({isbn})")
                continue

            # Check if book already exists
            check_query = "SELECT book_id, title FROM books WHERE isbn = %s"
            existing = execute_query(check_query, (isbn,), fetch_one=True)

            if existing:
                books_preview.append({
                    'row': idx,
                    'isbn': isbn,
                    'status': 'exists',
                    'title': existing['title'],
                    'message': 'Book already in database'
                })
            else:
                # Try multiple sources: Google Books -> Open Library -> CSV data
                book_info = None
                source = None

                # Try Google Books first
                book_info = fetch_google(isbn)
                if book_info:
                    source = 'Google Books'
                else:
                    # Try Open Library as fallback
                    book_info = fetch_openlibrary(isbn)
                    if book_info:
                        source = 'Open Library'
                    else:
                        # Use CSV data as last resort (libib column names)
                        title = row.get('title')
                        creators = row.get('creators')  # libib uses 'creators' for author
                        publisher = row.get('publisher')
                        publish_date = row.get('publish_date')
                        description = row.get('description')

                        # Extract year from publish_date if available
                        publication_year = None
                        if publish_date:
                            # Try to extract year (could be "2020", "2020-01-01", "January 2020", etc.)
                            import re
                            year_match = re.search(r'\b(19|20)\d{2}\b', str(publish_date))
                            if year_match:
                                publication_year = int(year_match.group(0))

                        if title:  # At minimum we need a title
                            book_info = {
                                'isbn': isbn,
                                'title': title,
                                'author': creators or 'Unknown',
                                'publisher': publisher or '',
                                'publication_year': publication_year,
                                'description': description or '',
                                'cover_image_url': '',
                            }
                            source = 'CSV data'

                if book_info:
                    books_preview.append({
                        'row': idx,
                        'isbn': isbn,
                        'status': 'ready',
                        'title': book_info.get('title', 'Unknown'),
                        'author': book_info.get('author', 'Unknown'),
                        'publisher': book_info.get('publisher', ''),
                        'year': book_info.get('publication_year', ''),
                        'description': book_info.get('description', ''),
                        'cover_url': book_info.get('cover_image_url', ''),
                        'source': source,
                        'message': f'Ready to import (from {source})'
                    })
                else:
                    books_preview.append({
                        'row': idx,
                        'isbn': isbn,
                        'status': 'not_found',
                        'message': 'Book not found (no APIs or CSV data)'
                    })

        return jsonify({
            "total_rows": idx if 'idx' in locals() else 0,
            "ready_to_import": len([b for b in books_preview if b['status'] == 'ready']),
            "already_exists": len([b for b in books_preview if b['status'] == 'exists']),
            "not_found": len([b for b in books_preview if b['status'] == 'not_found']),
            "errors": errors,
            "columns_found": column_names,
            "preview": books_preview[:50]  # Show first 50 for preview
        }), 200

    except Exception as e:
        return jsonify({"error": f"Error processing file: {str(e)}"}), 500

@admin_import_bp.route('/import/books/execute', methods=['POST'])
@jwt_required()
@admin_required
def execute_book_import():
    """Execute bulk import of books - supports both CSV data and manual ISBN entry"""
    data = request.get_json()

    collection_id = data.get('collection_id')
    books_data = data.get('books', [])  # List of book objects with ISBN and metadata (CSV mode)
    isbns = data.get('isbns', [])  # List of ISBNs only (manual mode)

    if not collection_id:
        return jsonify({"error": "collection_id is required"}), 400

    # Accept either books or isbns
    if not books_data and not isbns:
        return jsonify({"error": "No books or ISBNs provided"}), 400

    # Validate collection exists
    collection_check = "SELECT collection_id FROM collections WHERE collection_id = %s"
    if not execute_query(collection_check, (collection_id,), fetch_one=True):
        return jsonify({"error": "Invalid collection ID"}), 400

    results = {
        'imported': [],
        'skipped': [],
        'errors': []
    }

    # Convert ISBNs to book data format if needed (manual mode)
    if isbns and not books_data:
        books_data = []
        for isbn in isbns:
            # Fetch from APIs for manual entry
            book_info = fetch_google(isbn)
            source = 'Google Books'

            if not book_info:
                book_info = fetch_openlibrary(isbn)
                source = 'Open Library' if book_info else None

            if book_info:
                books_data.append({
                    'isbn': isbn,
                    'title': book_info.get('title'),
                    'author': book_info.get('author'),
                    'publisher': book_info.get('publisher'),
                    'year': book_info.get('publication_year'),
                    'description': book_info.get('description', ''),
                    'cover_url': book_info.get('cover_image_url', ''),
                    'source': source
                })
            else:
                results['errors'].append({
                    'isbn': isbn,
                    'reason': 'Not found in Google Books or Open Library'
                })

    with get_db_cursor() as cursor:
        for book_data in books_data:
            isbn = book_data.get('isbn')

            try:
                # Check if already exists
                check_query = "SELECT book_id FROM books WHERE isbn = %s"
                cursor.execute(check_query, (isbn,))
                existing = cursor.fetchone()

                if existing:
                    results['skipped'].append({
                        'isbn': isbn,
                        'reason': 'Already exists'
                    })
                    continue

                # Use provided book info (which may be from CSV, Google Books, or Open Library)
                book_info = {
                    'isbn': isbn,
                    'title': book_data.get('title'),
                    'author': book_data.get('author'),
                    'publisher': book_data.get('publisher'),
                    'publication_year': book_data.get('year'),
                    'description': book_data.get('description', ''),
                    'cover_image_url': book_data.get('cover_url', ''),
                    'language': book_data.get('language', 'eng')
                }
                source = book_data.get('source', 'Unknown')

                if not book_info.get('title'):
                    results['errors'].append({
                        'isbn': isbn,
                        'reason': 'Missing title'
                    })
                    continue

                # Insert book
                insert_query = """
                    INSERT INTO books
                    (isbn, title, publisher, publication_year,
                     description, cover_image_url, collection_id,
                     language, content_type, media_type, carrier_type)
                    VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
                    RETURNING book_id
                """

                cursor.execute(insert_query, (
                    book_info.get('isbn'),
                    book_info.get('title'),
                    book_info.get('publisher'),
                    book_info.get('publication_year'),
                    book_info.get('description'),
                    book_info.get('cover_image_url'),
                    collection_id,
                    book_info.get('language', 'eng'),
                    'txt',  # Default content type
                    'n',    # Default media type (unmediated)
                    'nc'    # Default carrier type (volume)
                ))

                book_id = cursor.fetchone()['book_id']

                # Add author as contributor if available
                if book_info.get('author'):
                    # Check if author exists, create if not
                    author_name = book_info['author']

                    cursor.execute("""
                        SELECT contributor_id FROM contributors
                        WHERE name = %s
                    """, (author_name,))

                    contributor = cursor.fetchone()

                    if contributor:
                        contributor_id = contributor['contributor_id']
                    else:
                        # Create new contributor
                        cursor.execute("""
                            INSERT INTO contributors (name, name_type)
                            VALUES (%s, %s)
                            RETURNING contributor_id
                        """, (author_name, 'person'))
                        contributor_id = cursor.fetchone()['contributor_id']

                    # Link author to book
                    cursor.execute("""
                        INSERT INTO book_contributors
                        (book_id, contributor_id, role, sequence_number)
                        VALUES (%s, %s, %s, %s)
                    """, (book_id, contributor_id, 'author', 1))

                results['imported'].append({
                    'isbn': isbn,
                    'book_id': book_id,
                    'title': book_info.get('title'),
                    'source': source
                })

            except Exception as e:
                results['errors'].append({
                    'isbn': isbn,
                    'reason': str(e)
                })

        # Refresh materialized view
        cursor.execute("REFRESH MATERIALIZED VIEW mv_book_availability")

    total_count = len(books_data) if books_data else len(isbns)

    return jsonify({
        "message": "Import completed",
        "total": total_count,
        "imported": len(results['imported']),
        "skipped": len(results['skipped']),
        "errors": len(results['errors']),
        "details": results
    }), 200

@admin_import_bp.route('/import/books/isbn-list', methods=['POST'])
@jwt_required()
@admin_required
def import_from_isbn_list():
    """Import books from a simple list of ISBNs"""
    data = request.get_json()

    collection_id = data.get('collection_id')
    isbn_text = data.get('isbn_list', '')  # Newline or comma-separated ISBNs

    if not collection_id:
        return jsonify({"error": "collection_id is required"}), 400

    if not isbn_text:
        return jsonify({"error": "isbn_list is required"}), 400

    # Parse ISBNs from text (support newline, comma, or space separated)
    isbns = [isbn.strip() for isbn in isbn_text.replace(',', '\n').split('\n') if isbn.strip()]

    # Use the execute import function
    return execute_book_import()
