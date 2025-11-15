from reportlab.lib.pagesizes import letter
from reportlab.lib import colors
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.platypus import SimpleDocTemplate, Table, TableStyle, Paragraph, Spacer
from reportlab.lib.units import inch
from datetime import datetime
import os

def generate_invoice_pdf(invoice_data, patron_data, output_path):
    """
    Generate a PDF invoice
    
    Args:
        invoice_data: Dictionary with invoice details
        patron_data: Dictionary with patron details
        output_path: Path where PDF should be saved
    
    Returns:
        Path to generated PDF file
    """
    try:
        # Create document
        doc = SimpleDocTemplate(output_path, pagesize=letter)
        elements = []
        styles = getSampleStyleSheet()
        
        # Custom styles
        title_style = ParagraphStyle(
            'CustomTitle',
            parent=styles['Heading1'],
            fontSize=24,
            textColor=colors.HexColor('#2C3E50'),
            spaceAfter=30,
        )
        
        # Header
        header = Paragraph("Nuk Library", title_style)
        elements.append(header)
        elements.append(Spacer(1, 0.2*inch))
        
        # Library details
        library_info = Paragraph("""
            <b>Nuk Library</b><br/>
            Bangalore, India<br/>
            Email: info@nuklibrary.com<br/>
            Phone: +91-XXXXXXXXXX
        """, styles['Normal'])
        elements.append(library_info)
        elements.append(Spacer(1, 0.3*inch))
        
        # Invoice title
        invoice_title = Paragraph(f"<b>INVOICE #{invoice_data['invoice_number']}</b>", styles['Heading2'])
        elements.append(invoice_title)
        elements.append(Spacer(1, 0.2*inch))
        
        # Invoice and patron details table
        details_data = [
            ['Invoice Date:', invoice_data['issue_date']],
            ['Due Date:', invoice_data['due_date']],
            ['', ''],
            ['Bill To:', ''],
            ['Name:', patron_data['name']],
            ['Email:', patron_data['email']],
            ['Phone:', patron_data.get('phone', 'N/A')],
            ['Member ID:', f"#{patron_data['patron_id']}"]
        ]
        
        details_table = Table(details_data, colWidths=[2*inch, 4*inch])
        details_table.setStyle(TableStyle([
            ('FONT', (0, 0), (0, -1), 'Helvetica-Bold'),
            ('FONT', (1, 0), (1, -1), 'Helvetica'),
            ('FONTSIZE', (0, 0), (-1, -1), 10),
            ('TEXTCOLOR', (0, 0), (-1, -1), colors.black),
            ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
            ('VALIGN', (0, 0), (-1, -1), 'TOP'),
        ]))
        
        elements.append(details_table)
        elements.append(Spacer(1, 0.4*inch))
        
        # Invoice items table
        items_data = [
            ['Description', 'Amount'],
            [invoice_data['invoice_type'].title() + ' Fee', f"₹{invoice_data['amount']:.2f}"]
        ]
        
        items_table = Table(items_data, colWidths=[4*inch, 2*inch])
        items_table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#34495E')),
            ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
            ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
            ('ALIGN', (1, 0), (1, -1), 'RIGHT'),
            ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
            ('FONTSIZE', (0, 0), (-1, 0), 12),
            ('BOTTOMPADDING', (0, 0), (-1, 0), 12),
            ('BACKGROUND', (0, 1), (-1, -1), colors.beige),
            ('GRID', (0, 0), (-1, -1), 1, colors.black),
            ('FONTSIZE', (0, 1), (-1, -1), 10),
        ]))
        
        elements.append(items_table)
        elements.append(Spacer(1, 0.3*inch))
        
        # Total
        total_data = [
            ['Total Amount:', f"₹{invoice_data['amount']:.2f}"]
        ]
        
        total_table = Table(total_data, colWidths=[4*inch, 2*inch])
        total_table.setStyle(TableStyle([
            ('ALIGN', (0, 0), (-1, -1), 'RIGHT'),
            ('FONTNAME', (0, 0), (-1, -1), 'Helvetica-Bold'),
            ('FONTSIZE', (0, 0), (-1, -1), 14),
            ('TEXTCOLOR', (0, 0), (-1, -1), colors.HexColor('#27AE60')),
        ]))
        
        elements.append(total_table)
        elements.append(Spacer(1, 0.5*inch))
        
        # Payment status
        if invoice_data.get('payment_status') == 'paid':
            status_text = f"<b>Status: PAID</b> (Payment Date: {invoice_data.get('payment_date', 'N/A')})"
            status_color = colors.green
        else:
            status_text = "<b>Status: PENDING</b>"
            status_color = colors.red
        
        status = Paragraph(status_text, styles['Normal'])
        elements.append(status)
        elements.append(Spacer(1, 0.3*inch))
        
        # Footer
        footer = Paragraph("""
            <i>Thank you for being a member of Nuk Library!</i><br/>
            <br/>
            For any queries, please contact us at info@nuklibrary.com
        """, styles['Normal'])
        elements.append(footer)
        
        # Build PDF
        doc.build(elements)
        
        return output_path
        
    except Exception as e:
        print(f"Error generating PDF: {e}")
        raise e
