import React, { useState, useEffect } from 'react';
import { adminBorrowingsAPI } from '../services/api';

function BorrowingsManagement() {
  const [borrowings, setBorrowings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [statusFilter, setStatusFilter] = useState('active');
  const [searchTerm, setSearchTerm] = useState('');
  const [showIssueForm, setShowIssueForm] = useState(false);

  // Autocomplete state for patron search
  const [patronSearch, setPatronSearch] = useState('');
  const [patronResults, setPatronResults] = useState([]);
  const [selectedPatron, setSelectedPatron] = useState(null);
  const [showPatronDropdown, setShowPatronDropdown] = useState(false);

  // Autocomplete state for item search
  const [itemSearch, setItemSearch] = useState('');
  const [itemResults, setItemResults] = useState([]);
  const [selectedItem, setSelectedItem] = useState(null);
  const [showItemDropdown, setShowItemDropdown] = useState(false);

  useEffect(() => {
    loadBorrowings();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [statusFilter]);

  const loadBorrowings = async () => {
    try {
      setLoading(true);
      setError('');

      const params = {};
      if (searchTerm) {
        params.patron = searchTerm;
        params.book = searchTerm;
      }

      const response = await adminBorrowingsAPI.getAllBorrowings(params.patron || '', params.book || '');
      let data = response.data || [];

      // Filter by status
      if (statusFilter === 'overdue') {
        data = data.filter(b => b.status !== 'returned' && new Date(b.due_date) < new Date());
      } else if (statusFilter === 'returned') {
        data = data.filter(b => b.status === 'returned');
      } else if (statusFilter === 'active') {
        data = data.filter(b => b.status !== 'returned');
      }

      setBorrowings(data);
    } catch (err) {
      console.error('Error loading borrowings:', err);
      setError('Failed to load borrowings');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    loadBorrowings();
  };

  const handleReturn = async (borrowingId) => {
    if (!window.confirm('Mark this item as returned?')) return;

    try {
      setError('');
      await adminBorrowingsAPI.returnBook(borrowingId);
      setSuccess('Item returned successfully!');
      loadBorrowings();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to return item');
    }
  };

  const handleRenew = async (borrowingId) => {
    if (!window.confirm('Renew this borrowing?')) return;

    try {
      setError('');
      await adminBorrowingsAPI.renewBorrowing(borrowingId);
      setSuccess('Borrowing renewed successfully!');
      loadBorrowings();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to renew borrowing');
    }
  };

  const handlePatronSearch = async (query) => {
    if (!query || query.length < 2) {
      setPatronResults([]);
      setShowPatronDropdown(false);
      return;
    }

    try {
      const response = await adminBorrowingsAPI.searchPatrons(query);
      setPatronResults(response.data || []);
      setShowPatronDropdown(true);
    } catch (err) {
      console.error('Error searching patrons:', err);
    }
  };

  const handleItemSearch = async (query) => {
    if (!query || query.length < 2) {
      setItemResults([]);
      setShowItemDropdown(false);
      return;
    }

    try {
      const response = await adminBorrowingsAPI.searchItems(query);
      setItemResults(response.data || []);
      setShowItemDropdown(true);
    } catch (err) {
      console.error('Error searching items:', err);
    }
  };

  const handleSelectPatron = (patron) => {
    setSelectedPatron(patron);
    setPatronSearch(`${patron.first_name} ${patron.last_name}`);
    setShowPatronDropdown(false);
  };

  const handleSelectItem = (item) => {
    setSelectedItem(item);
    setItemSearch(`${item.title} (Barcode: ${item.barcode})`);
    setShowItemDropdown(false);
  };

  const handleIssueBook = async (e) => {
    e.preventDefault();

    if (!selectedPatron) {
      setError('Please select a patron');
      return;
    }

    if (!selectedItem) {
      setError('Please select an item');
      return;
    }

    try {
      setError('');
      await adminBorrowingsAPI.issueBook(selectedPatron.patron_id, selectedItem.item_id);
      setSuccess('Book issued successfully!');
      setShowIssueForm(false);
      setPatronSearch('');
      setItemSearch('');
      setSelectedPatron(null);
      setSelectedItem(null);
      loadBorrowings();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to issue book');
    }
  };

  const isOverdue = (dueDate) => {
    return new Date(dueDate) < new Date();
  };

  const getDaysRemaining = (dueDate) => {
    const diff = new Date(dueDate) - new Date();
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  if (loading && borrowings.length === 0) {
    return <div style={{ padding: '2rem', textAlign: 'center' }}>Loading...</div>;
  }

  return (
    <div style={{ padding: '2rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h1>Circulation</h1>
          <p>Manage checkouts, returns, and renewals</p>
        </div>
        <button onClick={() => setShowIssueForm(true)} className="btn btn-primary">
          + Issue Book
        </button>
      </div>

      {error && <div style={{ padding: '1rem', background: '#f8d7da', color: '#721c24', borderRadius: '4px', marginBottom: '1rem' }}>{error}</div>}
      {success && <div style={{ padding: '1rem', background: '#d4edda', color: '#155724', borderRadius: '4px', marginBottom: '1rem' }}>{success}</div>}

      {/* Issue Book Modal */}
      {showIssueForm && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}
        onClick={() => setShowIssueForm(false)}
        >
          <div style={{
            background: 'white',
            padding: '2rem',
            borderRadius: '8px',
            maxWidth: '600px',
            width: '90%',
            maxHeight: '90vh',
            overflow: 'auto'
          }}
          onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
              <h2>Issue Book</h2>
              <button onClick={() => setShowIssueForm(false)} className="btn">×</button>
            </div>

            <form onSubmit={handleIssueBook}>
              {/* Patron Search */}
              <div style={{ marginBottom: '1rem', position: 'relative' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>Patron *</label>
                <input
                  type="text"
                  value={patronSearch}
                  onChange={(e) => {
                    setPatronSearch(e.target.value);
                    setSelectedPatron(null);
                    handlePatronSearch(e.target.value);
                  }}
                  placeholder="Search by patron name..."
                  style={{ width: '100%', padding: '0.5rem', border: '1px solid #ddd', borderRadius: '4px' }}
                  autoComplete="off"
                />
                {showPatronDropdown && patronResults.length > 0 && (
                  <div style={{
                    position: 'absolute',
                    top: '100%',
                    left: 0,
                    right: 0,
                    background: 'white',
                    border: '1px solid #ddd',
                    borderRadius: '4px',
                    maxHeight: '200px',
                    overflow: 'auto',
                    zIndex: 1001,
                    marginTop: '4px'
                  }}>
                    {patronResults.map((patron) => (
                      <div
                        key={patron.patron_id}
                        onClick={() => handleSelectPatron(patron)}
                        style={{
                          padding: '0.75rem',
                          cursor: 'pointer',
                          borderBottom: '1px solid #eee'
                        }}
                      >
                        <strong>{patron.first_name} {patron.last_name}</strong>
                        <div style={{ fontSize: '0.875rem', color: '#666' }}>{patron.email}</div>
                      </div>
                    ))}
                  </div>
                )}
                {selectedPatron && (
                  <div style={{ marginTop: '0.5rem', padding: '0.5rem', background: '#e8f4f8', borderRadius: '4px', fontSize: '0.875rem' }}>
                    ✓ Selected: {selectedPatron.first_name} {selectedPatron.last_name}
                  </div>
                )}
              </div>

              {/* Item Search */}
              <div style={{ marginBottom: '1.5rem', position: 'relative' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>Book / Item *</label>
                <input
                  type="text"
                  value={itemSearch}
                  onChange={(e) => {
                    setItemSearch(e.target.value);
                    setSelectedItem(null);
                    handleItemSearch(e.target.value);
                  }}
                  placeholder="Search by title, author, ISBN, or barcode..."
                  style={{ width: '100%', padding: '0.5rem', border: '1px solid #ddd', borderRadius: '4px' }}
                  autoComplete="off"
                />
                {showItemDropdown && itemResults.length > 0 && (
                  <div style={{
                    position: 'absolute',
                    top: '100%',
                    left: 0,
                    right: 0,
                    background: 'white',
                    border: '1px solid #ddd',
                    borderRadius: '4px',
                    maxHeight: '200px',
                    overflow: 'auto',
                    zIndex: 1001,
                    marginTop: '4px'
                  }}>
                    {itemResults.map((item) => (
                      <div
                        key={item.item_id}
                        onClick={() => handleSelectItem(item)}
                        style={{
                          padding: '0.75rem',
                          cursor: 'pointer',
                          borderBottom: '1px solid #eee'
                        }}
                      >
                        <strong>{item.title}</strong>
                        <div style={{ fontSize: '0.875rem', color: '#666' }}>Barcode: {item.barcode}</div>
                        <div style={{ fontSize: '0.75rem', color: item.status === 'Available' ? '#28a745' : '#dc3545' }}>
                          {item.status}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                {selectedItem && (
                  <div style={{ marginTop: '0.5rem', padding: '0.5rem', background: '#e8f4f8', borderRadius: '4px', fontSize: '0.875rem' }}>
                    ✓ Selected: {selectedItem.title} (Barcode: {selectedItem.barcode})
                  </div>
                )}
              </div>

              <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
                <button type="button" onClick={() => setShowIssueForm(false)} className="btn">
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Issue Book
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div style={{ borderBottom: '2px solid #ddd', marginBottom: '2rem' }}>
        <div style={{ display: 'flex', gap: '0' }}>
          {['active', 'returned', 'overdue'].map((status) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              style={{
                padding: '0.75rem 1.5rem',
                border: 'none',
                background: statusFilter === status ? '#5BC0BE' : 'transparent',
                color: statusFilter === status ? 'white' : '#333',
                borderRadius: '8px 8px 0 0',
                fontWeight: statusFilter === status ? '600' : '400',
                cursor: 'pointer',
                fontSize: '1rem',
                textTransform: 'capitalize',
                transition: 'all 0.2s ease',
              }}
            >
              {status}
            </button>
          ))}
        </div>
      </div>

      {/* Search */}
      <form onSubmit={handleSearch} style={{ marginBottom: '2rem' }}>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <input
            type="text"
            placeholder="Search by patron, barcode, or book title..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ flex: 1, padding: '0.5rem', border: '1px solid #ddd', borderRadius: '4px' }}
          />
          <button type="submit" className="btn btn-primary">Search</button>
        </div>
      </form>

      <div style={{ marginBottom: '1rem', color: '#666' }}>
        Found {borrowings.length} borrowing(s)
      </div>

      {/* Borrowings Table */}
      {borrowings.length === 0 ? (
        <div style={{ padding: '3rem', textAlign: 'center', color: '#666' }}>
          <p>No borrowings found</p>
        </div>
      ) : (
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#f5f5f5' }}>
                <th style={{ padding: '0.75rem', textAlign: 'left', borderBottom: '2px solid #ddd' }}>Patron</th>
                <th style={{ padding: '0.75rem', textAlign: 'left', borderBottom: '2px solid #ddd' }}>Book</th>
                <th style={{ padding: '0.75rem', textAlign: 'left', borderBottom: '2px solid #ddd' }}>Barcode</th>
                <th style={{ padding: '0.75rem', textAlign: 'left', borderBottom: '2px solid #ddd' }}>Checkout Date</th>
                <th style={{ padding: '0.75rem', textAlign: 'left', borderBottom: '2px solid #ddd' }}>Due Date</th>
                <th style={{ padding: '0.75rem', textAlign: 'left', borderBottom: '2px solid #ddd' }}>Status</th>
                <th style={{ padding: '0.75rem', textAlign: 'left', borderBottom: '2px solid #ddd' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {borrowings.map((borrowing) => {
                const overdue = statusFilter === 'active' && isOverdue(borrowing.due_date);
                const daysRemaining = getDaysRemaining(borrowing.due_date);

                return (
                  <tr key={borrowing.borrowing_id} style={{ borderBottom: '1px solid #ddd', background: overdue ? '#fff3cd' : 'white' }}>
                    <td style={{ padding: '0.75rem' }}>
                      <div>
                        <strong>{borrowing.first_name} {borrowing.last_name}</strong>
                        <div style={{ fontSize: '0.875rem', color: '#666' }}>{borrowing.email}</div>
                      </div>
                    </td>
                    <td style={{ padding: '0.75rem' }}>
                      <strong>{borrowing.title}</strong>
                    </td>
                    <td style={{ padding: '0.75rem' }}>{borrowing.barcode}</td>
                    <td style={{ padding: '0.75rem' }}>{formatDate(borrowing.checkout_date)}</td>
                    <td style={{ padding: '0.75rem' }}>
                      <div>
                        {formatDate(borrowing.due_date)}
                        {statusFilter === 'active' && (
                          <div style={{ fontSize: '0.75rem', color: overdue ? '#dc3545' : daysRemaining <= 3 ? '#ffc107' : '#666' }}>
                            {overdue ? (
                              `⚠ ${Math.abs(daysRemaining)} days overdue`
                            ) : daysRemaining <= 3 ? (
                              `⏰ ${daysRemaining} days left`
                            ) : (
                              `${daysRemaining} days`
                            )}
                          </div>
                        )}
                      </div>
                    </td>
                    <td style={{ padding: '0.75rem' }}>
                      <span style={{
                        padding: '0.25rem 0.5rem',
                        borderRadius: '4px',
                        fontSize: '0.875rem',
                        background: borrowing.status === 'returned' ? '#d4edda' : overdue ? '#f8d7da' : '#cfe2ff',
                        color: borrowing.status === 'returned' ? '#155724' : overdue ? '#721c24' : '#084298'
                      }}>
                        {borrowing.status === 'returned' ? 'Returned' : overdue ? 'Overdue' : 'Active'}
                      </span>
                      {borrowing.renewal_count > 0 && (
                        <div style={{ fontSize: '0.75rem', color: '#666', marginTop: '4px' }}>
                          Renewed {borrowing.renewal_count}x
                        </div>
                      )}
                    </td>
                    <td style={{ padding: '0.75rem' }}>
                      {borrowing.status !== 'returned' && (
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                          <button
                            onClick={() => handleReturn(borrowing.borrowing_id)}
                            className="btn"
                            style={{ fontSize: '0.875rem' }}
                            title="Return"
                          >
                            ✓ Return
                          </button>
                          <button
                            onClick={() => handleRenew(borrowing.borrowing_id)}
                            className="btn"
                            style={{ fontSize: '0.875rem' }}
                            title="Renew"
                          >
                            ↻ Renew
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
      )}
    </div>
  );
}

export default BorrowingsManagement;
