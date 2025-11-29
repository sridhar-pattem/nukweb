import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaBook, FaCalendar, FaComment } from 'react-icons/fa';
import BannerImageManager from '../admin/BannerImageManager';
import { useAuth } from '../../context/AuthContext';

const Blog = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [posts, setPosts] = useState([]);

  const handleSubmitPost = () => {
    if (!isAuthenticated) {
      alert('Please log in to submit a blog post');
      navigate('/login');
      return;
    }
    navigate('/patron/blog/new');
  };

  useEffect(() => {
    // Fetch published blog posts from API
    // TODO: Replace with actual API call when backend endpoint is ready
    setPosts([]);
  }, []);

  return (
    <div className="blog-page">
      {/* Hero */}
      <section
        className="hero"
        style={{
          height: '350px',
          backgroundImage: 'url(/assets/images/Nuk-20.jpeg)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
          position: 'relative'
        }}
      >
        <div className="hero-overlay"></div>
        <div className="hero-content">
          <h1><FaBook style={{ marginRight: '1rem' }} />Member Blog</h1>
          <p>Stories, reviews, and insights from our reading community</p>
        </div>
        <BannerImageManager pageName="blog" currentImage="Nuk-20.jpeg" />
      </section>

      {/* Blog Posts */}
      <section className="section">
        <div className="container">
          <div className="grid grid-2" style={{ alignItems: 'flex-start' }}>
            {/* Main Content */}
            <div style={{ gridColumn: '1 / -1' }}>
              <h2 style={{ marginBottom: '2rem' }}>Latest Posts</h2>
            </div>

            {/* Posts List */}
            <div style={{ gridColumn: '1 / 2' }}>
              {posts.length === 0 ? (
                <div className="card" style={{ textAlign: 'center', padding: '3rem 2rem' }}>
                  <FaBook style={{ fontSize: '3rem', color: 'var(--accent-peru)', marginBottom: '1rem' }} />
                  <h3 style={{ marginBottom: '1rem' }}>No Blog Posts Yet</h3>
                  <p style={{ color: '#6c757d', marginBottom: '1.5rem', lineHeight: '1.6' }}>
                    Be the first to share your reading experience, book reviews, or library stories with our community!
                  </p>
                  {isAuthenticated && (
                    <button onClick={handleSubmitPost} className="btn btn-primary">
                      Write Your First Post
                    </button>
                  )}
                </div>
              ) : (
                posts.map((post) => (
                  <div key={post.post_id} className="card" style={{ marginBottom: '2rem' }}>
                    <img
                      src={post.featured_image}
                      alt={post.title}
                      className="img-rounded"
                      style={{ width: '100%', height: '250px', objectFit: 'cover', marginBottom: '1rem' }}
                    />
                    <span className="badge" style={{ marginBottom: '0.5rem' }}>{post.category}</span>
                    <h3 style={{ marginBottom: '1rem' }}>
                      <Link to={`/blog/${post.post_id}`} style={{ color: 'var(--secondary-brown)', textDecoration: 'none' }}>
                        {post.title}
                      </Link>
                    </h3>
                    <p style={{ marginBottom: '1rem', lineHeight: '1.6' }}>{post.excerpt}</p>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: '1rem', borderTop: '1px solid var(--light-gray)' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <div
                          style={{
                            width: '32px',
                            height: '32px',
                            borderRadius: '50%',
                            backgroundColor: 'var(--accent-peru)',
                            color: 'white',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontWeight: '600',
                          }}
                        >
                          {post.author_avatar}
                        </div>
                        <div>
                          <div style={{ fontSize: '0.9rem', fontWeight: '500' }}>{post.author}</div>
                          <div style={{ fontSize: '0.875rem', color: '#6c757d' }}>
                            <FaCalendar style={{ marginRight: '0.25rem' }} />
                            {new Date(post.published_date).toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric',
                            })}
                          </div>
                        </div>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#6c757d' }}>
                        <FaComment />
                        <span>{post.comments_count}</span>
                      </div>
                    </div>
                    <Link to={`/blog/${post.post_id}`} className="btn btn-outline" style={{ marginTop: '1rem', width: '100%' }}>
                      Read More
                    </Link>
                  </div>
                ))
              )}
            </div>

            {/* Sidebar */}
            <div>
              <div className="card" style={{ marginBottom: '2rem' }}>
                <h4>Write for Us</h4>
                <p>
                  Members can share their reading experiences, book reviews, and recommendations.
                  Your post will be reviewed before publishing.
                </p>
                <button className="btn btn-primary" style={{ width: '100%' }} onClick={handleSubmitPost}>
                  Submit a Post
                </button>
              </div>

              <div className="card" style={{ marginBottom: '2rem' }}>
                <h4>Categories</h4>
                <ul style={{ listStyle: 'none', marginTop: '1rem' }}>
                  <li style={{ padding: '0.5rem 0', borderBottom: '1px solid var(--light-gray)' }}>
                    <a href="#book-reviews" style={{ color: 'var(--text-charcoal)' }}>Book Reviews</a>
                  </li>
                  <li style={{ padding: '0.5rem 0', borderBottom: '1px solid var(--light-gray)' }}>
                    <a href="#recommendations" style={{ color: 'var(--text-charcoal)' }}>Recommendations</a>
                  </li>
                  <li style={{ padding: '0.5rem 0', borderBottom: '1px solid var(--light-gray)' }}>
                    <a href="#reading-tips" style={{ color: 'var(--text-charcoal)' }}>Reading Tips</a>
                  </li>
                  <li style={{ padding: '0.5rem 0', borderBottom: '1px solid var(--light-gray)' }}>
                    <a href="#author-spotlights" style={{ color: 'var(--text-charcoal)' }}>Author Spotlights</a>
                  </li>
                  <li style={{ padding: '0.5rem 0' }}>
                    <a href="#library-experiences" style={{ color: 'var(--text-charcoal)' }}>Library Experiences</a>
                  </li>
                </ul>
              </div>

              <div className="card" style={{ backgroundColor: 'var(--light-beige)' }}>
                <h4>Featured Quote</h4>
                <blockquote style={{ fontStyle: 'italic', marginTop: '1rem', paddingLeft: '1rem', borderLeft: '4px solid var(--accent-peru)' }}>
                  "There is no friend as loyal as a book."
                  <footer style={{ marginTop: '0.5rem', fontStyle: 'normal', fontSize: '0.9rem' }}>
                    — Ernest Hemingway
                  </footer>
                </blockquote>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Blog;
