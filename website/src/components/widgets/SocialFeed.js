import React from 'react';
import { FaInstagram, FaFacebook, FaHeart, FaComment } from 'react-icons/fa';

const SocialFeed = ({ platform = 'instagram', limit = 6 }) => {
  // Mock data - will be replaced with API call
  const mockPosts = [
    {
      id: 1,
      image: 'https://via.placeholder.com/300x300?text=Library+Event',
      caption: 'Amazing turnout at today\'s book club meeting!',
      likes: 45,
      comments: 8,
      date: '2 days ago',
    },
    {
      id: 2,
      image: 'https://via.placeholder.com/300x300?text=New+Arrivals',
      caption: 'Fresh books just arrived! Come check them out.',
      likes: 62,
      comments: 12,
      date: '3 days ago',
    },
    {
      id: 3,
      image: 'https://via.placeholder.com/300x300?text=Reading+Corner',
      caption: 'Our cozy reading corner on a rainy afternoon ☕📚',
      likes: 89,
      comments: 15,
      date: '5 days ago',
    },
    {
      id: 4,
      image: 'https://via.placeholder.com/300x300?text=Art+Workshop',
      caption: 'Children\'s art workshop in full swing!',
      likes: 73,
      comments: 10,
      date: '1 week ago',
    },
    {
      id: 5,
      image: 'https://via.placeholder.com/300x300?text=Toastmasters',
      caption: 'Proud of our Toastmasters for their inspiring speeches!',
      likes: 54,
      comments: 9,
      date: '1 week ago',
    },
    {
      id: 6,
      image: 'https://via.placeholder.com/300x300?text=Chess+Tournament',
      caption: 'Chess tournament champions! 🏆',
      likes: 98,
      comments: 18,
      date: '2 weeks ago',
    },
  ];

  const posts = mockPosts.slice(0, limit);
  const platformIcon = platform === 'instagram' ? <FaInstagram /> : <FaFacebook />;
  const platformColor = platform === 'instagram' ? '#E4405F' : '#1877F2';
  const platformName = platform === 'instagram' ? 'Instagram' : 'Facebook';
  const platformHandle = platform === 'instagram' ? '@nuklibrary' : 'Nuk Library';

  return (
    <div className="social-feed">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
        <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span style={{ color: platformColor, fontSize: '1.5rem' }}>{platformIcon}</span>
          Follow us on {platformName}
        </h3>
        <a
          href={`https://${platform}.com/nuklibrary`}
          target="_blank"
          rel="noopener noreferrer"
          className="btn btn-outline btn-small"
          style={{ borderColor: platformColor, color: platformColor }}
        >
          {platformHandle}
        </a>
      </div>

      <div className="grid grid-3">
        {posts.map((post) => (
          <div
            key={post.id}
            className="card"
            style={{
              padding: 0,
              overflow: 'hidden',
              cursor: 'pointer',
              transition: 'transform var(--transition-fast)',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.transform = 'translateY(-4px)')}
            onMouseLeave={(e) => (e.currentTarget.style.transform = 'translateY(0)')}
          >
            <div style={{ position: 'relative', paddingBottom: '100%', backgroundColor: 'var(--light-gray)' }}>
              <img
                src={post.image}
                alt={post.caption}
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                }}
              />
              <div
                style={{
                  position: 'absolute',
                  bottom: 0,
                  left: 0,
                  right: 0,
                  padding: '1rem',
                  background: 'linear-gradient(to top, rgba(0,0,0,0.8), transparent)',
                  color: 'white',
                }}
              >
                <p style={{ margin: 0, fontSize: '0.875rem', marginBottom: '0.5rem' }}>
                  {post.caption}
                </p>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', fontSize: '0.875rem' }}>
                  <span>
                    <FaHeart style={{ marginRight: '0.25rem' }} />
                    {post.likes}
                  </span>
                  <span>
                    <FaComment style={{ marginRight: '0.25rem' }} />
                    {post.comments}
                  </span>
                  <span style={{ marginLeft: 'auto', opacity: 0.8 }}>{post.date}</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SocialFeed;
