import React, { useState, useEffect } from 'react';
import { adminItemsAPI, adminBooksAPI } from '../services/api';

const Items = () => {
  const [items, setItems] = useState([]);
  const [filteredItems, setFilteredItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);

  const [formData, setFormData] = useState({
    book_id: '',
    barcode: '',
    acquisition_date: '',
    condition: 'Good',
    location: '',
    notes: '',
  });

  const [bookSearchTerm, setBookSearchTerm] = useState('');
  const [bookSearchResults, setBookSearchResults] = useState([]);
  const [selectedBook, setSelectedBook] = useState(null);

  useEffect(() => {
    fetchItems();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    filterItems();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [items, searchTerm, statusFilter]);

  const fetchItems = async () => {
    try {
      setLoading(true);
      const response = await adminItemsAPI.getItems();
      // Handle different response formats from backend
      const itemsData = Array.isArray(response.data)
        ? response.data
        : (response.data?.items || []);
      setItems(itemsData);
    } catch (err) {
      console.error('Error fetching items:', err);
      setError('Failed to load items');
    } finally {
      setLoading(false);
    }
  };

  const filterItems = () => {
    // Ensure items is an array before filtering
    if (!Array.isArray(items)) {
      setFilteredItems([]);
      return;
    }

    let filtered = [...items];

    if (searchTerm) {
      filtered = filtered.filter(
        (item) =>
          item.barcode?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          item.title?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (statusFilter) {
      filtered = filtered.filter((item) => item.status === statusFilter);
    }

    setFilteredItems(filtered);
  };

  const handleSearchBooks = async (query) => {
    if (!query || query.length < 2) {
      setBookSearchResults([]);
      return;
    }

    try {
      const response = await adminBooksAPI.getBooks(1, { search: query });
      setBookSearchResults(response.data.books || []);
    } catch (err) {
      console.error('Error searching books:', err);
    }
  };

  const handleSelectBook = (book) => {
    setSelectedBook(book);
    setFormData((prev) => ({
      ...prev,
      book_id: book.book_id,
    }));
    setBookSearchTerm(book.title);
    setBookSearchResults([]);
  };

  const handleAdd = () => {
    setFormData({
      book_id: '',
      barcode: '',
      acquisition_date: new Date().toISOString().split('T')[0],
      condition: 'Good',
      location: '',
      notes: '',
    });
    setSelectedBook(null);
    setBookSearchTerm('');
    setBookSearchResults([]);
    setShowAddModal(true);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.book_id) {
      setError('Please select a book');
      return;
    }

    if (!formData.barcode) {
      setError('Barcode is required');
      return;
    }

    try {
      setError('');
      await adminItemsAPI.addItem(formData);
      setSuccess('Item added successfully!');
      setShowAddModal(false);
      fetchItems();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      console.error('Error creating item:', err);
      setError(err.response?.data?.error || 'Failed to create item');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this item?')) {
      return;
    }

    try {
      await adminItemsAPI.deleteItem(id);
      setSuccess('Item deleted successfully!');
      fetchItems();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      console.error('Error deleting item:', err);
      setError(err.response?.data?.error || 'Failed to delete item');
    }
  };

  const getStatusBadge = (status) => {
    const statusClasses = {
      Available: 'badge-success',
      'Checked Out': 'badge-warning',
      Reserved: 'badge-info',
      'Under Repair': 'badge-secondary',
      Lost: 'badge-danger',
      Damaged: 'badge-danger',
    };

    return <span className={`badge ${statusClasses[status] || 'badge-secondary'}`}>{status}</span>;
  };

  const getConditionBadge = (condition) => {
    const conditionClasses = {
      New: 'badge-success',
      Excellent: 'badge-success',
      Good: 'badge-info',
      Fair: 'badge-warning',
      Poor: 'badge-danger',
    };

    return (
      <span className={`badge ${conditionClasses[condition] || 'badge-secondary'}`}>
        {condition}
      </span>
    );
  };

  if (loading) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center' }}>
        <p>Loading items...</p>
      </div>
    );
  }

  return (
    <div style={{ padding: '2rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h1>Library Items</h1>
          <p>Manage physical copies of books in the library</p>
        </div>
        <button onClick={handleAdd} className="btn btn-primary">
          + Add Item
        </button>
      </div>

      {error && <div style={{ padding: '1rem', background: '#f8d7da', color: '#721c24', borderRadius: '4px', marginBottom: '1rem' }}>{error}</div>}
      {success && <div style={{ padding: '1rem', background: '#d4edda', color: '#155724', borderRadius: '4px', marginBottom: '1rem' }}>{success}</div>}

      {/* Search and Filters */}
      <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem' }}>
        <div style={{ flex: 1 }}>
          <input
            type="text"
            placeholder="Search by barcode or book title..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ width: '100%', padding: '0.5rem', border: '1px solid #ddd', borderRadius: '4px' }}
          />
        </div>

        <div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            style={{ padding: '0.5rem', border: '1px solid #ddd', borderRadius: '4px' }}
          >
            <option value="">All Statuses</option>
            <option value="Available">Available</option>
            <option value="Checked Out">Checked Out</option>
            <option value="Reserved">Reserved</option>
            <option value="Under Repair">Under Repair</option>
            <option value="Lost">Lost</option>
            <option value="Damaged">Damaged</option>
          </select>
        </div>
      </div>

      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: '#f5f5f5' }}>
              <th style={{ padding: '0.75rem', textAlign: 'left', borderBottom: '2px solid #ddd' }}>Barcode</th>
              <th style={{ padding: '0.75rem', textAlign: 'left', borderBottom: '2px solid #ddd' }}>Book Title</th>
              <th style={{ padding: '0.75rem', textAlign: 'left', borderBottom: '2px solid #ddd' }}>Status</th>
              <th style={{ padding: '0.75rem', textAlign: 'left', borderBottom: '2px solid #ddd' }}>Condition</th>
              <th style={{ padding: '0.75rem', textAlign: 'left', borderBottom: '2px solid #ddd' }}>Location</th>
              <th style={{ padding: '0.75rem', textAlign: 'left', borderBottom: '2px solid #ddd' }}>Acquisition Date</th>
              <th style={{ padding: '0.75rem', textAlign: 'left', borderBottom: '2px solid #ddd' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredItems.length === 0 ? (
              <tr>
                <td colSpan="7" style={{ padding: '2rem', textAlign: 'center', color: '#666' }}>
                  {searchTerm || statusFilter
                    ? 'No items found matching your filters'
                    : 'No items found. Add your first item!'}
                </td>
              </tr>
            ) : (
              filteredItems.map((item) => (
                <tr key={item.item_id} style={{ borderBottom: '1px solid #ddd' }}>
                  <td style={{ padding: '0.75rem' }}>
                    <strong>{item.barcode}</strong>
                  </td>
                  <td style={{ padding: '0.75rem' }}>
                    <div>
                      <strong>{item.title}</strong>
                      {item.isbn && <div style={{ fontSize: '0.875rem', color: '#666' }}>ISBN: {item.isbn}</div>}
                    </div>
                  </td>
                  <td style={{ padding: '0.75rem' }}>{getStatusBadge(item.status)}</td>
                  <td style={{ padding: '0.75rem' }}>{getConditionBadge(item.condition)}</td>
                  <td style={{ padding: '0.75rem' }}>{item.location || '-'}</td>
                  <td style={{ padding: '0.75rem' }}>
                    {item.acquisition_date
                      ? new Date(item.acquisition_date).toLocaleDateString()
                      : '-'}
                  </td>
                  <td style={{ padding: '0.75rem' }}>
                    <button
                      onClick={() => handleDelete(item.item_id)}
                      className="btn"
                      style={{ fontSize: '0.875rem' }}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div style={{ marginTop: '1rem', color: '#666' }}>
        Showing {filteredItems.length} of {items.length} items
      </div>

      {/* Add Item Modal */}
      {showAddModal && (
        <div
          style={{
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
          onClick={() => setShowAddModal(false)}
        >
          <div
            style={{
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
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h2>Add New Item</h2>
              <button onClick={() => setShowAddModal(false)} className="btn">×</button>
            </div>

            <form onSubmit={handleSubmit}>
              {/* Book Search */}
              <div style={{ marginBottom: '1rem' }}>
                <label htmlFor="book_search" style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>
                  Select Book *
                </label>
                <input
                  type="text"
                  id="book_search"
                  value={bookSearchTerm}
                  onChange={(e) => {
                    setBookSearchTerm(e.target.value);
                    handleSearchBooks(e.target.value);
                  }}
                  placeholder="Search for a book by title or ISBN..."
                  style={{ width: '100%', padding: '0.5rem', border: '1px solid #ddd', borderRadius: '4px' }}
                  autoComplete="off"
                />
                {bookSearchResults.length > 0 && (
                  <div style={{ marginTop: '0.5rem', border: '1px solid #ddd', borderRadius: '4px', maxHeight: '200px', overflow: 'auto' }}>
                    {bookSearchResults.map((book) => (
                      <div
                        key={book.book_id}
                        style={{ padding: '0.75rem', cursor: 'pointer', borderBottom: '1px solid #eee' }}
                        onClick={() => handleSelectBook(book)}
                      >
                        <strong>{book.title}</strong>
                        {book.subtitle && <div style={{ fontSize: '0.875rem', color: '#666' }}>{book.subtitle}</div>}
                        {book.isbn && <div style={{ fontSize: '0.75rem', color: '#999' }}>ISBN: {book.isbn}</div>}
                      </div>
                    ))}
                  </div>
                )}
                {selectedBook && (
                  <div style={{ marginTop: '0.5rem', padding: '0.5rem', background: '#e8f4f8', borderRadius: '4px' }}>
                    Selected: <strong>{selectedBook.title}</strong>
                  </div>
                )}
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                <div>
                  <label htmlFor="barcode" style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>
                    Barcode *
                  </label>
                  <input
                    type="text"
                    id="barcode"
                    name="barcode"
                    value={formData.barcode}
                    onChange={handleChange}
                    style={{ width: '100%', padding: '0.5rem', border: '1px solid #ddd', borderRadius: '4px' }}
                    required
                  />
                </div>

                <div>
                  <label htmlFor="acquisition_date" style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>
                    Acquisition Date
                  </label>
                  <input
                    type="date"
                    id="acquisition_date"
                    name="acquisition_date"
                    value={formData.acquisition_date}
                    onChange={handleChange}
                    style={{ width: '100%', padding: '0.5rem', border: '1px solid #ddd', borderRadius: '4px' }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                <div>
                  <label htmlFor="condition" style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>
                    Condition *
                  </label>
                  <select
                    id="condition"
                    name="condition"
                    value={formData.condition}
                    onChange={handleChange}
                    style={{ width: '100%', padding: '0.5rem', border: '1px solid #ddd', borderRadius: '4px' }}
                    required
                  >
                    <option value="New">New</option>
                    <option value="Excellent">Excellent</option>
                    <option value="Good">Good</option>
                    <option value="Fair">Fair</option>
                    <option value="Poor">Poor</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="location" style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>
                    Location
                  </label>
                  <input
                    type="text"
                    id="location"
                    name="location"
                    value={formData.location}
                    onChange={handleChange}
                    placeholder="e.g., Shelf A3, Row 5"
                    style={{ width: '100%', padding: '0.5rem', border: '1px solid #ddd', borderRadius: '4px' }}
                  />
                </div>
              </div>

              <div style={{ marginBottom: '1.5rem' }}>
                <label htmlFor="notes" style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>
                  Notes
                </label>
                <textarea
                  id="notes"
                  name="notes"
                  value={formData.notes}
                  onChange={handleChange}
                  rows="3"
                  placeholder="Additional notes about this item..."
                  style={{ width: '100%', padding: '0.5rem', border: '1px solid #ddd', borderRadius: '4px' }}
                />
              </div>

              <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="btn"
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Add Item
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Items;
