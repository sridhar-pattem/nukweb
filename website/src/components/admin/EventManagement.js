import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { eventManagementAPI } from '../../services/api';
import { FaCalendar, FaPlus, FaEdit, FaTrash, FaUsers, FaEye } from 'react-icons/fa';
import '../../styles/event-management.css';

const EventManagement = () => {
  const navigate = useNavigate();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    fetchEvents();
  }, [filter]);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      const params = filter !== 'all' ? { filter } : {};
      const response = await eventManagementAPI.getAllEvents(params);
      setEvents(response.data.events || []);
    } catch (error) {
      console.error('Error fetching events:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (eventId, eventTitle) => {
    if (window.confirm(`Are you sure you want to delete "${eventTitle}"?`)) {
      try {
        await eventManagementAPI.deleteEvent(eventId);
        alert('Event deleted successfully');
        fetchEvents();
      } catch (error) {
        console.error('Error deleting event:', error);
        alert(error.response?.data?.message || 'Failed to delete event');
      }
    }
  };

  const getEventStatus = (event) => {
    const now = new Date();
    const startDate = new Date(event.start_time);
    const endDate = new Date(event.end_time);

    if (now > endDate) return 'past';
    if (now >= startDate && now <= endDate) return 'ongoing';
    return 'upcoming';
  };

  const getStatusBadge = (status) => {
    const badges = {
      upcoming: 'badge-blue',
      ongoing: 'badge-green',
      past: 'badge-gray',
    };
    return badges[status] || 'badge-gray';
  };

  const filteredEvents = events.filter((event) => {
    const status = getEventStatus(event);
    if (filter === 'all') return true;
    return status === filter;
  });

  if (loading) {
    return (
      <div className="event-management loading">
        <div className="spinner"></div>
        <p>Loading events...</p>
      </div>
    );
  }

  return (
    <div className="event-management">
      <div className="management-header">
        <div className="header-content">
          <h1>Event Management</h1>
          <p>Create and manage library events</p>
        </div>
        <div className="header-actions">
          <Link to="/admin/events/new" className="btn btn-primary">
            <FaPlus /> Create Event
          </Link>
        </div>
      </div>

      {/* Filters */}
      <div className="event-filters">
        <button
          className={filter === 'all' ? 'active' : ''}
          onClick={() => setFilter('all')}
        >
          All Events ({events.length})
        </button>
        <button
          className={filter === 'upcoming' ? 'active' : ''}
          onClick={() => setFilter('upcoming')}
        >
          Upcoming ({events.filter((e) => getEventStatus(e) === 'upcoming').length})
        </button>
        <button
          className={filter === 'ongoing' ? 'active' : ''}
          onClick={() => setFilter('ongoing')}
        >
          Ongoing ({events.filter((e) => getEventStatus(e) === 'ongoing').length})
        </button>
        <button
          className={filter === 'past' ? 'active' : ''}
          onClick={() => setFilter('past')}
        >
          Past ({events.filter((e) => getEventStatus(e) === 'past').length})
        </button>
      </div>

      {/* Events List */}
      {filteredEvents.length === 0 ? (
        <div className="empty-state">
          <FaCalendar />
          <p>No {filter !== 'all' ? filter : ''} events found</p>
          <Link to="/admin/events/new" className="btn btn-primary">
            <FaPlus /> Create Your First Event
          </Link>
        </div>
      ) : (
        <div className="events-grid">
          {filteredEvents.map((event) => (
            <div key={event.event_id} className="event-card">
              <div className="event-header">
                {event.image_url && (
                  <div
                    className="event-image"
                    style={{ backgroundImage: `url(${event.image_url})` }}
                  ></div>
                )}
                <span className={`status-badge ${getStatusBadge(getEventStatus(event))}`}>
                  {getEventStatus(event)}
                </span>
              </div>
              <div className="event-content">
                <h3>{event.title}</h3>
                <p className="event-description">{event.description}</p>
                <div className="event-details">
                  <div className="detail-item">
                    <FaCalendar />
                    <span>
                      {new Date(event.start_time).toLocaleDateString()} -{' '}
                      {new Date(event.end_time).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="detail-item">
                    <FaUsers />
                    <span>
                      {event.current_participants || 0}/{event.max_participants || '∞'}
                      {event.max_participants &&
                        event.current_participants >= event.max_participants && (
                          <span className="full-badge">Full</span>
                        )}
                    </span>
                  </div>
                </div>
                {event.location && (
                  <p className="event-location">
                    <strong>Location:</strong> {event.location}
                  </p>
                )}
                {event.registration_required && (
                  <p className="registration-required">Registration Required</p>
                )}
              </div>
              <div className="event-actions">
                <button
                  className="btn btn-icon"
                  onClick={() => navigate(`/admin/events/${event.event_id}/registrations`)}
                  title="View Registrations"
                >
                  <FaUsers />
                </button>
                <button
                  className="btn btn-icon"
                  onClick={() => navigate(`/admin/events/edit/${event.event_id}`)}
                  title="Edit"
                >
                  <FaEdit />
                </button>
                <button
                  className="btn btn-icon btn-danger"
                  onClick={() => handleDelete(event.event_id, event.title)}
                  title="Delete"
                >
                  <FaTrash />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default EventManagement;
