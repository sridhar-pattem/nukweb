import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { FaCalendar, FaClock, FaMapMarkerAlt, FaUsers, FaTicketAlt } from 'react-icons/fa';

const EventDetail = () => {
  const { id } = useParams();
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Mock data - will be replaced with API call
    setEvent({
      event_id: id,
      title: 'Toastmasters Public Speaking Session',
      description: 'Join our Toastmasters club for an evening of inspiring speeches and constructive feedback. This is a great opportunity to improve your public speaking skills in a supportive environment.',
      full_description: 'Our Toastmasters club meets every week to practice public speaking, receive constructive feedback, and develop leadership skills. Whether you\'re a beginner or an experienced speaker, you\'ll find a welcoming community dedicated to helping each other grow.\n\nThe session includes prepared speeches, impromptu table topics, and evaluations. Guests are welcome to observe and experience the Toastmasters methodology firsthand.',
      event_date: '2024-12-05',
      event_time: '6:00 PM - 8:00 PM',
      location: 'Nuk Library Main Hall',
      category: 'Public Speaking',
      image_url: 'https://via.placeholder.com/800x400?text=Toastmasters+Session',
      max_participants: 30,
      registered_count: 18,
      fee: 'Free for members, ₹100 for non-members',
      contact_person: 'Priya Sharma',
      contact_email: 'toastmasters@mynuk.com',
      contact_phone: '+91 12345 67890',
    });

    setLoading(false);
  }, [id]);

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '5rem' }}>
        <p>Loading event details...</p>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="container" style={{ padding: '5rem 0', textAlign: 'center' }}>
        <h2>Event not found</h2>
        <Link to="/events" className="btn btn-primary" style={{ marginTop: '1rem' }}>
          Back to Events
        </Link>
      </div>
    );
  }

  return (
    <div className="event-detail-page">
      <section className="section">
        <div className="container">
          <Link to="/events" className="btn btn-outline btn-small" style={{ marginBottom: '2rem' }}>
            ← Back to Events
          </Link>

          {/* Event Header Image */}
          <img
            src={event.image_url}
            alt={event.title}
            className="img-rounded"
            style={{ width: '100%', maxHeight: '400px', objectFit: 'cover', marginBottom: '2rem' }}
            onError={(e) => {
              e.target.src = '/assets/images/event-placeholder.jpg';
            }}
          />

          <div className="grid grid-2" style={{ alignItems: 'flex-start' }}>
            {/* Event Details */}
            <div>
              <span className="badge badge-secondary" style={{ marginBottom: '1rem' }}>
                {event.category}
              </span>
              <h1 style={{ marginBottom: '1.5rem' }}>{event.title}</h1>

              <div className="card" style={{ marginBottom: '2rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
                  <FaCalendar style={{ color: 'var(--accent-peru)', fontSize: '1.25rem' }} />
                  <div>
                    <strong>Date</strong>
                    <p style={{ margin: 0, color: '#6c757d' }}>
                      {new Date(event.event_date).toLocaleDateString('en-US', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })}
                    </p>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
                  <FaClock style={{ color: 'var(--accent-peru)', fontSize: '1.25rem' }} />
                  <div>
                    <strong>Time</strong>
                    <p style={{ margin: 0, color: '#6c757d' }}>{event.event_time}</p>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
                  <FaMapMarkerAlt style={{ color: 'var(--accent-peru)', fontSize: '1.25rem' }} />
                  <div>
                    <strong>Location</strong>
                    <p style={{ margin: 0, color: '#6c757d' }}>{event.location}</p>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
                  <FaUsers style={{ color: 'var(--accent-peru)', fontSize: '1.25rem' }} />
                  <div>
                    <strong>Participants</strong>
                    <p style={{ margin: 0, color: '#6c757d' }}>
                      {event.registered_count} / {event.max_participants} registered
                    </p>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <FaTicketAlt style={{ color: 'var(--accent-peru)', fontSize: '1.25rem' }} />
                  <div>
                    <strong>Fee</strong>
                    <p style={{ margin: 0, color: '#6c757d' }}>{event.fee}</p>
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                <button className="btn btn-primary btn-large">
                  Register Now
                </button>
                <a href="/contact" className="btn btn-outline btn-large">
                  Contact Organizer
                </a>
              </div>
            </div>

            {/* Event Description */}
            <div>
              <h3 style={{ marginBottom: '1rem' }}>About this Event</h3>
              <p style={{ lineHeight: '1.8', fontSize: '1.05rem', marginBottom: '1.5rem' }}>
                {event.description}
              </p>

              <div style={{ whiteSpace: 'pre-line', lineHeight: '1.8', marginBottom: '2rem' }}>
                {event.full_description}
              </div>

              <div className="card" style={{ backgroundColor: 'var(--light-beige)' }}>
                <h4>Contact Information</h4>
                <p style={{ marginTop: '1rem' }}>
                  <strong>Organizer:</strong> {event.contact_person}<br />
                  <strong>Email:</strong> <a href={`mailto:${event.contact_email}`}>{event.contact_email}</a><br />
                  <strong>Phone:</strong> <a href={`tel:${event.contact_phone}`}>{event.contact_phone}</a>
                </p>
              </div>
            </div>
          </div>

          {/* Additional Information */}
          <div className="section" style={{ paddingTop: '3rem' }}>
            <h3 className="text-center mb-xl">What to Bring</h3>
            <div className="grid grid-3">
              <div className="card text-center">
                <h5>For Participants</h5>
                <ul style={{ textAlign: 'left', marginTop: '1rem', marginLeft: '1.5rem' }}>
                  <li>Your enthusiasm</li>
                  <li>Prepared speech (if applicable)</li>
                  <li>Notebook and pen</li>
                  <li>Water bottle</li>
                </ul>
              </div>

              <div className="card text-center">
                <h5>What We Provide</h5>
                <ul style={{ textAlign: 'left', marginTop: '1rem', marginLeft: '1.5rem' }}>
                  <li>Evaluation forms</li>
                  <li>Timer equipment</li>
                  <li>Certificates (for members)</li>
                  <li>Refreshments</li>
                </ul>
              </div>

              <div className="card text-center">
                <h5>Rules</h5>
                <ul style={{ textAlign: 'left', marginTop: '1rem', marginLeft: '1.5rem' }}>
                  <li>Arrive 10 minutes early</li>
                  <li>Silence mobile phones</li>
                  <li>Respect all speakers</li>
                  <li>Participate actively</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default EventDetail;
