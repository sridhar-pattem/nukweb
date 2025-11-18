import React, { useState, useEffect } from 'react';
import { FaSearch, FaFilter } from 'react-icons/fa';
import BookCard from '../shared/BookCard';

const Catalogue = () => {
  const [books, setBooks] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCollection, setSelectedCollection] = useState('all');
  const [selectedAgeRating, setSelectedAgeRating] = useState('all');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Mock data - will be replaced with API call
    setBooks([
      {
        book_id: 1,
        title: 'The Midnight Library',
        authors: ['Matt Haig'],
        cover_image_url: 'https://via.placeholder.com/200x300?text=Midnight+Library',
        rating: 4.5,
        available_items: 3,
        collection: 'Fiction',
      },
      {
        book_id: 2,
        title: 'Atomic Habits',
        authors: ['James Clear'],
        cover_image_url: 'https://via.placeholder.com/200x300?text=Atomic+Habits',
        rating: 4.8,
        available_items: 2,
        collection: 'Non-Fiction',
      },
      {
        book_id: 3,
        title: 'The Blue Umbrella',
        authors: ['Ruskin Bond'],
        cover_image_url: 'https://via.placeholder.com/200x300?text=Blue+Umbrella',
        rating: 4.3,
        available_items: 5,
        collection: 'Children',
      },
      {
        book_id: 4,
        title: 'Harry Potter and the Philosopher\'s Stone',
        authors: ['J.K. Rowling'],
        cover_image_url: 'https://via.placeholder.com/200x300?text=Harry+Potter',
        rating: 4.9,
        available_items: 4,
        collection: 'Children',
      },
      {
        book_id: 5,
        title: 'Sapiens',
        authors: ['Yuval Noah Harari'],
        cover_image_url: 'https://via.placeholder.com/200x300?text=Sapiens',
        rating: 4.7,
        available_items: 3,
        collection: 'Non-Fiction',
      },
      {
        book_id: 6,
        title: 'The Alchemist',
        authors: ['Paulo Coelho'],
        cover_image_url: 'https://via.placeholder.com/200x300?text=Alchemist',
        rating: 4.6,
        available_items: 6,
        collection: 'Fiction',
      },
    ]);
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    // API call will be made here
    setLoading(true);
    setTimeout(() => setLoading(false), 500);
  };

  const filteredBooks = books.filter((book) => {
    const matchesSearch = book.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      book.authors.some(author => author.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesCollection = selectedCollection === 'all' || book.collection === selectedCollection;
    return matchesSearch && matchesCollection;
  });

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
                  <option value="Fiction">Fiction</option>
                  <option value="Non-Fiction">Non-Fiction</option>
                  <option value="Children">Children</option>
                  <option value="Young Adult">Young Adult</option>
                  <option value="Reference">Reference</option>
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
          <div style={{ marginBottom: '1.5rem' }}>
            <h3>{filteredBooks.length} {filteredBooks.length === 1 ? 'Book' : 'Books'} Found</h3>
          </div>

          {/* Books Grid */}
          {loading ? (
            <div style={{ textAlign: 'center', padding: '3rem' }}>
              <p>Loading books...</p>
            </div>
          ) : filteredBooks.length > 0 ? (
            <div className="grid grid-3">
              {filteredBooks.map((book) => (
                <BookCard key={book.book_id} book={book} />
              ))}
            </div>
          ) : (
            <div className="card text-center" style={{ padding: '3rem' }}>
              <h4>No books found</h4>
              <p className="text-muted">Try adjusting your search or filters</p>
            </div>
          )}

          {/* Note for non-members */}
          <div className="card" style={{ marginTop: '2rem', backgroundColor: 'var(--light-beige)', border: '2px solid var(--accent-peru)' }}>
            <h4>Not a Member Yet?</h4>
            <p>
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
