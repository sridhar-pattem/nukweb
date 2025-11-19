import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { patronContentAPI } from '../../services/api';
import { FaPaperPlane, FaArrowLeft, FaStar } from 'react-icons/fa';
import '../../styles/patron-forms.css';

const TestimonialForm = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    content: '',
    rating: 5,
  });
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === 'rating' ? parseInt(value) : value,
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

    if (!formData.content.trim()) {
      newErrors.content = 'Testimonial content is required';
    }

    if (formData.content.length < 50) {
      newErrors.content = 'Please provide more detail (at least 50 characters)';
    }

    if (formData.content.length > 500) {
      newErrors.content = 'Testimonial is too long (maximum 500 characters)';
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
      await patronContentAPI.createTestimonial(formData);
      alert('Testimonial submitted successfully! It will be reviewed before being published.');
      navigate('/patron/dashboard');
    } catch (error) {
      console.error('Error submitting testimonial:', error);
      alert(error.response?.data?.message || 'Failed to submit testimonial');
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
          <FaStar className="header-icon" />
          <h1>Write a Testimonial</h1>
          <p>Share your experience with Nuk Library</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="patron-form">
        <div className="form-section">
          <h2>Your Experience</h2>

          <div className="form-group">
            <label htmlFor="rating">
              Rating <span className="required">*</span>
            </label>
            <div className="rating-input">
              {[1, 2, 3, 4, 5].map((star) => (
                <label key={star} className="star-label">
                  <input
                    type="radio"
                    name="rating"
                    value={star}
                    checked={formData.rating === star}
                    onChange={handleChange}
                  />
                  <FaStar
                    className={`star ${formData.rating >= star ? 'filled' : ''}`}
                  />
                </label>
              ))}
              <span className="rating-text">{formData.rating} out of 5 stars</span>
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="content">
              Your Testimonial <span className="required">*</span>
            </label>
            <textarea
              id="content"
              name="content"
              value={formData.content}
              onChange={handleChange}
              placeholder="Share your thoughts about Nuk Library... What do you love about it? How has it helped you?"
              rows="8"
              className={errors.content ? 'error' : ''}
            ></textarea>
            {errors.content && <span className="error-message">{errors.content}</span>}
            <div className="character-count">
              {formData.content.length}/500 characters
            </div>
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
            <FaPaperPlane /> {submitting ? 'Submitting...' : 'Submit Testimonial'}
          </button>
        </div>
      </form>

      <div className="form-help">
        <h3>Testimonial Guidelines</h3>
        <ul>
          <li>Be honest and authentic in your feedback</li>
          <li>Share specific details about your experience</li>
          <li>Keep it concise but meaningful (50-500 characters)</li>
          <li>All testimonials are reviewed before being published</li>
          <li>Outstanding testimonials may be featured on our homepage</li>
        </ul>
      </div>
    </div>
  );
};

export default TestimonialForm;
