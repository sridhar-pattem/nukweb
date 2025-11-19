import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { adminLibraryAPI } from '../../../services/api';
import { FaBook, FaSearch, FaPlus, FaEdit, FaTrash, FaBarcode } from 'react-icons/fa';
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

  const handleDelete = async (bookId) => {
    if (!window.confirm('Are you sure you want to delete this book?')) return;

    try {
      await adminLibraryAPI.deleteBook(bookId);
      fetchBooks();
    } catch (err) {
      console.error('Error deleting book:', err);
      setError('Failed to delete book');
    }
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
                  <th>ISBN</th>
                  <th>Title</th>
                  <th>Authors</th>
                  <th>Collection</th>
                  <th>Items</th>
                  <th>Available</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {books.map((book) => (
                  <tr key={book.book_id}>
                    <td>{book.isbn || 'N/A'}</td>
                    <td>
                      <div className="book-title">
                        <strong>{book.title}</strong>
                        {book.subtitle && <span className="subtitle">{book.subtitle}</span>}
                      </div>
                    </td>
                    <td>
                      {book.contributors && book.contributors.length > 0
                        ? book.contributors.map((c) => c.name).join(', ')
                        : 'N/A'}
                    </td>
                    <td>{book.collection_name || 'N/A'}</td>
                    <td>{book.total_items || 0}</td>
                    <td>
                      <span className={`status-badge ${book.available_items > 0 ? 'available' : 'unavailable'}`}>
                        {book.available_items || 0}
                      </span>
                    </td>
                    <td>
                      <div className="action-buttons">
                        <Link
                          to={`/admin/library/cataloging/books/${book.book_id}`}
                          className="btn btn-icon"
                          title="Edit Book"
                        >
                          <FaEdit />
                        </Link>
                        <Link
                          to={`/admin/library/cataloging/books/${book.book_id}/items`}
                          className="btn btn-icon"
                          title="Manage Items"
                        >
                          <FaBarcode />
                        </Link>
                        <button
                          onClick={() => handleDelete(book.book_id)}
                          className="btn btn-icon btn-danger"
                          title="Delete Book"
                        >
                          <FaTrash />
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
    </div>
  );
};

export default Cataloging;
