import React, { useState } from 'react';
import { adminBorrowingsAPI } from '../services/api';

function BorrowingsManagement() {
  const [searchType, setSearchType] = useState('patron');
  const [searchValue, setSearchValue] = useState('');
  const [borrowings, setBorrowings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showIssueForm, setShowIssueForm] = useState(false);
  const [issueForm, setIssueForm] = useState({
    patron_id: '',
    book_id: ''
  });

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchValue) {
      alert('Please enter a search value');
      return;
    }

    try {
      setLoading(true);
      setError('');
      const response = await adminBorrowingsAPI.searchBorrowings(searchType, searchValue, 'active');
      setBorrowings(response.data);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to search borrowings');
      setBorrowings([]);
    } finally {
      setLoading(false);
    }
  };

  const handleIssueBook = async (e) => {
    e.preventDefault();
    try {
      await adminBorrowingsAPI.issueBook(
        parseInt(issueForm.patron_id),
        parseInt(issueForm.book_id)
      );
      setShowIssueForm(false);
      setIssueForm({ patron_id: '', book_id: '' });
      alert('Book issued successfully!');
      // Refresh search if there was a previous search
      if (searchValue) {
        handleSearch(new Event('submit'));
      }
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to issue book');
    }
  };

  const handleRenew = async (borrowingId) => {
    if (window.confirm('Renew this book for 14 more days?')) {
      try {
        const response = await adminBorrowingsAPI.renewBorrowing(borrowingId);
        alert(response.data.message);
        handleSearch(new Event('submit'));
      } catch (err) {
        alert(err.response?.data?.error || 'Failed to renew book');
      }
    }
  };

  const handleReturn = async (borrowingId) => {
    if (window.confirm('Mark this book as returned?')) {
      try {
        await adminBorrowingsAPI.returnBook(borrowingId);
        alert('Book returned successfully!');
        handleSearch(new Event('submit'));
      } catch (err) {
        alert(err.response?.data?.error || 'Failed to return book');
      }
    }
  };

  const loadOverdue = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await adminBorrowingsAPI.getOverdue();
      setBorrowings(response.data);
      setSearchValue('');
    } catch (err) {
      setError('Failed to load overdue borrowings');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h1>Borrowings Management</h1>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button onClick={() => setShowIssueForm(!showIssueForm)} className="btn btn-primary">
            {showIssueForm ? 'Cancel' : 'Issue Book'}
          </button>
          <button onClick={loadOverdue} className="btn btn-danger">
            View Overdue
          </button>
        </div>
      </div>

      {error && <div className="error-message">{error}</div>}

      {/* Issue Book Form */}
      {showIssueForm && (
        <div className="card" style={{ marginBottom: '20px' }}>
          <h3>Issue Book to Patron</h3>
          <form onSubmit={handleIssueBook}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
              <div className="form-group">
                <label>Patron ID *</label>
                <input
                  type="number"
                  value={issueForm.patron_id}
                  onChange={(e) => setIssueForm({...issueForm, patron_id: e.target.value})}
                  required
                  placeholder="Enter patron ID"
                />
              </div>
              <div className="form-group">
                <label>Book ID *</label>
                <input
                  type="number"
                  value={issueForm.book_id}
                  onChange={(e) => setIssueForm({...issueForm, book_id: e.target.value})}
                  required
                  placeholder="Enter book ID"
                />
              </div>
            </div>
            <button type="submit" className="btn btn-success" style={{ marginTop: '10px' }}>
              Issue Book (14 days)
            </button>
          </form>
        </div>
      )}

      {/* Search Form */}
      <div className="card" style={{ marginBottom: '20px' }}>
        <h3>Search Borrowings</h3>
        <form onSubmit={handleSearch}>
          <div style={{ display: 'grid', gridTemplateColumns: '200px 1fr auto', gap: '10px', alignItems: 'end' }}>
            <div className="form-group">
              <label>Search By</label>
              <select
                value={searchType}
                onChange={(e) => setSearchType(e.target.value)}
                style={{ width: '100%', padding: '10px' }}
              >
                <option value="patron">Patron</option>
                <option value="book">Book</option>
              </select>
            </div>
            <div className="form-group">
              <label>
                {searchType === 'patron' ? 'Patron Name, Email, or ID' : 'Book Title, Author, or ISBN'}
              </label>
              <input
                type="text"
                value={searchValue}
                onChange={(e) => setSearchValue(e.target.value)}
                placeholder={searchType === 'patron' ? 'Enter patron details' : 'Enter book details'}
                style={{ width: '100%', padding: '10px' }}
              />
            </div>
            <button type="submit" className="btn btn-primary">
              Search
            </button>
          </div>
        </form>
      </div>

      {/* Results */}
      {loading && <div className="loading">Loading...</div>}

      {!loading && borrowings.length > 0 && (
        <div className="card">
          <h3>Active Borrowings ({borrowings.length})</h3>
          <div style={{ overflowX: 'auto' }}>
            <table>
              <thead>
                <tr>
                  <th>Patron</th>
                  <th>Book</th>
                  <th>Checkout Date</th>
                  <th>Due Date</th>
                  <th>Renewals</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {borrowings.map((borrowing) => {
                  const isOverdue = new Date(borrowing.due_date) < new Date() && borrowing.status === 'active';
                  return (
                    <tr key={borrowing.borrowing_id} style={{ backgroundColor: isOverdue ? '#ffe6e6' : 'transparent' }}>
                      <td>
                        <strong>{borrowing.patron_name}</strong><br />
                        <small>{borrowing.email}</small><br />
                        <small>ID: {borrowing.patron_id}</small>
                      </td>
                      <td>
                        <strong>{borrowing.title}</strong><br />
                        <small>{borrowing.author}</small><br />
                        <small>ISBN: {borrowing.isbn}</small>
                      </td>
                      <td>{new Date(borrowing.checkout_date).toLocaleDateString()}</td>
                      <td>
                        {new Date(borrowing.due_date).toLocaleDateString()}
                        {isOverdue && <span style={{ color: 'red', marginLeft: '5px' }}>(OVERDUE)</span>}
                      </td>
                      <td>{borrowing.renewal_count}/2</td>
                      <td>
                        <span style={{
                          padding: '3px 8px',
                          borderRadius: '3px',
                          fontSize: '12px',
                          backgroundColor: borrowing.status === 'active' ? '#3498db' : '#27ae60',
                          color: 'white'
                        }}>
                          {borrowing.status}
                        </span>
                      </td>
                      <td>
                        <div style={{ display: 'flex', gap: '5px', flexWrap: 'wrap' }}>
                          {borrowing.renewal_count < 2 && (
                            <button
                              onClick={() => handleRenew(borrowing.borrowing_id)}
                              className="btn btn-primary"
                              style={{ fontSize: '12px', padding: '5px 10px' }}
                            >
                              Renew
                            </button>
                          )}
                          <button
                            onClick={() => handleReturn(borrowing.borrowing_id)}
                            className="btn btn-success"
                            style={{ fontSize: '12px', padding: '5px 10px' }}
                          >
                            Return
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {!loading && searchValue && borrowings.length === 0 && (
        <div className="card">
          <p style={{ textAlign: 'center', color: '#666' }}>No borrowings found</p>
        </div>
      )}
    </div>
  );
}

export default BorrowingsManagement;
