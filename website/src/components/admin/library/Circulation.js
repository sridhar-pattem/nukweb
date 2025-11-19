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
    patron_search: '',
    item_search: '',
  });
  const [patronSuggestions, setPatronSuggestions] = useState([]);
  const [itemSuggestions, setItemSuggestions] = useState([]);
  const [selectedPatron, setSelectedPatron] = useState(null);
  const [selectedItem, setSelectedItem] = useState(null);
  const [showPatronSuggestions, setShowPatronSuggestions] = useState(false);
  const [showItemSuggestions, setShowItemSuggestions] = useState(false);
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

      // Debug: Log borrowing data to check structure
      if (data.length > 0) {
        console.log('Sample borrowing data:', data[0]);
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
    console.log('handleReturn called with borrowing ID:', borrowingId);

    if (!borrowingId) {
      setError('Invalid borrowing ID');
      return;
    }

    if (!window.confirm('Confirm return of this item?')) return;

    try {
      setError('');
      console.log('Calling returnItem API with ID:', borrowingId);
      await adminLibraryAPI.returnItem(borrowingId, { return_date: new Date().toISOString() });
      setSuccess('Item returned successfully');
      fetchBorrowings();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      console.error('Error returning item:', err);
      console.error('Error details:', err.response?.data);
      const errorMsg = err.response?.data?.error || err.response?.data?.message || 'Failed to return item';
      setError(errorMsg);
      setTimeout(() => setError(''), 5000);
    }
  };

  const handleRenew = async (borrowingId) => {
    console.log('handleRenew called with borrowing ID:', borrowingId);

    if (!borrowingId) {
      setError('Invalid borrowing ID');
      return;
    }

    if (!window.confirm('Renew this borrowing?')) return;

    try {
      setError('');
      console.log('Calling renewBorrowing API with ID:', borrowingId);
      await adminLibraryAPI.renewBorrowing(borrowingId);
      setSuccess('Borrowing renewed successfully');
      fetchBorrowings();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      console.error('Error renewing borrowing:', err);
      console.error('Error details:', err.response?.data);
      const errorMsg = err.response?.data?.error || err.response?.data?.message || 'Failed to renew borrowing';
      setError(errorMsg);
      setTimeout(() => setError(''), 5000);
    }
  };

  // Patron autocomplete search
  const handlePatronSearch = async (query) => {
    if (!query || query.length < 2) {
      setPatronSuggestions([]);
      setShowPatronSuggestions(false);
      return;
    }

    try {
      const response = await adminLibraryAPI.searchPatrons(query);
      setPatronSuggestions(response.data || []);
      setShowPatronSuggestions(true);
    } catch (err) {
      console.error('Error searching patrons:', err);
    }
  };

  // Item autocomplete search (supports title, author, ISBN, barcode)
  const handleItemSearch = async (query) => {
    if (!query || query.length < 2) {
      setItemSuggestions([]);
      setShowItemSuggestions(false);
      return;
    }

    try {
      const response = await adminLibraryAPI.searchItems(query);
      setItemSuggestions(response.data || []);
      setShowItemSuggestions(true);
    } catch (err) {
      console.error('Error searching items:', err);
    }
  };

  const handleSelectPatron = (patron) => {
    setSelectedPatron(patron);
    setCheckoutForm({
      ...checkoutForm,
      patron_search: `${patron.first_name} ${patron.last_name}`,
    });
    setShowPatronSuggestions(false);
    setPatronSuggestions([]);
  };

  const handleSelectItem = (item) => {
    setSelectedItem(item);
    setCheckoutForm({
      ...checkoutForm,
      item_search: `${item.title} (Barcode: ${item.barcode})`,
    });
    setShowItemSuggestions(false);
    setItemSuggestions([]);
  };

  const handleCheckout = async (e) => {
    e.preventDefault();

    if (!selectedPatron) {
      setError('Please select a patron from the suggestions');
      return;
    }

    if (!selectedItem) {
      setError('Please select an item from the suggestions');
      return;
    }

    try {
      setError('');

      // Now issue the book with patron_id and item_id
      await adminLibraryAPI.checkoutItem({
        patron_id: selectedPatron.patron_id,
        item_id: selectedItem.item_id,
      });

      setSuccess('Book checked out successfully!');
      setShowCheckoutModal(false);
      setCheckoutForm({ patron_search: '', item_search: '' });
      setSelectedPatron(null);
      setSelectedItem(null);
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
              {/* Patron Search with Autocomplete */}
              <div className="form-group">
                <label htmlFor="patron_search">
                  <FaUser /> Patron Name *
                </label>
                <input
                  type="text"
                  id="patron_search"
                  value={checkoutForm.patron_search}
                  onChange={(e) => {
                    setCheckoutForm({ ...checkoutForm, patron_search: e.target.value });
                    setSelectedPatron(null);
                    handlePatronSearch(e.target.value);
                  }}
                  className="form-control"
                  placeholder="Search by patron name..."
                  autoComplete="off"
                />
                {showPatronSuggestions && patronSuggestions.length > 0 && (
                  <div className="autocomplete-dropdown">
                    {patronSuggestions.map((patron) => (
                      <div
                        key={patron.patron_id}
                        className="autocomplete-item"
                        onClick={() => handleSelectPatron(patron)}
                      >
                        <div className="autocomplete-item-main">
                          <strong>
                            {patron.first_name} {patron.last_name}
                          </strong>
                        </div>
                        <div className="autocomplete-item-sub">{patron.email}</div>
                        {patron.plan_name && (
                          <div className="autocomplete-item-sub">
                            Plan: {patron.plan_name}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
                {selectedPatron && (
                  <div className="selected-info">
                    <strong>✓ Selected:</strong> {selectedPatron.first_name}{' '}
                    {selectedPatron.last_name} ({selectedPatron.email})
                  </div>
                )}
              </div>

              {/* Item Search with Autocomplete */}
              <div className="form-group">
                <label htmlFor="item_search">
                  <FaBook /> Book / Item *
                </label>
                <input
                  type="text"
                  id="item_search"
                  value={checkoutForm.item_search}
                  onChange={(e) => {
                    setCheckoutForm({ ...checkoutForm, item_search: e.target.value });
                    setSelectedItem(null);
                    handleItemSearch(e.target.value);
                  }}
                  className="form-control"
                  placeholder="Search by title, author, ISBN, or barcode..."
                  autoComplete="off"
                />
                {showItemSuggestions && itemSuggestions.length > 0 && (
                  <div className="autocomplete-dropdown">
                    {itemSuggestions.map((item) => (
                      <div
                        key={item.item_id}
                        className="autocomplete-item"
                        onClick={() => handleSelectItem(item)}
                      >
                        <div className="autocomplete-item-main">
                          <strong>{item.title}</strong>
                        </div>
                        {item.authors && (
                          <div className="autocomplete-item-sub">By: {item.authors}</div>
                        )}
                        <div className="autocomplete-item-sub">
                          Barcode: {item.barcode}
                          {item.isbn && ` | ISBN: ${item.isbn}`}
                        </div>
                        <div className="autocomplete-item-sub">
                          <span
                            className={`badge ${
                              item.status === 'Available' ? 'badge-success' : 'badge-warning'
                            }`}
                          >
                            {item.status}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                {selectedItem && (
                  <div className="selected-info">
                    <strong>✓ Selected:</strong> {selectedItem.title} (Barcode:{' '}
                    {selectedItem.barcode})
                  </div>
                )}
              </div>

              <div className="modal-actions">
                <button
                  type="button"
                  onClick={() => {
                    setShowCheckoutModal(false);
                    setCheckoutForm({ patron_search: '', item_search: '' });
                    setSelectedPatron(null);
                    setSelectedItem(null);
                    setPatronSuggestions([]);
                    setItemSuggestions([]);
                    setShowPatronSuggestions(false);
                    setShowItemSuggestions(false);
                  }}
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
