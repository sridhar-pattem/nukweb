import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { adminBooksAPI } from '../services/api';

function BookDetail() {
  const { bookId } = useParams();
  const navigate = useNavigate();
  const [book, setBook] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadBookDetails();
  }, [bookId]);

  const loadBookDetails = async () => {
    try {
      setLoading(true);
      const response = await adminBooksAPI.getBookDetails(bookId);
      setBook(response.data);
      setError('');
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to load book details');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (status) => {
    if (window.confirm(`Mark this book as ${status}?`)) {
      try {
        await adminBooksAPI.updateBookStatus(book.book_id, status);
        await loadBookDetails();
        alert(`Book status updated to ${status}`);
      } catch (err) {
        alert('Failed to update book status');
      }
    }
  };

  const handleUpdateCopies = async (action) => {
    const count = parseInt(prompt(`How many copies to ${action}?`, '1'));
    if (!count || count <= 0) return;

    try {
      await adminBooksAPI.updateCopies(book.book_id, action, count);
      await loadBookDetails();
      alert(`Book copies ${action === 'add' ? 'added' : 'removed'} successfully!`);
    } catch (err) {
      alert(err.response?.data?.error || `Failed to ${action} copies`);
    }
  };

  if (loading) {
    return <div className="loading">Loading book details...</div>;
  }

  if (error) {
    return (
      <div>
        <div className="error-message">{error}</div>
        <button onClick={() => navigate(-1)} className="btn btn-secondary">
          Go Back
        </button>
      </div>
    );
  }

  if (!book) {
    return <div>Book not found</div>;
  }

  const defaultCover = 'https://via.placeholder.com/200x300?text=No+Cover';

  return (
    <div className="book-detail-container">
      <button onClick={() => navigate(-1)} className="btn btn-secondary" style={{ marginBottom: '20px' }}>
        ← Back to Catalogue
      </button>

      <div className="book-detail-content">
        {/* Book Cover */}
        <div className="book-cover-section">
          <img
            src={book.cover_image_url || defaultCover}
            alt={book.title}
            className="book-cover-large"
            onError={(e) => { e.target.src = defaultCover; }}
          />
        </div>

        {/* Book Information */}
        <div className="book-info-section">
          <h1>{book.title}</h1>
          <p className="book-author">by {book.author || 'Unknown Author'}</p>

          <div className="book-meta">
            <div className="meta-item">
              <strong>ISBN:</strong> {book.isbn}
            </div>
            <div className="meta-item">
              <strong>Collection:</strong> {book.collection_name}
            </div>
            {book.genre && (
              <div className="meta-item">
                <strong>Genre:</strong> {book.genre}
              </div>
            )}
            {book.sub_genre && (
              <div className="meta-item">
                <strong>Sub-Genre:</strong> {book.sub_genre}
              </div>
            )}
            {book.publisher && (
              <div className="meta-item">
                <strong>Publisher:</strong> {book.publisher}
              </div>
            )}
            {book.publication_year && (
              <div className="meta-item">
                <strong>Published:</strong> {book.publication_year}
              </div>
            )}
            {book.age_rating && (
              <div className="meta-item">
                <strong>Age Rating:</strong> {book.age_rating}
              </div>
            )}
          </div>

          {/* Status and Availability */}
          <div className="book-availability">
            <div className="availability-card">
              <h3>Availability</h3>
              <div className="availability-info">
                <div className="availability-stat">
                  <span className="stat-label">Status:</span>
                  <span
                    className="stat-value"
                    style={{
                      padding: '5px 12px',
                      borderRadius: '5px',
                      backgroundColor: book.status === 'Available' ? '#27ae60' : '#e74c3c',
                      color: 'white',
                      fontSize: '14px'
                    }}
                  >
                    {book.status}
                  </span>
                </div>
                <div className="availability-stat">
                  <span className="stat-label">Available Copies:</span>
                  <span className="stat-value" style={{ fontSize: '24px', fontWeight: 'bold', color: '#667eea' }}>
                    {book.available_copies} / {book.total_copies}
                  </span>
                </div>
                {book.is_checked_out && (
                  <div className="availability-stat">
                    <span
                      style={{
                        padding: '4px 10px',
                        borderRadius: '4px',
                        backgroundColor: '#ff9800',
                        color: 'white',
                        fontSize: '12px'
                      }}
                    >
                      Currently Checked Out
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Description */}
          {book.description && (
            <div className="book-description">
              <h3>Description</h3>
              <p>{book.description}</p>
            </div>
          )}

          {/* Active Borrowings */}
          {book.active_borrowings && book.active_borrowings.length > 0 && (
            <div className="active-borrowings">
              <h3>Currently Borrowed By</h3>
              <div style={{ overflowX: 'auto' }}>
                <table>
                  <thead>
                    <tr>
                      <th>Patron</th>
                      <th>Checkout Date</th>
                      <th>Due Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {book.active_borrowings.map((borrowing) => (
                      <tr key={borrowing.borrowing_id}>
                        <td>
                          <span
                            style={{ color: '#667eea', cursor: 'pointer', textDecoration: 'underline' }}
                            onClick={() => navigate(`/admin/patron-management?patronId=${borrowing.patron_id}`)}
                          >
                            {borrowing.patron_name} ({borrowing.patron_id})
                          </span>
                        </td>
                        <td>{new Date(borrowing.checkout_date).toLocaleDateString()}</td>
                        <td>{new Date(borrowing.due_date).toLocaleDateString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="book-actions">
            <h3>Actions</h3>
            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
              <button
                onClick={() => handleUpdateCopies('add')}
                className="btn btn-success"
              >
                Add Copies
              </button>
              <button
                onClick={() => handleUpdateCopies('remove')}
                className="btn btn-secondary"
                disabled={book.total_copies <= 0}
              >
                Remove Copies
              </button>
              {book.status === 'Available' && (
                <button
                  onClick={() => handleUpdateStatus('Lost')}
                  className="btn btn-danger"
                >
                  Mark as Lost
                </button>
              )}
              {book.status === 'Available' && (
                <button
                  onClick={() => handleUpdateStatus('Damaged')}
                  className="btn btn-danger"
                >
                  Mark as Damaged
                </button>
              )}
              {book.status !== 'Available' && book.status !== 'Phased Out' && (
                <button
                  onClick={() => handleUpdateStatus('Available')}
                  className="btn btn-success"
                >
                  Mark as Available
                </button>
              )}
            </div>
          </div>

          {/* Metadata */}
          <div className="book-metadata">
            <small style={{ color: '#999' }}>
              Added: {new Date(book.created_at).toLocaleDateString()} |
              Last Updated: {new Date(book.updated_at).toLocaleDateString()}
            </small>
          </div>
        </div>
      </div>
    </div>
  );
}

export default BookDetail;
