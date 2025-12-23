import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { FaStar, FaBook, FaCheckCircle, FaTimesCircle, FaUser } from 'react-icons/fa';

const BookDetail = () => {
  const { id } = useParams();
  const [book, setBook] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Mock data - will be replaced with API call
    setBook({
      book_id: id,
      title: 'The Midnight Library',
      authors: ['Matt Haig'],
      isbn: '9780525559474',
      publisher: 'Viking',
      publication_year: 2020,
      pages: 304,
      language: 'English',
      cover_image_url: 'https://via.placeholder.com/300x450?text=Midnight+Library',
      description: 'Between life and death there is a library, and within that library, the shelves go on forever. Every book provides a chance to try another life you could have lived. To see how things would be if you had made other choices... Would you have done anything different, if you had the chance to undo your regrets?',
      subjects: ['Fiction', 'Philosophy', 'Contemporary'],
      tags: ['fiction', 'philosophy', 'bestseller', 'mental-health'],
      collection: 'Fiction',
      age_rating: 'Adult',
      rating: 4.5,
      total_reviews: 15,
      total_items: 5,
      available_items: 3,
    });

    setReviews([
      {
        review_id: 1,
        patron_name: 'Priya S.',
        rating: 5,
        review_text: 'A beautiful exploration of life, regret, and second chances. Matt Haig has created something truly special.',
        created_at: '2024-11-10',
      },
      {
        review_id: 2,
        patron_name: 'Rajesh K.',
        rating: 4,
        review_text: 'Thought-provoking and emotional. Made me reflect on my own life choices.',
        created_at: '2024-11-05',
      },
      {
        review_id: 3,
        patron_name: 'Anita D.',
        rating: 5,
        review_text: 'One of the best books I\'ve read this year. Highly recommend!',
        created_at: '2024-10-28',
      },
    ]);

    setLoading(false);
  }, [id]);

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '5rem' }}>
        <p>Loading book details...</p>
      </div>
    );
  }

  if (!book) {
    return (
      <div className="container" style={{ padding: '5rem 0', textAlign: 'center' }}>
        <h2>Book not found</h2>
        <Link to="/catalogue" className="btn btn-primary" style={{ marginTop: '1rem' }}>
          Back to Catalogue
        </Link>
      </div>
    );
  }

  const renderStars = (rating) => {
    return Array.from({ length: 5 }, (_, i) => (
      <FaStar
        key={i}
        style={{
          color: i < Math.floor(rating) ? '#FFB800' : '#D3D3D3',
          marginRight: '0.25rem',
        }}
      />
    ));
  };

  return (
    <div className="book-detail-page">
      <section className="section">
        <div className="container">
          <Link to="/catalogue" className="btn btn-outline btn-small" style={{ marginBottom: '2rem' }}>
            ← Back to Catalogue
          </Link>

          <div className="grid grid-2" style={{ alignItems: 'flex-start' }}>
            {/* Book Cover & Info */}
            <div>
              <img
                src={book.cover_image_url}
                alt={book.title}
                className="img-rounded"
                style={{ width: '100%', maxWidth: '400px' }}
                onError={(e) => {
                  e.target.src = '/assets/images/book-placeholder.jpg';
                }}
              />
            </div>

            {/* Book Details */}
            <div>
              <h1 style={{ marginBottom: '0.5rem' }}>{book.title}</h1>
              <p style={{ fontSize: '1.25rem', color: 'var(--text-charcoal)', marginBottom: '1rem' }}>
                by {book.authors.join(', ')}
              </p>

              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  {renderStars(book.rating)}
                  <span style={{ marginLeft: '0.5rem', fontWeight: '500' }}>
                    {book.rating.toFixed(1)} ({book.total_reviews} reviews)
                  </span>
                </div>
              </div>

              <div style={{ marginBottom: '1.5rem' }}>
                {book.available_items > 0 ? (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--success-green)' }}>
                    <FaCheckCircle />
                    <span style={{ fontWeight: '500' }}>
                      {book.available_items} of {book.total_items} copies available
                    </span>
                  </div>
                ) : (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#dc3545' }}>
                    <FaTimesCircle />
                    <span style={{ fontWeight: '500' }}>Currently unavailable</span>
                  </div>
                )}
              </div>

              <div className="card" style={{ padding: '1.5rem', marginBottom: '1.5rem' }}>
                <h4>Book Information</h4>
                <table style={{ width: '100%', marginTop: '1rem' }}>
                  <tbody>
                    <tr style={{ borderBottom: '1px solid var(--light-gray)' }}>
                      <td style={{ padding: '0.75rem 0', fontWeight: '500' }}>ISBN</td>
                      <td style={{ padding: '0.75rem 0' }}>{book.isbn}</td>
                    </tr>
                    <tr style={{ borderBottom: '1px solid var(--light-gray)' }}>
                      <td style={{ padding: '0.75rem 0', fontWeight: '500' }}>Publisher</td>
                      <td style={{ padding: '0.75rem 0' }}>{book.publisher}</td>
                    </tr>
                    <tr style={{ borderBottom: '1px solid var(--light-gray)' }}>
                      <td style={{ padding: '0.75rem 0', fontWeight: '500' }}>Publication Year</td>
                      <td style={{ padding: '0.75rem 0' }}>{book.publication_year}</td>
                    </tr>
                    <tr style={{ borderBottom: '1px solid var(--light-gray)' }}>
                      <td style={{ padding: '0.75rem 0', fontWeight: '500' }}>Pages</td>
                      <td style={{ padding: '0.75rem 0' }}>{book.pages}</td>
                    </tr>
                    <tr style={{ borderBottom: '1px solid var(--light-gray)' }}>
                      <td style={{ padding: '0.75rem 0', fontWeight: '500' }}>Language</td>
                      <td style={{ padding: '0.75rem 0' }}>{book.language}</td>
                    </tr>
                    <tr style={{ borderBottom: '1px solid var(--light-gray)' }}>
                      <td style={{ padding: '0.75rem 0', fontWeight: '500' }}>Collection</td>
                      <td style={{ padding: '0.75rem 0' }}>{book.collection}</td>
                    </tr>
                    <tr>
                      <td style={{ padding: '0.75rem 0', fontWeight: '500' }}>Age Rating</td>
                      <td style={{ padding: '0.75rem 0' }}>{book.age_rating}</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <div style={{ display: 'flex', gap: '1rem' }}>
                <button className="btn btn-primary" disabled>
                  <FaBook style={{ marginRight: '0.5rem' }} />
                  Reserve Book (Members Only)
                </button>
              </div>
            </div>
          </div>

          {/* Description */}
          <div className="section">
            <h3>Description</h3>
            <p style={{ lineHeight: '1.8', fontSize: '1.05rem' }}>{book.description}</p>
            {book.subjects && book.subjects.length > 0 && (
              <div style={{ marginTop: '1.5rem' }}>
                <strong>Subjects:</strong>{' '}
                {book.subjects.map((subject, index) => (
                  <span key={index} className="badge" style={{ marginLeft: '0.5rem' }}>
                    {subject}
                  </span>
                ))}
              </div>
            )}
            {book.tags && book.tags.length > 0 && (
              <div style={{ marginTop: '1rem' }}>
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
          </div>

          {/* Reviews */}
          <div className="section section-alt" style={{ padding: '2rem', borderRadius: 'var(--radius-lg)' }}>
            <h3 style={{ marginBottom: '1.5rem' }}>Member Reviews ({reviews.length})</h3>

            {reviews.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                {reviews.map((review) => (
                  <div key={review.review_id} className="card">
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <FaUser style={{ color: 'var(--accent-peru)' }} />
                        <strong>{review.patron_name}</strong>
                      </div>
                      <div>{renderStars(review.rating)}</div>
                    </div>
                    <p style={{ marginTop: '0.75rem', lineHeight: '1.6' }}>{review.review_text}</p>
                    <p style={{ fontSize: '0.875rem', color: '#6c757d', marginTop: '0.5rem', marginBottom: 0 }}>
                      {new Date(review.created_at).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted">No reviews yet. Be the first to review this book!</p>
            )}

            <div className="card" style={{ marginTop: '1.5rem', backgroundColor: 'var(--light-beige)' }}>
              <h5>Write a Review</h5>
              <p className="text-muted">Members can write reviews and rate books. Please log in to continue.</p>
              <Link to="/membership" className="btn btn-primary">
                Become a Member
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default BookDetail;
