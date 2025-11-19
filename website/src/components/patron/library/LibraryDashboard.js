import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { patronLibraryAPI } from '../../../services/api';
import { FaBook, FaBookReader, FaClock, FaExclamationTriangle, FaStar } from 'react-icons/fa';
import '../../../styles/library-dashboard.css';

const LibraryDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [borrowings, setBorrowings] = useState([]);
  const [recommendations, setRecommendations] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchLibraryData();
  }, []);

  const fetchLibraryData = async () => {
    try {
      setLoading(true);
      const [borrowingsRes, recommendationsRes] = await Promise.all([
        patronLibraryAPI.getMyBorrowings('active'),
        patronLibraryAPI.getRecommendations(),
      ]);

      setBorrowings(borrowingsRes.data || []);
      setRecommendations(recommendationsRes.data || []);
    } catch (err) {
      console.error('Error fetching library data:', err);
      setError('Failed to load library data');
    } finally {
      setLoading(false);
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

  const getStatusColor = (dueDate) => {
    const days = getDaysRemaining(dueDate);
    if (days < 0) return 'overdue';
    if (days <= 3) return 'due-soon';
    return 'active';
  };

  if (loading) {
    return (
      <div className="library-dashboard loading">
        <div className="spinner"></div>
        <p>Loading your library...</p>
      </div>
    );
  }

  const activeBorrowings = borrowings.filter(b => b.status === 'active');
  const overdueBorrowings = activeBorrowings.filter(b => isOverdue(b.due_date));

  return (
    <div className="library-dashboard">
      <div className="dashboard-header">
        <h1>My Library</h1>
        <p>Manage your borrowed books and discover new reads</p>
      </div>

      {error && <div className="error-message">{error}</div>}

      {/* Library Stats */}
      <div className="library-stats">
        <div className="stat-card">
          <div className="stat-icon active">
            <FaBookReader />
          </div>
          <div className="stat-content">
            <h3>{activeBorrowings.length}</h3>
            <p>Currently Borrowed</p>
          </div>
        </div>

        <div className="stat-card">
          <div className={`stat-icon ${overdueBorrowings.length > 0 ? 'overdue' : 'ok'}`}>
            {overdueBorrowings.length > 0 ? <FaExclamationTriangle /> : <FaClock />}
          </div>
          <div className="stat-content">
            <h3>{overdueBorrowings.length}</h3>
            <p>Overdue Books</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon recommendations">
            <FaStar />
          </div>
          <div className="stat-content">
            <h3>{recommendations.length}</h3>
            <p>Recommendations</p>
          </div>
        </div>
      </div>

      {/* Current Borrowings */}
      <div className="library-section">
        <div className="section-header">
          <h2>Currently Borrowed</h2>
          <Link to="/patron/library/all-borrowings" className="view-all-link">
            View All →
          </Link>
        </div>

        {activeBorrowings.length === 0 ? (
          <div className="empty-state">
            <FaBook />
            <p>You don't have any books currently borrowed</p>
            <Link to="/patron/library/browse" className="btn btn-primary">
              Browse Books
            </Link>
          </div>
        ) : (
          <div className="borrowings-list">
            {activeBorrowings.slice(0, 5).map((borrowing) => (
              <div key={borrowing.borrowing_id} className={`borrowing-card ${getStatusColor(borrowing.due_date)}`}>
                <div className="book-cover">
                  {borrowing.cover_image_url ? (
                    <img src={borrowing.cover_image_url} alt={borrowing.title} />
                  ) : (
                    <div className="cover-placeholder">
                      <FaBook />
                    </div>
                  )}
                </div>
                <div className="borrowing-info">
                  <h3>{borrowing.title}</h3>
                  {borrowing.subtitle && <p className="subtitle">{borrowing.subtitle}</p>}
                  {borrowing.contributors && borrowing.contributors.length > 0 && (
                    <p className="contributors">
                      by {borrowing.contributors.map(c => c.name).join(', ')}
                    </p>
                  )}
                  <div className="borrowing-meta">
                    <span className="barcode">
                      <strong>Barcode:</strong> {borrowing.barcode}
                    </span>
                    <span className={`due-date ${getStatusColor(borrowing.due_date)}`}>
                      {isOverdue(borrowing.due_date) ? (
                        <>
                          <FaExclamationTriangle /> Overdue by {Math.abs(getDaysRemaining(borrowing.due_date))} days
                        </>
                      ) : getDaysRemaining(borrowing.due_date) <= 3 ? (
                        <>
                          <FaClock /> Due in {getDaysRemaining(borrowing.due_date)} days
                        </>
                      ) : (
                        <>
                          <FaClock /> Due {new Date(borrowing.due_date).toLocaleDateString()}
                        </>
                      )}
                    </span>
                  </div>
                  {borrowing.renewal_count !== undefined && (
                    <p className="renewal-info">
                      Renewed {borrowing.renewal_count} time(s)
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Recommendations */}
      {recommendations.length > 0 && (
        <div className="library-section">
          <div className="section-header">
            <h2>Recommended for You</h2>
            <Link to="/patron/library/browse" className="view-all-link">
              Browse More →
            </Link>
          </div>

          <div className="recommendations-grid">
            {recommendations.slice(0, 4).map((book) => (
              <Link
                key={book.book_id}
                to={`/patron/library/book/${book.book_id}`}
                className="recommendation-card"
              >
                <div className="book-cover">
                  {book.cover_image_url ? (
                    <img src={book.cover_image_url} alt={book.title} />
                  ) : (
                    <div className="cover-placeholder">
                      <FaBook />
                    </div>
                  )}
                </div>
                <div className="book-info">
                  <h4>{book.title}</h4>
                  {book.contributors && book.contributors.length > 0 && (
                    <p className="author">
                      {book.contributors[0].name}
                    </p>
                  )}
                  {book.avg_rating && (
                    <div className="rating">
                      <FaStar /> {parseFloat(book.avg_rating).toFixed(1)}
                    </div>
                  )}
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Quick Actions */}
      <div className="quick-actions">
        <Link to="/patron/library/browse" className="action-btn">
          <FaBook /> Browse Books
        </Link>
        <Link to="/patron/library/all-borrowings" className="action-btn">
          <FaBookReader /> View All Borrowings
        </Link>
      </div>
    </div>
  );
};

export default LibraryDashboard;
