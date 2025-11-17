from flask import Blueprint, request, jsonify, send_file
from flask_jwt_extended import jwt_required, get_jwt_identity
from app.utils.database import get_db_connection, get_db_cursor
from app.utils.auth import admin_required
from app.utils.cowork_invoice_generator import generate_cowork_invoice_pdf
from datetime import datetime, timedelta
import os
import tempfile

admin_cowork_invoices_bp = Blueprint('admin_cowork_invoices', __name__)

def generate_invoice_number():
    """Generate a unique invoice number"""
    timestamp = datetime.now().strftime('%Y%m%d%H%M%S')
    return f"INV-CW-{timestamp}"

@admin_cowork_invoices_bp.route('/cowork-invoices', methods=['POST'])
@jwt_required()
@admin_required
def create_cowork_invoice():
    """
    Create a new coworking invoice/receipt with custom member details and line items

    Request body:
    {
        "member_name": "John Doe",
        "member_email": "john@example.com",
        "member_phone": "+91-9876543210",
        "member_address": "123 Main St, Bangalore",
        "line_items": [
            {
                "description": "Coworking Day Pass - Nov 1-5",
                "quantity": 5,
                "unit_price": 500,
                "amount": 2500
            }
        ],
        "payment_status": "paid" or "pending",
        "payment_mode": "UPI" or "Cash" or "Credit/Debit Card" or "Bank Transfer",
        "payment_date": "2025-11-16" (optional, for paid invoices),
        "due_date": "2025-11-30" (optional, for pending invoices),
        "notes": "Any additional notes",
        "document_type": "invoice" or "receipt"
    }
    """
    try:
        data = request.get_json()

        # Validate required fields
        required_fields = ['member_name', 'member_email', 'line_items']
        for field in required_fields:
            if field not in data:
                return jsonify({'error': f'{field} is required'}), 400

        if not data['line_items'] or len(data['line_items']) == 0:
            return jsonify({'error': 'At least one line item is required'}), 400

        # Calculate total amount
        total_amount = sum(item['amount'] for item in data['line_items'])

        # Generate invoice number
        invoice_number = generate_invoice_number()

        # Set dates
        issue_date = datetime.now().date()
        due_date = data.get('due_date')
        if not due_date and data.get('payment_status') == 'pending':
            # Default: 30 days from issue date
            due_date = (issue_date + timedelta(days=30)).strftime('%Y-%m-%d')

        payment_date = data.get('payment_date') if data.get('payment_status') == 'paid' else None
        document_type = data.get('document_type', 'invoice')

        # Insert invoice into database
        with get_db_connection() as conn:
            with conn.cursor() as cur:
                cur.execute("""
                    INSERT INTO invoices (
                        invoice_number, invoice_type, amount,
                        payment_mode, payment_status,
                        issue_date, due_date, payment_date,
                        custom_member_name, custom_member_email,
                        custom_member_phone, custom_member_address,
                        notes
                    ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
                    RETURNING invoice_id
                """, (
                    invoice_number, 'cowork', total_amount,
                    data.get('payment_mode'), data.get('payment_status', 'pending'),
                    issue_date, due_date, payment_date,
                    data['member_name'], data['member_email'],
                    data.get('member_phone'), data.get('member_address'),
                    data.get('notes')
                ))

                invoice_id = cur.fetchone()[0]

                # Insert line items
                for idx, item in enumerate(data['line_items']):
                    cur.execute("""
                        INSERT INTO invoice_line_items (
                            invoice_id, description, quantity,
                            unit_price, amount, item_order
                        ) VALUES (%s, %s, %s, %s, %s, %s)
                    """, (
                        invoice_id, item['description'], item.get('quantity', 1),
                        item['unit_price'], item['amount'], idx
                    ))

                conn.commit()

        # Initialize pdf_url
        pdf_url = f"/api/admin/cowork-invoices/{invoice_id}/pdf"

        # Generate PDF
        try:
            # Create uploads directory if it doesn't exist
            upload_dir = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), 'uploads', 'invoices')
            os.makedirs(upload_dir, exist_ok=True)

            pdf_filename = f"{invoice_number}.pdf"
            pdf_path = os.path.join(upload_dir, pdf_filename)

            # Check for logo
            logo_dir = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), 'uploads', 'logo')
            logo_path = None
            if os.path.exists(logo_dir):
                # Look for common logo file names
                for logo_file in ['logo.png', 'logo.jpg', 'logo.jpeg', 'nuk_logo.png', 'nuk_logo.jpg']:
                    potential_logo = os.path.join(logo_dir, logo_file)
                    if os.path.exists(potential_logo):
                        logo_path = potential_logo
                        break

            invoice_data = {
                'invoice_number': invoice_number,
                'invoice_type': 'cowork',
                'issue_date': str(issue_date),
                'due_date': due_date,
                'payment_status': data.get('payment_status', 'pending'),
                'payment_date': payment_date,
                'payment_mode': data.get('payment_mode'),
                'notes': data.get('notes'),
                'document_type': document_type
            }

            member_data = {
                'name': data['member_name'],
                'email': data['member_email'],
                'phone': data.get('member_phone', ''),
                'address': data.get('member_address', '')
            }

            generate_cowork_invoice_pdf(invoice_data, data['line_items'], member_data, pdf_path, logo_path)

            # Update PDF URL in database
            with get_db_connection() as conn:
                with conn.cursor() as cur:
                    cur.execute(
                        "UPDATE invoices SET pdf_url = %s WHERE invoice_id = %s",
                        (pdf_url, invoice_id)
                    )
                    conn.commit()

        except Exception as pdf_error:
            print(f"Error generating PDF: {pdf_error}")
            import traceback
            traceback.print_exc()
            # Continue anyway, PDF can be regenerated later

        return jsonify({
            'message': 'Invoice created successfully',
            'invoice_id': invoice_id,
            'invoice_number': invoice_number,
            'pdf_url': pdf_url
        }), 201

    except Exception as e:
        print(f"Error creating invoice: {e}")
        return jsonify({'error': str(e)}), 500


@admin_cowork_invoices_bp.route('/cowork-invoices', methods=['GET'])
@jwt_required()
@admin_required
def get_cowork_invoices():
    """
    Get list of coworking invoices with pagination and filters

    Query params:
    - page: int (default 1)
    - per_page: int (default 20)
    - payment_status: 'pending' | 'paid' | 'overdue'
    - search: search by invoice number or member name
    """
    try:
        page = int(request.args.get('page', 1))
        per_page = int(request.args.get('per_page', 20))
        payment_status = request.args.get('payment_status')
        search = request.args.get('search', '').strip()

        offset = (page - 1) * per_page

        # Build query
        where_clauses = ["invoice_type = 'cowork'"]
        params = []

        if payment_status:
            where_clauses.append("payment_status = %s")
            params.append(payment_status)

        if search:
            where_clauses.append("""
                (invoice_number ILIKE %s OR
                 custom_member_name ILIKE %s OR
                 custom_member_email ILIKE %s)
            """)
            search_pattern = f"%{search}%"
            params.extend([search_pattern, search_pattern, search_pattern])

        where_clause = " AND ".join(where_clauses)

        with get_db_cursor() as cur:
            # Get total count
            cur.execute(f"SELECT COUNT(*) as count FROM invoices WHERE {where_clause}", params)
            total = cur.fetchone()['count']

            # Get invoices
            query = f"""
                SELECT
                    invoice_id, invoice_number, amount,
                    payment_mode, payment_status,
                    issue_date, due_date, payment_date,
                    custom_member_name, custom_member_email,
                    custom_member_phone, custom_member_address,
                    notes, pdf_url, created_at
                FROM invoices
                WHERE {where_clause}
                ORDER BY created_at DESC
                LIMIT %s OFFSET %s
            """
            params.extend([per_page, offset])

            cur.execute(query, params)
            rows = cur.fetchall()

            invoices = []
            for row in rows:
                invoice = {
                    'invoice_id': row['invoice_id'],
                    'invoice_number': row['invoice_number'],
                    'amount': float(row['amount']) if row['amount'] is not None else 0.0,
                    'payment_mode': row['payment_mode'],
                    'payment_status': row['payment_status'],
                    'issue_date': str(row['issue_date']) if row['issue_date'] else None,
                    'due_date': str(row['due_date']) if row['due_date'] else None,
                    'payment_date': str(row['payment_date']) if row['payment_date'] else None,
                    'member_name': row['custom_member_name'],
                    'member_email': row['custom_member_email'],
                    'member_phone': row['custom_member_phone'],
                    'member_address': row['custom_member_address'],
                    'notes': row['notes'],
                    'pdf_url': row['pdf_url'],
                    'created_at': str(row['created_at']) if row['created_at'] else None
                }
                invoices.append(invoice)

            return jsonify({
                'invoices': invoices,
                'total': total,
                'page': page,
                'per_page': per_page,
                'total_pages': (total + per_page - 1) // per_page
            }), 200

    except Exception as e:
        import traceback
        print(f"Error fetching invoices: {e}")
        traceback.print_exc()
        return jsonify({'error': str(e)}), 500


@admin_cowork_invoices_bp.route('/cowork-invoices/<int:invoice_id>', methods=['GET'])
@jwt_required()
@admin_required
def get_cowork_invoice(invoice_id):
    """Get a specific coworking invoice with line items"""
    try:
        with get_db_cursor() as cur:
            # Get invoice
            cur.execute("""
                SELECT
                    invoice_id, invoice_number, amount,
                    payment_mode, payment_status,
                    issue_date, due_date, payment_date,
                    custom_member_name, custom_member_email,
                    custom_member_phone, custom_member_address,
                    notes, pdf_url, created_at
                FROM invoices
                WHERE invoice_id = %s AND invoice_type = 'cowork'
            """, (invoice_id,))

            row = cur.fetchone()
            if not row:
                return jsonify({'error': 'Invoice not found'}), 404

            invoice = {
                'invoice_id': row['invoice_id'],
                'invoice_number': row['invoice_number'],
                'amount': float(row['amount']) if row['amount'] is not None else 0.0,
                'payment_mode': row['payment_mode'],
                'payment_status': row['payment_status'],
                'issue_date': str(row['issue_date']) if row['issue_date'] else None,
                'due_date': str(row['due_date']) if row['due_date'] else None,
                'payment_date': str(row['payment_date']) if row['payment_date'] else None,
                'member_name': row['custom_member_name'],
                'member_email': row['custom_member_email'],
                'member_phone': row['custom_member_phone'],
                'member_address': row['custom_member_address'],
                'notes': row['notes'],
                'pdf_url': row['pdf_url'],
                'created_at': str(row['created_at']) if row['created_at'] else None
            }

            # Get line items
            cur.execute("""
                SELECT
                    line_item_id, description, quantity,
                    unit_price, amount, item_order
                FROM invoice_line_items
                WHERE invoice_id = %s
                ORDER BY item_order
            """, (invoice_id,))

            line_items = []
            for item_row in cur.fetchall():
                line_items.append({
                    'line_item_id': item_row['line_item_id'],
                    'description': item_row['description'],
                    'quantity': float(item_row['quantity']),
                    'unit_price': float(item_row['unit_price']),
                    'amount': float(item_row['amount']),
                    'item_order': item_row['item_order']
                })

            invoice['line_items'] = line_items

            return jsonify(invoice), 200

    except Exception as e:
        print(f"Error fetching invoice: {e}")
        return jsonify({'error': str(e)}), 500


@admin_cowork_invoices_bp.route('/cowork-invoices/<int:invoice_id>/pdf', methods=['GET'])
@jwt_required()
@admin_required
def download_invoice_pdf(invoice_id):
    """Download PDF for a specific invoice"""
    try:
        with get_db_cursor() as cur:
            # Get invoice details
            cur.execute("""
                SELECT
                    invoice_number, amount, payment_mode, payment_status,
                    issue_date, due_date, payment_date,
                    custom_member_name, custom_member_email,
                    custom_member_phone, custom_member_address,
                    notes, pdf_url
                FROM invoices
                WHERE invoice_id = %s AND invoice_type = 'cowork'
            """, (invoice_id,))

            row = cur.fetchone()
            if not row:
                return jsonify({'error': 'Invoice not found'}), 404

            invoice_data = {
                'invoice_number': row['invoice_number'],
                'invoice_type': 'cowork',
                'issue_date': str(row['issue_date']) if row['issue_date'] else None,
                'due_date': str(row['due_date']) if row['due_date'] else None,
                'payment_status': row['payment_status'],
                'payment_date': str(row['payment_date']) if row['payment_date'] else None,
                'payment_mode': row['payment_mode'],
                'notes': row['notes'],
                'document_type': 'receipt' if row['payment_status'] == 'paid' else 'invoice'
            }

            member_data = {
                'name': row['custom_member_name'],
                'email': row['custom_member_email'],
                'phone': row['custom_member_phone'] or '',
                'address': row['custom_member_address'] or ''
            }

            # Get line items
            cur.execute("""
                SELECT description, quantity, unit_price, amount
                FROM invoice_line_items
                WHERE invoice_id = %s
                ORDER BY item_order
            """, (invoice_id,))

            line_items = []
            for item_row in cur.fetchall():
                line_items.append({
                    'description': item_row['description'],
                    'quantity': float(item_row['quantity']),
                    'unit_price': float(item_row['unit_price']),
                    'amount': float(item_row['amount'])
                })

        # Generate PDF
        upload_dir = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), 'uploads', 'invoices')
        pdf_path = os.path.join(upload_dir, f"{invoice_data['invoice_number']}.pdf")

        # Check if PDF exists, if not regenerate
        if not os.path.exists(pdf_path):
            os.makedirs(upload_dir, exist_ok=True)

            # Check for logo
            logo_dir = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), 'uploads', 'logo')
            logo_path = None
            if os.path.exists(logo_dir):
                for logo_file in ['logo.png', 'logo.jpg', 'logo.jpeg', 'nuk_logo.png', 'nuk_logo.jpg']:
                    potential_logo = os.path.join(logo_dir, logo_file)
                    if os.path.exists(potential_logo):
                        logo_path = potential_logo
                        break

            generate_cowork_invoice_pdf(invoice_data, line_items, member_data, pdf_path, logo_path)

        return send_file(
            pdf_path,
            mimetype='application/pdf',
            as_attachment=True,
            download_name=f"{invoice_data['invoice_number']}.pdf"
        )

    except Exception as e:
        print(f"Error downloading PDF: {e}")
        return jsonify({'error': str(e)}), 500


@admin_cowork_invoices_bp.route('/cowork-invoices/<int:invoice_id>', methods=['PUT'])
@jwt_required()
@admin_required
def update_cowork_invoice(invoice_id):
    """Update invoice payment status"""
    try:
        data = request.get_json()

        with get_db_connection() as conn:
            with conn.cursor() as cur:
                # Check if invoice exists
                cur.execute(
                    "SELECT invoice_id FROM invoices WHERE invoice_id = %s AND invoice_type = 'cowork'",
                    (invoice_id,)
                )
                if not cur.fetchone():
                    return jsonify({'error': 'Invoice not found'}), 404

                # Update fields
                update_fields = []
                params = []

                if 'payment_status' in data:
                    update_fields.append("payment_status = %s")
                    params.append(data['payment_status'])

                if 'payment_mode' in data:
                    update_fields.append("payment_mode = %s")
                    params.append(data['payment_mode'])

                if 'payment_date' in data:
                    update_fields.append("payment_date = %s")
                    params.append(data['payment_date'])

                if 'notes' in data:
                    update_fields.append("notes = %s")
                    params.append(data['notes'])

                if not update_fields:
                    return jsonify({'error': 'No fields to update'}), 400

                params.append(invoice_id)
                query = f"UPDATE invoices SET {', '.join(update_fields)} WHERE invoice_id = %s"

                cur.execute(query, params)
                conn.commit()

        return jsonify({'message': 'Invoice updated successfully'}), 200

    except Exception as e:
        print(f"Error updating invoice: {e}")
        return jsonify({'error': str(e)}), 500


@admin_cowork_invoices_bp.route('/cowork-invoices/<int:invoice_id>', methods=['DELETE'])
@jwt_required()
@admin_required
def delete_cowork_invoice(invoice_id):
    """Delete an invoice (soft delete by marking as cancelled)"""
    try:
        with get_db_connection() as conn:
            with conn.cursor() as cur:
                # Check if invoice exists
                cur.execute(
                    "SELECT invoice_number FROM invoices WHERE invoice_id = %s AND invoice_type = 'cowork'",
                    (invoice_id,)
                )
                row = cur.fetchone()
                if not row:
                    return jsonify({'error': 'Invoice not found'}), 404

                invoice_number = row['invoice_number']

                # Delete invoice (cascade will delete line items)
                cur.execute("DELETE FROM invoices WHERE invoice_id = %s", (invoice_id,))
                conn.commit()

                # Try to delete PDF file
                try:
                    upload_dir = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), 'uploads', 'invoices')
                    pdf_path = os.path.join(upload_dir, f"{invoice_number}.pdf")
                    if os.path.exists(pdf_path):
                        os.remove(pdf_path)
                except:
                    pass  # Ignore file deletion errors

        return jsonify({'message': 'Invoice deleted successfully'}), 200

    except Exception as e:
        print(f"Error deleting invoice: {e}")
        return jsonify({'error': str(e)}), 500
