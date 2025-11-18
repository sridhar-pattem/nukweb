import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { adminBooksAPI, adminItemsAPI } from '../services/api';

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

  const handleAddItem = async () => {
    const barcode = prompt('Enter barcode for the new item:');
    if (!barcode || barcode.trim() === '') return;

    const callNumber = prompt('Enter call number (optional):', book.call_number || '');
    const shelfLocation = prompt('Enter shelf location (optional):', '');

    try {
      await adminItemsAPI.addItem({
        book_id: book.book_id,
        barcode: barcode.trim(),
        call_number: callNumber || null,
        shelf_location: shelfLocation || null,
        circulation_status: 'available',
        condition: 'good'
      });
      await loadBookDetails();
      alert('Item added successfully!');
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to add item');
    }
  };

  const handleRemoveItem = async () => {
    if (!book.items || book.items.length === 0) {
      alert('No items to remove');
      return;
    }

    // Show list of items to choose from
    const itemList = book.items.map(item =>
      `${item.barcode} - ${item.circulation_status}${item.is_borrowed ? ' (BORROWED)' : ''}`
    ).join('\n');

    const barcode = prompt(`Select item to remove by entering barcode:\n\n${itemList}`);
    if (!barcode) return;

    const itemToRemove = book.items.find(i => i.barcode === barcode.trim());
    if (!itemToRemove) {
      alert('Item not found');
      return;
    }

    if (itemToRemove.is_borrowed) {
      alert('Cannot remove item that is currently borrowed');
      return;
    }

    if (!window.confirm(`Remove item ${barcode}?`)) return;

    try {
      await adminItemsAPI.deleteItem(itemToRemove.item_id);
      await loadBookDetails();
      alert('Item removed successfully!');
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to remove item');
    }
  };

  const handleUpdateItemStatus = async (itemId, newStatus) => {
    try {
      await adminItemsAPI.updateItemStatus(itemId, newStatus);
      await loadBookDetails();
      alert(`Item status updated to ${newStatus}`);
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to update item status');
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
                  <span className="stat-label">Available Items:</span>
                  <span className="stat-value" style={{ fontSize: '24px', fontWeight: 'bold', color: '#667eea' }}>
                    {book.available_items || 0} / {book.total_items || 0}
                  </span>
                </div>
                {book.checked_out_items > 0 && (
                  <div className="availability-stat">
                    <span className="stat-label">Checked Out:</span>
                    <span className="stat-value" style={{ fontSize: '18px', color: '#e74c3c' }}>
                      {book.checked_out_items}
                    </span>
                  </div>
                )}
                {book.on_hold_items > 0 && (
                  <div className="availability-stat">
                    <span className="stat-label">On Hold:</span>
                    <span className="stat-value" style={{ fontSize: '18px', color: '#ff9800' }}>
                      {book.on_hold_items}
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

          {/* Items List */}
          {book.items && book.items.length > 0 && (
            <div className="book-items">
              <h3>Items ({book.items.length})</h3>
              <div style={{ overflowX: 'auto' }}>
                <table>
                  <thead>
                    <tr>
                      <th>Barcode</th>
                      <th>Call Number</th>
                      <th>Status</th>
                      <th>Condition</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {book.items.map((item) => (
                      <tr key={item.item_id}>
                        <td><code>{item.barcode}</code></td>
                        <td>{item.call_number || '-'}</td>
                        <td>
                          <span style={{
                            padding: '3px 8px',
                            borderRadius: '3px',
                            fontSize: '12px',
                            backgroundColor: item.circulation_status === 'available' ? '#27ae60' :
                                           item.circulation_status === 'checked_out' ? '#e74c3c' : '#95a5a6',
                            color: 'white'
                          }}>
                            {item.circulation_status.replace('_', ' ')}
                          </span>
                          {item.is_borrowed && <small style={{ marginLeft: '5px', color: '#e74c3c' }}>(Borrowed)</small>}
                        </td>
                        <td>{item.condition || '-'}</td>
                        <td>
                          <div style={{ display: 'flex', gap: '5px', flexWrap: 'wrap' }}>
                            {item.circulation_status !== 'available' && !item.is_borrowed && (
                              <button
                                onClick={() => handleUpdateItemStatus(item.item_id, 'available')}
                                className="btn btn-success"
                                style={{ fontSize: '11px', padding: '4px 8px' }}
                              >
                                Mark Available
                              </button>
                            )}
                            {item.circulation_status === 'available' && (
                              <>
                                <button
                                  onClick={() => handleUpdateItemStatus(item.item_id, 'lost')}
                                  className="btn btn-danger"
                                  style={{ fontSize: '11px', padding: '4px 8px' }}
                                >
                                  Lost
                                </button>
                                <button
                                  onClick={() => handleUpdateItemStatus(item.item_id, 'damaged')}
                                  className="btn btn-danger"
                                  style={{ fontSize: '11px', padding: '4px 8px' }}
                                >
                                  Damaged
                                </button>
                              </>
                            )}
                          </div>
                        </td>
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
                onClick={handleAddItem}
                className="btn btn-success"
              >
                Add Item (Copy)
              </button>
              <button
                onClick={handleRemoveItem}
                className="btn btn-secondary"
                disabled={!book.items || book.items.length === 0}
              >
                Remove Item
              </button>
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
