from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required
from app.utils.auth import admin_required
from app.utils.database import execute_query, get_db_cursor
from app.utils.googlebooks import fetch_book_by_isbn as fetch_google_books
from app.utils.openlibrary import fetch_book_by_isbn as fetch_open_library
from app.config import Config
import json

admin_books_bp = Blueprint('admin_books', __name__)

@admin_books_bp.route('/books', methods=['GET'])
@jwt_required()
@admin_required
def get_books():
    """Get all books with pagination and filters"""
    page = request.args.get('page', 1, type=int)
    search = request.args.get('search', '')
    collection = request.args.get('collection', '')
    content_type = request.args.get('content_type', '')
    language = request.args.get('language', '')

    offset = (page - 1) * Config.ITEMS_PER_PAGE

    # Build query
    where_clauses = ["b.is_active = TRUE"]
    params = []

    if search:
        # Handle quoted phrases for exact tag matching and regular words
        import re
        quoted_pattern = r'"([^"]+)"'
        quoted_terms = re.findall(quoted_pattern, search)
        # Remove quoted parts and split remaining into words
        remaining = re.sub(quoted_pattern, '', search)
        search_words = [word.strip() for word in remaining.split() if word.strip()]

        word_conditions = []

        # Process quoted terms (exact tag match only)
        for quoted_term in quoted_terms:
            quoted_lower = quoted_term.lower().strip()
            word_conditions.append("""
                EXISTS (
                    SELECT 1 FROM unnest(b.tags) AS tag
                    WHERE LOWER(tag) = %s
                )
            """)
            params.append(quoted_lower)

        # Process regular words (partial match in title/author/tags/ISBN)
        for word in search_words:
            word_param = f'%{word}%'
            word_conditions.append("""
                (b.title ILIKE %s OR b.subtitle ILIKE %s OR b.isbn ILIKE %s OR
                 EXISTS (
                     SELECT 1 FROM book_contributors bc
                     JOIN contributors c ON bc.contributor_id = c.contributor_id
                     WHERE bc.book_id = b.book_id AND c.name ILIKE %s
                 ) OR
                 EXISTS (
                     SELECT 1 FROM unnest(b.tags) AS tag
                     WHERE tag ILIKE %s
                 ))
            """)
            params.extend([word_param, word_param, word_param, word_param, word_param])

        # All conditions must match (AND logic)
        if word_conditions:
            where_clauses.append("(" + " AND ".join(word_conditions) + ")")

    if collection:
        where_clauses.append("b.collection_id = %s")
        params.append(collection)

    if content_type:
        where_clauses.append("b.content_type = %s")
        params.append(content_type)

    if language:
        where_clauses.append("b.language = %s")
        params.append(language)

    where_sql = "WHERE " + " AND ".join(where_clauses)

    # Get total count
    count_query = f"""
        SELECT COUNT(*) as total
        FROM books b
        {where_sql}
    """
    total_result = execute_query(count_query, tuple(params) if params else None, fetch_one=True)
    total = total_result['total'] if total_result else 0

    # Get books with availability using the view
    query = f"""
        SELECT b.book_id, b.isbn, b.title, b.subtitle,
               b.publisher, b.publication_year,
               b.collection_id, c.collection_name,
               b.content_type, b.media_type, b.carrier_type,
               b.language, b.subjects, b.tags,
               b.age_rating, b.cover_image_url, b.created_at,
               ba.total_items, ba.available_items,
               ba.checked_out_items, ba.on_hold_items,
               COALESCE((SELECT json_agg(
                   json_build_object(
                       'contributor_id', contrib.contributor_id,
                       'name', contrib.name,
                       'role', bc.role,
                       'sequence', bc.sequence_number
                   ) ORDER BY bc.role, bc.sequence_number
               )
                FROM book_contributors bc
                JOIN contributors contrib ON bc.contributor_id = contrib.contributor_id
                WHERE bc.book_id = b.book_id
               ), '[]'::json) as contributors
        FROM books b
        LEFT JOIN collections c ON b.collection_id = c.collection_id
        LEFT JOIN mv_book_availability ba ON b.book_id = ba.book_id
        {where_sql}
        ORDER BY b.created_at DESC
        LIMIT %s OFFSET %s
    """
    params.extend([Config.ITEMS_PER_PAGE, offset])

    books = execute_query(query, tuple(params), fetch_all=True)

    return jsonify({
        "books": [dict(b) for b in (books or [])],
        "total": total,
        "page": page,
        "per_page": Config.ITEMS_PER_PAGE,
        "total_pages": (total + Config.ITEMS_PER_PAGE - 1) // Config.ITEMS_PER_PAGE
    }), 200

@admin_books_bp.route('/books/<int:book_id>', methods=['GET'])
@jwt_required()
@admin_required
def get_book_details(book_id):
    """Get detailed information about a specific book"""
    query = """
        SELECT b.book_id, b.isbn, b.isbn_10, b.issn, b.other_identifier,
               b.title, b.subtitle, b.statement_of_responsibility,
               b.edition_statement, b.place_of_publication,
               b.publisher, b.publication_year, b.copyright_year,
               b.series_title, b.series_number,
               b.extent, b.dimensions,
               b.content_type, b.media_type, b.carrier_type,
               b.subjects, b.description, b.notes, b.tags,
               b.age_rating, b.target_audience,
               b.language, b.additional_languages,
               b.collection_id, c.collection_name,
               b.call_number, b.cover_image_url, b.thumbnail_url,
               b.resource_type, b.cataloged_by,
               b.created_at, b.updated_at,
               ba.total_items, ba.available_items,
               ba.checked_out_items, ba.on_hold_items
        FROM books b
        LEFT JOIN collections c ON b.collection_id = c.collection_id
        LEFT JOIN mv_book_availability ba ON b.book_id = ba.book_id
        WHERE b.book_id = %s
    """

    book = execute_query(query, (book_id,), fetch_one=True)

    if not book:
        return jsonify({"error": "Book not found"}), 404

    # Get contributors
    contributors_query = """
        SELECT bc.book_contributor_id, bc.contributor_id, bc.role, bc.sequence_number,
               c.name, c.name_type, c.date_of_birth, c.date_of_death,
               c.date_established, c.date_terminated
        FROM book_contributors bc
        JOIN contributors c ON bc.contributor_id = c.contributor_id
        WHERE bc.book_id = %s
        ORDER BY bc.role, bc.sequence_number
    """
    contributors = execute_query(contributors_query, (book_id,), fetch_all=True)

    # Get items
    items_query = """
        SELECT i.item_id, i.barcode, i.accession_number,
               i.call_number, i.shelf_location, i.circulation_status,
               i.condition, i.acquisition_date,
               CASE
                   WHEN EXISTS (
                       SELECT 1 FROM borrowings br
                       WHERE br.item_id = i.item_id AND br.status = 'active'
                   ) THEN true
                   ELSE false
               END as is_borrowed
        FROM items i
        WHERE i.book_id = %s
        ORDER BY i.barcode
    """
    items = execute_query(items_query, (book_id,), fetch_all=True)

    result = dict(book)
    result['contributors'] = [dict(c) for c in (contributors or [])]
    result['items'] = [dict(i) for i in (items or [])]

    return jsonify(result), 200

def merge_book_data(google_data, openlibrary_data):
    """
    Merge book data from Google Books and OpenLibrary.
    Google Books data takes precedence, OpenLibrary fills in missing fields.

    Required fields to check: Title, Author, Publisher, Genre, Pages,
    Publication Year, Language, Description, Cover Image URL
    """
    print("\n" + "=" * 80)
    print("STARTING DATA MERGE")
    print("=" * 80)

    if not google_data:
        print("Google Books returned no data, using OpenLibrary data only")
        return openlibrary_data

    if not openlibrary_data:
        print("OpenLibrary returned no data, using Google Books data only")
        return google_data

    merged = google_data.copy()
    fields_merged = []

    # Map of Google Books fields to OpenLibrary fields
    field_mappings = {
        'title': 'title',
        'author': 'author',
        'publisher': 'publisher',
        'genre': 'genre',
        'page_count': 'number_of_pages',
        'publication_year': 'publication_year',
        'language': 'language',
        'description': 'description',
        'cover_image_url': 'cover_image_url',
        'categories': 'subjects'
    }

    # Fill in missing fields from OpenLibrary
    for google_field, openlibrary_field in field_mappings.items():
        google_value = merged.get(google_field)
        openlibrary_value = openlibrary_data.get(openlibrary_field)

        if not google_value and openlibrary_value:
            merged[google_field] = openlibrary_value
            fields_merged.append(f"{google_field} (from OpenLibrary)")
            print(f"  ✓ Merged {google_field}: '{openlibrary_value}' (from OpenLibrary)")
        elif google_value:
            print(f"  • Using {google_field}: '{google_value}' (from Google Books)")
        else:
            print(f"  ✗ Missing {google_field}: Not available in either source")

    # If page_count is missing but number_of_pages is available
    if not merged.get('page_count') and merged.get('number_of_pages'):
        merged['page_count'] = merged['number_of_pages']

    print(f"\nFields merged from OpenLibrary: {len(fields_merged)}")
    if fields_merged:
        print(f"  - {', '.join(fields_merged)}")

    print("\nFINAL MERGED DATA:")
    print(json.dumps(merged, indent=2))
    print("=" * 80 + "\n")

    return merged

@admin_books_bp.route('/books/fetch-by-isbn', methods=['POST'])
@jwt_required()
@admin_required
def fetch_book_details():
    """
    Fetch book details by ISBN.
    First tries Google Books, then fills missing fields from OpenLibrary.
    """
    data = request.get_json()
    isbn = data.get('isbn')

    if not isbn:
        return jsonify({"error": "ISBN is required"}), 400

    print("\n" + "🔍" * 40)
    print(f"📚 BOOK LOOKUP REQUEST FOR ISBN: {isbn}")
    print("🔍" * 40 + "\n")

    # Check if book already exists
    existing_query = "SELECT book_id FROM books WHERE isbn = %s OR isbn_10 = %s"
    isbn_clean = isbn.replace('-', '').replace(' ', '')
    existing = execute_query(existing_query, (isbn_clean, isbn_clean), fetch_one=True)

    if existing:
        return jsonify({"error": "Book with this ISBN already exists"}), 400

    # Fetch from Google Books first
    print(f"📗 Step 1: Fetching book data from Google Books for ISBN: {isbn}")
    google_book_info = fetch_google_books(isbn)

    # Check if important fields are missing from Google Books
    required_fields = ['title', 'author', 'publisher', 'page_count',
                      'publication_year', 'language', 'description', 'cover_image_url']
    missing_fields = []

    if google_book_info:
        missing_fields = [field for field in required_fields
                         if not google_book_info.get(field)]

        print(f"\n📊 Google Books Result Summary:")
        print(f"  Total fields: {len(required_fields)}")
        print(f"  Fields found: {len(required_fields) - len(missing_fields)}")
        print(f"  Fields missing: {len(missing_fields)}")
        if missing_fields:
            print(f"  Missing: {', '.join(missing_fields)}")
    else:
        print("  ❌ Google Books returned no data")
        missing_fields = required_fields

    # If Google Books returned no data or has missing fields, try OpenLibrary
    openlibrary_book_info = None
    if not google_book_info or missing_fields:
        print(f"\n📘 Step 2: Fetching book data from OpenLibrary for ISBN: {isbn}")
        print(f"  Reason: {'No data from Google Books' if not google_book_info else f'Missing {len(missing_fields)} field(s)'}")
        openlibrary_book_info = fetch_open_library(isbn)

        if openlibrary_book_info:
            print(f"  ✓ OpenLibrary returned data")
        else:
            print(f"  ❌ OpenLibrary returned no data")
    else:
        print(f"\n✅ Google Books has all required fields, skipping OpenLibrary")

    # Merge data from both sources
    book_info = merge_book_data(google_book_info, openlibrary_book_info)

    if not book_info:
        print("\n❌ LOOKUP FAILED: No data from either source\n")
        return jsonify({"error": "Book not found in Google Books or OpenLibrary"}), 404

    # Final validation
    final_missing = [field for field in required_fields if not book_info.get(field)]
    print("\n" + "=" * 80)
    print("📋 FINAL RESULT VALIDATION:")
    print(f"  Required fields present: {len(required_fields) - len(final_missing)}/{len(required_fields)}")
    if final_missing:
        print(f"  ⚠️  Still missing: {', '.join(final_missing)}")
    else:
        print(f"  ✅ All required fields present!")
    print("=" * 80 + "\n")

    return jsonify(book_info), 200

@admin_books_bp.route('/books', methods=['POST'])
@jwt_required()
@admin_required
def add_book():
    """Add a new book to the catalogue"""
    data = request.get_json()

    required_fields = ['title', 'collection_id']
    if not all(field in data for field in required_fields):
        return jsonify({"error": "Missing required fields: title, collection_id"}), 400

    # Check if ISBN already exists (if provided)
    if data.get('isbn'):
        check_query = "SELECT book_id FROM books WHERE isbn = %s"
        existing = execute_query(check_query, (data['isbn'],), fetch_one=True)
        if existing:
            return jsonify({"error": "Book with this ISBN already exists"}), 400

    # Validate collection_id exists
    collection_check = "SELECT collection_id FROM collections WHERE collection_id = %s"
    collection_exists = execute_query(collection_check, (data['collection_id'],), fetch_one=True)

    if not collection_exists:
        return jsonify({"error": "Invalid collection ID"}), 400

    # Validate RDA types if provided
    if data.get('content_type'):
        ct_check = "SELECT code FROM rda_content_types WHERE code = %s"
        if not execute_query(ct_check, (data['content_type'],), fetch_one=True):
            return jsonify({"error": "Invalid content_type"}), 400

    if data.get('media_type'):
        mt_check = "SELECT code FROM rda_media_types WHERE code = %s"
        if not execute_query(mt_check, (data['media_type'],), fetch_one=True):
            return jsonify({"error": "Invalid media_type"}), 400

    if data.get('carrier_type'):
        car_check = "SELECT code FROM rda_carrier_types WHERE code = %s"
        if not execute_query(car_check, (data['carrier_type'],), fetch_one=True):
            return jsonify({"error": "Invalid carrier_type"}), 400

    query = """
        INSERT INTO books
        (isbn, isbn_10, issn, other_identifier,
         title, subtitle, statement_of_responsibility,
         edition_statement, place_of_publication,
         publisher, publication_year, copyright_year,
         series_title, series_number,
         extent, dimensions,
         content_type, media_type, carrier_type,
         subjects, description, notes, tags,
         age_rating, target_audience,
         language, additional_languages,
         collection_id, call_number,
         cover_image_url, thumbnail_url,
         resource_type, cataloged_by)
        VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s,
                %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
        RETURNING book_id
    """

    with get_db_cursor() as cursor:
        cursor.execute(query, (
            data.get('isbn'),
            data.get('isbn_10'),
            data.get('issn'),
            data.get('other_identifier'),
            data['title'],
            data.get('subtitle'),
            data.get('statement_of_responsibility'),
            data.get('edition_statement'),
            data.get('place_of_publication'),
            data.get('publisher'),
            data.get('publication_year'),
            data.get('copyright_year'),
            data.get('series_title'),
            data.get('series_number'),
            data.get('extent'),
            data.get('dimensions'),
            data.get('content_type', 'txt'),
            data.get('media_type', 'n'),
            data.get('carrier_type', 'nc'),
            data.get('subjects'),
            data.get('description'),
            data.get('notes'),
            data.get('tags'),
            data.get('age_rating'),
            data.get('target_audience'),
            data.get('language', 'eng'),
            data.get('additional_languages'),
            data['collection_id'],
            data.get('call_number'),
            data.get('cover_image_url'),
            data.get('thumbnail_url'),
            data.get('resource_type', 'book'),
            data.get('cataloged_by')
        ))

        book_id = cursor.fetchone()['book_id']

        # Add contributors if provided
        if data.get('contributors'):
            for contrib in data['contributors']:
                cursor.execute("""
                    INSERT INTO book_contributors
                    (book_id, contributor_id, role, sequence_number)
                    VALUES (%s, %s, %s, %s)
                """, (
                    book_id,
                    contrib['contributor_id'],
                    contrib.get('role', 'author'),
                    contrib.get('sequence_number', 1)
                ))

        # Refresh materialized view
        cursor.execute("REFRESH MATERIALIZED VIEW mv_book_availability")

        return jsonify({
            "message": "Book added successfully",
            "book_id": book_id
        }), 201

@admin_books_bp.route('/books/<int:book_id>', methods=['PUT'])
@jwt_required()
@admin_required
def update_book(book_id):
    """Update book information"""
    data = request.get_json()

    # Check if book exists
    check_query = "SELECT book_id FROM books WHERE book_id = %s"
    book = execute_query(check_query, (book_id,), fetch_one=True)

    if not book:
        return jsonify({"error": "Book not found"}), 404

    # Build update query dynamically
    update_fields = []
    params = []

    updatable_fields = [
        'isbn', 'isbn_10', 'issn', 'other_identifier',
        'title', 'subtitle', 'statement_of_responsibility',
        'edition_statement', 'place_of_publication',
        'publisher', 'publication_year', 'copyright_year',
        'series_title', 'series_number',
        'extent', 'dimensions',
        'content_type', 'media_type', 'carrier_type',
        'subjects', 'description', 'notes', 'tags',
        'age_rating', 'target_audience',
        'language', 'additional_languages',
        'collection_id', 'call_number',
        'cover_image_url', 'thumbnail_url',
        'resource_type', 'cataloged_by'
    ]

    for field in updatable_fields:
        if field in data:
            update_fields.append(f"{field} = %s")
            params.append(data[field])

    if not update_fields:
        return jsonify({"error": "No fields to update"}), 400

    params.append(book_id)

    query = f"""
        UPDATE books
        SET {', '.join(update_fields)}
        WHERE book_id = %s
    """

    execute_query(query, tuple(params))

    return jsonify({"message": "Book updated successfully"}), 200

@admin_books_bp.route('/books/<int:book_id>/contributors', methods=['POST'])
@jwt_required()
@admin_required
def add_book_contributor(book_id):
    """Add a contributor to a book"""
    data = request.get_json()

    required_fields = ['contributor_id', 'role']
    if not all(field in data for field in required_fields):
        return jsonify({"error": "Missing required fields: contributor_id, role"}), 400

    # Check if book exists
    book_check = "SELECT book_id FROM books WHERE book_id = %s"
    if not execute_query(book_check, (book_id,), fetch_one=True):
        return jsonify({"error": "Book not found"}), 404

    # Check if contributor exists
    contrib_check = "SELECT contributor_id FROM contributors WHERE contributor_id = %s"
    if not execute_query(contrib_check, (data['contributor_id'],), fetch_one=True):
        return jsonify({"error": "Contributor not found"}), 404

    # Check if this relationship already exists
    existing_query = """
        SELECT book_contributor_id FROM book_contributors
        WHERE book_id = %s AND contributor_id = %s AND role = %s
    """
    existing = execute_query(existing_query, (book_id, data['contributor_id'], data['role']), fetch_one=True)

    if existing:
        return jsonify({"error": "This contributor relationship already exists"}), 400

    query = """
        INSERT INTO book_contributors (book_id, contributor_id, role, sequence_number)
        VALUES (%s, %s, %s, %s)
        RETURNING book_contributor_id
    """

    with get_db_cursor() as cursor:
        cursor.execute(query, (
            book_id,
            data['contributor_id'],
            data['role'],
            data.get('sequence_number', 1)
        ))

        bc_id = cursor.fetchone()['book_contributor_id']

        return jsonify({
            "message": "Contributor added to book successfully",
            "book_contributor_id": bc_id
        }), 201

@admin_books_bp.route('/books/<int:book_id>/contributors/<int:book_contributor_id>', methods=['DELETE'])
@jwt_required()
@admin_required
def remove_book_contributor(book_id, book_contributor_id):
    """Remove a contributor from a book"""
    query = """
        DELETE FROM book_contributors
        WHERE book_id = %s AND book_contributor_id = %s
    """
    rows_affected = execute_query(query, (book_id, book_contributor_id))

    if rows_affected == 0:
        return jsonify({"error": "Contributor relationship not found"}), 404

    return jsonify({"message": "Contributor removed from book successfully"}), 200

@admin_books_bp.route('/books/<int:book_id>/contributors/<int:book_contributor_id>', methods=['PUT'])
@jwt_required()
@admin_required
def update_book_contributor(book_id, book_contributor_id):
    """Update contributor relationship (role, sequence)"""
    data = request.get_json()

    update_fields = []
    params = []

    if 'role' in data:
        update_fields.append("role = %s")
        params.append(data['role'])

    if 'sequence_number' in data:
        update_fields.append("sequence_number = %s")
        params.append(data['sequence_number'])

    if not update_fields:
        return jsonify({"error": "No fields to update"}), 400

    params.extend([book_id, book_contributor_id])

    query = f"""
        UPDATE book_contributors
        SET {', '.join(update_fields)}
        WHERE book_id = %s AND book_contributor_id = %s
    """

    rows_affected = execute_query(query, tuple(params))

    if rows_affected == 0:
        return jsonify({"error": "Contributor relationship not found"}), 404

    return jsonify({"message": "Contributor relationship updated successfully"}), 200

@admin_books_bp.route('/books/<int:book_id>', methods=['DELETE'])
@jwt_required()
@admin_required
def delete_book(book_id):
    """Soft delete a book (set is_active to false)"""
    query = "UPDATE books SET is_active = FALSE WHERE book_id = %s"
    rows_affected = execute_query(query, (book_id,))

    if rows_affected == 0:
        return jsonify({"error": "Book not found"}), 404

    return jsonify({"message": "Book deleted successfully"}), 200

@admin_books_bp.route('/age-ratings', methods=['GET'])
@jwt_required()
def get_age_ratings():
    """Get all age ratings"""
    query = "SELECT * FROM age_ratings ORDER BY min_age"
    ratings = execute_query(query, fetch_all=True)
    return jsonify([dict(r) for r in (ratings or [])]), 200

@admin_books_bp.route('/age-ratings', methods=['POST'])
@jwt_required()
@admin_required
def add_age_rating():
    """Add a new age rating"""
    data = request.get_json()

    required_fields = ['rating_name', 'min_age']
    if not all(field in data for field in required_fields):
        return jsonify({"error": "Missing required fields"}), 400

    query = """
        INSERT INTO age_ratings (rating_name, min_age, max_age, description)
        VALUES (%s, %s, %s, %s)
        RETURNING rating_id
    """

    with get_db_cursor() as cursor:
        cursor.execute(query, (
            data['rating_name'],
            data['min_age'],
            data.get('max_age'),
            data.get('description')
        ))

        rating_id = cursor.fetchone()['rating_id']

        return jsonify({
            "message": "Age rating added successfully",
            "rating_id": rating_id
        }), 201

@admin_books_bp.route('/books/<int:book_id>/collection', methods=['PUT'])
@jwt_required()
@admin_required
def update_book_collection(book_id):
    """Update a single book's collection"""
    data = request.get_json()
    new_collection_id = data.get('collection_id')

    if not new_collection_id:
        return jsonify({'error': 'Collection ID required'}), 400

    # Verify book exists
    book = execute_query(
        "SELECT book_id, title FROM books WHERE book_id = %s",
        (book_id,),
        fetch_one=True
    )

    if not book:
        return jsonify({'error': 'Book not found'}), 404

    # Verify collection exists
    collection = execute_query(
        "SELECT collection_id, collection_name FROM collections WHERE collection_id = %s",
        (new_collection_id,),
        fetch_one=True
    )

    if not collection:
        return jsonify({'error': 'Collection not found'}), 404

    # Update book's collection
    execute_query(
        """UPDATE books
           SET collection_id = %s, updated_at = CURRENT_TIMESTAMP
           WHERE book_id = %s""",
        (new_collection_id, book_id)
    )

    return jsonify({
        'message': f'Book moved to {collection["collection_name"]} successfully',
        'book_id': book_id,
        'new_collection': collection['collection_name']
    }), 200

@admin_books_bp.route('/books/batch-update-collection', methods=['PUT'])
@jwt_required()
@admin_required
def batch_update_book_collection():
    """Update multiple books' collections at once"""
    data = request.get_json()
    book_ids = data.get('book_ids', [])
    new_collection_id = data.get('collection_id')

    if not book_ids:
        return jsonify({'error': 'Book IDs required'}), 400

    if not new_collection_id:
        return jsonify({'error': 'Collection ID required'}), 400

    # Verify collection exists
    collection = execute_query(
        "SELECT collection_id, collection_name FROM collections WHERE collection_id = %s",
        (new_collection_id,),
        fetch_one=True
    )

    if not collection:
        return jsonify({'error': 'Collection not found'}), 404

    # Update all books
    with get_db_cursor() as cursor:
        cursor.execute(
            """UPDATE books
               SET collection_id = %s, updated_at = CURRENT_TIMESTAMP
               WHERE book_id = ANY(%s)""",
            (new_collection_id, book_ids)
        )
        updated_count = cursor.rowcount

    return jsonify({
        'message': f'{updated_count} book(s) moved to {collection["collection_name"]} successfully',
        'updated_count': updated_count,
        'new_collection': collection['collection_name']
    }), 200
