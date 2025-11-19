import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { eventManagementAPI } from '../../services/api';
import { FaSave, FaArrowLeft, FaCalendar } from 'react-icons/fa';
import '../../styles/event-form.css';

const EventForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    start_time: '',
    end_time: '',
    location: '',
    max_participants: '',
    registration_required: false,
    registration_deadline: '',
    image_url: '',
    event_type: 'Workshop',
  });
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState({});

  const eventTypes = [
    'Workshop',
    'Book Club',
    'Author Talk',
    'Reading Session',
    'Toastmasters',
    'Art Club',
    'Chess',
    'Study Group',
    'Community Event',
    'Other',
  ];

  useEffect(() => {
    if (id) {
      fetchEvent();
    }
  }, [id]);

  const fetchEvent = async () => {
    try {
      setLoading(true);
      const response = await eventManagementAPI.getEventById(id);
      const event = response.data;
      setFormData({
        title: event.title,
        description: event.description,
        start_time: formatDateTimeForInput(event.start_time),
        end_time: formatDateTimeForInput(event.end_time),
        location: event.location || '',
        max_participants: event.max_participants || '',
        registration_required: event.registration_required || false,
        registration_deadline: event.registration_deadline
          ? formatDateTimeForInput(event.registration_deadline)
          : '',
        image_url: event.image_url || '',
        event_type: event.event_type || 'Workshop',
      });
    } catch (error) {
      console.error('Error fetching event:', error);
      alert('Failed to load event');
      navigate('/admin/events');
    } finally {
      setLoading(false);
    }
  };

  const formatDateTimeForInput = (dateString) => {
    const date = new Date(dateString);
    return date.toISOString().slice(0, 16);
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));

    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: null,
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Event title is required';
    }

    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
    }

    if (!formData.start_time) {
      newErrors.start_time = 'Start time is required';
    }

    if (!formData.end_time) {
      newErrors.end_time = 'End time is required';
    }

    if (formData.start_time && formData.end_time) {
      if (new Date(formData.start_time) >= new Date(formData.end_time)) {
        newErrors.end_time = 'End time must be after start time';
      }
    }

    if (formData.registration_required && !formData.registration_deadline) {
      newErrors.registration_deadline =
        'Registration deadline is required when registration is required';
    }

    if (formData.max_participants && formData.max_participants < 1) {
      newErrors.max_participants = 'Max participants must be at least 1';
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
      setSaving(true);
      const data = {
        ...formData,
        max_participants: formData.max_participants
          ? parseInt(formData.max_participants)
          : null,
      };

      if (id) {
        await eventManagementAPI.updateEvent(id, data);
        alert('Event updated successfully!');
      } else {
        await eventManagementAPI.createEvent(data);
        alert('Event created successfully!');
      }

      navigate('/admin/events');
    } catch (error) {
      console.error('Error saving event:', error);
      alert(error.response?.data?.message || 'Failed to save event');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="event-form loading">
        <div className="spinner"></div>
        <p>Loading event...</p>
      </div>
    );
  }

  return (
    <div className="event-form-container">
      <div className="form-header">
        <button
          className="btn btn-text"
          onClick={() => navigate('/admin/events')}
        >
          <FaArrowLeft /> Back to Events
        </button>
        <div className="header-content">
          <FaCalendar className="header-icon" />
          <h1>{id ? 'Edit Event' : 'Create New Event'}</h1>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="event-form">
        <div className="form-section">
          <h2>Event Information</h2>

          <div className="form-group">
            <label htmlFor="title">
              Event Title <span className="required">*</span>
            </label>
            <input
              type="text"
              id="title"
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder="Enter event title"
              className={errors.title ? 'error' : ''}
            />
            {errors.title && <span className="error-message">{errors.title}</span>}
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="event_type">Event Type</label>
              <select
                id="event_type"
                name="event_type"
                value={formData.event_type}
                onChange={handleChange}
              >
                {eventTypes.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="location">Location</label>
              <input
                type="text"
                id="location"
                name="location"
                value={formData.location}
                onChange={handleChange}
                placeholder="Event location"
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="description">
              Description <span className="required">*</span>
            </label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Describe the event..."
              rows="5"
              className={errors.description ? 'error' : ''}
            ></textarea>
            {errors.description && (
              <span className="error-message">{errors.description}</span>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="image_url">Event Image URL</label>
            <input
              type="url"
              id="image_url"
              name="image_url"
              value={formData.image_url}
              onChange={handleChange}
              placeholder="https://example.com/event-image.jpg"
            />
          </div>
        </div>

        <div className="form-section">
          <h2>Schedule</h2>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="start_time">
                Start Time <span className="required">*</span>
              </label>
              <input
                type="datetime-local"
                id="start_time"
                name="start_time"
                value={formData.start_time}
                onChange={handleChange}
                className={errors.start_time ? 'error' : ''}
              />
              {errors.start_time && (
                <span className="error-message">{errors.start_time}</span>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="end_time">
                End Time <span className="required">*</span>
              </label>
              <input
                type="datetime-local"
                id="end_time"
                name="end_time"
                value={formData.end_time}
                onChange={handleChange}
                className={errors.end_time ? 'error' : ''}
              />
              {errors.end_time && (
                <span className="error-message">{errors.end_time}</span>
              )}
            </div>
          </div>
        </div>

        <div className="form-section">
          <h2>Registration Settings</h2>

          <div className="form-group checkbox">
            <label>
              <input
                type="checkbox"
                name="registration_required"
                checked={formData.registration_required}
                onChange={handleChange}
              />
              <span>Require registration for this event</span>
            </label>
          </div>

          {formData.registration_required && (
            <>
              <div className="form-group">
                <label htmlFor="registration_deadline">
                  Registration Deadline <span className="required">*</span>
                </label>
                <input
                  type="datetime-local"
                  id="registration_deadline"
                  name="registration_deadline"
                  value={formData.registration_deadline}
                  onChange={handleChange}
                  className={errors.registration_deadline ? 'error' : ''}
                />
                {errors.registration_deadline && (
                  <span className="error-message">
                    {errors.registration_deadline}
                  </span>
                )}
              </div>

              <div className="form-group">
                <label htmlFor="max_participants">Maximum Participants</label>
                <input
                  type="number"
                  id="max_participants"
                  name="max_participants"
                  value={formData.max_participants}
                  onChange={handleChange}
                  placeholder="Leave empty for unlimited"
                  min="1"
                  className={errors.max_participants ? 'error' : ''}
                />
                {errors.max_participants && (
                  <span className="error-message">{errors.max_participants}</span>
                )}
                <small>Leave empty for unlimited participants</small>
              </div>
            </>
          )}
        </div>

        <div className="form-actions">
          <button
            type="button"
            className="btn btn-secondary"
            onClick={() => navigate('/admin/events')}
          >
            Cancel
          </button>
          <button type="submit" className="btn btn-primary" disabled={saving}>
            <FaSave /> {saving ? 'Saving...' : id ? 'Update Event' : 'Create Event'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default EventForm;
