import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FaBook, FaUser, FaCalendar, FaComment } from 'react-icons/fa';
import BannerImageManager from '../admin/BannerImageManager';

const Blog = () => {
  const [posts, setPosts] = useState([]);

  useEffect(() => {
    // Mock data - will be replaced with API call
    setPosts([
      {
        post_id: 1,
        title: 'My Journey with Classic Literature',
        excerpt: 'How diving into Jane Austen and Charles Dickens transformed my reading habits and appreciation for storytelling...',
        author: 'Priya Sharma',
        author_avatar: 'P',
        published_date: '2024-11-15',
        category: 'Book Reviews',
        comments_count: 12,
        featured_image: 'https://via.placeholder.com/600x400?text=Classic+Literature',
      },
      {
        post_id: 2,
        title: '10 Must-Read Books for Young Adults',
        excerpt: 'A curated list of contemporary YA books that tackle important themes and offer compelling narratives...',
        author: 'Rajesh Kumar',
        author_avatar: 'R',
        published_date: '2024-11-12',
        category: 'Recommendations',
        comments_count: 8,
        featured_image: 'https://via.placeholder.com/600x400?text=YA+Books',
      },
      {
        post_id: 3,
        title: 'Creating a Reading Routine',
        excerpt: 'Tips and tricks for building a sustainable reading habit in our busy modern lives...',
        author: 'Anita Desai',
        author_avatar: 'A',
        published_date: '2024-11-08',
        category: 'Reading Tips',
        comments_count: 15,
        featured_image: 'https://via.placeholder.com/600x400?text=Reading+Routine',
      },
      {
        post_id: 4,
        title: 'Rediscovering Ruskin Bond',
        excerpt: 'Why Ruskin Bond\'s simple yet profound stories continue to captivate readers of all ages...',
        author: 'Vikram Singh',
        author_avatar: 'V',
        published_date: '2024-11-01',
        category: 'Author Spotlights',
        comments_count: 20,
        featured_image: 'https://via.placeholder.com/600x400?text=Ruskin+Bond',
      },
    ]);
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
              {posts.map((post) => (
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
              ))}
            </div>

            {/* Sidebar */}
            <div>
              <div className="card" style={{ marginBottom: '2rem' }}>
                <h4>Write for Us</h4>
                <p>
                  Members can share their reading experiences, book reviews, and recommendations.
                  Your post will be reviewed before publishing.
                </p>
                <button className="btn btn-primary" style={{ width: '100%' }}>
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
