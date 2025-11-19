import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { patronContentAPI } from '../../services/api';
import { FaPaperPlane, FaArrowLeft, FaBook } from 'react-icons/fa';
import '../../styles/patron-forms.css';

const BookSuggestionForm = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    book_title: '',
    author: '',
    isbn: '',
    publisher: '',
    publication_year: '',
    genre: '',
    reason: '',
    purchase_link: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState({});

  const genres = [
    'Fiction',
    'Non-Fiction',
    'Mystery',
    'Thriller',
    'Romance',
    'Science Fiction',
    'Fantasy',
    'Biography',
    'History',
    'Self-Help',
    'Business',
    'Science',
    'Philosophy',
    'Poetry',
    'Children',
    'Young Adult',
    'Other',
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Clear error for this field
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: null,
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.book_title.trim()) {
      newErrors.book_title = 'Book title is required';
    }

    if (!formData.author.trim()) {
      newErrors.author = 'Author name is required';
    }

    if (!formData.reason.trim()) {
      newErrors.reason = 'Please explain why you\'re suggesting this book';
    }

    if (formData.reason.length < 50) {
      newErrors.reason = 'Please provide more detail (at least 50 characters)';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      setSubmitting(true);
      await patronContentAPI.createBookSuggestion(formData);
      alert('Book suggestion submitted successfully! You will be notified once it\'s reviewed.');
      navigate('/patron/dashboard');
    } catch (error) {
      console.error('Error submitting suggestion:', error);
      alert(error.response?.data?.message || 'Failed to submit suggestion');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="patron-form-container">
      <div className="form-header">
        <button
          className="btn btn-text"
          onClick={() => navigate('/patron/dashboard')}
        >
          <FaArrowLeft /> Back to Dashboard
        </button>
        <div className="header-content">
          <FaBook className="header-icon" />
          <h1>Suggest a Book</h1>
          <p>Help us expand our collection by suggesting books you'd like to see in our library</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="patron-form">
        <div className="form-section">
          <h2>Book Information</h2>

          <div className="form-group">
            <label htmlFor="book_title">
              Book Title <span className="required">*</span>
            </label>
            <input
              type="text"
              id="book_title"
              name="book_title"
              value={formData.book_title}
              onChange={handleChange}
              placeholder="Enter the book title"
              className={errors.book_title ? 'error' : ''}
            />
            {errors.book_title && <span className="error-message">{errors.book_title}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="author">
              Author <span className="required">*</span>
            </label>
            <input
              type="text"
              id="author"
              name="author"
              value={formData.author}
              onChange={handleChange}
              placeholder="Author name"
              className={errors.author ? 'error' : ''}
            />
            {errors.author && <span className="error-message">{errors.author}</span>}
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="isbn">ISBN</label>
              <input
                type="text"
                id="isbn"
                name="isbn"
                value={formData.isbn}
                onChange={handleChange}
                placeholder="ISBN (if known)"
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
                placeholder="YYYY"
                min="1800"
                max={new Date().getFullYear()}
              />
            </div>
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
                placeholder="Publisher name"
              />
            </div>

            <div className="form-group">
              <label htmlFor="genre">Genre</label>
              <select
                id="genre"
                name="genre"
                value={formData.genre}
                onChange={handleChange}
              >
                <option value="">Select a genre</option>
                {genres.map((genre) => (
                  <option key={genre} value={genre}>
                    {genre}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="purchase_link">Purchase/Info Link</label>
            <input
              type="url"
              id="purchase_link"
              name="purchase_link"
              value={formData.purchase_link}
              onChange={handleChange}
              placeholder="https://example.com/book-link"
            />
            <small>Optional: Link to where the book can be purchased or more info</small>
          </div>
        </div>

        <div className="form-section">
          <h2>Why This Book?</h2>

          <div className="form-group">
            <label htmlFor="reason">
              Reason for Suggestion <span className="required">*</span>
            </label>
            <textarea
              id="reason"
              name="reason"
              value={formData.reason}
              onChange={handleChange}
              placeholder="Tell us why you think this book would be a great addition to our library..."
              rows="6"
              className={errors.reason ? 'error' : ''}
            ></textarea>
            {errors.reason && <span className="error-message">{errors.reason}</span>}
            <small>Help us understand why this book would benefit our community</small>
          </div>
        </div>

        <div className="form-actions">
          <button
            type="button"
            className="btn btn-secondary"
            onClick={() => navigate('/patron/dashboard')}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="btn btn-primary"
            disabled={submitting}
          >
            <FaPaperPlane /> {submitting ? 'Submitting...' : 'Submit Suggestion'}
          </button>
        </div>
      </form>

      <div className="form-help">
        <h3>Suggestion Guidelines</h3>
        <ul>
          <li>Please check if the book is already in our catalogue before suggesting</li>
          <li>Provide as much detail as possible to help us evaluate the suggestion</li>
          <li>Explain how this book would benefit our community</li>
          <li>We review all suggestions and will notify you of our decision</li>
        </ul>
      </div>
    </div>
  );
};

export default BookSuggestionForm;
