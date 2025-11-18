import React from 'react';
import { Link } from 'react-router-dom';
import { FaCalendar, FaClock, FaMapMarkerAlt } from 'react-icons/fa';

const EventCard = ({ event }) => {
  const {
    event_id,
    title,
    description,
    event_date,
    event_time,
    location,
    image_url,
    category,
  } = event;

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('en-US', options);
  };

  return (
    <div className="event-card">
      <img
        src={image_url || '/assets/images/event-placeholder.jpg'}
        alt={title}
        className="event-card-image"
        onError={(e) => {
          e.target.src = '/assets/images/event-placeholder.jpg';
        }}
      />
      <div className="event-card-content">
        <span className="event-card-date">
          {formatDate(event_date)}
        </span>
        {category && (
          <span className="badge badge-secondary" style={{ marginLeft: '0.5rem' }}>
            {category}
          </span>
        )}
        <h4 className="event-card-title">{title}</h4>
        <p className="event-card-description">{description}</p>
        <div className="event-card-footer">
          <div style={{ fontSize: '0.875rem', color: '#6c757d' }}>
            <div style={{ marginBottom: '0.25rem' }}>
              <FaClock style={{ marginRight: '0.5rem' }} />
              {event_time}
            </div>
            {location && (
              <div>
                <FaMapMarkerAlt style={{ marginRight: '0.5rem' }} />
                {location}
              </div>
            )}
          </div>
          <Link to={`/events/${event_id}`} className="btn btn-secondary btn-small">
            Learn More
          </Link>
        </div>
      </div>
    </div>
  );
};

export default EventCard;
