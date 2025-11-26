import React, { useState, useEffect } from 'react';
import { patronAPI } from '../services/api';

function BrowseBooks() {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedBook, setSelectedBook] = useState(null);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [review, setReview] = useState({ rating: 5, comment: '' });
  const [searchMode, setSearchMode] = useState('keyword'); // 'keyword' or 'semantic'
  const [searchResult, setSearchResult] = useState({ mode: '', count: 0 });

  useEffect(() => {
    loadBooks();
  }, [search]);

  const loadBooks = async () => {
    try {
      setLoading(true);
      const response = await patronAPI.getBooks(1, '', search);
      setBooks(response.data.books);
      setSearchResult({ mode: 'keyword', count: response.data.books.length });
    } catch (err) {
      console.error('Failed to load books:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSemanticSearch = async () => {
    if (!search.trim()) return;

    try {
      setLoading(true);
      const response = await patronAPI.semanticSearch(search, 20);
      setBooks(response.data.books || []);
      setSearchResult({
        mode: response.data.mode || 'semantic',
        count: (response.data.books || []).length
      });
    } catch (err) {
      console.error('Semantic search failed:', err);
      // Fallback to regular search
      loadBooks();
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchMode === 'semantic') {
      handleSemanticSearch();
    } else {
      loadBooks();
    }
  };

  const handleBookClick = async (bookId) => {
    try {
      const response = await patronAPI.getBookDetails(bookId);
      setSelectedBook(response.data);
      setShowReviewForm(false);
    } catch (err) {
      alert('Failed to load book details');
    }
  };

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    try {
      await patronAPI.addReview(selectedBook.book.book_id, review.rating, review.comment);
      alert('Review submitted successfully!');
      setShowReviewForm(false);
      setReview({ rating: 5, comment: '' });
      // Reload book details
      handleBookClick(selectedBook.book.book_id);
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to submit review');
    }
  };

  if (loading) {
    return <div className="loading">Loading books...</div>;
  }

  return (
    <div>
      <h1>Browse Books</h1>

      <div style={{ marginBottom: '20px' }}>
        <form onSubmit={handleSearchSubmit}>
          <div style={{ display: 'flex', gap: '10px', marginBottom: '10px' }}>
            <input
              type="text"
              placeholder={searchMode === 'semantic'
                ? "Try: 'books about chemistry for students' or 'inspiring biographies'"
                : "Search books by title or author..."}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{
                flex: 1,
                padding: '12px',
                fontSize: '16px',
                border: '1px solid #ddd',
                borderRadius: '5px'
              }}
            />
            <button
              type="submit"
              className="btn btn-primary"
              style={{ padding: '12px 24px', whiteSpace: 'nowrap' }}
            >
              Search
            </button>
          </div>
        </form>

        <div style={{ display: 'flex', gap: '15px', alignItems: 'center', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
            <span style={{ fontWeight: '600', fontSize: '14px' }}>Search Mode:</span>
            <button
              type="button"
              onClick={() => setSearchMode('keyword')}
              className={`btn ${searchMode === 'keyword' ? 'btn-primary' : 'btn-secondary'}`}
              style={{ padding: '6px 16px', fontSize: '14px' }}
            >
              Keyword
            </button>
            <button
              type="button"
              onClick={() => setSearchMode('semantic')}
              className={`btn ${searchMode === 'semantic' ? 'btn-primary' : 'btn-secondary'}`}
              style={{ padding: '6px 16px', fontSize: '14px' }}
            >
              Semantic AI
            </button>
          </div>

          {searchMode === 'semantic' && (
            <span style={{ fontSize: '13px', color: '#666', fontStyle: 'italic' }}>
              💡 Semantic search understands natural language queries
            </span>
          )}

          {searchResult.mode && search && (
            <span style={{ fontSize: '13px', color: '#27ae60', fontWeight: '500' }}>
              {searchResult.mode === 'keyword-fallback'
                ? `⚠️ Semantic search unavailable, showing keyword results (${searchResult.count})`
                : `✓ Found ${searchResult.count} books using ${searchResult.mode} search`}
            </span>
          )}
        </div>
      </div>

      {selectedBook ? (
        <div className="card">
          <button
            onClick={() => setSelectedBook(null)}
            className="btn btn-secondary"
            style={{ marginBottom: '15px' }}
          >
            ← Back to Books
          </button>

          <div style={{ display: 'grid', gridTemplateColumns: '200px 1fr', gap: '20px' }}>
            <div>
              {selectedBook.book.cover_image_url ? (
                <img
                  src={selectedBook.book.cover_image_url}
                  alt={selectedBook.book.title}
                  style={{ width: '100%', borderRadius: '5px' }}
                />
              ) : (
                <div style={{
                  width: '100%',
                  height: '300px',
                  backgroundColor: '#f0f0f0',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderRadius: '5px'
                }}>
                  No Cover
                </div>
              )}
            </div>

            <div>
              <h2>{selectedBook.book.title}</h2>
              <p><strong>Author:</strong> {selectedBook.book.author || 'Unknown'}</p>
              <p><strong>Genre:</strong> {selectedBook.book.genre || 'N/A'}</p>
              <p><strong>Collection:</strong> {selectedBook.book.collection}</p>
              <p><strong>Available Copies:</strong> {selectedBook.book.available_copies}</p>
              {selectedBook.book.avg_rating && (
                <p><strong>Rating:</strong> {parseFloat(selectedBook.book.avg_rating).toFixed(1)} ⭐ 
                   ({selectedBook.book.review_count} reviews)</p>
              )}
              {selectedBook.book.description && (
                <p style={{ marginTop: '15px' }}>{selectedBook.book.description}</p>
              )}

              <button
                onClick={() => setShowReviewForm(!showReviewForm)}
                className="btn btn-primary"
                style={{ marginTop: '15px' }}
              >
                {showReviewForm ? 'Cancel' : 'Write a Review'}
              </button>

              {showReviewForm && (
                <form onSubmit={handleSubmitReview} style={{ marginTop: '15px', padding: '15px', backgroundColor: '#f9f9f9', borderRadius: '5px' }}>
                  <div className="form-group">
                    <label>Rating (1-5 stars)</label>
                    <select
                      value={review.rating}
                      onChange={(e) => setReview({...review, rating: parseInt(e.target.value)})}
                      required
                    >
                      <option value="5">5 - Excellent</option>
                      <option value="4">4 - Good</option>
                      <option value="3">3 - Average</option>
                      <option value="2">2 - Below Average</option>
                      <option value="1">1 - Poor</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Your Review</label>
                    <textarea
                      value={review.comment}
                      onChange={(e) => setReview({...review, comment: e.target.value})}
                      rows="4"
                      placeholder="Share your thoughts about this book..."
                    />
                  </div>
                  <button type="submit" className="btn btn-success">Submit Review</button>
                </form>
              )}
            </div>
          </div>

          {selectedBook.reviews && selectedBook.reviews.length > 0 && (
            <div style={{ marginTop: '30px' }}>
              <h3>Reviews</h3>
              {selectedBook.reviews.map((rev, idx) => (
                <div key={idx} style={{
                  padding: '15px',
                  marginBottom: '10px',
                  backgroundColor: '#f9f9f9',
                  borderRadius: '5px'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
                    <strong>{rev.patron_name}</strong>
                    <span>{'⭐'.repeat(rev.rating)}</span>
                  </div>
                  <p style={{ margin: 0 }}>{rev.comment}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        <div className="book-grid">
          {books.map((book) => (
            <div
              key={book.book_id}
              className="book-card"
              onClick={() => handleBookClick(book.book_id)}
            >
              {book.cover_image_url ? (
                <img src={book.cover_image_url} alt={book.title} />
              ) : (
                <div style={{
                  width: '100%',
                  height: '250px',
                  backgroundColor: '#f0f0f0',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  No Cover
                </div>
              )}
              <div className="book-card-content">
                <h4>{book.title}</h4>
                <p>{book.author || 'Unknown Author'}</p>
                <p><small>{book.collection}</small></p>
                {book.avg_rating && (
                  <p>⭐ {parseFloat(book.avg_rating).toFixed(1)}</p>
                )}
                <p style={{ color: book.available_copies > 0 ? '#27ae60' : '#e74c3c', fontWeight: 'bold' }}>
                  {book.available_copies > 0 ? `${book.available_copies} Available` : 'Not Available'}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}

      {books.length === 0 && !loading && (
        <div className="card">
          <p style={{ textAlign: 'center', color: '#666' }}>No books found</p>
        </div>
      )}
    </div>
  );
}

export default BrowseBooks;
