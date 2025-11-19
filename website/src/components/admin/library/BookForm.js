import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { adminLibraryAPI } from '../../../services/api';
import { FaBook, FaSearch, FaPlus, FaTrash, FaArrowLeft } from 'react-icons/fa';
import '../../../styles/admin-library.css';

const BookForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditMode = !!id;

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [collections, setCollections] = useState([]);
  const [contributors, setContributors] = useState([]);
  const [isbnLookup, setIsbnLookup] = useState('');
  const [lookupLoading, setLookupLoading] = useState(false);

  const [formData, setFormData] = useState({
    isbn: '',
    title: '',
    subtitle: '',
    publisher: '',
    publication_year: '',
    language: 'English',
    pages: '',
    description: '',
    age_rating: '',
    collection_id: '',
    cover_image_url: '',
  });

  const [bookContributors, setBookContributors] = useState([]);

  useEffect(() => {
    fetchCollections();
    if (isEditMode) {
      fetchBookDetails();
    }
  }, [id]);

  const fetchCollections = async () => {
    try {
      const response = await adminLibraryAPI.getCollections();
      setCollections(response.data || []);
    } catch (err) {
      console.error('Error fetching collections:', err);
    }
  };

  const fetchBookDetails = async () => {
    try {
      setLoading(true);
      const response = await adminLibraryAPI.getBookById(id);
      const book = response.data;

      setFormData({
        isbn: book.isbn || '',
        title: book.title || '',
        subtitle: book.subtitle || '',
        publisher: book.publisher || '',
        publication_year: book.publication_year || '',
        language: book.language || 'English',
        pages: book.pages || '',
        description: book.description || '',
        age_rating: book.age_rating || '',
        collection_id: book.collection_id || '',
        cover_image_url: book.cover_image_url || '',
      });

      setBookContributors(book.contributors || []);
    } catch (err) {
      console.error('Error fetching book:', err);
      setError('Failed to load book details');
    } finally {
      setLoading(false);
    }
  };

  const handleIsbnLookup = async () => {
    if (!isbnLookup) {
      setError('Please enter an ISBN');
      return;
    }

    try {
      setLookupLoading(true);
      setError('');
      const response = await adminLibraryAPI.fetchBookByISBN(isbnLookup);
      const bookData = response.data;

      setFormData({
        isbn: bookData.isbn || isbnLookup,
        title: bookData.title || '',
        subtitle: bookData.subtitle || '',
        publisher: bookData.publisher || '',
        publication_year: bookData.publication_year || '',
        language: bookData.language || 'English',
        pages: bookData.pages || '',
        description: bookData.description || '',
        age_rating: formData.age_rating,
        collection_id: formData.collection_id,
        cover_image_url: bookData.cover_image_url || '',
      });

      if (bookData.contributors && bookData.contributors.length > 0) {
        setBookContributors(bookData.contributors);
      }

      setSuccess('Book details fetched successfully!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      console.error('Error looking up ISBN:', err);
      setError(err.response?.data?.error || 'Failed to fetch book details from ISBN');
    } finally {
      setLookupLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.title) {
      setError('Title is required');
      return;
    }

    try {
      setSaving(true);
      setError('');

      const bookData = {
        ...formData,
        contributors: bookContributors,
      };

      if (isEditMode) {
        await adminLibraryAPI.updateBook(id, bookData);
        setSuccess('Book updated successfully!');
      } else {
        await adminLibraryAPI.createBook(bookData);
        setSuccess('Book created successfully!');
      }

      setTimeout(() => {
        navigate('/admin/library/cataloging');
      }, 1500);
    } catch (err) {
      console.error('Error saving book:', err);
      setError(err.response?.data?.error || 'Failed to save book');
    } finally {
      setSaving(false);
    }
  };

  const addContributor = () => {
    setBookContributors([...bookContributors, { name: '', role: 'Author' }]);
  };

  const removeContributor = (index) => {
    setBookContributors(bookContributors.filter((_, i) => i !== index));
  };

  const updateContributor = (index, field, value) => {
    const updated = [...bookContributors];
    updated[index][field] = value;
    setBookContributors(updated);
  };

  if (loading) {
    return (
      <div className="admin-library loading">
        <div className="spinner"></div>
        <p>Loading book...</p>
      </div>
    );
  }

  return (
    <div className="admin-library">
      <div className="admin-header">
        <div>
          <h1>{isEditMode ? 'Edit Book' : 'Add Book'}</h1>
          <p>{isEditMode ? 'Update book information' : 'Add a new book to the catalog'}</p>
        </div>
        <Link to="/admin/library/cataloging" className="btn btn-outline">
          <FaArrowLeft /> Back to Catalog
        </Link>
      </div>

      {error && <div className="error-message">{error}</div>}
      {success && <div className="success-message">{success}</div>}

      {/* ISBN Lookup */}
      {!isEditMode && (
        <div className="form-section">
          <h2>Quick Add by ISBN</h2>
          <div className="isbn-lookup">
            <input
              type="text"
              placeholder="Enter ISBN (e.g., 9780123456789)"
              value={isbnLookup}
              onChange={(e) => setIsbnLookup(e.target.value)}
              className="form-control"
            />
            <button
              type="button"
              onClick={handleIsbnLookup}
              disabled={lookupLoading}
              className="btn btn-primary"
            >
              <FaSearch /> {lookupLoading ? 'Looking up...' : 'Lookup'}
            </button>
          </div>
          <p className="help-text">Automatically fetch book details from Google Books</p>
        </div>
      )}

      {/* Book Form */}
      <form onSubmit={handleSubmit} className="book-form">
        <div className="form-section">
          <h2>Book Information</h2>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="isbn">ISBN</label>
              <input
                type="text"
                id="isbn"
                name="isbn"
                value={formData.isbn}
                onChange={handleChange}
                className="form-control"
              />
            </div>

            <div className="form-group">
              <label htmlFor="collection_id">Collection</label>
              <select
                id="collection_id"
                name="collection_id"
                value={formData.collection_id}
                onChange={handleChange}
                className="form-control"
              >
                <option value="">Select Collection</option>
                {collections.map((collection) => (
                  <option key={collection.collection_id} value={collection.collection_id}>
                    {collection.collection_name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="title">Title *</label>
            <input
              type="text"
              id="title"
              name="title"
              value={formData.title}
              onChange={handleChange}
              className="form-control"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="subtitle">Subtitle</label>
            <input
              type="text"
              id="subtitle"
              name="subtitle"
              value={formData.subtitle}
              onChange={handleChange}
              className="form-control"
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="publisher">Publisher</label>
              <input
                type="text"
                id="publisher"
                name="publisher"
                value={formData.publisher}
                onChange={handleChange}
                className="form-control"
              />
            </div>

            <div className="form-group">
              <label htmlFor="publication_year">Publication Year</label>
              <input
                type="number"
                id="publication_year"
                name="publication_year"
                value={formData.publication_year}
                onChange={handleChange}
                className="form-control"
                min="1000"
                max={new Date().getFullYear() + 1}
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="language">Language</label>
              <input
                type="text"
                id="language"
                name="language"
                value={formData.language}
                onChange={handleChange}
                className="form-control"
              />
            </div>

            <div className="form-group">
              <label htmlFor="pages">Pages</label>
              <input
                type="number"
                id="pages"
                name="pages"
                value={formData.pages}
                onChange={handleChange}
                className="form-control"
                min="1"
              />
            </div>

            <div className="form-group">
              <label htmlFor="age_rating">Age Rating</label>
              <select
                id="age_rating"
                name="age_rating"
                value={formData.age_rating}
                onChange={handleChange}
                className="form-control"
              >
                <option value="">Select Age Rating</option>
                <option value="All Ages">All Ages</option>
                <option value="Children">Children</option>
                <option value="Young Adult">Young Adult</option>
                <option value="Adult">Adult</option>
              </select>
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="description">Description</label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              className="form-control"
              rows="4"
            />
          </div>

          <div className="form-group">
            <label htmlFor="cover_image_url">Cover Image URL</label>
            <input
              type="url"
              id="cover_image_url"
              name="cover_image_url"
              value={formData.cover_image_url}
              onChange={handleChange}
              className="form-control"
            />
          </div>
        </div>

        {/* Contributors Section */}
        <div className="form-section">
          <div className="section-header">
            <h2>Contributors</h2>
            <button type="button" onClick={addContributor} className="btn btn-outline btn-small">
              <FaPlus /> Add Contributor
            </button>
          </div>

          {bookContributors.length === 0 ? (
            <p className="help-text">No contributors added yet</p>
          ) : (
            <div className="contributors-list">
              {bookContributors.map((contributor, index) => (
                <div key={index} className="contributor-item">
                  <div className="form-row">
                    <div className="form-group">
                      <input
                        type="text"
                        placeholder="Name"
                        value={contributor.name}
                        onChange={(e) => updateContributor(index, 'name', e.target.value)}
                        className="form-control"
                      />
                    </div>
                    <div className="form-group">
                      <select
                        value={contributor.role}
                        onChange={(e) => updateContributor(index, 'role', e.target.value)}
                        className="form-control"
                      >
                        <option value="Author">Author</option>
                        <option value="Editor">Editor</option>
                        <option value="Translator">Translator</option>
                        <option value="Illustrator">Illustrator</option>
                      </select>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeContributor(index)}
                      className="btn btn-icon btn-danger"
                    >
                      <FaTrash />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Form Actions */}
        <div className="form-actions">
          <button
            type="button"
            onClick={() => navigate('/admin/library/cataloging')}
            className="btn btn-outline"
          >
            Cancel
          </button>
          <button type="submit" disabled={saving} className="btn btn-primary">
            {saving ? 'Saving...' : isEditMode ? 'Update Book' : 'Create Book'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default BookForm;
