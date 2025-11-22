import React, { useState, useEffect } from 'react';
import { FaCalendar, FaFilter } from 'react-icons/fa';
import EventCard from '../shared/EventCard';

const Events = () => {
  const [events, setEvents] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('all');

  useEffect(() => {
    // Mock data - will be replaced with API call
    setEvents([
      {
        event_id: 1,
        title: 'Toastmasters Public Speaking Session',
        description: 'Join our Toastmasters club for an evening of inspiring speeches and constructive feedback.',
        event_date: '2024-12-05',
        event_time: '6:00 PM - 8:00 PM',
        location: 'Nuk Library Main Hall',
        category: 'Public Speaking',
        image_url: 'https://via.placeholder.com/400x250?text=Toastmasters',
      },
      {
        event_id: 2,
        title: 'Children\'s Art Workshop',
        description: 'Let your children explore their creativity with watercolors and canvas painting.',
        event_date: '2024-12-08',
        event_time: '4:00 PM - 6:00 PM',
        location: 'Art Room',
        category: 'Art',
        image_url: 'https://via.placeholder.com/400x250?text=Art+Workshop',
      },
      {
        event_id: 3,
        title: 'Chess Tournament',
        description: 'Monthly chess tournament for all age groups. Prizes for winners!',
        event_date: '2024-12-15',
        event_time: '2:00 PM - 6:00 PM',
        location: 'Activity Room',
        category: 'Chess',
        image_url: 'https://via.placeholder.com/400x250?text=Chess+Tournament',
      },
      {
        event_id: 4,
        title: 'Author Talk: Meet Ruskin Bond',
        description: 'Meet the legendary author Ruskin Bond and hear stories from his long writing career.',
        event_date: '2024-12-20',
        event_time: '5:00 PM - 7:00 PM',
        location: 'Main Hall',
        category: 'Author Talk',
        image_url: 'https://via.placeholder.com/400x250?text=Author+Talk',
      },
      {
        event_id: 5,
        title: 'Book Club: December Discussion',
        description: 'This month we\'re discussing "The Midnight Library" by Matt Haig. All welcome!',
        event_date: '2024-12-22',
        event_time: '3:00 PM - 5:00 PM',
        location: 'Reading Room',
        category: 'Book Club',
        image_url: 'https://via.placeholder.com/400x250?text=Book+Club',
      },
      {
        event_id: 6,
        title: 'Rubik\'s Cube Speed Competition',
        description: 'Test your speed-cubing skills in our monthly Rubik\'s cube competition.',
        event_date: '2024-12-28',
        event_time: '11:00 AM - 1:00 PM',
        location: 'Activity Room',
        category: 'Rubik\'s Cube',
        image_url: 'https://via.placeholder.com/400x250?text=Rubiks+Cube',
      },
    ]);
  }, []);

  const filteredEvents = selectedCategory === 'all'
    ? events
    : events.filter(event => event.category === selectedCategory);

  return (
    <div className="events-page">
      {/* Hero */}
      <section
        className="hero"
        style={{
          height: '350px',
          backgroundImage: 'url(/assets/images/Nuk-17.jpeg)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
          position: 'relative'
        }}
      >
        <div className="hero-overlay"></div>
        <div className="hero-content">
          <h1><FaCalendar style={{ marginRight: '1rem' }} />Events & Activities</h1>
          <p>Join us for exciting programs and community gatherings</p>
        </div>
      </section>

      {/* Upcoming Events */}
      <section className="section">
        <div className="container">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <h2>Upcoming Events</h2>
              <p className="text-muted">Mark your calendars!</p>
            </div>
            <div className="form-group" style={{ marginBottom: 0, minWidth: '200px' }}>
              <label className="form-label">
                <FaFilter style={{ marginRight: '0.5rem' }} />
                Filter by Category
              </label>
              <select
                className="form-select"
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
              >
                <option value="all">All Events</option>
                <option value="Public Speaking">Public Speaking</option>
                <option value="Art">Art</option>
                <option value="Chess">Chess</option>
                <option value="Rubik's Cube">Rubik's Cube</option>
                <option value="Author Talk">Author Talks</option>
                <option value="Book Club">Book Club</option>
              </select>
            </div>
          </div>

          <div className="grid grid-3">
            {filteredEvents.map((event) => (
              <EventCard key={event.event_id} event={event} />
            ))}
          </div>

          {filteredEvents.length === 0 && (
            <div className="card text-center" style={{ padding: '3rem' }}>
              <h4>No events found</h4>
              <p className="text-muted">Try selecting a different category</p>
            </div>
          )}
        </div>
      </section>

      {/* Regular Activities */}
      <section className="section section-alt">
        <div className="container">
          <h2 className="text-center mb-xl">Regular Activities</h2>
          <div className="grid grid-2">
            <div className="card">
              <h4>Toastmasters International</h4>
              <p><strong>Schedule:</strong> Every Friday, 6:00 PM - 8:00 PM</p>
              <p>
                We host two Toastmasters clubs - one for children and one for adults. These clubs are
                affiliated with Toastmasters International and provide a supportive environment to
                develop public speaking and leadership skills.
              </p>
              <p className="text-muted" style={{ fontSize: '0.9rem', marginTop: '1rem' }}>
                <strong>Benefits:</strong> Overcome fear of public speaking, build confidence,
                improve communication skills, network with professionals.
              </p>
            </div>

            <div className="card">
              <h4>Art Club</h4>
              <p><strong>Schedule:</strong> Saturdays & Sundays, 4:00 PM - 6:00 PM</p>
              <p>
                Learn different art forms including watercolors, acrylics, sketching, and more.
                Our in-house artists guide both children and adults in creating their own artwork.
              </p>
              <p className="text-muted" style={{ fontSize: '0.9rem', marginTop: '1rem' }}>
                <strong>Materials:</strong> All art supplies provided. Just bring your creativity!
              </p>
            </div>

            <div className="card">
              <h4>Chess Classes</h4>
              <p><strong>Schedule:</strong> Wednesdays & Saturdays, 5:00 PM - 6:30 PM</p>
              <p>
                From beginners to advanced players, our chess classes help develop strategic thinking,
                problem-solving, and concentration skills. Regular tournaments are organized.
              </p>
              <p className="text-muted" style={{ fontSize: '0.9rem', marginTop: '1rem' }}>
                <strong>Age Groups:</strong> Children (6-12 years) and Teens (13-17 years)
              </p>
            </div>

            <div className="card">
              <h4>Rubik's Cube Training</h4>
              <p><strong>Schedule:</strong> Thursdays, 5:00 PM - 6:00 PM</p>
              <p>
                Learn the techniques to solve Rubik's cube and improve your solving speed.
                Suitable for all ages and skill levels.
              </p>
              <p className="text-muted" style={{ fontSize: '0.9rem', marginTop: '1rem' }}>
                <strong>Equipment:</strong> Rubik's cubes available for practice at the library.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="section">
        <div className="container">
          <div className="card" style={{ backgroundColor: 'var(--light-beige)', border: '2px solid var(--accent-peru)', textAlign: 'center', padding: '3rem' }}>
            <h2>Join Our Community</h2>
            <p style={{ fontSize: '1.125rem', margin: '1rem 0 2rem' }}>
              Become a member to participate in all our events and activities at discounted rates.
            </p>
            <div>
              <a href="/membership" className="btn btn-primary btn-large">
                View Membership Plans
              </a>
              <a href="/contact" className="btn btn-secondary btn-large" style={{ marginLeft: '1rem' }}>
                Contact Us
              </a>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Events;
