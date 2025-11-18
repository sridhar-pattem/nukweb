import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { FaUser, FaCalendar, FaComment, FaHeart } from 'react-icons/fa';

const BlogPost = () => {
  const { id } = useParams();
  const [post, setPost] = useState(null);
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Mock data - will be replaced with API call
    setPost({
      post_id: id,
      title: 'My Journey with Classic Literature',
      content: `When I first joined Nuk Library three years ago, I never imagined that the dusty classics section would become my favorite corner. Like many readers of my generation, I was drawn to contemporary bestsellers and popular fiction. But one rainy afternoon, curiosity led me to pick up "Pride and Prejudice" by Jane Austen, and my reading world transformed.

## The Beginning

It started slowly. Elizabeth Bennet's wit and independence spoke to me in ways I hadn't anticipated. The social commentary, wrapped in romance and humor, revealed layers of meaning that contemporary novels often lacked. I was hooked.

## Discovering Dickens

Next came Charles Dickens. "Great Expectations" was my introduction to his world - a world of vivid characters, social criticism, and unforgettable storytelling. Pip's journey from a humble blacksmith's apprentice to a gentleman mirrored my own journey of self-discovery through reading.

## What I've Learned

Reading classics has taught me patience. These books demand attention and reflection. They've enriched my vocabulary, deepened my understanding of human nature, and provided historical context for our modern world. Most importantly, they've shown me that great stories are timeless.

## My Recommendations

If you're new to classics, start with:
- Pride and Prejudice by Jane Austen
- To Kill a Mockingbird by Harper Lee
- The Great Gatsby by F. Scott Fitzgerald
- Jane Eyre by Charlotte Brontë

Don't be intimidated. Take your time. Discuss with fellow readers. And remember - every classic was once a new book that captured hearts and minds. They still do.`,
      excerpt: 'How diving into Jane Austen and Charles Dickens transformed my reading habits and appreciation for storytelling...',
      author: 'Priya Sharma',
      author_avatar: 'P',
      author_bio: 'Avid reader and member of Nuk Library since 2021. Loves classics, historical fiction, and chai.',
      published_date: '2024-11-15',
      category: 'Book Reviews',
      featured_image: 'https://via.placeholder.com/1200x600?text=Classic+Literature',
      likes_count: 45,
    });

    setComments([
      {
        comment_id: 1,
        author: 'Rajesh K.',
        author_avatar: 'R',
        comment_text: 'This is so inspiring! I\'ve been hesitant to start classics, but your post has motivated me to pick up Pride and Prejudice.',
        created_at: '2024-11-16',
      },
      {
        comment_id: 2,
        author: 'Anita D.',
        author_avatar: 'A',
        comment_text: 'Beautifully written! I had a similar experience with classics. Have you tried Tolstoy?',
        created_at: '2024-11-16',
      },
    ]);

    setLoading(false);
  }, [id]);

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '5rem' }}>
        <p>Loading post...</p>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="container" style={{ padding: '5rem 0', textAlign: 'center' }}>
        <h2>Post not found</h2>
        <Link to="/blog" className="btn btn-primary" style={{ marginTop: '1rem' }}>
          Back to Blog
        </Link>
      </div>
    );
  }

  return (
    <div className="blog-post-page">
      <section className="section">
        <div className="container">
          <Link to="/blog" className="btn btn-outline btn-small" style={{ marginBottom: '2rem' }}>
            ← Back to Blog
          </Link>

          {/* Featured Image */}
          <img
            src={post.featured_image}
            alt={post.title}
            className="img-rounded"
            style={{ width: '100%', maxHeight: '500px', objectFit: 'cover', marginBottom: '2rem' }}
          />

          <div style={{ maxWidth: '800px', margin: '0 auto' }}>
            {/* Post Header */}
            <span className="badge" style={{ marginBottom: '1rem' }}>{post.category}</span>
            <h1 style={{ marginBottom: '1.5rem' }}>{post.title}</h1>

            {/* Author Info */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', paddingBottom: '1.5rem', marginBottom: '2rem', borderBottom: '2px solid var(--light-gray)' }}>
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
                  fontSize: '1.5rem',
                  fontWeight: '600',
                }}
              >
                {post.author_avatar}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: '600', fontSize: '1.125rem' }}>{post.author}</div>
                <div style={{ fontSize: '0.9rem', color: '#6c757d' }}>
                  <FaCalendar style={{ marginRight: '0.5rem' }} />
                  {new Date(post.published_date).toLocaleDateString('en-US', {
                    month: 'long',
                    day: 'numeric',
                    year: 'numeric',
                  })}
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <button className="btn btn-outline btn-small">
                  <FaHeart style={{ marginRight: '0.5rem' }} />
                  {post.likes_count}
                </button>
              </div>
            </div>

            {/* Post Content */}
            <div style={{ fontSize: '1.05rem', lineHeight: '1.8', whiteSpace: 'pre-line', marginBottom: '3rem' }}>
              {post.content}
            </div>

            {/* Author Bio */}
            <div className="card" style={{ backgroundColor: 'var(--light-beige)', marginBottom: '3rem' }}>
              <h4>About the Author</h4>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginTop: '1rem' }}>
                <div
                  style={{
                    width: '64px',
                    height: '64px',
                    borderRadius: '50%',
                    backgroundColor: 'var(--accent-peru)',
                    color: 'white',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '2rem',
                    fontWeight: '600',
                  }}
                >
                  {post.author_avatar}
                </div>
                <div>
                  <h5 style={{ margin: 0 }}>{post.author}</h5>
                  <p style={{ margin: '0.5rem 0 0', color: '#6c757d' }}>{post.author_bio}</p>
                </div>
              </div>
            </div>

            {/* Comments */}
            <div>
              <h3 style={{ marginBottom: '1.5rem' }}>
                <FaComment style={{ marginRight: '0.5rem' }} />
                Comments ({comments.length})
              </h3>

              {comments.map((comment) => (
                <div key={comment.comment_id} className="card" style={{ marginBottom: '1rem' }}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem' }}>
                    <div
                      style={{
                        width: '40px',
                        height: '40px',
                        borderRadius: '50%',
                        backgroundColor: 'var(--accent-peru)',
                        color: 'white',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontWeight: '600',
                        flexShrink: 0,
                      }}
                    >
                      {comment.author_avatar}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: '600' }}>{comment.author}</div>
                      <div style={{ fontSize: '0.875rem', color: '#6c757d', marginBottom: '0.5rem' }}>
                        {new Date(comment.created_at).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        })}
                      </div>
                      <p style={{ margin: 0, lineHeight: '1.6' }}>{comment.comment_text}</p>
                    </div>
                  </div>
                </div>
              ))}

              <div className="card" style={{ marginTop: '2rem', backgroundColor: 'var(--light-beige)' }}>
                <h5>Leave a Comment</h5>
                <p className="text-muted">Members can leave comments. Please log in to continue.</p>
                <Link to="/membership" className="btn btn-primary">
                  Become a Member
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default BlogPost;
