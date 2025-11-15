import React, { useState, useEffect } from 'react';
import { adminBooksAPI } from '../services/api';

function BookCatalogue() {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [showAddForm, setShowAddForm] = useState(false);
  const [isbnLookup, setIsbnLookup] = useState('');
  const [lookupLoading, setLookupLoading] = useState(false);
  const [newBook, setNewBook] = useState({
    isbn: '',
    title: '',
    author: '',
    genre: '',
    sub_genre: '',
    publisher: '',
    publication_year: '',
    description: '',
    collection: '',
    total_copies: 1,
    age_rating: '',
    cover_image_url: ''
  });

  useEffect(() => {
    loadBooks();
  }, [page, search]);

  const loadBooks = async () => {
    try {
      setLoading(true);
      const response = await adminBooksAPI.getBooks(page, { search });
      setBooks(response.data.books);
      setTotalPages(response.data.total_pages);
      setError('');
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to load books');
    } finally {
      setLoading(false);
    }
  };

  const handleISBNLookup = async () => {
    if (!isbnLookup) {
      alert('Please enter an ISBN');
      return;
    }

    try {
      setLookupLoading(true);
      const response = await adminBooksAPI.fetchByISBN(isbnLookup);
      setNewBook({
        ...newBook,
        ...response.data,
        total_copies: 1,
        collection: newBook.collection || ''
      });
      alert('Book details fetched! Please add collection and review before saving.');
    } catch (err) {
      alert(err.response?.data?.error || 'Book not found in Open Library');
    } finally {
      setLookupLoading(false);
    }
  };

  const handleAddBook = async (e) => {
    e.preventDefault();
    if (!newBook.collection) {
      alert('Please specify a collection (e.g., History, Philosophy, Science, etc.)');
      return;
    }

    try {
      await adminBooksAPI.addBook(newBook);
      setShowAddForm(false);
      setNewBook({
        isbn: '',
        title: '',
        author: '',
        genre: '',
        sub_genre: '',
        publisher: '',
        publication_year: '',
        description: '',
        collection: '',
        total_copies: 1,
        age_rating: '',
        cover_image_url: ''
      });
      setIsbnLookup('');
      loadBooks();
      alert('Book added successfully!');
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to add book');
    }
  };

  const handleUpdateStatus = async (bookId, status) => {
    if (window.confirm(`Mark this book as ${status}?`)) {
      try {
        await adminBooksAPI.updateBookStatus(bookId, status);
        loadBooks();
        alert(`Book status updated to ${status}`);
      } catch (err) {
        alert('Failed to update book status');
      }
    }
  };

  if (loading && books.length === 0) {
    return <div className="loading">Loading books...</div>;
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h1>Book Catalogue</h1>
        <button onClick={() => setShowAddForm(!showAddForm)} className="btn btn-primary">
          {showAddForm ? 'Cancel' : 'Add New Book'}
        </button>
      </div>

      {error && <div className="error-message">{error}</div>}

      {showAddForm && (
        <div className="card" style={{ marginBottom: '20px' }}>
          <h3>Add New Book</h3>
          
          {/* ISBN Lookup */}
          <div style={{ marginBottom: '20px', padding: '15px', backgroundColor: '#f0f0f0', borderRadius: '5px' }}>
            <h4>Quick Add via ISBN</h4>
            <div style={{ display: 'flex', gap: '10px' }}>
              <input
                type="text"
                placeholder="Enter ISBN (e.g., 9780140449136)"
                value={isbnLookup}
                onChange={(e) => setIsbnLookup(e.target.value)}
                style={{ flex: 1, padding: '10px' }}
              />
              <button
                type="button"
                onClick={handleISBNLookup}
                disabled={lookupLoading}
                className="btn btn-primary"
              >
                {lookupLoading ? 'Looking up...' : 'Fetch from Open Library'}
              </button>
            </div>
          </div>

          {/* Manual Entry Form */}
          <form onSubmit={handleAddBook}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
              <div className="form-group">
                <label>ISBN *</label>
                <input
                  type="text"
                  value={newBook.isbn}
                  onChange={(e) => setNewBook({...newBook, isbn: e.target.value})}
                  required
                />
              </div>
              <div className="form-group">
                <label>Title *</label>
                <input
                  type="text"
                  value={newBook.title}
                  onChange={(e) => setNewBook({...newBook, title: e.target.value})}
                  required
                />
              </div>
              <div className="form-group">
                <label>Author</label>
                <input
                  type="text"
                  value={newBook.author}
                  onChange={(e) => setNewBook({...newBook, author: e.target.value})}
                />
              </div>
              <div className="form-group">
                <label>Collection * (e.g., History, Philosophy)</label>
                <input
                  type="text"
                  value={newBook.collection}
                  onChange={(e) => setNewBook({...newBook, collection: e.target.value})}
                  required
                  placeholder="History, Science, Biography, etc."
                />
              </div>
              <div className="form-group">
                <label>Genre</label>
                <input
                  type="text"
                  value={newBook.genre}
                  onChange={(e) => setNewBook({...newBook, genre: e.target.value})}
                />
              </div>
              <div className="form-group">
                <label>Sub-Genre</label>
                <input
                  type="text"
                  value={newBook.sub_genre}
                  onChange={(e) => setNewBook({...newBook, sub_genre: e.target.value})}
                />
              </div>
              <div className="form-group">
                <label>Publisher</label>
                <input
                  type="text"
                  value={newBook.publisher}
                  onChange={(e) => setNewBook({...newBook, publisher: e.target.value})}
                />
              </div>
              <div className="form-group">
                <label>Publication Year</label>
                <input
                  type="number"
                  value={newBook.publication_year}
                  onChange={(e) => setNewBook({...newBook, publication_year: e.target.value})}
                />
              </div>
              <div className="form-group">
                <label>Age Rating</label>
                <select
                  value={newBook.age_rating}
                  onChange={(e) => setNewBook({...newBook, age_rating: e.target.value})}
                >
                  <option value="">Select Age Rating</option>
                  <option value="2-4 years">2-4 years</option>
                  <option value="5-6 years">5-6 years</option>
                  <option value="7-9 years">7-9 years</option>
                  <option value="10+ years">10+ years</option>
                </select>
              </div>
              <div className="form-group">
                <label>Total Copies</label>
                <input
                  type="number"
                  min="1"
                  value={newBook.total_copies}
                  onChange={(e) => setNewBook({...newBook, total_copies: e.target.value})}
                />
              </div>
              <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                <label>Cover Image URL</label>
                <input
                  type="url"
                  value={newBook.cover_image_url}
                  onChange={(e) => setNewBook({...newBook, cover_image_url: e.target.value})}
                  placeholder="https://..."
                />
              </div>
              <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                <label>Description</label>
                <textarea
                  value={newBook.description}
                  onChange={(e) => setNewBook({...newBook, description: e.target.value})}
                  rows="3"
                />
              </div>
            </div>
            <button type="submit" className="btn btn-success" style={{ marginTop: '10px' }}>
              Add Book to Catalogue
            </button>
          </form>
        </div>
      )}

      <div className="card">
        <div style={{ marginBottom: '15px' }}>
          <input
            type="text"
            placeholder="Search by title, author, or ISBN..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '5px' }}
          />
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Title</th>
                <th>Author</th>
                <th>Collection</th>
                <th>ISBN</th>
                <th>Copies</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {books.map((book) => (
                <tr key={book.book_id}>
                  <td>{book.book_id}</td>
                  <td>{book.title}</td>
                  <td>{book.author || 'Unknown'}</td>
                  <td>{book.collection}</td>
                  <td>{book.isbn}</td>
                  <td>{book.available_copies}/{book.total_copies}</td>
                  <td>
                    <span style={{
                      padding: '3px 8px',
                      borderRadius: '3px',
                      fontSize: '12px',
                      backgroundColor: book.status === 'Available' ? '#27ae60' : '#e74c3c',
                      color: 'white'
                    }}>
                      {book.status}
                    </span>
                  </td>
                  <td>
                    {book.status === 'Available' && (
                      <button
                        onClick={() => handleUpdateStatus(book.book_id, 'Lost')}
                        className="btn btn-danger"
                        style={{ fontSize: '12px', padding: '5px 10px' }}
                      >
                        Mark Lost
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {totalPages > 1 && (
          <div className="pagination">
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              className="btn btn-secondary"
            >
              Previous
            </button>
            <span style={{ padding: '0 15px' }}>
              Page {page} of {totalPages}
            </span>
            <button
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="btn btn-secondary"
            >
              Next
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default BookCatalogue;
