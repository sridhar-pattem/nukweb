import React, { useState, useEffect } from 'react';
import { FaCalendar } from 'react-icons/fa';
import BookCard from '../shared/BookCard';

const NewArrivals = () => {
  const [newBooks, setNewBooks] = useState([]);
  const [selectedPeriod, setSelectedPeriod] = useState('30');

  useEffect(() => {
    // Mock data - will be replaced with API call
    setNewBooks([
      {
        book_id: 1,
        title: 'The Midnight Library',
        authors: ['Matt Haig'],
        cover_image_url: 'https://via.placeholder.com/200x300?text=Midnight+Library',
        rating: 4.5,
        available_items: 3,
        added_date: '2024-11-15',
      },
      {
        book_id: 2,
        title: 'Atomic Habits',
        authors: ['James Clear'],
        cover_image_url: 'https://via.placeholder.com/200x300?text=Atomic+Habits',
        rating: 4.8,
        available_items: 2,
        added_date: '2024-11-12',
      },
      {
        book_id: 3,
        title: 'The Blue Umbrella',
        authors: ['Ruskin Bond'],
        cover_image_url: 'https://via.placeholder.com/200x300?text=Blue+Umbrella',
        rating: 4.3,
        available_items: 5,
        added_date: '2024-11-10',
      },
      {
        book_id: 4,
        title: 'Project Hail Mary',
        authors: ['Andy Weir'],
        cover_image_url: 'https://via.placeholder.com/200x300?text=Project+Hail+Mary',
        rating: 4.9,
        available_items: 4,
        added_date: '2024-11-08',
      },
      {
        book_id: 5,
        title: 'The Thursday Murder Club',
        authors: ['Richard Osman'],
        cover_image_url: 'https://via.placeholder.com/200x300?text=Thursday+Murder+Club',
        rating: 4.6,
        available_items: 3,
        added_date: '2024-11-05',
      },
      {
        book_id: 6,
        title: 'Thinking, Fast and Slow',
        authors: ['Daniel Kahneman'],
        cover_image_url: 'https://via.placeholder.com/200x300?text=Thinking+Fast+Slow',
        rating: 4.7,
        available_items: 2,
        added_date: '2024-11-01',
      },
    ]);
  }, [selectedPeriod]);

  return (
    <div className="new-arrivals-page">
      {/* Hero */}
      <section className="hero" style={{ height: '350px' }}>
        <div className="hero-overlay"></div>
        <div className="hero-content">
          <h1><FaCalendar style={{ marginRight: '1rem' }} />New Arrivals</h1>
          <p>Discover our latest additions to the collection</p>
        </div>
      </section>

      {/* New Arrivals */}
      <section className="section">
        <div className="container">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <h2>Recently Added Books</h2>
              <p className="text-muted">We add 50+ new books every month</p>
            </div>
            <div className="form-group" style={{ marginBottom: 0, minWidth: '200px' }}>
              <select
                className="form-select"
                value={selectedPeriod}
                onChange={(e) => setSelectedPeriod(e.target.value)}
              >
                <option value="7">Last 7 days</option>
                <option value="30">Last 30 days</option>
                <option value="90">Last 3 months</option>
              </select>
            </div>
          </div>

          <div className="grid grid-3">
            {newBooks.map((book) => (
              <div key={book.book_id} style={{ position: 'relative' }}>
                <span
                  className="badge badge-success"
                  style={{
                    position: 'absolute',
                    top: '10px',
                    right: '10px',
                    zIndex: 10,
                  }}
                >
                  New
                </span>
                <BookCard book={book} />
                <p style={{ fontSize: '0.875rem', color: '#6c757d', marginTop: '0.5rem', textAlign: 'center' }}>
                  Added: {new Date(book.added_date).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                  })}
                </p>
              </div>
            ))}
          </div>

          {/* Info Card */}
          <div className="card" style={{ marginTop: '3rem', backgroundColor: 'var(--light-beige)', border: '2px solid var(--accent-peru)' }}>
            <h4>Want to suggest a book?</h4>
            <p>
              Members can suggest books they'd like to see in our collection. We review all suggestions
              and add popular titles based on demand and availability.
            </p>
            <a href="/contact" className="btn btn-primary">
              Suggest a Book
            </a>
          </div>
        </div>
      </section>

      {/* Coming Soon */}
      <section className="section section-alt">
        <div className="container">
          <h2 className="text-center mb-xl">Coming Soon</h2>
          <p className="text-center text-muted" style={{ marginBottom: '2rem' }}>
            These highly anticipated titles will be available in the next few weeks
          </p>

          <div className="grid grid-4">
            {['Book Title 1', 'Book Title 2', 'Book Title 3', 'Book Title 4'].map((title, index) => (
              <div key={index} className="card text-center">
                <div
                  style={{
                    height: '250px',
                    backgroundColor: 'var(--light-gray)',
                    borderRadius: 'var(--radius-md)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginBottom: '1rem',
                  }}
                >
                  <FaCalendar size={48} style={{ color: 'var(--accent-peru)' }} />
                </div>
                <h5>{title}</h5>
                <p className="text-muted">Author Name</p>
                <span className="badge">Coming in December</span>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default NewArrivals;
