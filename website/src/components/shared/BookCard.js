import React from 'react';
import { Link } from 'react-router-dom';
import { FaStar } from 'react-icons/fa';

const BookCard = ({ book, compact = false }) => {
  const {
    book_id,
    title,
    authors = [],
    cover_image_url,
    thumbnail_url,
    rating = 0,
    available_items = 0,
    collection_name,
    age_rating,
    tags = [],
  } = book;

  const displayImage = cover_image_url || thumbnail_url || '/assets/images/book-placeholder.jpg';
  const displayAuthors = authors.join(', ') || 'Unknown Author';
  const isAvailable = available_items > 0;

  return (
    <div className={`book-card ${compact ? 'book-card-compact' : ''}`}>
      <img
        src={displayImage}
        alt={title}
        className="book-card-image"
        onError={(e) => {
          e.target.src = '/assets/images/book-placeholder.jpg';
        }}
      />
      <div className="book-card-content">
        <h4 className="book-card-title">{title}</h4>
        <p className="book-card-author">by {displayAuthors}</p>
        {tags.length > 0 && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.25rem', marginTop: '0.5rem', marginBottom: '0.5rem' }}>
            {tags.slice(0, 3).map((tag, index) => (
              <span
                key={index}
                style={{
                  fontSize: '0.7rem',
                  padding: '0.15rem 0.4rem',
                  background: '#e3f2fd',
                  color: '#1976d2',
                  borderRadius: '10px',
                  fontWeight: '500'
                }}
              >
                {tag}
              </span>
            ))}
            {tags.length > 3 && (
              <span style={{ fontSize: '0.7rem', color: '#666' }}>+{tags.length - 3}</span>
            )}
          </div>
        )}
        <div className="book-card-meta">
          {compact ? (
            <>
              {collection_name && (
                <span className="book-card-collection">{collection_name}</span>
              )}
              {age_rating && (
                <span className="book-card-age-rating">{age_rating}</span>
              )}
            </>
          ) : (
            <>
              {rating > 0 && (
                <div className="book-card-rating">
                  <FaStar />
                  <span>{rating.toFixed(1)}</span>
                </div>
              )}
              <span className={`book-card-availability ${isAvailable ? 'available' : 'unavailable'}`}>
                {isAvailable ? `${available_items} available` : 'Not available'}
              </span>
            </>
          )}
        </div>
        <Link to={`/books/${book_id}`} className="btn btn-secondary btn-small" style={{ marginTop: '1rem', width: '100%' }}>
          View Details
        </Link>
      </div>
    </div>
  );
};

export default BookCard;
