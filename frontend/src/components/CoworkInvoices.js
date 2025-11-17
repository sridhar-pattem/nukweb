import React, { useState, useEffect } from 'react';
import { adminCoworkInvoicesAPI } from '../services/api';

function CoworkInvoices() {
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  // Filters
  const [paymentStatus, setPaymentStatus] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  // Modal states
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState(null);

  // Form state
  const [formData, setFormData] = useState({
    member_name: '',
    member_email: '',
    member_phone: '',
    member_address: '',
    payment_status: 'pending',
    payment_mode: '',
    payment_date: '',
    due_date: '',
    notes: '',
    document_type: 'invoice',
    line_items: [
      {
        description: '',
        quantity: 1,
        unit_price: 0,
        amount: 0
      }
    ]
  });

  useEffect(() => {
    fetchInvoices();
  }, [currentPage, paymentStatus, searchTerm]);

  const fetchInvoices = async () => {
    try {
      setLoading(true);
      const response = await adminCoworkInvoicesAPI.getInvoices(
        currentPage,
        20,
        paymentStatus,
        searchTerm
      );
      setInvoices(response.data.invoices);
      setTotalPages(response.data.total_pages);
      setTotal(response.data.total);
      setError('');
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to fetch invoices');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleLineItemChange = (index, field, value) => {
    const newLineItems = [...formData.line_items];
    newLineItems[index][field] = value;

    // Auto-calculate amount
    if (field === 'quantity' || field === 'unit_price') {
      const quantity = parseFloat(newLineItems[index].quantity) || 0;
      const unitPrice = parseFloat(newLineItems[index].unit_price) || 0;
      newLineItems[index].amount = quantity * unitPrice;
    }

    setFormData(prev => ({
      ...prev,
      line_items: newLineItems
    }));
  };

  const addLineItem = () => {
    setFormData(prev => ({
      ...prev,
      line_items: [
        ...prev.line_items,
        {
          description: '',
          quantity: 1,
          unit_price: 0,
          amount: 0
        }
      ]
    }));
  };

  const removeLineItem = (index) => {
    if (formData.line_items.length > 1) {
      setFormData(prev => ({
        ...prev,
        line_items: prev.line_items.filter((_, i) => i !== index)
      }));
    }
  };

  const calculateTotal = () => {
    return formData.line_items.reduce((sum, item) => sum + (parseFloat(item.amount) || 0), 0);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validation
    if (!formData.member_name || !formData.member_email) {
      setError('Member name and email are required');
      return;
    }

    if (formData.line_items.some(item => !item.description || item.amount <= 0)) {
      setError('All line items must have a description and amount greater than 0');
      return;
    }

    try {
      setLoading(true);
      await adminCoworkInvoicesAPI.createInvoice(formData);
      setSuccess('Invoice created successfully!');
      setShowCreateModal(false);
      resetForm();
      fetchInvoices();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to create invoice');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      member_name: '',
      member_email: '',
      member_phone: '',
      member_address: '',
      payment_status: 'pending',
      payment_mode: '',
      payment_date: '',
      due_date: '',
      notes: '',
      document_type: 'invoice',
      line_items: [
        {
          description: '',
          quantity: 1,
          unit_price: 0,
          amount: 0
        }
      ]
    });
  };

  const handleViewInvoice = async (invoice) => {
    try {
      const response = await adminCoworkInvoicesAPI.getInvoice(invoice.invoice_id);
      setSelectedInvoice(response.data);
      setShowViewModal(true);
    } catch (err) {
      setError('Failed to fetch invoice details');
    }
  };

  const handleDownloadPDF = async (invoiceId, invoiceNumber) => {
    try {
      const response = await adminCoworkInvoicesAPI.downloadPDF(invoiceId);
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${invoiceNumber}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      setSuccess('PDF downloaded successfully!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError('Failed to download PDF');
    }
  };

  const handleDeleteInvoice = async (invoiceId) => {
    if (!window.confirm('Are you sure you want to delete this invoice?')) {
      return;
    }

    try {
      await adminCoworkInvoicesAPI.deleteInvoice(invoiceId);
      setSuccess('Invoice deleted successfully!');
      fetchInvoices();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError('Failed to delete invoice');
    }
  };

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'paid':
        return 'badge-success';
      case 'pending':
        return 'badge-warning';
      case 'overdue':
        return 'badge-danger';
      default:
        return 'badge-secondary';
    }
  };

  return (
    <div className="cowork-invoices">
      <div className="page-header">
        <h1>Cowork Invoices & Receipts</h1>
        <button className="btn btn-primary" onClick={() => setShowCreateModal(true)}>
          + Create New Invoice
        </button>
      </div>

      {error && (
        <div className="alert alert-error">
          {error}
          <button onClick={() => setError('')} className="alert-close">&times;</button>
        </div>
      )}

      {success && (
        <div className="alert alert-success">
          {success}
          <button onClick={() => setSuccess('')} className="alert-close">&times;</button>
        </div>
      )}

      {/* Filters */}
      <div className="filters">
        <div className="filter-group">
          <input
            type="text"
            placeholder="Search by invoice number, name, or email..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
            className="search-input"
          />
        </div>
        <div className="filter-group">
          <select
            value={paymentStatus}
            onChange={(e) => {
              setPaymentStatus(e.target.value);
              setCurrentPage(1);
            }}
            className="filter-select"
          >
            <option value="">All Statuses</option>
            <option value="pending">Pending</option>
            <option value="paid">Paid</option>
            <option value="overdue">Overdue</option>
          </select>
        </div>
      </div>

      {/* Invoices Table */}
      {loading ? (
        <div className="loading">Loading invoices...</div>
      ) : (
        <>
          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Invoice #</th>
                  <th>Member Name</th>
                  <th>Email</th>
                  <th>Amount</th>
                  <th>Status</th>
                  <th>Issue Date</th>
                  <th>Payment Mode</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {invoices.length === 0 ? (
                  <tr>
                    <td colSpan="8" style={{ textAlign: 'center' }}>
                      No invoices found
                    </td>
                  </tr>
                ) : (
                  invoices.map(invoice => (
                    <tr key={invoice.invoice_id}>
                      <td><strong>{invoice.invoice_number}</strong></td>
                      <td>{invoice.member_name}</td>
                      <td>{invoice.member_email}</td>
                      <td>₹{parseFloat(invoice.amount).toFixed(2)}</td>
                      <td>
                        <span className={`badge ${getStatusBadgeClass(invoice.payment_status)}`}>
                          {invoice.payment_status}
                        </span>
                      </td>
                      <td>{invoice.issue_date}</td>
                      <td>{invoice.payment_mode || '-'}</td>
                      <td className="actions">
                        <button
                          className="btn btn-sm btn-info"
                          onClick={() => handleViewInvoice(invoice)}
                        >
                          View
                        </button>
                        <button
                          className="btn btn-sm btn-success"
                          onClick={() => handleDownloadPDF(invoice.invoice_id, invoice.invoice_number)}
                        >
                          PDF
                        </button>
                        <button
                          className="btn btn-sm btn-danger"
                          onClick={() => handleDeleteInvoice(invoice.invoice_id)}
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="pagination">
              <button
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
                className="btn btn-secondary"
              >
                Previous
              </button>
              <span className="page-info">
                Page {currentPage} of {totalPages} ({total} total)
              </span>
              <button
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages}
                className="btn btn-secondary"
              >
                Next
              </button>
            </div>
          )}
        </>
      )}

      {/* Create Invoice Modal */}
      {showCreateModal && (
        <div className="modal-overlay" onClick={() => setShowCreateModal(false)}>
          <div className="modal-content large" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Create New Invoice/Receipt</h2>
              <button className="modal-close" onClick={() => setShowCreateModal(false)}>&times;</button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="form-section">
                <h3>Member Details</h3>
                <div className="form-row">
                  <div className="form-group">
                    <label>Member Name *</label>
                    <input
                      type="text"
                      name="member_name"
                      value={formData.member_name}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Email *</label>
                    <input
                      type="email"
                      name="member_email"
                      value={formData.member_email}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Phone</label>
                    <input
                      type="text"
                      name="member_phone"
                      value={formData.member_phone}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div className="form-group">
                    <label>Address</label>
                    <textarea
                      name="member_address"
                      value={formData.member_address}
                      onChange={handleInputChange}
                      rows="2"
                    />
                  </div>
                </div>
              </div>

              <div className="form-section">
                <h3>Line Items</h3>
                {formData.line_items.map((item, index) => (
                  <div key={index} className="line-item">
                    <div className="form-row">
                      <div className="form-group flex-2">
                        <label>Description *</label>
                        <input
                          type="text"
                          value={item.description}
                          onChange={(e) => handleLineItemChange(index, 'description', e.target.value)}
                          required
                          placeholder="e.g., Coworking Day Pass - Nov 1-5"
                        />
                      </div>
                      <div className="form-group">
                        <label>Quantity</label>
                        <input
                          type="number"
                          value={item.quantity}
                          onChange={(e) => handleLineItemChange(index, 'quantity', e.target.value)}
                          min="0.01"
                          step="0.01"
                          required
                        />
                      </div>
                      <div className="form-group">
                        <label>Unit Price (₹)</label>
                        <input
                          type="number"
                          value={item.unit_price}
                          onChange={(e) => handleLineItemChange(index, 'unit_price', e.target.value)}
                          min="0"
                          step="0.01"
                          required
                        />
                      </div>
                      <div className="form-group">
                        <label>Amount (₹)</label>
                        <input
                          type="number"
                          value={item.amount}
                          readOnly
                          className="readonly"
                        />
                      </div>
                      <div className="form-group" style={{ alignSelf: 'flex-end' }}>
                        <button
                          type="button"
                          className="btn btn-sm btn-danger"
                          onClick={() => removeLineItem(index)}
                          disabled={formData.line_items.length === 1}
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
                <button type="button" className="btn btn-secondary" onClick={addLineItem}>
                  + Add Line Item
                </button>
                <div className="total-amount">
                  <strong>Total Amount: ₹{calculateTotal().toFixed(2)}</strong>
                </div>
              </div>

              <div className="form-section">
                <h3>Payment Details</h3>
                <div className="form-row">
                  <div className="form-group">
                    <label>Document Type</label>
                    <select
                      name="document_type"
                      value={formData.document_type}
                      onChange={handleInputChange}
                    >
                      <option value="invoice">Invoice</option>
                      <option value="receipt">Receipt</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Payment Status</label>
                    <select
                      name="payment_status"
                      value={formData.payment_status}
                      onChange={handleInputChange}
                    >
                      <option value="pending">Pending</option>
                      <option value="paid">Paid</option>
                      <option value="overdue">Overdue</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Payment Mode</label>
                    <select
                      name="payment_mode"
                      value={formData.payment_mode}
                      onChange={handleInputChange}
                    >
                      <option value="">Select...</option>
                      <option value="UPI">UPI</option>
                      <option value="Cash">Cash</option>
                      <option value="Credit/Debit Card">Credit/Debit Card</option>
                      <option value="Bank Transfer">Bank Transfer</option>
                      <option value="Gift Coupon">Gift Coupon</option>
                    </select>
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Due Date</label>
                    <input
                      type="date"
                      name="due_date"
                      value={formData.due_date}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div className="form-group">
                    <label>Payment Date</label>
                    <input
                      type="date"
                      name="payment_date"
                      value={formData.payment_date}
                      onChange={handleInputChange}
                      disabled={formData.payment_status !== 'paid'}
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label>Notes</label>
                  <textarea
                    name="notes"
                    value={formData.notes}
                    onChange={handleInputChange}
                    rows="3"
                    placeholder="Any additional notes..."
                  />
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowCreateModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" disabled={loading}>
                  {loading ? 'Creating...' : 'Create Invoice'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View Invoice Modal */}
      {showViewModal && selectedInvoice && (
        <div className="modal-overlay" onClick={() => setShowViewModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Invoice Details - {selectedInvoice.invoice_number}</h2>
              <button className="modal-close" onClick={() => setShowViewModal(false)}>&times;</button>
            </div>

            <div className="invoice-details">
              <div className="detail-section">
                <h3>Member Information</h3>
                <p><strong>Name:</strong> {selectedInvoice.member_name}</p>
                <p><strong>Email:</strong> {selectedInvoice.member_email}</p>
                <p><strong>Phone:</strong> {selectedInvoice.member_phone || 'N/A'}</p>
                <p><strong>Address:</strong> {selectedInvoice.member_address || 'N/A'}</p>
              </div>

              <div className="detail-section">
                <h3>Line Items</h3>
                <table className="invoice-items-table">
                  <thead>
                    <tr>
                      <th>Description</th>
                      <th>Qty</th>
                      <th>Unit Price</th>
                      <th>Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedInvoice.line_items?.map((item, index) => (
                      <tr key={index}>
                        <td>{item.description}</td>
                        <td>{item.quantity}</td>
                        <td>₹{parseFloat(item.unit_price).toFixed(2)}</td>
                        <td>₹{parseFloat(item.amount).toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr>
                      <td colSpan="3"><strong>Total</strong></td>
                      <td><strong>₹{parseFloat(selectedInvoice.amount).toFixed(2)}</strong></td>
                    </tr>
                  </tfoot>
                </table>
              </div>

              <div className="detail-section">
                <h3>Payment Information</h3>
                <p><strong>Status:</strong> <span className={`badge ${getStatusBadgeClass(selectedInvoice.payment_status)}`}>
                  {selectedInvoice.payment_status}
                </span></p>
                <p><strong>Payment Mode:</strong> {selectedInvoice.payment_mode || 'N/A'}</p>
                <p><strong>Issue Date:</strong> {selectedInvoice.issue_date}</p>
                <p><strong>Due Date:</strong> {selectedInvoice.due_date || 'N/A'}</p>
                <p><strong>Payment Date:</strong> {selectedInvoice.payment_date || 'N/A'}</p>
                {selectedInvoice.notes && (
                  <p><strong>Notes:</strong> {selectedInvoice.notes}</p>
                )}
              </div>
            </div>

            <div className="modal-footer">
              <button
                className="btn btn-success"
                onClick={() => handleDownloadPDF(selectedInvoice.invoice_id, selectedInvoice.invoice_number)}
              >
                Download PDF
              </button>
              <button className="btn btn-secondary" onClick={() => setShowViewModal(false)}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default CoworkInvoices;
