from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required
from app.utils.auth import admin_required, hash_password
from app.utils.database import execute_query, get_db_cursor
from app.utils.googlebooks import fetch_book_by_isbn as fetch_google
from app.utils.openlibrary import fetch_book_by_isbn as fetch_openlibrary
import csv
import io
import re
from datetime import datetime

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

@admin_import_bp.route('/import/patrons/preview', methods=['POST'])
@jwt_required()
@admin_required
def preview_patron_import():
    """Preview patrons from CSV file before importing"""
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

        patrons_preview = []
        errors = []
        column_names = []

        for idx, row in enumerate(csv_reader, start=1):
            # Store column names from first row
            if idx == 1:
                column_names = list(row.keys())
                print(f"CSV Columns found: {column_names}")

            # Extract patron data
            patron_id = row.get('patron_id', '').strip()
            first_name = row.get('first_name', '').strip()
            last_name = row.get('last_name', '').strip()
            email = row.get('email', '').strip()
            phone = row.get('phone', '').strip()
            freeze = row.get('freeze', '').strip()
            tags = row.get('tags', '').strip()

            # Validate required fields
            if not patron_id:
                errors.append(f"Row {idx}: Missing patron_id")
                continue

            if not email:
                errors.append(f"Row {idx}: Missing email")
                continue

            if not first_name or not last_name:
                errors.append(f"Row {idx}: Missing first_name or last_name")
                continue

            # Validate email format
            email_pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
            if not re.match(email_pattern, email):
                errors.append(f"Row {idx}: Invalid email format ({email})")
                continue

            # Check if patron_id already exists
            check_query = "SELECT patron_id FROM patrons WHERE patron_id = %s"
            existing_patron = execute_query(check_query, (patron_id,), fetch_one=True)

            # Check if email already exists
            email_check = "SELECT user_id, email FROM users WHERE email = %s"
            existing_email = execute_query(email_check, (email,), fetch_one=True)

            if existing_patron:
                patrons_preview.append({
                    'row': idx,
                    'patron_id': patron_id,
                    'name': f"{first_name} {last_name}",
                    'email': email,
                    'status': 'exists',
                    'message': 'Patron ID already exists'
                })
            elif existing_email:
                patrons_preview.append({
                    'row': idx,
                    'patron_id': patron_id,
                    'name': f"{first_name} {last_name}",
                    'email': email,
                    'status': 'email_conflict',
                    'message': 'Email already exists'
                })
            else:
                # Consolidate address
                address_parts = [
                    row.get('address1', '').strip(),
                    row.get('address2', '').strip(),
                    row.get('city', '').strip(),
                    row.get('state', '').strip(),
                    row.get('country', '').strip(),
                    row.get('zip', '').strip()
                ]
                full_address = ', '.join([part for part in address_parts if part])

                # Determine status
                user_status = 'frozen' if freeze.lower() in ['1', 'true', 'yes'] else 'active'

                # Parse join date from created field
                join_date = None
                created_str = row.get('created', '').strip()
                if created_str:
                    try:
                        join_date = datetime.strptime(created_str, '%Y-%m-%d').date()
                    except ValueError:
                        try:
                            # Try alternative format
                            join_date = datetime.strptime(created_str, '%m/%d/%Y').date()
                        except ValueError:
                            pass  # Use default (today)

                patrons_preview.append({
                    'row': idx,
                    'patron_id': patron_id,
                    'name': f"{first_name} {last_name}",
                    'email': email,
                    'phone': phone,
                    'address': full_address,
                    'tags': tags,
                    'status': 'ready',
                    'user_status': user_status,
                    'join_date': str(join_date) if join_date else None,
                    'message': f'Ready to import (status: {user_status})'
                })

        return jsonify({
            "total_rows": idx if 'idx' in locals() else 0,
            "ready_to_import": len([p for p in patrons_preview if p['status'] == 'ready']),
            "already_exists": len([p for p in patrons_preview if p['status'] == 'exists']),
            "email_conflicts": len([p for p in patrons_preview if p['status'] == 'email_conflict']),
            "errors": errors,
            "columns_found": column_names,
            "preview": patrons_preview  # Send all records for import (no limit)
        }), 200

    except Exception as e:
        return jsonify({"error": f"Error processing file: {str(e)}"}), 500

@admin_import_bp.route('/import/patrons/execute', methods=['POST'])
@jwt_required()
@admin_required
def execute_patron_import():
    """Execute bulk import of patrons from CSV data"""
    data = request.get_json()

    patrons_data = data.get('patrons', [])  # List of patron objects from preview

    if not patrons_data:
        return jsonify({"error": "No patrons provided"}), 400

    results = {
        'imported': [],
        'skipped': [],
        'errors': []
    }

    # Default password for all imported patrons
    default_password = "BookNook313"
    password_hash = hash_password(default_password)

    # Get default membership plan ID for "2 Book 3 Month"
    default_membership_plan_id = None
    try:
        plan_query = "SELECT plan_id FROM membership_plans WHERE plan_name = %s"
        plan_result = execute_query(plan_query, ("2 Book 3 Month",), fetch_one=True)
        if plan_result:
            default_membership_plan_id = plan_result['plan_id']
    except Exception as e:
        print(f"Warning: Could not find default membership plan '2 Book 3 Month': {str(e)}")

    # Process each patron in its own transaction to prevent one failure from blocking others
    for patron_data in patrons_data:
        patron_id = patron_data.get('patron_id')
        email = patron_data.get('email')

        try:
            # Use a separate cursor context for each patron (separate transaction)
            with get_db_cursor() as cursor:
                # Check if patron already exists
                check_query = "SELECT patron_id FROM patrons WHERE patron_id = %s"
                cursor.execute(check_query, (patron_id,))
                existing_patron = cursor.fetchone()

                if existing_patron:
                    results['skipped'].append({
                        'patron_id': patron_id,
                        'email': email,
                        'reason': 'Patron ID already exists'
                    })
                    continue

                # Check if email already exists
                email_check = "SELECT user_id FROM users WHERE email = %s"
                cursor.execute(email_check, (email,))
                existing_email = cursor.fetchone()

                if existing_email:
                    results['skipped'].append({
                        'patron_id': patron_id,
                        'email': email,
                        'reason': 'Email already exists'
                    })
                    continue

                # Extract patron data from preview
                name = patron_data.get('name', '')  # Combined "First Last"
                phone = patron_data.get('phone', '')
                address = patron_data.get('address', '')
                tags = patron_data.get('tags', '')
                user_status = patron_data.get('user_status', 'active')

                # Split name into first_name and last_name (required for patrons table)
                name_parts = name.split(' ', 1)
                first_name = name_parts[0] if len(name_parts) > 0 else ''
                last_name = name_parts[1] if len(name_parts) > 1 else ''

                # Validate required fields (patrons.first_name and last_name are NOT NULL)
                if not first_name or not last_name:
                    results['errors'].append({
                        'patron_id': patron_id,
                        'email': email,
                        'reason': 'Missing first_name or last_name'
                    })
                    continue

                # Create user account first (required for foreign key constraint)
                cursor.execute("""
                    INSERT INTO users (email, password_hash, role, name, status)
                    VALUES (%s, %s, 'patron', %s, %s)
                    RETURNING user_id
                """, (email, password_hash, name, user_status))

                user_result = cursor.fetchone()
                if not user_result:
                    raise Exception("Failed to create user account")

                user_id = user_result['user_id']

                # Create patron record matching actual database schema
                # Schema has: first_name, last_name, phone, address, tags (NOT join_date or mobile_number)
                cursor.execute("""
                    INSERT INTO patrons
                    (patron_id, user_id, first_name, last_name, phone, address, tags, membership_plan_id)
                    VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
                """, (patron_id, user_id, first_name, last_name, phone, address, tags, default_membership_plan_id))

                results['imported'].append({
                    'patron_id': patron_id,
                    'email': email,
                    'name': name,
                    'status': user_status
                })

        except Exception as e:
            # Log the detailed error for debugging
            import traceback
            error_detail = str(e)
            print(f"Error importing patron {patron_id}: {error_detail}")
            print(traceback.format_exc())

            results['errors'].append({
                'patron_id': patron_id,
                'email': email,
                'reason': error_detail
            })

    return jsonify({
        "message": "Patron import completed",
        "total": len(patrons_data),
        "imported": len(results['imported']),
        "skipped": len(results['skipped']),
        "errors": len(results['errors']),
        "details": results,
        "default_password": default_password
    }), 200
