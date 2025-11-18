import React from 'react';
import { Link } from 'react-router-dom';
import { FaStar } from 'react-icons/fa';

const BookCard = ({ book }) => {
  const {
    book_id,
    title,
    authors = [],
    cover_image_url,
    thumbnail_url,
    rating = 0,
    available_items = 0,
  } = book;

  const displayImage = cover_image_url || thumbnail_url || '/assets/images/book-placeholder.jpg';
  const displayAuthors = authors.join(', ') || 'Unknown Author';
  const isAvailable = available_items > 0;

  return (
    <div className="book-card">
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
        <div className="book-card-meta">
          {rating > 0 && (
            <div className="book-card-rating">
              <FaStar />
              <span>{rating.toFixed(1)}</span>
            </div>
          )}
          <span className={`book-card-availability ${isAvailable ? 'available' : 'unavailable'}`}>
            {isAvailable ? `${available_items} available` : 'Not available'}
          </span>
        </div>
        <Link to={`/books/${book_id}`} className="btn btn-secondary btn-small" style={{ marginTop: '1rem', width: '100%' }}>
          View Details
        </Link>
      </div>
    </div>
  );
};

export default BookCard;
