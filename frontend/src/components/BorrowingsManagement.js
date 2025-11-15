import React, { useState, useEffect, useRef } from 'react';
import { adminBorrowingsAPI } from '../services/api';

function BorrowingsManagement() {
  const [searchType, setSearchType] = useState('patron');
  const [searchValue, setSearchValue] = useState('');
  const [borrowings, setBorrowings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showIssueForm, setShowIssueForm] = useState(false);

  // Autocomplete state for patron search
  const [patronSearch, setPatronSearch] = useState('');
  const [patronResults, setPatronResults] = useState([]);
  const [selectedPatron, setSelectedPatron] = useState(null);
  const [showPatronDropdown, setShowPatronDropdown] = useState(false);
  const patronRef = useRef(null);

  // Autocomplete state for book search
  const [bookSearch, setBookSearch] = useState('');
  const [bookResults, setBookResults] = useState([]);
  const [selectedBook, setSelectedBook] = useState(null);
  const [showBookDropdown, setShowBookDropdown] = useState(false);
  const bookRef = useRef(null);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (patronRef.current && !patronRef.current.contains(event.target)) {
        setShowPatronDropdown(false);
      }
      if (bookRef.current && !bookRef.current.contains(event.target)) {
        setShowBookDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Search patrons as user types
  useEffect(() => {
    const searchPatrons = async () => {
      if (patronSearch.length < 2) {
        setPatronResults([]);
        return;
      }

      try {
        const response = await adminBorrowingsAPI.searchPatrons(patronSearch);
        setPatronResults(response.data);
        setShowPatronDropdown(true);
      } catch (err) {
        console.error('Failed to search patrons:', err);
      }
    };

    const timeoutId = setTimeout(searchPatrons, 300);
    return () => clearTimeout(timeoutId);
  }, [patronSearch]);

  // Search books as user types
  useEffect(() => {
    const searchBooks = async () => {
      if (bookSearch.length < 2) {
        setBookResults([]);
        return;
      }

      try {
        const response = await adminBorrowingsAPI.searchBooks(bookSearch);
        setBookResults(response.data);
        setShowBookDropdown(true);
      } catch (err) {
        console.error('Failed to search books:', err);
      }
    };

    const timeoutId = setTimeout(searchBooks, 300);
    return () => clearTimeout(timeoutId);
  }, [bookSearch]);

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

    if (!selectedPatron) {
      alert('Please select a patron');
      return;
    }

    if (!selectedBook) {
      alert('Please select a book');
      return;
    }

    try {
      await adminBorrowingsAPI.issueBook(selectedPatron.patron_id, selectedBook.book_id);
      setShowIssueForm(false);
      setPatronSearch('');
      setBookSearch('');
      setSelectedPatron(null);
      setSelectedBook(null);
      setPatronResults([]);
      setBookResults([]);
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

  const selectPatron = (patron) => {
    setSelectedPatron(patron);
    setPatronSearch(patron.name);
    setShowPatronDropdown(false);
  };

  const selectBook = (book) => {
    setSelectedBook(book);
    setBookSearch(book.title);
    setShowBookDropdown(false);
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
              {/* Patron Autocomplete */}
              <div className="form-group" ref={patronRef}>
                <label>Search Patron by Name *</label>
                <input
                  type="text"
                  value={patronSearch}
                  onChange={(e) => {
                    setPatronSearch(e.target.value);
                    setSelectedPatron(null);
                  }}
                  placeholder="Start typing patron name..."
                  required
                  style={{ width: '100%', padding: '10px' }}
                />
                {showPatronDropdown && patronResults.length > 0 && (
                  <div style={{
                    position: 'absolute',
                    zIndex: 1000,
                    backgroundColor: 'white',
                    border: '1px solid #ddd',
                    borderRadius: '4px',
                    maxHeight: '200px',
                    overflowY: 'auto',
                    width: '100%',
                    marginTop: '2px',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                  }}>
                    {patronResults.map((patron) => (
                      <div
                        key={patron.patron_id}
                        onClick={() => selectPatron(patron)}
                        style={{
                          padding: '10px',
                          cursor: 'pointer',
                          borderBottom: '1px solid #f0f0f0',
                          ':hover': { backgroundColor: '#f5f5f5' }
                        }}
                        onMouseEnter={(e) => e.target.style.backgroundColor = '#f5f5f5'}
                        onMouseLeave={(e) => e.target.style.backgroundColor = 'white'}
                      >
                        <div><strong>{patron.name}</strong></div>
                        <div style={{ fontSize: '12px', color: '#666' }}>
                          {patron.email} | ID: {patron.patron_id}
                        </div>
                        {patron.plan_name && (
                          <div style={{ fontSize: '11px', color: '#888' }}>
                            Plan: {patron.plan_name}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
                {selectedPatron && (
                  <div style={{ marginTop: '5px', padding: '5px', backgroundColor: '#e8f5e9', borderRadius: '3px' }}>
                    <small>Selected: {selectedPatron.name} ({selectedPatron.patron_id})</small>
                  </div>
                )}
              </div>

              {/* Book Autocomplete */}
              <div className="form-group" ref={bookRef}>
                <label>Search Book by Title or ISBN *</label>
                <input
                  type="text"
                  value={bookSearch}
                  onChange={(e) => {
                    setBookSearch(e.target.value);
                    setSelectedBook(null);
                  }}
                  placeholder="Start typing book title or ISBN..."
                  required
                  style={{ width: '100%', padding: '10px' }}
                />
                {showBookDropdown && bookResults.length > 0 && (
                  <div style={{
                    position: 'absolute',
                    zIndex: 1000,
                    backgroundColor: 'white',
                    border: '1px solid #ddd',
                    borderRadius: '4px',
                    maxHeight: '200px',
                    overflowY: 'auto',
                    width: '100%',
                    marginTop: '2px',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                  }}>
                    {bookResults.map((book) => (
                      <div
                        key={book.book_id}
                        onClick={() => selectBook(book)}
                        style={{
                          padding: '10px',
                          cursor: 'pointer',
                          borderBottom: '1px solid #f0f0f0'
                        }}
                        onMouseEnter={(e) => e.target.style.backgroundColor = '#f5f5f5'}
                        onMouseLeave={(e) => e.target.style.backgroundColor = 'white'}
                      >
                        <div><strong>{book.title}</strong></div>
                        <div style={{ fontSize: '12px', color: '#666' }}>
                          {book.author} | ISBN: {book.isbn}
                        </div>
                        <div style={{ fontSize: '11px', color: '#888' }}>
                          Available: {book.available_copies}/{book.total_copies}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                {selectedBook && (
                  <div style={{ marginTop: '5px', padding: '5px', backgroundColor: '#e3f2fd', borderRadius: '3px' }}>
                    <small>Selected: {selectedBook.title} (Available: {selectedBook.available_copies})</small>
                  </div>
                )}
              </div>
            </div>
            <button
              type="submit"
              className="btn btn-success"
              style={{ marginTop: '10px' }}
              disabled={!selectedPatron || !selectedBook}
            >
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
