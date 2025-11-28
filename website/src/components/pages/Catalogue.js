import React, { useEffect, useState } from 'react';
import { FaSearch, FaFilter } from 'react-icons/fa';
import BookCard from '../shared/BookCard';
import apiClient from '../../services/api';
import { patronLibraryAPI } from '../../services/api';

const Catalogue = () => {
  const [books, setBooks] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCollection, setSelectedCollection] = useState('all');
  const [selectedAgeRating, setSelectedAgeRating] = useState('all');
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [error, setError] = useState('');
  const [collections, setCollections] = useState([]);

  const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5001/api';

  // Fetch collections on mount
  useEffect(() => {
    fetchCollections();
  }, []);

  const fetchCollections = async () => {
    try {
      const response = await patronLibraryAPI.getCollections();
      setCollections(response.data || []);
    } catch (err) {
      console.error('Error fetching collections:', err);
      setCollections([]);
    }
  };

  const transformBooks = (dataBooks = []) =>
    dataBooks.map((book) => ({
      book_id: book.book_id,
      title: book.title,
      authors: book.contributors
        ? book.contributors
            .filter((c) => c.role === 'author')
            .map((c) => c.name)
        : [],
      cover_image_url:
        book.cover_image_url || 'https://via.placeholder.com/200x300?text=No+Cover',
      rating: book.avg_rating || 0,
      available_items: book.available_items || 0,
      collection_name: book.collection_name || '',
      age_rating: book.age_rating || '',
    }));

  const handleSearch = async (e) => {
    e.preventDefault();

    if (!searchTerm.trim()) {
      return;
    }

    setLoading(true);
    setHasSearched(true);
    setError('');

    try {
      const response = await apiClient.get('/patron/books/search', {
        params: { search: searchTerm, page: 1, limit: 6 },
        baseURL: API_URL,
      });

      const data = response.data;

      if (data?.books) {
        setBooks(transformBooks(data.books));
      } else {
        setBooks([]);
      }
    } catch (error) {
      console.error('Error fetching books:', error);
      setBooks([]);
      setError('Unable to fetch books right now. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const filteredBooks = books;

  return (
    <div className="catalogue-page">
      {/* Hero */}
      <section className="hero" style={{ height: '350px' }}>
        <div className="hero-overlay"></div>
        <div className="hero-content">
          <h1>Book Catalogue</h1>
          <p>Explore our collection of 10,000+ books</p>
        </div>
      </section>

      {/* Search and Filters */}
      <section className="section">
        <div className="container">
          <div className="card" style={{ marginBottom: '2rem' }}>
            <form onSubmit={handleSearch}>
              <div className="search-bar">
                <FaSearch style={{ fontSize: '1.25rem', color: 'var(--text-charcoal)' }} />
                <input
                  type="text"
                  className="search-input"
                  placeholder="Search by title, author, or ISBN..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                <button type="submit" className="search-button">
                  Search
                </button>
              </div>
            </form>

            <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem', flexWrap: 'wrap' }}>
              <div className="form-group" style={{ marginBottom: 0, flex: '1', minWidth: '200px' }}>
                <label className="form-label">
                  <FaFilter style={{ marginRight: '0.5rem' }} />
                  Collection
                </label>
                <select
                  className="form-select"
                  value={selectedCollection}
                  onChange={(e) => setSelectedCollection(e.target.value)}
                >
                  <option value="all">All Collections</option>
                  {collections.map((collection) => (
                    <option key={collection.collection_id} value={collection.collection_name}>
                      {collection.collection_name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group" style={{ marginBottom: 0, flex: '1', minWidth: '200px' }}>
                <label className="form-label">Age Group</label>
                <select
                  className="form-select"
                  value={selectedAgeRating}
                  onChange={(e) => setSelectedAgeRating(e.target.value)}
                >
                  <option value="all">All Ages</option>
                  <option value="toddlers">Toddlers (0-3)</option>
                  <option value="preschool">Preschool (3-5)</option>
                  <option value="children">Children (6-12)</option>
                  <option value="young-adult">Young Adult (13-17)</option>
                  <option value="adult">Adult (18+)</option>
                </select>
              </div>
            </div>
          </div>

          {/* Results Count */}
          {hasSearched && (
            <div style={{ marginBottom: '1.5rem' }}>
              <h3 style={{ color: 'var(--ink)' }}>
                {filteredBooks.length} {filteredBooks.length === 1 ? 'Book' : 'Books'} Found
                {filteredBooks.length === 6 && ' (showing first 6 results)'}
              </h3>
              {error && <p style={{ color: 'var(--accent-peru)', marginTop: '0.25rem' }}>{error}</p>}
            </div>
          )}

          {/* Books Grid */}
          {loading ? (
            <div style={{ textAlign: 'center', padding: '3rem' }}>
              <p style={{ color: 'var(--ink)' }}>Loading books...</p>
            </div>
          ) : !hasSearched ? (
            <div className="card text-center" style={{ padding: '3rem' }}>
              <h4 style={{ color: 'var(--ink)' }}>Search Our Catalogue</h4>
              <p style={{ color: '#666' }}>Enter a book title, author name, or keyword to search our collection of 10,000+ books</p>
            </div>
          ) : filteredBooks.length > 0 ? (
            <div className="grid grid-3">
              {filteredBooks.map((book) => (
                <BookCard key={book.book_id} book={book} />
              ))}
            </div>
          ) : (
            <div className="card text-center" style={{ padding: '3rem' }}>
              <h4 style={{ color: 'var(--ink)' }}>No books found</h4>
              <p style={{ color: '#666' }}>Try different search terms or browse our catalogue in person at the library</p>
            </div>
          )}

          {/* Note for non-members */}
          <div className="card" style={{ marginTop: '2rem', backgroundColor: '#FFF9E6', border: '2px solid var(--accent-peru)' }}>
            <h4 style={{ color: 'var(--ink)' }}>Not a Member Yet?</h4>
            <p style={{ color: '#555' }}>
              You're viewing a sample of our catalogue. Members get access to our full collection of 10,000+ books,
              along with the ability to reserve books, write reviews, and get personalized recommendations.
            </p>
            <a href="/membership" className="btn btn-primary">
              Become a Member
            </a>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Catalogue;
