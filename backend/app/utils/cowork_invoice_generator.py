from reportlab.lib.pagesizes import letter
from reportlab.lib import colors
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.platypus import SimpleDocTemplate, Table, TableStyle, Paragraph, Spacer, Image
from reportlab.lib.units import inch
from reportlab.lib.enums import TA_CENTER, TA_RIGHT, TA_LEFT
from datetime import datetime
import os

def generate_cowork_invoice_pdf(invoice_data, line_items, member_data, output_path, logo_path=None):
    """
    Generate a PDF invoice or receipt for coworking payments

    Args:
        invoice_data: Dictionary with invoice details
            - invoice_number: str
            - invoice_type: 'cowork'
            - issue_date: str (YYYY-MM-DD)
            - due_date: str (YYYY-MM-DD) - optional for receipts
            - payment_status: 'paid' or 'pending'
            - payment_date: str (YYYY-MM-DD) - optional
            - payment_mode: str - optional
            - notes: str - optional
            - document_type: 'invoice' or 'receipt'
        line_items: List of dictionaries with line item details
            - description: str
            - quantity: float
            - unit_price: float
            - amount: float
        member_data: Dictionary with member details
            - name: str
            - email: str
            - phone: str
            - address: str
        output_path: Path where PDF should be saved
        logo_path: Optional path to logo image

    Returns:
        Path to generated PDF file
    """
    try:
        # Create document
        doc = SimpleDocTemplate(output_path, pagesize=letter,
                              topMargin=0.5*inch, bottomMargin=0.5*inch,
                              leftMargin=0.75*inch, rightMargin=0.75*inch)
        elements = []
        styles = getSampleStyleSheet()

        # Custom styles
        title_style = ParagraphStyle(
            'CustomTitle',
            parent=styles['Heading1'],
            fontSize=28,
            textColor=colors.HexColor('#2C3E50'),
            spaceAfter=12,
            alignment=TA_CENTER,
            fontName='Helvetica-Bold'
        )

        header_style = ParagraphStyle(
            'HeaderStyle',
            parent=styles['Normal'],
            fontSize=10,
            textColor=colors.HexColor('#34495E'),
            alignment=TA_CENTER,
            spaceAfter=6
        )

        doc_type_style = ParagraphStyle(
            'DocTypeStyle',
            parent=styles['Heading1'],
            fontSize=20,
            textColor=colors.HexColor('#E74C3C') if invoice_data.get('document_type') == 'invoice' else colors.HexColor('#27AE60'),
            spaceAfter=12,
            alignment=TA_CENTER,
            fontName='Helvetica-Bold'
        )

        # Header Section with Logo
        if logo_path and os.path.exists(logo_path):
            try:
                logo = Image(logo_path, width=1.5*inch, height=1.5*inch)
                logo.hAlign = 'CENTER'
                elements.append(logo)
                elements.append(Spacer(1, 0.1*inch))
            except Exception as e:
                print(f"Error loading logo: {e}")

        # Library Title
        header = Paragraph("Nuk Library", title_style)
        elements.append(header)

        # Library Contact Details
        library_info = Paragraph("""
            Bangalore, India<br/>
            Email: host@mynuk.com | Phone: +91 72595 28336
        """, header_style)
        elements.append(library_info)
        elements.append(Spacer(1, 0.3*inch))

        # Document Type (INVOICE or RECEIPT)
        doc_type = invoice_data.get('document_type', 'invoice').upper()
        doc_title = Paragraph(f"<b>{doc_type}</b>", doc_type_style)
        elements.append(doc_title)
        elements.append(Spacer(1, 0.05*inch))

        # Invoice/Receipt Number
        invoice_num = Paragraph(f"<b>#{invoice_data['invoice_number']}</b>",
                               ParagraphStyle('InvoiceNum', parent=styles['Normal'],
                                            fontSize=12, alignment=TA_CENTER))
        elements.append(invoice_num)
        elements.append(Spacer(1, 0.3*inch))

        # Two-column layout for invoice details and member details
        detail_style = ParagraphStyle('DetailStyle', parent=styles['Normal'], fontSize=9, leading=14)
        label_style = ParagraphStyle('LabelStyle', parent=styles['Normal'],
                                    fontSize=9, textColor=colors.HexColor('#7F8C8D'), leading=14)

        # Left column - Invoice Details
        left_col_data = []
        left_col_data.append([Paragraph("<b>Invoice Date:</b>", label_style),
                             Paragraph(invoice_data['issue_date'], detail_style)])

        if doc_type == 'INVOICE' and invoice_data.get('due_date'):
            left_col_data.append([Paragraph("<b>Due Date:</b>", label_style),
                                 Paragraph(invoice_data['due_date'], detail_style)])

        if invoice_data.get('payment_status') == 'paid' and invoice_data.get('payment_date'):
            left_col_data.append([Paragraph("<b>Payment Date:</b>", label_style),
                                 Paragraph(invoice_data['payment_date'], detail_style)])

        if invoice_data.get('payment_mode'):
            left_col_data.append([Paragraph("<b>Payment Mode:</b>", label_style),
                                 Paragraph(invoice_data['payment_mode'], detail_style)])

        left_table = Table(left_col_data, colWidths=[1.2*inch, 1.8*inch])
        left_table.setStyle(TableStyle([
            ('VALIGN', (0, 0), (-1, -1), 'TOP'),
            ('ALIGN', (0, 0), (0, -1), 'LEFT'),
            ('ALIGN', (1, 0), (1, -1), 'LEFT'),
        ]))

        # Right column - Member Details
        right_col_data = []
        right_col_data.append([Paragraph("<b>Bill To:</b>", label_style), Paragraph("", detail_style)])
        right_col_data.append([Paragraph("<b>Name:</b>", label_style),
                              Paragraph(member_data.get('name', 'N/A'), detail_style)])
        right_col_data.append([Paragraph("<b>Email:</b>", label_style),
                              Paragraph(member_data.get('email', 'N/A'), detail_style)])
        right_col_data.append([Paragraph("<b>Phone:</b>", label_style),
                              Paragraph(member_data.get('phone', 'N/A'), detail_style)])

        if member_data.get('address'):
            address_lines = member_data['address'].replace('\n', '<br/>')
            right_col_data.append([Paragraph("<b>Address:</b>", label_style),
                                  Paragraph(address_lines, detail_style)])

        right_table = Table(right_col_data, colWidths=[1.0*inch, 2.0*inch])
        right_table.setStyle(TableStyle([
            ('VALIGN', (0, 0), (-1, -1), 'TOP'),
            ('ALIGN', (0, 0), (0, -1), 'LEFT'),
            ('ALIGN', (1, 0), (1, -1), 'LEFT'),
        ]))

        # Combine left and right columns
        header_table = Table([[left_table, right_table]], colWidths=[3.2*inch, 3.2*inch])
        header_table.setStyle(TableStyle([
            ('VALIGN', (0, 0), (-1, -1), 'TOP'),
            ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
        ]))

        elements.append(header_table)
        elements.append(Spacer(1, 0.4*inch))

        # Line Items Table
        items_data = [['#', 'Description', 'Qty', 'Unit Price', 'Amount']]

        total_amount = 0
        for idx, item in enumerate(line_items, start=1):
            # Convert to float if string
            quantity = float(item.get('quantity', 1))
            unit_price = float(item['unit_price'])
            amount = float(item['amount'])

            items_data.append([
                str(idx),
                item['description'],
                str(quantity),
                f"Rs. {unit_price:.2f}",
                f"Rs. {amount:.2f}"
            ])
            total_amount += amount

        items_table = Table(items_data, colWidths=[0.4*inch, 3.2*inch, 0.6*inch, 1.0*inch, 1.2*inch])
        items_table.setStyle(TableStyle([
            # Header row
            ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#34495E')),
            ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
            ('ALIGN', (0, 0), (-1, 0), 'CENTER'),
            ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
            ('FONTSIZE', (0, 0), (-1, 0), 11),
            ('BOTTOMPADDING', (0, 0), (-1, 0), 10),
            ('TOPPADDING', (0, 0), (-1, 0), 10),
            # Data rows
            ('BACKGROUND', (0, 1), (-1, -1), colors.beige),
            ('TEXTCOLOR', (0, 1), (-1, -1), colors.black),
            ('ALIGN', (0, 1), (0, -1), 'CENTER'),  # Row number
            ('ALIGN', (1, 1), (1, -1), 'LEFT'),    # Description
            ('ALIGN', (2, 1), (2, -1), 'CENTER'),  # Quantity
            ('ALIGN', (3, 1), (-1, -1), 'RIGHT'),  # Prices
            ('FONTNAME', (0, 1), (-1, -1), 'Helvetica'),
            ('FONTSIZE', (0, 1), (-1, -1), 10),
            ('TOPPADDING', (0, 1), (-1, -1), 8),
            ('BOTTOMPADDING', (0, 1), (-1, -1), 8),
            # Grid
            ('GRID', (0, 0), (-1, -1), 0.5, colors.grey),
            ('LINEBELOW', (0, 0), (-1, 0), 1.5, colors.HexColor('#34495E')),
        ]))

        elements.append(items_table)
        elements.append(Spacer(1, 0.2*inch))

        # Total Section
        total_data = [
            ['Subtotal:', f"Rs. {total_amount:.2f}"],
            ['Total Amount:', f"Rs. {total_amount:.2f}"]
        ]

        total_table = Table(total_data, colWidths=[4.6*inch, 1.8*inch])
        total_table.setStyle(TableStyle([
            ('ALIGN', (0, 0), (-1, -1), 'RIGHT'),
            ('FONTNAME', (0, 0), (-1, 0), 'Helvetica'),
            ('FONTNAME', (0, 1), (-1, 1), 'Helvetica-Bold'),
            ('FONTSIZE', (0, 0), (-1, 0), 11),
            ('FONTSIZE', (0, 1), (-1, 1), 14),
            ('TEXTCOLOR', (0, 1), (-1, 1), colors.HexColor('#27AE60')),
            ('LINEABOVE', (0, 1), (-1, 1), 1, colors.grey),
            ('TOPPADDING', (0, 1), (-1, 1), 8),
        ]))

        elements.append(total_table)
        elements.append(Spacer(1, 0.3*inch))

        # Payment Status
        if invoice_data.get('payment_status') == 'paid':
            status_text = f"<b>PAID</b>"
            status_color = colors.HexColor('#27AE60')
            if invoice_data.get('payment_date'):
                status_text += f" on {invoice_data['payment_date']}"
        else:
            status_text = "<b>PAYMENT PENDING</b>"
            status_color = colors.HexColor('#E74C3C')

        status_style = ParagraphStyle('StatusStyle', parent=styles['Normal'],
                                     fontSize=12, textColor=status_color,
                                     fontName='Helvetica-Bold', alignment=TA_CENTER)
        status = Paragraph(status_text, status_style)
        elements.append(status)
        elements.append(Spacer(1, 0.2*inch))

        # Notes section
        if invoice_data.get('notes'):
            notes_style = ParagraphStyle('NotesStyle', parent=styles['Normal'],
                                        fontSize=9, textColor=colors.HexColor('#7F8C8D'))
            notes_label = Paragraph("<b>Notes:</b>", notes_style)
            elements.append(notes_label)
            notes_text = Paragraph(invoice_data['notes'], notes_style)
            elements.append(notes_text)
            elements.append(Spacer(1, 0.2*inch))

        # Footer
        footer_style = ParagraphStyle('FooterStyle', parent=styles['Normal'],
                                     fontSize=9, textColor=colors.HexColor('#95A5A6'),
                                     alignment=TA_CENTER, leading=12)
        footer = Paragraph("""
            <i>Thank you for choosing Nuk Library Coworking Space!</i><br/>
            For any queries, please contact us at host@mynuk.com
        """, footer_style)
        elements.append(footer)

        # Build PDF
        doc.build(elements)

        return output_path

    except Exception as e:
        print(f"Error generating cowork invoice PDF: {e}")
        raise e
