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
                  <th>Due Date</th>
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
                      {book.earliest_due_date ? (
                        <span className="due-date-badge">
                          {new Date(book.earliest_due_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                        </span>
                      ) : (
                        '-'
                      )}
                    </td>
                    <td>
                      <div className="action-buttons">
                        <Link
                          to={`/admin/library/cataloging/books/${book.book_id}/items`}
                          className="btn btn-icon btn-primary"
                          title="Add/Manage Items"
                        >
                          <FaPlug />
                        </Link>
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
    </div>
  );
};

export default Cataloging;
