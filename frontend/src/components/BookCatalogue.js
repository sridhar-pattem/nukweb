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
  const [showNewCollectionForm, setShowNewCollectionForm] = useState(false);
  const [newCollectionName, setNewCollectionName] = useState('');
  const [newCollectionDescription, setNewCollectionDescription] = useState('');
  const [showDamagedLost, setShowDamagedLost] = useState(false);
  const [newBook, setNewBook] = useState({
    isbn: '',
    title: '',
    author: '',
    genre: '',
    sub_genre: '',
    publisher: '',
    publication_year: '',
    description: '',
    collection_id: '',
    total_copies: 1,
    age_rating: '',
    cover_image_url: ''
  });

  useEffect(() => {
    loadCollections();
  }, []);

  useEffect(() => {
    loadBooks();
  }, [page, search, selectedCollection, showDamagedLost]);

  const loadBooks = async () => {
    try {
      setLoading(true);
      const filters = { search };
      if (selectedCollection) {
        filters.collection = selectedCollection;
      }
      if (!showDamagedLost) {
        filters.exclude_damaged_lost = true;
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

  const handleCreateCollection = async () => {
    if (!newCollectionName.trim()) {
      alert('Please enter a collection name');
      return;
    }

    try {
      const response = await adminCollectionsAPI.createCollection({
        collection_name: newCollectionName,
        description: newCollectionDescription
      });

      // Reload collections
      await loadCollections();

      // Select the newly created collection
      setNewBook({ ...newBook, collection_id: response.data.collection.collection_id });

      // Reset form
      setNewCollectionName('');
      setNewCollectionDescription('');
      setShowNewCollectionForm(false);

      alert('Collection created successfully!');
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to create collection');
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
        collection_id: newBook.collection_id || ''
      });
      alert('Book details fetched! Please select a collection and review before saving.');
    } catch (err) {
      alert(err.response?.data?.error || 'Book not found in Open Library');
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
        collection_id: '',
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
              <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                <label>Collection *</label>
                <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
                  <div style={{ flex: 1 }}>
                    <select
                      value={newBook.collection_id}
                      onChange={(e) => {
                        const value = e.target.value;
                        if (value === '__new__') {
                          setShowNewCollectionForm(true);
                        } else {
                          setNewBook({...newBook, collection_id: value});
                        }
                      }}
                      required
                      style={{ width: '100%' }}
                    >
                      <option value="">Select a collection</option>
                      {collections.map((col) => (
                        <option key={col.collection_id} value={col.collection_id}>
                          {col.collection_name}
                        </option>
                      ))}
                      <option value="__new__">+ Add New Collection</option>
                    </select>
                  </div>
                </div>

                {showNewCollectionForm && (
                  <div style={{
                    marginTop: '10px',
                    padding: '15px',
                    backgroundColor: '#f0f8ff',
                    border: '1px solid #ccc',
                    borderRadius: '5px'
                  }}>
                    <h4 style={{ marginTop: 0 }}>Create New Collection</h4>
                    <div style={{ display: 'grid', gap: '10px' }}>
                      <div>
                        <label>Collection Name *</label>
                        <input
                          type="text"
                          value={newCollectionName}
                          onChange={(e) => setNewCollectionName(e.target.value)}
                          placeholder="e.g., History, Science Fiction"
                        />
                      </div>
                      <div>
                        <label>Description</label>
                        <textarea
                          value={newCollectionDescription}
                          onChange={(e) => setNewCollectionDescription(e.target.value)}
                          placeholder="Brief description"
                          rows="2"
                        />
                      </div>
                      <div style={{ display: 'flex', gap: '10px' }}>
                        <button
                          type="button"
                          onClick={handleCreateCollection}
                          className="btn btn-success"
                          style={{ fontSize: '12px', padding: '6px 12px' }}
                        >
                          Create Collection
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setShowNewCollectionForm(false);
                            setNewCollectionName('');
                            setNewCollectionDescription('');
                          }}
                          className="btn btn-secondary"
                          style={{ fontSize: '12px', padding: '6px 12px' }}
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  </div>
                )}
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
        {/* Collection Selector */}
        <div style={{ marginBottom: '15px' }}>
          <div style={{ display: 'flex', gap: '10px', alignItems: 'center', marginBottom: '10px' }}>
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
                placeholder="Search by title, author, or ISBN..."
                value={search}
                onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '5px' }}
              />
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <input
              type="checkbox"
              id="showDamagedLost"
              checked={showDamagedLost}
              onChange={(e) => { setShowDamagedLost(e.target.checked); setPage(1); }}
            />
            <label htmlFor="showDamagedLost" style={{ margin: 0, cursor: 'pointer' }}>
              Show Damaged or Lost books
            </label>
          </div>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table>
            <thead>
              <tr>
                <th>Cover</th>
                <th>ISBN</th>
                <th>Title</th>
                <th>Author</th>
                <th>Collection</th>
                <th>Copies</th>
                <th>Status</th>
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
                    {book.is_checked_out && (
                      <div style={{ marginTop: '3px' }}>
                        <span style={{
                          padding: '2px 6px',
                          borderRadius: '3px',
                          fontSize: '10px',
                          backgroundColor: '#ff9800',
                          color: 'white'
                        }}>
                          CHECKED OUT
                        </span>
                        {book.due_date && (
                          <small style={{ marginLeft: '5px', color: '#666' }}>
                            Due: {new Date(book.due_date).toLocaleDateString()}
                          </small>
                        )}
                      </div>
                    )}
                  </td>
                  <td>{book.author || 'Unknown'}</td>
                  <td>{book.collection}</td>
                  <td>
                    {book.available_copies}/{book.total_copies}
                    {book.available_copies === 0 && book.total_copies > 0 && (
                      <div style={{ fontSize: '10px', color: '#d32f2f', marginTop: '2px' }}>
                        All copies out
                      </div>
                    )}
                  </td>
                  <td>
                    {(() => {
                      // Check for Damaged or Lost status first
                      if (book.status === 'Damaged') {
                        return (
                          <span style={{
                            padding: '3px 8px',
                            borderRadius: '3px',
                            fontSize: '12px',
                            backgroundColor: '#f39c12',
                            color: 'white'
                          }}>
                            Damaged
                          </span>
                        );
                      } else if (book.status === 'Lost') {
                        return (
                          <span style={{
                            padding: '3px 8px',
                            borderRadius: '3px',
                            fontSize: '12px',
                            backgroundColor: '#95a5a6',
                            color: 'white'
                          }}>
                            Lost
                          </span>
                        );
                      } else if (book.is_checked_out && book.due_date) {
                        // Checked out status with due date
                        const dueDate = new Date(book.due_date).toLocaleDateString();
                        return (
                          <span style={{
                            padding: '3px 8px',
                            borderRadius: '3px',
                            fontSize: '12px',
                            backgroundColor: '#e74c3c',
                            color: 'white'
                          }}>
                            Checked Out (Due: {dueDate})
                          </span>
                        );
                      } else {
                        // Available status
                        return (
                          <span style={{
                            padding: '3px 8px',
                            borderRadius: '3px',
                            fontSize: '12px',
                            backgroundColor: '#27ae60',
                            color: 'white'
                          }}>
                            Available
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
