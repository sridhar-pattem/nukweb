import React, { useState, useEffect } from 'react';
import { adminLibraryAPI } from '../../../services/api';
import {
  FaBook,
  FaSearch,
  FaCheck,
  FaRedo,
  FaExclamationTriangle,
  FaClock,
  FaUser,
  FaPlus,
  FaTimes,
} from 'react-icons/fa';
import '../../../styles/admin-library.css';

const Circulation = () => {
  const [loading, setLoading] = useState(true);
  const [borrowings, setBorrowings] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('active');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showCheckoutModal, setShowCheckoutModal] = useState(false);
  const [checkoutForm, setCheckoutForm] = useState({
    patron_email: '',
    item_barcode: '',
  });
  const itemsPerPage = 20;

  useEffect(() => {
    fetchBorrowings();
  }, [page, statusFilter]);

  const fetchBorrowings = async () => {
    try {
      setLoading(true);
      const params = {};

      if (searchTerm) {
        params.patron = searchTerm;
        params.book = searchTerm;
      }

      const response = await adminLibraryAPI.getBorrowings(params);

      // Filter by status if needed (backend returns all active by default)
      let data = response.data || [];

      if (statusFilter === 'overdue') {
        data = data.filter(b => new Date(b.due_date) < new Date());
      } else if (statusFilter === 'returned') {
        // For returned, we need a different endpoint or query
        data = data.filter(b => b.status === 'returned');
      }

      setBorrowings(data);
      setTotal(data.length);
    } catch (err) {
      console.error('Error fetching borrowings:', err);
      setError('Failed to load borrowings');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setPage(1);
    fetchBorrowings();
  };

  const handleReturn = async (borrowingId) => {
    if (!window.confirm('Confirm return of this item?')) return;

    try {
      await adminLibraryAPI.returnItem(borrowingId, { return_date: new Date().toISOString() });
      setSuccess('Item returned successfully');
      fetchBorrowings();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      console.error('Error returning item:', err);
      setError(err.response?.data?.error || 'Failed to return item');
    }
  };

  const handleRenew = async (borrowingId) => {
    if (!window.confirm('Renew this borrowing?')) return;

    try {
      await adminLibraryAPI.renewBorrowing(borrowingId);
      setSuccess('Borrowing renewed successfully');
      fetchBorrowings();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      console.error('Error renewing borrowing:', err);
      setError(err.response?.data?.error || 'Failed to renew borrowing');
    }
  };

  const handleCheckout = async (e) => {
    e.preventDefault();

    if (!checkoutForm.patron_email || !checkoutForm.item_barcode) {
      setError('Patron email and item barcode are required');
      return;
    }

    try {
      setError('');

      // First, search for patron by email
      const patronRes = await adminLibraryAPI.searchPatrons(checkoutForm.patron_email);
      const patrons = patronRes.data;

      if (!patrons || patrons.length === 0) {
        setError('Patron not found with that email');
        return;
      }

      const patron = patrons[0]; // Take first match

      // Search for item by barcode
      const itemRes = await adminLibraryAPI.searchItems(checkoutForm.item_barcode);
      const items = itemRes.data;

      if (!items || items.length === 0) {
        setError('Item not found with that barcode');
        return;
      }

      const item = items[0]; // Take first match

      // Now issue the book with patron_id and item_id
      await adminLibraryAPI.checkoutItem({
        patron_id: patron.patron_id,
        item_id: item.item_id,
      });

      setSuccess('Book checked out successfully!');
      setShowCheckoutModal(false);
      setCheckoutForm({ patron_email: '', item_barcode: '' });
      fetchBorrowings();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      console.error('Error checking out item:', err);
      setError(err.response?.data?.error || 'Failed to checkout item');
    }
  };

  const isOverdue = (dueDate) => {
    return new Date(dueDate) < new Date();
  };

  const getDaysRemaining = (dueDate) => {
    const diff = new Date(dueDate) - new Date();
    const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
    return days;
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const totalPages = Math.ceil(total / itemsPerPage);

  if (loading && borrowings.length === 0) {
    return (
      <div className="admin-library loading">
        <div className="spinner"></div>
        <p>Loading circulation...</p>
      </div>
    );
  }

  return (
    <div className="admin-library">
      <div className="admin-header">
        <div>
          <h1>Circulation</h1>
          <p>Manage checkouts, returns, and renewals</p>
        </div>
        <button onClick={() => setShowCheckoutModal(true)} className="btn btn-primary">
          <FaPlus /> Issue Book
        </button>
      </div>

      {error && <div className="error-message">{error}</div>}
      {success && <div className="success-message">{success}</div>}

      {/* Checkout Modal */}
      {showCheckoutModal && (
        <div className="modal-overlay" onClick={() => setShowCheckoutModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Issue Book</h2>
              <button
                className="modal-close"
                onClick={() => setShowCheckoutModal(false)}
              >
                <FaTimes />
              </button>
            </div>
            <form onSubmit={handleCheckout} className="modal-form">
              <div className="form-group">
                <label htmlFor="patron_email">Patron Email *</label>
                <input
                  type="email"
                  id="patron_email"
                  value={checkoutForm.patron_email}
                  onChange={(e) =>
                    setCheckoutForm({ ...checkoutForm, patron_email: e.target.value })
                  }
                  className="form-control"
                  required
                  placeholder="Enter patron email address"
                />
              </div>
              <div className="form-group">
                <label htmlFor="item_barcode">Item Barcode *</label>
                <input
                  type="text"
                  id="item_barcode"
                  value={checkoutForm.item_barcode}
                  onChange={(e) =>
                    setCheckoutForm({ ...checkoutForm, item_barcode: e.target.value })
                  }
                  className="form-control"
                  required
                  placeholder="Scan or enter item barcode"
                />
              </div>
              <div className="modal-actions">
                <button
                  type="button"
                  onClick={() => setShowCheckoutModal(false)}
                  className="btn btn-outline"
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Checkout
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="admin-tabs">
        <button
          className={`tab ${statusFilter === 'active' ? 'active' : ''}`}
          onClick={() => {
            setStatusFilter('active');
            setPage(1);
          }}
        >
          Active
        </button>
        <button
          className={`tab ${statusFilter === 'returned' ? 'active' : ''}`}
          onClick={() => {
            setStatusFilter('returned');
            setPage(1);
          }}
        >
          Returned
        </button>
        <button
          className={`tab ${statusFilter === 'overdue' ? 'active' : ''}`}
          onClick={() => {
            setStatusFilter('overdue');
            setPage(1);
          }}
        >
          Overdue
        </button>
      </div>

      {/* Search */}
      <div className="admin-toolbar">
        <form onSubmit={handleSearch} className="search-form">
          <div className="search-box">
            <FaSearch />
            <input
              type="text"
              placeholder="Search by patron, barcode, or book title..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <button type="submit" className="btn btn-primary">
            Search
          </button>
        </form>
      </div>

      {/* Results Summary */}
      <div className="results-summary">
        <p>Found {total} borrowing(s)</p>
      </div>

      {/* Borrowings Table */}
      {borrowings.length === 0 ? (
        <div className="empty-state">
          <FaBook />
          <p>No borrowings found</p>
        </div>
      ) : (
        <>
          <div className="table-container">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Patron</th>
                  <th>Book</th>
                  <th>Barcode</th>
                  <th>Checkout Date</th>
                  <th>Due Date</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {borrowings.map((borrowing) => {
                  const overdue = statusFilter === 'active' && isOverdue(borrowing.due_date);
                  const daysRemaining = getDaysRemaining(borrowing.due_date);

                  return (
                    <tr key={borrowing.borrowing_id} className={overdue ? 'row-overdue' : ''}>
                      <td>
                        <div className="patron-info">
                          <FaUser />
                          <div>
                            <strong>{borrowing.first_name} {borrowing.last_name}</strong>
                            <span className="patron-email">{borrowing.email}</span>
                          </div>
                        </div>
                      </td>
                      <td>
                        <div className="book-info">
                          <strong>{borrowing.title}</strong>
                        </div>
                      </td>
                      <td>{borrowing.barcode}</td>
                      <td>{formatDate(borrowing.checkout_date)}</td>
                      <td>
                        <div className="due-date-cell">
                          {formatDate(borrowing.due_date)}
                          {statusFilter === 'active' && (
                            <span
                              className={`days-remaining ${
                                overdue ? 'overdue' : daysRemaining <= 3 ? 'warning' : ''
                              }`}
                            >
                              {overdue ? (
                                <>
                                  <FaExclamationTriangle /> {Math.abs(daysRemaining)} days overdue
                                </>
                              ) : daysRemaining <= 3 ? (
                                <>
                                  <FaClock /> {daysRemaining} days left
                                </>
                              ) : (
                                `${daysRemaining} days`
                              )}
                            </span>
                          )}
                        </div>
                      </td>
                      <td>
                        <span
                          className={`status-badge ${
                            borrowing.status === 'returned' ? 'returned' : overdue ? 'overdue' : 'active'
                          }`}
                        >
                          {borrowing.status === 'returned' ? 'Returned' : overdue ? 'Overdue' : 'Active'}
                        </span>
                        {borrowing.renewal_count > 0 && (
                          <span className="renewal-badge">Renewed {borrowing.renewal_count}x</span>
                        )}
                      </td>
                      <td>
                        {borrowing.status === 'active' && (
                          <div className="action-buttons">
                            <button
                              onClick={() => handleReturn(borrowing.borrowing_id)}
                              className="btn btn-icon btn-success"
                              title="Return Item"
                            >
                              <FaCheck />
                            </button>
                            <button
                              onClick={() => handleRenew(borrowing.borrowing_id)}
                              className="btn btn-icon"
                              title="Renew"
                            >
                              <FaRedo />
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="pagination">
              <button
                onClick={() => setPage(page - 1)}
                disabled={page === 1}
                className="btn btn-outline"
              >
                Previous
              </button>

              <span className="page-info">
                Page {page} of {totalPages}
              </span>

              <button
                onClick={() => setPage(page + 1)}
                disabled={page === totalPages}
                className="btn btn-outline"
              >
                Next
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default Circulation;
