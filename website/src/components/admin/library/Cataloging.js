import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { adminLibraryAPI } from '../../../services/api';
import { FaBook, FaSearch, FaPlus, FaPlug } from 'react-icons/fa';
import '../../../styles/admin-library.css';

const Cataloging = () => {
  const [loading, setLoading] = useState(true);
  const [books, setBooks] = useState([]);
  const [collections, setCollections] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCollection, setSelectedCollection] = useState('');
  const [error, setError] = useState('');
  const [selectedBook, setSelectedBook] = useState(null);
  const [showItemsPanel, setShowItemsPanel] = useState(false);
  const [bookItems, setBookItems] = useState([]);
  const [loadingItems, setLoadingItems] = useState(false);
  const [filters, setFilters] = useState({
    isbn: '',
    title: '',
    author: '',
    collection: '',
  });
  const itemsPerPage = 20;

  useEffect(() => {
    fetchCollections();
  }, []);

  useEffect(() => {
    fetchBooks();
  }, [page, selectedCollection]);

  const fetchCollections = async () => {
    try {
      const response = await adminLibraryAPI.getCollections();
      setCollections(response.data || []);
    } catch (err) {
      console.error('Error fetching collections:', err);
    }
  };

  const fetchBooks = async () => {
    try {
      setLoading(true);
      const params = { page };

      if (searchTerm) params.search = searchTerm;
      if (selectedCollection) params.collection = selectedCollection;

      const response = await adminLibraryAPI.getBooks(params);
      setBooks(response.data.books || []);
      setTotal(response.data.total || 0);
    } catch (err) {
      console.error('Error fetching books:', err);
      setError('Failed to load books');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setPage(1);
    fetchBooks();
  };

  const handleBookClick = async (book) => {
    setSelectedBook(book);
    setShowItemsPanel(true);
    setLoadingItems(true);

    try {
      const response = await adminLibraryAPI.getBookById(book.book_id);
      setBookItems(response.data.items || []);
    } catch (err) {
      console.error('Error fetching book items:', err);
      setError('Failed to load book items');
    } finally {
      setLoadingItems(false);
    }
  };

  const closeItemsPanel = () => {
    setShowItemsPanel(false);
    setSelectedBook(null);
    setBookItems([]);
  };

  const handleFilterChange = (field, value) => {
    setFilters((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const filterBooks = (booksList) => {
    return booksList.filter((book) => {
      // ISBN filter
      if (filters.isbn && !book.isbn?.toLowerCase().includes(filters.isbn.toLowerCase())) {
        return false;
      }

      // Title filter
      if (filters.title && !book.title.toLowerCase().includes(filters.title.toLowerCase())) {
        return false;
      }

      // Author filter
      if (filters.author) {
        const authors = book.contributors && book.contributors.length > 0
          ? book.contributors.map((c) => c.name).join(' ').toLowerCase()
          : '';
        if (!authors.includes(filters.author.toLowerCase())) {
          return false;
        }
      }

      // Collection filter
      if (filters.collection && book.collection_name?.toLowerCase() !== filters.collection.toLowerCase()) {
        return false;
      }

      return true;
    });
  };

  const totalPages = Math.ceil(total / itemsPerPage);

  if (loading && books.length === 0) {
    return (
      <div className="admin-library loading">
        <div className="spinner"></div>
        <p>Loading cataloging...</p>
      </div>
    );
  }

  return (
    <div className="admin-library">
      <div className="admin-header">
        <div>
          <h1>Cataloging</h1>
          <p>Manage library books and items</p>
        </div>
        <Link to="/admin/library/cataloging/books/new" className="btn btn-primary">
          <FaPlus /> Add Book
        </Link>
      </div>

      {error && <div className="error-message">{error}</div>}

      {/* Search and Filters */}
      <div className="admin-toolbar">
        <form onSubmit={handleSearch} className="search-form">
          <div className="search-box">
            <FaSearch />
            <input
              type="text"
              placeholder="Search by title, ISBN, or author..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <button type="submit" className="btn btn-primary">
            Search
          </button>
        </form>

        <select
          value={selectedCollection}
          onChange={(e) => {
            setSelectedCollection(e.target.value);
            setPage(1);
          }}
          className="filter-select"
        >
          <option value="">All Collections</option>
          {collections.map((collection) => (
            <option key={collection.collection_id} value={collection.collection_id}>
              {collection.collection_name}
            </option>
          ))}
        </select>
      </div>

      {/* Results Summary */}
      <div className="results-summary">
        <p>
          Found {total} book(s)
          {(searchTerm || selectedCollection) && (
            <button
              onClick={() => {
                setSearchTerm('');
                setSelectedCollection('');
                setPage(1);
              }}
              className="btn btn-link"
            >
              Clear Filters
            </button>
          )}
        </p>
      </div>

      {/* Books Table */}
      {books.length === 0 ? (
        <div className="empty-state">
          <FaBook />
          <p>No books found</p>
        </div>
      ) : (
        <>
          <div className="table-container">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Cover</th>
                  <th>ISBN</th>
                  <th>Title</th>
                  <th>Authors</th>
                  <th>Collection</th>
                  <th>Items (Avail/Total)</th>
                  <th>Actions</th>
                </tr>
                <tr className="filter-row">
                  <th></th>
                  <th>
                    <input
                      type="text"
                      placeholder="Filter ISBN..."
                      value={filters.isbn}
                      onChange={(e) => handleFilterChange('isbn', e.target.value)}
                      className="column-filter"
                    />
                  </th>
                  <th>
                    <input
                      type="text"
                      placeholder="Filter Title..."
                      value={filters.title}
                      onChange={(e) => handleFilterChange('title', e.target.value)}
                      className="column-filter"
                    />
                  </th>
                  <th>
                    <input
                      type="text"
                      placeholder="Filter Author..."
                      value={filters.author}
                      onChange={(e) => handleFilterChange('author', e.target.value)}
                      className="column-filter"
                    />
                  </th>
                  <th>
                    <input
                      type="text"
                      placeholder="Filter Collection..."
                      value={filters.collection}
                      onChange={(e) => handleFilterChange('collection', e.target.value)}
                      className="column-filter"
                      list="collections-list"
                    />
                    <datalist id="collections-list">
                      {collections.map((collection) => (
                        <option key={collection.collection_id} value={collection.collection_name} />
                      ))}
                    </datalist>
                  </th>
                  <th></th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {filterBooks(books).map((book) => (
                  <tr key={book.book_id}>
                    <td>
                      {book.cover_image_url ? (
                        <img
                          src={book.cover_image_url}
                          alt={book.title}
                          className="book-cover-thumbnail"
                        />
                      ) : (
                        <div className="book-cover-placeholder">
                          <FaBook />
                        </div>
                      )}
                    </td>
                    <td>{book.isbn || 'N/A'}</td>
                    <td>
                      <Link
                        to={`/admin/library/cataloging/books/${book.book_id}`}
                        className="book-title-link"
                      >
                        <div className="book-title">
                          <strong>{book.title}</strong>
                          {book.subtitle && <span className="subtitle">{book.subtitle}</span>}
                          {book.earliest_due_date && (
                            <div className="due-date-under-title">
                              Due: {new Date(book.earliest_due_date).toLocaleDateString('en-US', {
                                month: 'short',
                                day: 'numeric',
                                year: 'numeric'
                              })}
                            </div>
                          )}
                        </div>
                      </Link>
                    </td>
                    <td>
                      {book.contributors && book.contributors.length > 0
                        ? book.contributors.map((c) => c.name).join(', ')
                        : 'N/A'}
                    </td>
                    <td>{book.collection_name || 'N/A'}</td>
                    <td>
                      <span className="items-count">
                        {book.available_items || 0}/{book.total_items || 0}
                      </span>
                    </td>
                    <td>
                      <div className="action-buttons">
                        <button
                          onClick={() => handleBookClick(book)}
                          className="btn btn-icon btn-primary"
                          title="Manage Items"
                        >
                          <FaPlug />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="pagination">
              <button
                onClick={() => setPage(page - 1)}
                disabled={page === 1}
                className="btn btn-outline"
              >
                Previous
              </button>

              <span className="page-info">
                Page {page} of {totalPages}
              </span>

              <button
                onClick={() => setPage(page + 1)}
                disabled={page === totalPages}
                className="btn btn-outline"
              >
                Next
              </button>
            </div>
          )}
        </>
      )}

      {/* Right-hand Items Panel */}
      {showItemsPanel && selectedBook && (
        <>
          <div className="panel-overlay" onClick={closeItemsPanel}></div>
          <div className="right-panel">
            <div className="panel-header">
              <div>
                <h2>{selectedBook.title}</h2>
                {selectedBook.subtitle && <p className="text-muted">{selectedBook.subtitle}</p>}
              </div>
              <button onClick={closeItemsPanel} className="btn btn-icon">
                ×
              </button>
            </div>

            <div className="panel-content">
              {/* Book Info */}
              <div className="panel-section">
                <h3>Book Information</h3>
                <div className="info-grid">
                  <div className="info-item">
                    <label>ISBN:</label>
                    <span>{selectedBook.isbn || 'N/A'}</span>
                  </div>
                  <div className="info-item">
                    <label>Authors:</label>
                    <span>
                      {selectedBook.contributors && selectedBook.contributors.length > 0
                        ? selectedBook.contributors.map((c) => c.name).join(', ')
                        : 'N/A'}
                    </span>
                  </div>
                  <div className="info-item">
                    <label>Collection:</label>
                    <span>{selectedBook.collection_name || 'N/A'}</span>
                  </div>
                  <div className="info-item">
                    <label>Available/Total:</label>
                    <span>
                      {selectedBook.available_items || 0}/{selectedBook.total_items || 0}
                    </span>
                  </div>
                </div>
              </div>

              {/* Items List */}
              <div className="panel-section">
                <div className="section-header">
                  <h3>Items</h3>
                  <Link
                    to={`/admin/library/cataloging/books/${selectedBook.book_id}/items`}
                    className="btn btn-outline btn-small"
                  >
                    <FaPlus /> Add Item
                  </Link>
                </div>

                {loadingItems ? (
                  <div className="loading-items">Loading items...</div>
                ) : bookItems.length === 0 ? (
                  <div className="empty-items">
                    <p>No items found for this book.</p>
                    <p className="text-muted">
                      Click "Add Item" to create the first physical copy.
                    </p>
                  </div>
                ) : (
                  <div className="items-list">
                    {bookItems.map((item) => (
                      <div key={item.item_id} className="item-card">
                        <div className="item-info">
                          <div className="item-barcode">
                            <strong>Barcode:</strong> {item.barcode || 'Not assigned'}
                          </div>
                          <div className="item-status">
                            <span className={`status-badge ${item.circulation_status}`}>
                              {item.circulation_status}
                            </span>
                          </div>
                          <div className="item-condition">
                            <span className="text-muted">Condition:</span> {item.condition}
                          </div>
                          {item.is_borrowed && (
                            <div className="item-borrowed">
                              <span className="badge-warning">Currently Borrowed</span>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default Cataloging;
