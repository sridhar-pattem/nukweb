import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { adminBooksAPI, adminCollectionsAPI } from '../services/api';

function BookCatalogue() {
  const navigate = useNavigate();
  const [books, setBooks] = useState([]);
  const [collections, setCollections] = useState([]);
  const [selectedCollection, setSelectedCollection] = useState('');
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
    subtitle: '',
    publisher: '',
    publication_year: '',
    description: '',
    collection_id: '',
    language: 'eng',
    age_rating: '',
    cover_image_url: ''
  });

  useEffect(() => {
    loadCollections();
  }, []);

  useEffect(() => {
    loadBooks();
  }, [page, search, selectedCollection]);

  const loadBooks = async () => {
    try {
      setLoading(true);
      const filters = { search };
      if (selectedCollection) {
        filters.collection = selectedCollection;
      }
      const response = await adminBooksAPI.getBooks(page, filters);
      setBooks(response.data.books);
      setTotalPages(response.data.total_pages);
      setError('');
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to load books');
    } finally {
      setLoading(false);
    }
  };

  const loadCollections = async () => {
    try {
      const response = await adminCollectionsAPI.getCollections();
      setCollections(response.data);

      // Find "Popular Science" collection and set as default
      const popularScience = response.data.find(c =>
        c.collection_name.toLowerCase().includes('popular science')
      );
      if (popularScience && !selectedCollection) {
        setSelectedCollection(popularScience.collection_id);
      }
    } catch (err) {
      console.error('Failed to load collections:', err);
    }
  };

  const handleBookClick = (bookId) => {
    navigate(`/admin/books/${bookId}`);
  };

  const handleISBNLookup = async () => {
    if (!isbnLookup) {
      alert('Please enter an ISBN');
      return;
    }

    try {
      setLookupLoading(true);
      const response = await adminBooksAPI.fetchByISBN(isbnLookup);
      const bookData = response.data;

      // Map the response to our new schema
      setNewBook({
        isbn: bookData.isbn || '',
        title: bookData.title || '',
        subtitle: bookData.subtitle || '',
        publisher: bookData.publisher || '',
        publication_year: bookData.publication_year || '',
        description: bookData.description || '',
        cover_image_url: bookData.cover_image_url || '',
        collection_id: newBook.collection_id || '',
        language: 'eng',
        age_rating: ''
      });
      alert('Book details fetched! Please select a collection and review before saving. You can add contributors and items after creating the book.');
    } catch (err) {
      alert(err.response?.data?.error || 'Book not found');
    } finally {
      setLookupLoading(false);
    }
  };

  const handleAddBook = async (e) => {
    e.preventDefault();
    if (!newBook.collection_id) {
      alert('Please select a collection');
      return;
    }

    try {
      const response = await adminBooksAPI.addBook(newBook);
      setShowAddForm(false);
      setNewBook({
        isbn: '',
        title: '',
        subtitle: '',
        publisher: '',
        publication_year: '',
        description: '',
        collection_id: '',
        language: 'eng',
        age_rating: '',
        cover_image_url: ''
      });
      setIsbnLookup('');
      loadBooks();
      alert('Book added successfully! Click on the book to add contributors and items.');
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to add book');
    }
  };

  // Helper function to display contributors
  const getContributorDisplay = (contributors) => {
    if (!contributors || !Array.isArray(contributors) || contributors.length === 0) {
      return 'Unknown';
    }
    const authors = contributors.filter(c => c && c.role === 'author');
    if (authors.length > 0) {
      return authors.map(a => a.name).join(', ');
    }
    return contributors[0] && contributors[0].name ? contributors[0].name : 'Unknown';
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

          <div style={{ marginBottom: '15px', padding: '10px', backgroundColor: '#fff3cd', borderRadius: '5px', border: '1px solid #ffc107' }}>
            <strong>Note:</strong> Add basic book information here. After creating the book, click on it to add contributors, items/barcodes, and additional details.
          </div>

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
                {lookupLoading ? 'Looking up...' : 'Fetch from Google Books'}
              </button>
            </div>
          </div>

          {/* Manual Entry Form */}
          <form onSubmit={handleAddBook}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
              <div className="form-group">
                <label>ISBN</label>
                <input
                  type="text"
                  value={newBook.isbn}
                  onChange={(e) => setNewBook({...newBook, isbn: e.target.value})}
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
                <label>Subtitle</label>
                <input
                  type="text"
                  value={newBook.subtitle}
                  onChange={(e) => setNewBook({...newBook, subtitle: e.target.value})}
                />
              </div>
              <div className="form-group">
                <label>Collection *</label>
                <select
                  value={newBook.collection_id}
                  onChange={(e) => setNewBook({...newBook, collection_id: e.target.value})}
                  required
                  style={{ width: '100%' }}
                >
                  <option value="">Select a collection</option>
                  {collections.map((col) => (
                    <option key={col.collection_id} value={col.collection_id}>
                      {col.collection_name}
                    </option>
                  ))}
                </select>
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
                <label>Language</label>
                <select
                  value={newBook.language}
                  onChange={(e) => setNewBook({...newBook, language: e.target.value})}
                >
                  <option value="eng">English</option>
                  <option value="spa">Spanish</option>
                  <option value="fra">French</option>
                  <option value="ger">German</option>
                  <option value="ita">Italian</option>
                  <option value="por">Portuguese</option>
                  <option value="chi">Chinese</option>
                  <option value="jpn">Japanese</option>
                </select>
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
        {/* Collection Selector */}
        <div style={{ marginBottom: '15px', display: 'flex', gap: '10px', alignItems: 'center' }}>
          <div style={{ flex: 1 }}>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500' }}>Filter by Collection:</label>
            <select
              value={selectedCollection}
              onChange={(e) => {
                setSelectedCollection(e.target.value);
                setPage(1);
              }}
              style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '5px' }}
            >
              <option value="">All Collections</option>
              {collections.map((col) => (
                <option key={col.collection_id} value={col.collection_id}>
                  {col.collection_name} ({col.book_count} books)
                </option>
              ))}
            </select>
          </div>
          <div style={{ flex: 1 }}>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500' }}>Search:</label>
            <input
              type="text"
              placeholder="Search by title, contributor, or ISBN..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '5px' }}
            />
          </div>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table>
            <thead>
              <tr>
                <th>Cover</th>
                <th>ISBN</th>
                <th>Title</th>
                <th>Contributors</th>
                <th>Collection</th>
                <th>Items</th>
                <th>Availability</th>
              </tr>
            </thead>
            <tbody>
              {books.map((book) => (
                <tr key={book.book_id}>
                  <td>
                    <img
                      src={book.cover_image_url || 'https://via.placeholder.com/60x90?text=No+Cover'}
                      alt={book.title}
                      style={{
                        width: '60px',
                        height: '90px',
                        objectFit: 'cover',
                        borderRadius: '4px',
                        cursor: 'pointer'
                      }}
                      onClick={() => handleBookClick(book.book_id)}
                      onError={(e) => { e.target.src = 'https://via.placeholder.com/60x90?text=No+Cover'; }}
                    />
                  </td>
                  <td>{book.isbn}</td>
                  <td>
                    <span
                      style={{
                        color: '#667eea',
                        cursor: 'pointer',
                        textDecoration: 'underline',
                        fontWeight: '500'
                      }}
                      onClick={() => handleBookClick(book.book_id)}
                    >
                      {book.title}
                    </span>
                    {book.subtitle && (
                      <div style={{ fontSize: '12px', color: '#666', marginTop: '2px' }}>
                        {book.subtitle}
                      </div>
                    )}
                  </td>
                  <td>
                    {getContributorDisplay(book.contributors)}
                    {book.contributors && book.contributors.length > 1 && (
                      <div style={{ fontSize: '11px', color: '#888', marginTop: '2px' }}>
                        +{book.contributors.length - 1} more
                      </div>
                    )}
                  </td>
                  <td>{book.collection_name || book.collection}</td>
                  <td>
                    <div>
                      <strong>{book.available_items || 0}/{book.total_items || 0}</strong>
                    </div>
                    {(book.total_items || 0) === 0 && (
                      <div style={{ fontSize: '10px', color: '#ff9800', marginTop: '2px' }}>
                        No items added
                      </div>
                    )}
                    {(book.available_items || 0) === 0 && (book.total_items || 0) > 0 && (
                      <div style={{ fontSize: '10px', color: '#d32f2f', marginTop: '2px' }}>
                        All checked out
                      </div>
                    )}
                  </td>
                  <td>
                    {(() => {
                      const totalItems = book.total_items || 0;
                      const availableItems = book.available_items || 0;
                      const checkedOutItems = book.checked_out_items || 0;

                      if (totalItems === 0) {
                        return (
                          <span style={{
                            padding: '3px 8px',
                            borderRadius: '3px',
                            fontSize: '12px',
                            backgroundColor: '#ff9800',
                            color: 'white'
                          }}>
                            No Items
                          </span>
                        );
                      } else if (availableItems > 0) {
                        return (
                          <span style={{
                            padding: '3px 8px',
                            borderRadius: '3px',
                            fontSize: '12px',
                            backgroundColor: '#27ae60',
                            color: 'white'
                          }}>
                            Available ({availableItems})
                          </span>
                        );
                      } else if (checkedOutItems > 0) {
                        return (
                          <span style={{
                            padding: '3px 8px',
                            borderRadius: '3px',
                            fontSize: '12px',
                            backgroundColor: '#e74c3c',
                            color: 'white'
                          }}>
                            All Out
                          </span>
                        );
                      } else {
                        return (
                          <span style={{
                            padding: '3px 8px',
                            borderRadius: '3px',
                            fontSize: '12px',
                            backgroundColor: '#95a5a6',
                            color: 'white'
                          }}>
                            Unavailable
                          </span>
                        );
                      }
                    })()}
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
