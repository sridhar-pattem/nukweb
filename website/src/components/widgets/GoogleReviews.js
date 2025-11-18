import React from 'react';
import { FaStar, FaGoogle } from 'react-icons/fa';

const GoogleReviews = ({ limit = 3 }) => {
  // Mock data - will be replaced with Google Reviews API
  const mockReviews = [
    {
      id: 1,
      author: 'Priya Sharma',
      rating: 5,
      text: 'Nuk Library has been a second home for my kids. The reading environment and activities have greatly contributed to their development.',
      date: '2 weeks ago',
      avatar: 'P',
    },
    {
      id: 2,
      author: 'Rajesh Kumar',
      rating: 5,
      text: 'The cowork space is perfect for my startup. Quiet, professional, and surrounded by books - what more could I ask for?',
      date: '1 month ago',
      avatar: 'R',
    },
    {
      id: 3,
      author: 'Anita Desai',
      rating: 5,
      text: 'The Toastmasters club at Nuk helped me overcome my fear of public speaking. The supportive community is amazing!',
      date: '1 month ago',
      avatar: 'A',
    },
    {
      id: 4,
      author: 'Vikram Singh',
      rating: 4,
      text: 'Great collection of books and helpful staff. The study space is very quiet and conducive for focused work.',
      date: '2 months ago',
      avatar: 'V',
    },
  ];

  const reviews = mockReviews.slice(0, limit);
  const averageRating = 4.9;
  const totalReviews = 127;

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
    <div className="google-reviews">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
        <div>
          <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
            <FaGoogle style={{ color: '#4285F4' }} />
            Google Reviews
          </h3>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            {renderStars(averageRating)}
            <span style={{ fontWeight: '600', fontSize: '1.125rem' }}>{averageRating}</span>
            <span className="text-muted">({totalReviews} reviews)</span>
          </div>
        </div>
        <a
          href="https://www.google.com/search?q=nuk+library+bangalore"
          target="_blank"
          rel="noopener noreferrer"
          className="btn btn-outline btn-small"
        >
          Write a Review
        </a>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {reviews.map((review) => (
          <div key={review.id} className="card">
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem' }}>
              <div
                style={{
                  width: '48px',
                  height: '48px',
                  borderRadius: '50%',
                  backgroundColor: 'var(--accent-peru)',
                  color: 'white',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '1.25rem',
                  fontWeight: '600',
                  flexShrink: 0,
                }}
              >
                {review.avatar}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                  <div>
                    <h5 style={{ margin: 0 }}>{review.author}</h5>
                    <p style={{ margin: '0.25rem 0 0', fontSize: '0.875rem', color: '#6c757d' }}>
                      {review.date}
                    </p>
                  </div>
                  <div>{renderStars(review.rating)}</div>
                </div>
                <p style={{ margin: '0.75rem 0 0', lineHeight: '1.6' }}>{review.text}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="card" style={{ marginTop: '1rem', backgroundColor: 'var(--light-beige)', textAlign: 'center' }}>
        <p style={{ margin: 0 }}>
          <strong>Love Nuk Library?</strong> Share your experience on Google and help others discover us!
        </p>
        <a
          href="https://www.google.com/search?q=nuk+library+bangalore"
          target="_blank"
          rel="noopener noreferrer"
          className="btn btn-primary"
          style={{ marginTop: '1rem' }}
        >
          Leave a Review
        </a>
      </div>
    </div>
  );
};

export default GoogleReviews;
