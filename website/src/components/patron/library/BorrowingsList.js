import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { patronLibraryAPI } from '../../../services/api';
import { FaBook, FaClock, FaExclamationTriangle, FaSearch } from 'react-icons/fa';
import '../../../styles/library-dashboard.css';

const BorrowingsList = () => {
  const [loading, setLoading] = useState(true);
  const [borrowings, setBorrowings] = useState([]);
  const [filteredBorrowings, setFilteredBorrowings] = useState([]);
  const [activeTab, setActiveTab] = useState('active');
  const [searchTerm, setSearchTerm] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    fetchBorrowings(activeTab);
  }, [activeTab]);

  useEffect(() => {
    filterBorrowings();
  }, [searchTerm, borrowings]);

  const fetchBorrowings = async (status) => {
    try {
      setLoading(true);
      const response = await patronLibraryAPI.getMyBorrowings(status);
      setBorrowings(response.data || []);
      setFilteredBorrowings(response.data || []);
    } catch (err) {
      console.error('Error fetching borrowings:', err);
      setError('Failed to load borrowings');
    } finally {
      setLoading(false);
    }
  };

  const filterBorrowings = () => {
    if (!searchTerm) {
      setFilteredBorrowings(borrowings);
      return;
    }

    const filtered = borrowings.filter((borrowing) => {
      const searchLower = searchTerm.toLowerCase();
      return (
        borrowing.title.toLowerCase().includes(searchLower) ||
        borrowing.subtitle?.toLowerCase().includes(searchLower) ||
        borrowing.isbn?.toLowerCase().includes(searchLower) ||
        borrowing.barcode?.toLowerCase().includes(searchLower) ||
        borrowing.contributors?.some(c => c.name.toLowerCase().includes(searchLower))
      );
    });
    setFilteredBorrowings(filtered);
  };

  const isOverdue = (dueDate) => {
    return new Date(dueDate) < new Date();
  };

  const getDaysRemaining = (dueDate) => {
    const diff = new Date(dueDate) - new Date();
    const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
    return days;
  };

  const getStatusColor = (borrowing) => {
    if (borrowing.status === 'returned') return 'returned';
    if (borrowing.status === 'lost') return 'lost';
    const days = getDaysRemaining(borrowing.due_date);
    if (days < 0) return 'overdue';
    if (days <= 3) return 'due-soon';
    return 'active';
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const tabs = [
    { id: 'active', label: 'Active', count: null },
    { id: 'returned', label: 'History', count: null },
  ];

  if (loading) {
    return (
      <div className="library-dashboard loading">
        <div className="spinner"></div>
        <p>Loading your borrowings...</p>
      </div>
    );
  }

  return (
    <div className="library-dashboard">
      <div className="dashboard-header">
        <h1>My Borrowings</h1>
        <p>View and manage all your book borrowings</p>
      </div>

      {error && <div className="error-message">{error}</div>}

      {/* Tabs */}
      <div className="borrowings-tabs">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            className={`tab-button ${activeTab === tab.id ? 'active' : ''}`}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Search and Filter */}
      <div className="borrowings-toolbar">
        <div className="search-box">
          <FaSearch />
          <input
            type="text"
            placeholder="Search by title, author, ISBN, or barcode..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Borrowings List */}
      {filteredBorrowings.length === 0 ? (
        <div className="empty-state">
          <FaBook />
          <p>
            {searchTerm
              ? 'No borrowings match your search'
              : activeTab === 'active'
              ? "You don't have any active borrowings"
              : "You haven't borrowed any books yet"}
          </p>
          {!searchTerm && activeTab === 'active' && (
            <Link to="/patron/library/browse" className="btn btn-primary">
              Browse Books
            </Link>
          )}
        </div>
      ) : (
        <div className="borrowings-detailed-list">
          {filteredBorrowings.map((borrowing) => (
            <div
              key={borrowing.borrowing_id}
              className={`borrowing-detailed-card ${getStatusColor(borrowing)}`}
            >
              <div className="book-cover">
                {borrowing.cover_image_url ? (
                  <img src={borrowing.cover_image_url} alt={borrowing.title} />
                ) : (
                  <div className="cover-placeholder">
                    <FaBook />
                  </div>
                )}
              </div>

              <div className="borrowing-detailed-info">
                <div className="book-header">
                  <div>
                    <Link
                      to={`/patron/library/book/${borrowing.book_id}`}
                      className="book-title-link"
                    >
                      <h3>{borrowing.title}</h3>
                    </Link>
                    {borrowing.subtitle && (
                      <p className="subtitle">{borrowing.subtitle}</p>
                    )}
                    {borrowing.contributors && borrowing.contributors.length > 0 && (
                      <p className="contributors">
                        by {borrowing.contributors.map((c) => c.name).join(', ')}
                      </p>
                    )}
                  </div>
                  <div className={`status-badge ${getStatusColor(borrowing)}`}>
                    {borrowing.status === 'returned'
                      ? 'Returned'
                      : isOverdue(borrowing.due_date)
                      ? 'Overdue'
                      : borrowing.status === 'active'
                      ? 'Active'
                      : borrowing.status}
                  </div>
                </div>

                <div className="borrowing-detailed-meta">
                  <div className="meta-row">
                    <div className="meta-item">
                      <strong>Barcode:</strong> {borrowing.barcode}
                    </div>
                    {borrowing.call_number && (
                      <div className="meta-item">
                        <strong>Call Number:</strong> {borrowing.call_number}
                      </div>
                    )}
                    {borrowing.isbn && (
                      <div className="meta-item">
                        <strong>ISBN:</strong> {borrowing.isbn}
                      </div>
                    )}
                  </div>

                  <div className="meta-row">
                    <div className="meta-item">
                      <strong>Checked Out:</strong>{' '}
                      {formatDate(borrowing.checkout_date)}
                    </div>
                    <div className="meta-item">
                      <strong>Due Date:</strong> {formatDate(borrowing.due_date)}
                      {borrowing.status === 'active' && (
                        <span className={`due-indicator ${getStatusColor(borrowing)}`}>
                          {isOverdue(borrowing.due_date) ? (
                            <>
                              {' '}
                              <FaExclamationTriangle /> Overdue by{' '}
                              {Math.abs(getDaysRemaining(borrowing.due_date))} days
                            </>
                          ) : getDaysRemaining(borrowing.due_date) <= 3 ? (
                            <>
                              {' '}
                              <FaClock /> Due in {getDaysRemaining(borrowing.due_date)}{' '}
                              days
                            </>
                          ) : (
                            <>
                              {' '}
                              <FaClock /> {getDaysRemaining(borrowing.due_date)} days
                              remaining
                            </>
                          )}
                        </span>
                      )}
                    </div>
                    {borrowing.return_date && (
                      <div className="meta-item">
                        <strong>Returned:</strong> {formatDate(borrowing.return_date)}
                      </div>
                    )}
                  </div>

                  {borrowing.renewal_count > 0 && (
                    <div className="meta-row">
                      <div className="meta-item renewal-badge">
                        Renewed {borrowing.renewal_count} time(s)
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Summary */}
      {filteredBorrowings.length > 0 && (
        <div className="borrowings-summary">
          <p>
            Showing {filteredBorrowings.length} of {borrowings.length} borrowing(s)
          </p>
        </div>
      )}
    </div>
  );
};

export default BorrowingsList;
