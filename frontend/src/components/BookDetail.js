import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { adminBooksAPI, adminItemsAPI, adminContributorsAPI } from '../services/api';
import TagInput from './common/TagInput';

function BookDetail() {
  const { bookId } = useParams();
  const navigate = useNavigate();
  const [book, setBook] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showEditForm, setShowEditForm] = useState(false);
  const [showAddContributor, setShowAddContributor] = useState(false);
  const [contributorSearch, setContributorSearch] = useState('');
  const [contributorResults, setContributorResults] = useState([]);
  const [editFormData, setEditFormData] = useState(null);
  const [ageRatings, setAgeRatings] = useState([]);

  useEffect(() => {
    loadBookDetails();
    loadAgeRatings();
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

  const loadAgeRatings = async () => {
    try {
      const response = await adminBooksAPI.getAgeRatings();
      setAgeRatings(response.data || []);
    } catch (err) {
      console.error('Failed to load age ratings:', err);
      setAgeRatings([]);
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

  const handleEditBook = () => {
    setEditFormData({
      title: book.title || '',
      subtitle: book.subtitle || '',
      isbn: book.isbn || '',
      publisher: book.publisher || '',
      publication_year: book.publication_year || '',
      description: book.description || '',
      language: book.language || 'eng',
      age_rating: book.age_rating || '',
      cover_image_url: book.cover_image_url || '',
      collection_id: book.collection_id || '',
      tags: book.tags || []
    });
    setShowEditForm(true);
  };

  const handleSaveEdit = async (e) => {
    e.preventDefault();
    try {
      await adminBooksAPI.updateBook(book.book_id, editFormData);
      setShowEditForm(false);
      await loadBookDetails();
      alert('Book updated successfully!');
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to update book');
    }
  };

  const handleSearchContributors = async (query) => {
    setContributorSearch(query);
    if (query.length < 2) {
      setContributorResults([]);
      return;
    }

    try {
      const response = await adminContributorsAPI.searchContributors(query);
      setContributorResults(response.data);
    } catch (err) {
      console.error('Failed to search contributors:', err);
    }
  };

  const handleAddContributor = async (contributor, role) => {
    const sequence = (book.contributors || []).filter(c => c.role === role).length + 1;

    try {
      await adminBooksAPI.addBookContributor(book.book_id, {
        contributor_id: contributor.contributor_id,
        role: role,
        sequence_number: sequence
      });
      await loadBookDetails();
      setShowAddContributor(false);
      setContributorSearch('');
      setContributorResults([]);
      alert('Contributor added successfully!');
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to add contributor');
    }
  };

  const handleRemoveContributor = async (bookContributorId) => {
    if (!window.confirm('Remove this contributor?')) return;

    try {
      await adminBooksAPI.removeBookContributor(book.book_id, bookContributorId);
      await loadBookDetails();
      alert('Contributor removed successfully!');
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to remove contributor');
    }
  };

  const getContributorDisplay = (contributors) => {
    if (!contributors || !Array.isArray(contributors) || contributors.length === 0) {
      return 'Unknown';
    }
    const authors = contributors.filter(c => c && c.role === 'author');
    if (authors.length > 0) {
      return authors.map(a => a.name).join(', ');
    }
    return contributors[0] && contributors[0].name ? contributors[0].name : 'Unknown';
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
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <button onClick={() => navigate(-1)} className="btn btn-secondary">
          ← Back to Catalogue
        </button>
        <button onClick={handleEditBook} className="btn btn-primary">
          Edit Book Details
        </button>
      </div>

      {showEditForm && editFormData && (
        <div className="card" style={{ marginBottom: '20px', padding: '20px' }}>
          <h3>Edit Book Details</h3>
          <form onSubmit={handleSaveEdit}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
              <div className="form-group">
                <label>Title *</label>
                <input
                  type="text"
                  value={editFormData.title}
                  onChange={(e) => setEditFormData({...editFormData, title: e.target.value})}
                  required
                />
              </div>
              <div className="form-group">
                <label>Subtitle</label>
                <input
                  type="text"
                  value={editFormData.subtitle}
                  onChange={(e) => setEditFormData({...editFormData, subtitle: e.target.value})}
                />
              </div>
              <div className="form-group">
                <label>ISBN</label>
                <input
                  type="text"
                  value={editFormData.isbn}
                  onChange={(e) => setEditFormData({...editFormData, isbn: e.target.value})}
                />
              </div>
              <div className="form-group">
                <label>Publisher</label>
                <input
                  type="text"
                  value={editFormData.publisher}
                  onChange={(e) => setEditFormData({...editFormData, publisher: e.target.value})}
                />
              </div>
              <div className="form-group">
                <label>Publication Year</label>
                <input
                  type="number"
                  value={editFormData.publication_year}
                  onChange={(e) => setEditFormData({...editFormData, publication_year: e.target.value})}
                />
              </div>
              <div className="form-group">
                <label>Language</label>
                <input
                  type="text"
                  value={editFormData.language}
                  onChange={(e) => setEditFormData({...editFormData, language: e.target.value})}
                />
              </div>
              <div className="form-group">
                <label>Age Rating</label>
                <select
                  value={editFormData.age_rating}
                  onChange={(e) => setEditFormData({...editFormData, age_rating: e.target.value})}
                >
                  <option value="">Select Age Rating</option>
                  {ageRatings.map((rating) => (
                    <option key={rating.rating_id} value={rating.rating_name}>
                      {rating.rating_name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                <label>Cover Image URL</label>
                <input
                  type="url"
                  value={editFormData.cover_image_url}
                  onChange={(e) => setEditFormData({...editFormData, cover_image_url: e.target.value})}
                />
              </div>
              <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                <label>Description</label>
                <textarea
                  value={editFormData.description}
                  onChange={(e) => setEditFormData({...editFormData, description: e.target.value})}
                  rows="4"
                />
              </div>
              <div style={{ gridColumn: '1 / -1' }}>
                <TagInput
                  tags={editFormData.tags}
                  onChange={(newTags) => setEditFormData({...editFormData, tags: newTags})}
                  placeholder="Add tags for searchability (e.g., fiction, adventure, young-adult)"
                />
              </div>
            </div>
            <div style={{ marginTop: '15px', display: 'flex', gap: '10px' }}>
              <button type="submit" className="btn btn-success">Save Changes</button>
              <button type="button" onClick={() => setShowEditForm(false)} className="btn btn-secondary">Cancel</button>
            </div>
          </form>
        </div>
      )}

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
          {book.subtitle && <h3 style={{ color: '#666', fontWeight: 'normal', marginTop: '-10px' }}>{book.subtitle}</h3>}
          <p className="book-author">by {getContributorDisplay(book.contributors)}</p>

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

          {/* Tags Display */}
          {book.tags && book.tags.length > 0 && (
            <div style={{ marginTop: '15px' }}>
              <strong>Tags:</strong>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginTop: '0.5rem' }}>
                {book.tags.map((tag, index) => (
                  <span
                    key={index}
                    style={{
                      display: 'inline-block',
                      padding: '0.25rem 0.75rem',
                      background: '#e3f2fd',
                      color: '#1976d2',
                      borderRadius: '16px',
                      fontSize: '0.875rem',
                      fontWeight: '500'
                    }}
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}

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

          {/* Contributors Section */}
          <div className="book-contributors" style={{ marginTop: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3>Contributors</h3>
              <button
                onClick={() => setShowAddContributor(!showAddContributor)}
                className="btn btn-primary"
                style={{ fontSize: '14px', padding: '8px 15px' }}
              >
                {showAddContributor ? 'Cancel' : 'Add Contributor'}
              </button>
            </div>

            {showAddContributor && (
              <div style={{ marginTop: '15px', padding: '15px', backgroundColor: '#f5f5f5', borderRadius: '5px' }}>
                <h4>Search for Contributor</h4>
                <input
                  type="text"
                  placeholder="Search by name..."
                  value={contributorSearch}
                  onChange={(e) => handleSearchContributors(e.target.value)}
                  style={{ width: '100%', padding: '10px', marginBottom: '10px' }}
                />
                {contributorResults.length > 0 && (
                  <div style={{ maxHeight: '200px', overflowY: 'auto', border: '1px solid #ddd', borderRadius: '4px', backgroundColor: 'white' }}>
                    {contributorResults.map((contributor) => (
                      <div
                        key={contributor.contributor_id}
                        style={{
                          padding: '10px',
                          borderBottom: '1px solid #eee',
                          cursor: 'pointer',
                          ':hover': { backgroundColor: '#f0f0f0' }
                        }}
                      >
                        <div><strong>{contributor.name}</strong></div>
                        <div style={{ fontSize: '12px', color: '#666', marginTop: '5px' }}>
                          <button
                            onClick={() => handleAddContributor(contributor, 'author')}
                            className="btn btn-success"
                            style={{ fontSize: '11px', padding: '4px 8px', marginRight: '5px' }}
                          >
                            Add as Author
                          </button>
                          <button
                            onClick={() => handleAddContributor(contributor, 'editor')}
                            className="btn btn-secondary"
                            style={{ fontSize: '11px', padding: '4px 8px', marginRight: '5px' }}
                          >
                            Add as Editor
                          </button>
                          <button
                            onClick={() => handleAddContributor(contributor, 'illustrator')}
                            className="btn btn-secondary"
                            style={{ fontSize: '11px', padding: '4px 8px' }}
                          >
                            Add as Illustrator
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                <div style={{ marginTop: '10px', fontSize: '12px', color: '#666' }}>
                  Don't see the contributor? Create a new one in the Contributors page first.
                </div>
              </div>
            )}

            {book.contributors && book.contributors.length > 0 ? (
              <div style={{ marginTop: '15px' }}>
                <table>
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Role</th>
                      <th>Sequence</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {book.contributors.map((contributor) => (
                      <tr key={contributor.book_contributor_id}>
                        <td><strong>{contributor.name}</strong></td>
                        <td style={{ textTransform: 'capitalize' }}>{contributor.role}</td>
                        <td>{contributor.sequence}</td>
                        <td>
                          <button
                            onClick={() => handleRemoveContributor(contributor.book_contributor_id)}
                            className="btn btn-danger"
                            style={{ fontSize: '11px', padding: '4px 8px' }}
                          >
                            Remove
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div style={{ marginTop: '15px', padding: '15px', backgroundColor: '#fff3cd', borderRadius: '5px', border: '1px solid #ffc107' }}>
                <p style={{ margin: 0 }}>No contributors added yet. Click "Add Contributor" to add authors, editors, or illustrators.</p>
              </div>
            )}
          </div>

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
