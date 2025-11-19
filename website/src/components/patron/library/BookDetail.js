import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { patronLibraryAPI } from '../../../services/api';
import {
  FaBook,
  FaStar,
  FaCheckCircle,
  FaTimesCircle,
  FaArrowLeft,
  FaRegStar,
  FaUser
} from 'react-icons/fa';
import '../../../styles/library-dashboard.css';

const BookDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [book, setBook] = useState(null);
  const [error, setError] = useState('');
  const [reviewForm, setReviewForm] = useState({
    rating: 0,
    comment: '',
  });
  const [hoverRating, setHoverRating] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [reviewSuccess, setReviewSuccess] = useState('');

  useEffect(() => {
    fetchBookDetails();
  }, [id]);

  const fetchBookDetails = async () => {
    try {
      setLoading(true);
      const response = await patronLibraryAPI.getBookDetails(id);
      setBook(response.data);
    } catch (err) {
      console.error('Error fetching book details:', err);
      setError('Failed to load book details');
    } finally {
      setLoading(false);
    }
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();

    if (reviewForm.rating === 0) {
      setError('Please select a rating');
      return;
    }

    try {
      setSubmitting(true);
      setError('');
      await patronLibraryAPI.addBookReview(id, reviewForm);
      setReviewSuccess('Review submitted successfully!');
      setReviewForm({ rating: 0, comment: '' });

      // Refresh book details to show new review
      setTimeout(() => {
        fetchBookDetails();
        setReviewSuccess('');
      }, 2000);
    } catch (err) {
      console.error('Error submitting review:', err);
      setError(err.response?.data?.error || 'Failed to submit review');
    } finally {
      setSubmitting(false);
    }
  };

  const getAvailabilityStatus = () => {
    if (!book.total_items || book.total_items === 0) {
      return {
        text: 'Not Available',
        className: 'unavailable',
        icon: <FaTimesCircle />,
        description: 'This book is currently not available in our collection.'
      };
    }
    if (book.available_items > 0) {
      return {
        text: `${book.available_items} of ${book.total_items} Available`,
        className: 'available',
        icon: <FaCheckCircle />,
        description: 'Visit the library to check out this book.'
      };
    }
    return {
      text: 'All Checked Out',
      className: 'checked-out',
      icon: <FaTimesCircle />,
      description: `All ${book.total_items} copies are currently checked out.`
    };
  };

  const renderStars = (rating, interactive = false, onHover = null, onClick = null) => {
    return (
      <div className="star-rating">
        {[1, 2, 3, 4, 5].map((star) => (
          <span
            key={star}
            className={`star ${star <= (interactive ? (hoverRating || rating) : rating) ? 'filled' : ''}`}
            onMouseEnter={() => interactive && onHover && onHover(star)}
            onMouseLeave={() => interactive && onHover && onHover(0)}
            onClick={() => interactive && onClick && onClick(star)}
          >
            {star <= (interactive ? (hoverRating || rating) : rating) ? <FaStar /> : <FaRegStar />}
          </span>
        ))}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="library-dashboard loading">
        <div className="spinner"></div>
        <p>Loading book details...</p>
      </div>
    );
  }

  if (error && !book) {
    return (
      <div className="library-dashboard">
        <div className="error-message">{error}</div>
        <button onClick={() => navigate(-1)} className="btn btn-outline">
          <FaArrowLeft /> Go Back
        </button>
      </div>
    );
  }

  if (!book) {
    return (
      <div className="library-dashboard">
        <div className="empty-state">
          <FaBook />
          <p>Book not found</p>
          <Link to="/patron/library/browse" className="btn btn-primary">
            Browse Books
          </Link>
        </div>
      </div>
    );
  }

  const availability = getAvailabilityStatus();

  return (
    <div className="library-dashboard book-detail">
      <button onClick={() => navigate(-1)} className="btn btn-outline btn-small back-button">
        <FaArrowLeft /> Back
      </button>

      <div className="book-detail-header">
        <div className="book-detail-cover">
          {book.cover_image_url ? (
            <img src={book.cover_image_url} alt={book.title} />
          ) : (
            <div className="cover-placeholder-large">
              <FaBook />
            </div>
          )}
        </div>

        <div className="book-detail-info">
          <h1>{book.title}</h1>
          {book.subtitle && <h2 className="subtitle">{book.subtitle}</h2>}

          {book.contributors && book.contributors.length > 0 && (
            <div className="contributors-list">
              <h3>Contributors</h3>
              {book.contributors.map((contributor, index) => (
                <div key={index} className="contributor-item">
                  <strong>{contributor.name}</strong>
                  {contributor.role && <span className="role"> ({contributor.role})</span>}
                  {(contributor.date_of_birth || contributor.date_of_death) && (
                    <span className="dates">
                      {' '}
                      {contributor.date_of_birth && new Date(contributor.date_of_birth).getFullYear()}
                      {contributor.date_of_death && ` - ${new Date(contributor.date_of_death).getFullYear()}`}
                    </span>
                  )}
                </div>
              ))}
            </div>
          )}

          <div className="book-meta">
            {book.isbn && (
              <div className="meta-item">
                <strong>ISBN:</strong> {book.isbn}
              </div>
            )}
            {book.publisher && (
              <div className="meta-item">
                <strong>Publisher:</strong> {book.publisher}
              </div>
            )}
            {book.publication_year && (
              <div className="meta-item">
                <strong>Year:</strong> {book.publication_year}
              </div>
            )}
            {book.collection_name && (
              <div className="meta-item">
                <strong>Collection:</strong> {book.collection_name}
              </div>
            )}
            {book.age_rating && (
              <div className="meta-item">
                <strong>Age Rating:</strong> {book.age_rating}
              </div>
            )}
          </div>

          <div className={`availability-section ${availability.className}`}>
            <div className="availability-icon">{availability.icon}</div>
            <div>
              <h3>{availability.text}</h3>
              <p>{availability.description}</p>
            </div>
          </div>

          {book.avg_rating && (
            <div className="book-rating-summary">
              <div className="rating-score">
                {renderStars(Math.round(book.avg_rating))}
                <span className="rating-number">
                  {parseFloat(book.avg_rating).toFixed(1)} out of 5
                </span>
              </div>
              {book.review_count > 0 && (
                <span className="review-count">
                  Based on {book.review_count} review{book.review_count !== 1 ? 's' : ''}
                </span>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Description */}
      {book.description && (
        <div className="book-section">
          <h2>Description</h2>
          <p className="book-description">{book.description}</p>
        </div>
      )}

      {/* Add Review Section */}
      <div className="book-section">
        <h2>Write a Review</h2>
        {reviewSuccess && <div className="success-message">{reviewSuccess}</div>}
        {error && <div className="error-message">{error}</div>}

        <form onSubmit={handleReviewSubmit} className="review-form">
          <div className="form-group">
            <label>Your Rating *</label>
            {renderStars(
              reviewForm.rating,
              true,
              setHoverRating,
              (rating) => setReviewForm({ ...reviewForm, rating })
            )}
          </div>

          <div className="form-group">
            <label htmlFor="review-comment">Your Review (Optional)</label>
            <textarea
              id="review-comment"
              rows="5"
              placeholder="Share your thoughts about this book..."
              value={reviewForm.comment}
              onChange={(e) => setReviewForm({ ...reviewForm, comment: e.target.value })}
            />
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            disabled={submitting || reviewForm.rating === 0}
          >
            {submitting ? 'Submitting...' : 'Submit Review'}
          </button>
        </form>
      </div>

      {/* Reviews Section */}
      {book.reviews && book.reviews.length > 0 && (
        <div className="book-section">
          <h2>Reader Reviews</h2>
          <div className="reviews-list">
            {book.reviews.map((review) => (
              <div key={review.review_id} className="review-card">
                <div className="review-header">
                  <div className="reviewer-info">
                    <FaUser className="reviewer-icon" />
                    <div>
                      <strong>{review.patron_name}</strong>
                      <span className="review-date">
                        {new Date(review.created_at).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                  {renderStars(review.rating)}
                </div>
                {review.comment && (
                  <p className="review-comment">{review.comment}</p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default BookDetail;
