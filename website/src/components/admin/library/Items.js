import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { adminLibraryAPI } from '../../../services/api';
import { FaPlus, FaEdit, FaTrash, FaSearch, FaBook, FaBarcode } from 'react-icons/fa';
import '../../../styles/admin-library.css';

const Items = () => {
  const navigate = useNavigate();
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
  }, []);

  useEffect(() => {
    filterItems();
  }, [items, searchTerm, statusFilter]);

  const fetchItems = async () => {
    try {
      setLoading(true);
      const response = await adminLibraryAPI.getItems();
      setItems(response.data || []);
    } catch (err) {
      console.error('Error fetching items:', err);
      setError('Failed to load items');
    } finally {
      setLoading(false);
    }
  };

  const filterItems = () => {
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
      const response = await adminLibraryAPI.getBooks({ search: query });
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
      await adminLibraryAPI.createItem(formData);
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
      await adminLibraryAPI.deleteItem(id);
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
      <div className="admin-library loading">
        <div className="spinner"></div>
        <p>Loading items...</p>
      </div>
    );
  }

  return (
    <div className="admin-library">
      <div className="admin-header">
        <div>
          <h1>Library Items</h1>
          <p>Manage physical copies of books in the library</p>
        </div>
        <button onClick={handleAdd} className="btn btn-primary">
          <FaPlus /> Add Item
        </button>
      </div>

      {error && <div className="error-message">{error}</div>}
      {success && <div className="success-message">{success}</div>}

      {/* Search and Filters */}
      <div className="filters-section">
        <div className="search-box">
          <FaSearch />
          <input
            type="text"
            placeholder="Search by barcode or book title..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="filter-group">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="form-control"
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

      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>Barcode</th>
              <th>Book Title</th>
              <th>Status</th>
              <th>Condition</th>
              <th>Location</th>
              <th>Acquisition Date</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredItems.length === 0 ? (
              <tr>
                <td colSpan="7" className="no-data">
                  {searchTerm || statusFilter
                    ? 'No items found matching your filters'
                    : 'No items found. Add your first item!'}
                </td>
              </tr>
            ) : (
              filteredItems.map((item) => (
                <tr key={item.item_id}>
                  <td>
                    <strong>
                      <FaBarcode /> {item.barcode}
                    </strong>
                  </td>
                  <td>
                    <div>
                      <strong>{item.title}</strong>
                      {item.isbn && <div className="text-muted small">ISBN: {item.isbn}</div>}
                    </div>
                  </td>
                  <td>{getStatusBadge(item.status)}</td>
                  <td>{getConditionBadge(item.condition)}</td>
                  <td>{item.location || '-'}</td>
                  <td>
                    {item.acquisition_date
                      ? new Date(item.acquisition_date).toLocaleDateString()
                      : '-'}
                  </td>
                  <td>
                    <div className="action-buttons">
                      <button
                        onClick={() => navigate(`/admin/library/items/${item.item_id}`)}
                        className="btn btn-icon btn-small"
                        title="Edit"
                      >
                        <FaEdit />
                      </button>
                      <button
                        onClick={() => handleDelete(item.item_id)}
                        className="btn btn-icon btn-small btn-danger"
                        title="Delete"
                      >
                        <FaTrash />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="results-info">
        Showing {filteredItems.length} of {items.length} items
      </div>

      {/* Add Item Modal */}
      {showAddModal && (
        <div className="modal-overlay" onClick={() => setShowAddModal(false)}>
          <div
            className="modal-content modal-large"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-header">
              <h2>Add New Item</h2>
              <button onClick={() => setShowAddModal(false)} className="btn btn-icon">
                ×
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              {/* Book Search */}
              <div className="form-group">
                <label htmlFor="book_search">
                  <FaBook /> Select Book *
                </label>
                <input
                  type="text"
                  id="book_search"
                  value={bookSearchTerm}
                  onChange={(e) => {
                    setBookSearchTerm(e.target.value);
                    handleSearchBooks(e.target.value);
                  }}
                  className="form-control"
                  placeholder="Search for a book by title or ISBN..."
                  autoComplete="off"
                />
                {bookSearchResults.length > 0 && (
                  <div className="search-results-dropdown">
                    {bookSearchResults.map((book) => (
                      <div
                        key={book.book_id}
                        className="search-result-item"
                        onClick={() => handleSelectBook(book)}
                      >
                        <strong>{book.title}</strong>
                        {book.subtitle && <div className="text-muted">{book.subtitle}</div>}
                        {book.isbn && <div className="text-muted small">ISBN: {book.isbn}</div>}
                      </div>
                    ))}
                  </div>
                )}
                {selectedBook && (
                  <div className="selected-book">
                    Selected: <strong>{selectedBook.title}</strong>
                  </div>
                )}
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="barcode">
                    <FaBarcode /> Barcode *
                  </label>
                  <input
                    type="text"
                    id="barcode"
                    name="barcode"
                    value={formData.barcode}
                    onChange={handleChange}
                    className="form-control"
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="acquisition_date">Acquisition Date</label>
                  <input
                    type="date"
                    id="acquisition_date"
                    name="acquisition_date"
                    value={formData.acquisition_date}
                    onChange={handleChange}
                    className="form-control"
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="condition">Condition *</label>
                  <select
                    id="condition"
                    name="condition"
                    value={formData.condition}
                    onChange={handleChange}
                    className="form-control"
                    required
                  >
                    <option value="New">New</option>
                    <option value="Excellent">Excellent</option>
                    <option value="Good">Good</option>
                    <option value="Fair">Fair</option>
                    <option value="Poor">Poor</option>
                  </select>
                </div>

                <div className="form-group">
                  <label htmlFor="location">Location</label>
                  <input
                    type="text"
                    id="location"
                    name="location"
                    value={formData.location}
                    onChange={handleChange}
                    className="form-control"
                    placeholder="e.g., Shelf A3, Row 5"
                  />
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="notes">Notes</label>
                <textarea
                  id="notes"
                  name="notes"
                  value={formData.notes}
                  onChange={handleChange}
                  className="form-control"
                  rows="3"
                  placeholder="Additional notes about this item..."
                />
              </div>

              <div className="modal-actions">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="btn btn-outline"
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
