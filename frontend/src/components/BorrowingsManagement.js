import React, { useState, useEffect, useRef } from 'react';
import { adminBorrowingsAPI } from '../services/api';

function BorrowingsManagement() {
  const [borrowings, setBorrowings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showIssueForm, setShowIssueForm] = useState(false);

  // Filters
  const [patronFilter, setPatronFilter] = useState('');
  const [bookFilter, setBookFilter] = useState('');

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

  // History modal
  const [showHistory, setShowHistory] = useState(false);
  const [historyData, setHistoryData] = useState([]);
  const [historyTitle, setHistoryTitle] = useState('');

  // Load all borrowings on mount
  useEffect(() => {
    loadAllBorrowings();
  }, []);

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

  const loadAllBorrowings = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await adminBorrowingsAPI.getAllBorrowings(patronFilter, bookFilter);
      setBorrowings(response.data);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to load borrowings');
    } finally {
      setLoading(false);
    }
  };

  const handleFilter = () => {
    loadAllBorrowings();
  };

  const handleClearFilters = () => {
    setPatronFilter('');
    setBookFilter('');
    setTimeout(() => loadAllBorrowings(), 0);
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

    if (selectedBook.available_copies <= 0) {
      alert('No copies available for this book');
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
      loadAllBorrowings();
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to issue book');
    }
  };

  const handleRenew = async (borrowingId) => {
    if (window.confirm('Renew this book for 14 more days?')) {
      try {
        const response = await adminBorrowingsAPI.renewBorrowing(borrowingId);
        alert(response.data.message);
        loadAllBorrowings();
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
        loadAllBorrowings();
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
      setPatronFilter('');
      setBookFilter('');
    } catch (err) {
      setError('Failed to load overdue borrowings');
    } finally {
      setLoading(false);
    }
  };

  const showPatronHistory = async (patronId, patronName) => {
    try {
      setLoading(true);
      const response = await adminBorrowingsAPI.getBorrowingHistory(patronId, null);
      setHistoryData(response.data);
      setHistoryTitle(`Borrowing History - ${patronName}`);
      setShowHistory(true);
    } catch (err) {
      alert('Failed to load history');
    } finally {
      setLoading(false);
    }
  };

  const showBookHistory = async (bookId, bookTitle) => {
    try {
      setLoading(true);
      const response = await adminBorrowingsAPI.getBorrowingHistory(null, bookId);
      setHistoryData(response.data);
      setHistoryTitle(`Borrowing History - ${bookTitle}`);
      setShowHistory(true);
    } catch (err) {
      alert('Failed to load history');
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
                    width: 'calc(50% - 15px)',
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
                          borderBottom: '1px solid #f0f0f0'
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
                    width: 'calc(50% - 15px)',
                    marginTop: '2px',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                  }}>
                    {bookResults.map((book) => (
                      <div
                        key={book.book_id}
                        onClick={() => selectBook(book)}
                        style={{
                          padding: '10px',
                          cursor: book.available_copies > 0 ? 'pointer' : 'not-allowed',
                          borderBottom: '1px solid #f0f0f0',
                          backgroundColor: book.available_copies === 0 ? '#ffebee' : 'white',
                          opacity: book.available_copies === 0 ? 0.6 : 1
                        }}
                        onMouseEnter={(e) => {
                          if (book.available_copies > 0) {
                            e.target.style.backgroundColor = '#f5f5f5';
                          }
                        }}
                        onMouseLeave={(e) => {
                          if (book.available_copies > 0) {
                            e.target.style.backgroundColor = 'white';
                          } else {
                            e.target.style.backgroundColor = '#ffebee';
                          }
                        }}
                      >
                        <div>
                          <strong>{book.title}</strong>
                          {book.available_copies === 0 && (
                            <span style={{ color: 'red', marginLeft: '5px', fontSize: '11px' }}>
                              (All Checked Out)
                            </span>
                          )}
                        </div>
                        <div style={{ fontSize: '12px', color: '#666' }}>
                          {book.author} | ISBN: {book.isbn}
                        </div>
                        <div style={{ fontSize: '11px', color: book.available_copies === 0 ? '#d32f2f' : '#388e3c' }}>
                          Available: {book.available_copies}/{book.total_copies}
                          {book.earliest_due_date && book.available_copies === 0 && (
                            <span> | Next available: {new Date(book.earliest_due_date).toLocaleDateString()}</span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                {selectedBook && (
                  <div style={{
                    marginTop: '5px',
                    padding: '5px',
                    backgroundColor: selectedBook.available_copies > 0 ? '#e3f2fd' : '#ffebee',
                    borderRadius: '3px'
                  }}>
                    <small>
                      Selected: {selectedBook.title}
                      {selectedBook.available_copies > 0 ? (
                        ` (Available: ${selectedBook.available_copies})`
                      ) : (
                        <span style={{ color: 'red' }}> (No copies available!)</span>
                      )}
                    </small>
                  </div>
                )}
              </div>
            </div>
            <button
              type="submit"
              className="btn btn-success"
              style={{ marginTop: '10px' }}
              disabled={!selectedPatron || !selectedBook || selectedBook.available_copies === 0}
            >
              Issue Book (14 days)
            </button>
          </form>
        </div>
      )}

      {/* Filter Section */}
      <div className="card" style={{ marginBottom: '20px' }}>
        <h3>Filter Borrowings</h3>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr auto auto', gap: '10px', alignItems: 'end' }}>
          <div className="form-group">
            <label>Patron Name</label>
            <input
              type="text"
              value={patronFilter}
              onChange={(e) => setPatronFilter(e.target.value)}
              placeholder="Filter by patron name..."
              style={{ width: '100%', padding: '10px' }}
            />
          </div>
          <div className="form-group">
            <label>Book Title</label>
            <input
              type="text"
              value={bookFilter}
              onChange={(e) => setBookFilter(e.target.value)}
              placeholder="Filter by book title..."
              style={{ width: '100%', padding: '10px' }}
            />
          </div>
          <button onClick={handleFilter} className="btn btn-primary">
            Apply Filters
          </button>
          <button onClick={handleClearFilters} className="btn btn-secondary">
            Clear
          </button>
        </div>
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
                        <small>ID: {borrowing.patron_id}</small><br />
                        <button
                          onClick={() => showPatronHistory(borrowing.patron_id, borrowing.patron_name)}
                          className="btn btn-secondary"
                          style={{ fontSize: '10px', padding: '2px 6px', marginTop: '3px' }}
                        >
                          View History
                        </button>
                      </td>
                      <td>
                        <strong>{borrowing.title}</strong><br />
                        <small>{borrowing.author}</small><br />
                        <small>ISBN: {borrowing.isbn}</small><br />
                        <button
                          onClick={() => showBookHistory(borrowing.book_id, borrowing.title)}
                          className="btn btn-secondary"
                          style={{ fontSize: '10px', padding: '2px 6px', marginTop: '3px' }}
                        >
                          View History
                        </button>
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
                          {borrowing.renewal_count < 2 && borrowing.status === 'active' && (
                            <button
                              onClick={() => handleRenew(borrowing.borrowing_id)}
                              className="btn btn-primary"
                              style={{ fontSize: '12px', padding: '5px 10px' }}
                            >
                              Renew
                            </button>
                          )}
                          {borrowing.status === 'active' && (
                            <button
                              onClick={() => handleReturn(borrowing.borrowing_id)}
                              className="btn btn-success"
                              style={{ fontSize: '12px', padding: '5px 10px' }}
                            >
                              Return
                            </button>
                          )}
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

      {!loading && borrowings.length === 0 && (
        <div className="card">
          <p style={{ textAlign: 'center', color: '#666' }}>
            {patronFilter || bookFilter ? 'No borrowings match the filters' : 'No active borrowings'}
          </p>
        </div>
      )}

      {/* History Modal */}
      {showHistory && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.5)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 2000
        }}>
          <div style={{
            backgroundColor: 'white',
            padding: '20px',
            borderRadius: '8px',
            maxWidth: '900px',
            width: '90%',
            maxHeight: '80vh',
            overflow: 'auto'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
              <h2>{historyTitle}</h2>
              <button onClick={() => setShowHistory(false)} className="btn btn-secondary">
                Close
              </button>
            </div>
            <div style={{ overflowX: 'auto' }}>
              <table>
                <thead>
                  <tr>
                    <th>Book/Patron</th>
                    <th>Checkout</th>
                    <th>Due Date</th>
                    <th>Return Date</th>
                    <th>Renewals</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {historyData.map((record, idx) => (
                    <tr key={idx}>
                      <td>
                        {record.title ? (
                          <>
                            <strong>{record.title}</strong><br />
                            <small>{record.author}</small>
                          </>
                        ) : (
                          <>
                            <strong>{record.patron_name}</strong><br />
                            <small>{record.email}</small>
                          </>
                        )}
                      </td>
                      <td>{new Date(record.checkout_date).toLocaleDateString()}</td>
                      <td>{new Date(record.due_date).toLocaleDateString()}</td>
                      <td>{record.return_date ? new Date(record.return_date).toLocaleDateString() : 'Not returned'}</td>
                      <td>{record.renewal_count}/2</td>
                      <td>
                        <span style={{
                          padding: '3px 8px',
                          borderRadius: '3px',
                          fontSize: '11px',
                          backgroundColor: record.status === 'active' ? '#3498db' : record.status === 'returned' ? '#27ae60' : '#95a5a6',
                          color: 'white'
                        }}>
                          {record.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default BorrowingsManagement;
