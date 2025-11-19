import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { patronLibraryAPI } from '../../../services/api';
import { FaBook, FaSearch, FaStar, FaCheckCircle, FaTimesCircle } from 'react-icons/fa';
import '../../../styles/library-dashboard.css';

const BookBrowse = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [books, setBooks] = useState([]);
  const [collections, setCollections] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState(searchParams.get('search') || '');
  const [selectedCollection, setSelectedCollection] = useState(searchParams.get('collection') || '');
  const [error, setError] = useState('');
  const itemsPerPage = 12;

  useEffect(() => {
    fetchBooks();
  }, [page, selectedCollection]);

  useEffect(() => {
    fetchCollections();
  }, []);

  const fetchBooks = async () => {
    try {
      setLoading(true);
      const params = {
        page,
      };

      if (selectedCollection) {
        params.collection = selectedCollection;
      }

      if (searchTerm) {
        params.search = searchTerm;
      }

      const response = await patronLibraryAPI.getBrowseBooks(params);
      setBooks(response.data.books || []);
      setTotal(response.data.total || 0);
    } catch (err) {
      console.error('Error fetching books:', err);
      setError('Failed to load books');
    } finally {
      setLoading(false);
    }
  };

  const fetchCollections = async () => {
    try {
      // For now, we'll use a simplified version. In a full implementation,
      // we'd need an API endpoint to fetch collections
      setCollections([
        { collection_id: '', collection_name: 'All Collections' },
        { collection_id: '1', collection_name: 'Fiction' },
        { collection_id: '2', collection_name: 'Non-Fiction' },
        { collection_id: '3', collection_name: 'Reference' },
        { collection_id: '4', collection_name: 'Children' },
      ]);
    } catch (err) {
      console.error('Error fetching collections:', err);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setPage(1);
    fetchBooks();

    // Update URL params
    const params = new URLSearchParams();
    if (searchTerm) params.set('search', searchTerm);
    if (selectedCollection) params.set('collection', selectedCollection);
    setSearchParams(params);
  };

  const handleCollectionChange = (collectionId) => {
    setSelectedCollection(collectionId);
    setPage(1);

    // Update URL params
    const params = new URLSearchParams();
    if (searchTerm) params.set('search', searchTerm);
    if (collectionId) params.set('collection', collectionId);
    setSearchParams(params);
  };

  const handlePageChange = (newPage) => {
    setPage(newPage);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const totalPages = Math.ceil(total / itemsPerPage);

  const getAvailabilityStatus = (book) => {
    if (!book.total_items || book.total_items === 0) {
      return { text: 'Not Available', className: 'unavailable', icon: <FaTimesCircle /> };
    }
    if (book.available_items > 0) {
      return { text: `${book.available_items} Available`, className: 'available', icon: <FaCheckCircle /> };
    }
    return { text: 'All Checked Out', className: 'checked-out', icon: <FaTimesCircle /> };
  };

  if (loading && books.length === 0) {
    return (
      <div className="library-dashboard loading">
        <div className="spinner"></div>
        <p>Loading books...</p>
      </div>
    );
  }

  return (
    <div className="library-dashboard">
      <div className="dashboard-header">
        <h1>Browse Books</h1>
        <p>Explore our library collection</p>
      </div>

      {error && <div className="error-message">{error}</div>}

      {/* Search and Filters */}
      <div className="browse-toolbar">
        <form onSubmit={handleSearch} className="search-form">
          <div className="search-box">
            <FaSearch />
            <input
              type="text"
              placeholder="Search by title, author, or ISBN..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <button type="submit" className="btn btn-primary">
            Search
          </button>
        </form>

        <div className="filter-section">
          <label htmlFor="collection-filter">Collection:</label>
          <select
            id="collection-filter"
            value={selectedCollection}
            onChange={(e) => handleCollectionChange(e.target.value)}
            className="collection-select"
          >
            {collections.map((collection) => (
              <option key={collection.collection_id} value={collection.collection_id}>
                {collection.collection_name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Results Summary */}
      {(searchTerm || selectedCollection) && (
        <div className="search-summary">
          <p>
            Found {total} book(s)
            {searchTerm && <> for "<strong>{searchTerm}</strong>"</>}
            {selectedCollection && collections.find(c => c.collection_id === selectedCollection) && (
              <> in <strong>{collections.find(c => c.collection_id === selectedCollection).collection_name}</strong></>
            )}
          </p>
          {(searchTerm || selectedCollection) && (
            <button
              onClick={() => {
                setSearchTerm('');
                setSelectedCollection('');
                setPage(1);
                setSearchParams({});
              }}
              className="btn btn-outline btn-small"
            >
              Clear Filters
            </button>
          )}
        </div>
      )}

      {/* Books Grid */}
      {books.length === 0 ? (
        <div className="empty-state">
          <FaBook />
          <p>
            {searchTerm || selectedCollection
              ? 'No books match your search criteria'
              : 'No books available'}
          </p>
        </div>
      ) : (
        <>
          <div className="books-grid">
            {books.map((book) => {
              const availability = getAvailabilityStatus(book);
              return (
                <Link
                  key={book.book_id}
                  to={`/patron/library/book/${book.book_id}`}
                  className="book-card"
                >
                  <div className="book-cover">
                    {book.cover_image_url ? (
                      <img src={book.cover_image_url} alt={book.title} />
                    ) : (
                      <div className="cover-placeholder">
                        <FaBook />
                      </div>
                    )}
                    <div className={`availability-badge ${availability.className}`}>
                      {availability.icon} {availability.text}
                    </div>
                  </div>
                  <div className="book-info">
                    <h3 className="book-title">{book.title}</h3>
                    {book.subtitle && (
                      <p className="book-subtitle">{book.subtitle}</p>
                    )}
                    {book.contributors && book.contributors.length > 0 && (
                      <p className="book-author">
                        {book.contributors[0].name}
                        {book.contributors.length > 1 && ` +${book.contributors.length - 1} more`}
                      </p>
                    )}
                    {book.collection_name && (
                      <p className="book-collection">{book.collection_name}</p>
                    )}
                    {book.avg_rating && (
                      <div className="book-rating">
                        <FaStar /> {parseFloat(book.avg_rating).toFixed(1)}
                        {book.review_count > 0 && (
                          <span className="review-count">
                            ({book.review_count})
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                </Link>
              );
            })}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="pagination">
              <button
                onClick={() => handlePageChange(page - 1)}
                disabled={page === 1}
                className="btn btn-outline"
              >
                Previous
              </button>

              <div className="page-numbers">
                {[...Array(totalPages)].map((_, index) => {
                  const pageNum = index + 1;
                  // Show first page, last page, current page, and pages around current
                  if (
                    pageNum === 1 ||
                    pageNum === totalPages ||
                    (pageNum >= page - 2 && pageNum <= page + 2)
                  ) {
                    return (
                      <button
                        key={pageNum}
                        onClick={() => handlePageChange(pageNum)}
                        className={`page-button ${page === pageNum ? 'active' : ''}`}
                      >
                        {pageNum}
                      </button>
                    );
                  } else if (pageNum === page - 3 || pageNum === page + 3) {
                    return <span key={pageNum} className="page-ellipsis">...</span>;
                  }
                  return null;
                })}
              </div>

              <button
                onClick={() => handlePageChange(page + 1)}
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

export default BookBrowse;
