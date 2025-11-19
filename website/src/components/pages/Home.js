import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { FaBook, FaLaptop, FaGraduationCap, FaCoffee, FaChess, FaPalette, FaMicrophone, FaStar } from 'react-icons/fa';
import BookCard from '../shared/BookCard';
import EventCard from '../shared/EventCard';

const Home = () => {
  const [newArrivals, setNewArrivals] = useState([]);
  const [upcomingEvents, setUpcomingEvents] = useState([]);

  useEffect(() => {
    // Mock data - will be replaced with API calls later
    setNewArrivals([
      {
        book_id: 1,
        title: 'The Midnight Library',
        authors: ['Matt Haig'],
        cover_image_url: 'https://via.placeholder.com/200x300?text=Midnight+Library',
        rating: 4.5,
        available_items: 3,
      },
      {
        book_id: 2,
        title: 'Atomic Habits',
        authors: ['James Clear'],
        cover_image_url: 'https://via.placeholder.com/200x300?text=Atomic+Habits',
        rating: 4.8,
        available_items: 2,
      },
      {
        book_id: 3,
        title: 'The Blue Umbrella',
        authors: ['Ruskin Bond'],
        cover_image_url: 'https://via.placeholder.com/200x300?text=Blue+Umbrella',
        rating: 4.3,
        available_items: 5,
      },
    ]);

    setUpcomingEvents([
      {
        event_id: 1,
        title: 'Toastmasters Public Speaking Session',
        description: 'Join our Toastmasters club for an evening of inspiring speeches and constructive feedback.',
        event_date: '2025-12-05',
        event_time: '6:00 PM - 8:00 PM',
        location: 'Nuk Library Main Hall',
        category: 'Public Speaking',
        image_url: 'https://via.placeholder.com/400x250?text=Toastmasters',
      },
      {
        event_id: 2,
        title: 'Children\'s Art Workshop',
        description: 'Let your children explore their creativity with watercolors and canvas painting.',
        event_date: '2025-12-08',
        event_time: '4:00 PM - 6:00 PM',
        location: 'Art Room',
        category: 'Art',
        image_url: 'https://via.placeholder.com/400x250?text=Art+Workshop',
      },
      {
        event_id: 3,
        title: 'Chess Tournament',
        description: 'Monthly chess tournament for all age groups. Prizes for winners!',
        event_date: '2025-12-15',
        event_time: '2:00 PM - 6:00 PM',
        location: 'Activity Room',
        category: 'Chess',
        image_url: 'https://via.placeholder.com/400x250?text=Chess+Tournament',
      },
    ]);
  }, []);

  return (
    <div className="home-page">
      {/* Hero Section */}
      <section
        className="hero"
        style={{
          backgroundImage: 'url(/assets/images/Home_Banner.jpeg)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
          position: 'relative'
        }}
      >
        <div className="hero-overlay"></div>
        <div className="hero-content fade-in">
          <h1>Welcome to Nuk Library</h1>
          <p>
            Your community hub for reading, learning, and growth in Bangalore.<br />
            Serving all ages for over 14 years.
          </p>
          <div>
            <Link to="/membership" className="btn btn-primary btn-large">
              Become a Member
            </Link>
            <Link to="/catalogue" className="btn btn-outline btn-large" style={{ marginLeft: '1rem' }}>
              Browse Books
            </Link>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="stats-section">
        <div className="stats-grid">
          <div className="stat-item">
            <div className="stat-number">14+</div>
            <div className="stat-label">Years of Service</div>
          </div>
          <div className="stat-item">
            <div className="stat-number">10,000+</div>
            <div className="stat-label">Books</div>
          </div>
          <div className="stat-item">
            <div className="stat-number">500+</div>
            <div className="stat-label">Active Members</div>
          </div>
          <div className="stat-item">
            <div className="stat-number">7</div>
            <div className="stat-label">Days Open</div>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section className="section">
        <div className="container">
          <div className="text-center mb-xl">
            <h2>Our Services</h2>
            <p className="text-muted">Discover what makes Nuk Library special</p>
          </div>
          <div className="grid grid-4">
            <div className="service-card">
              <div className="service-icon">
                <FaBook />
              </div>
              <h3>Library</h3>
              <p>
                Extensive collection for all ages - from toddlers to adults. Fiction, non-fiction, and specialized sections.
              </p>
              <Link to="/services/library" className="btn btn-secondary">
                Learn More
              </Link>
            </div>
            <div className="service-card">
              <div className="service-icon">
                <FaLaptop />
              </div>
              <h3>Cowork Space</h3>
              <p>
                Professional workspace with AC, WiFi, and power backup. Perfect for startups and freelancers.
              </p>
              <Link to="/services/cowork" className="btn btn-secondary">
                Learn More
              </Link>
            </div>
            <div className="service-card">
              <div className="service-icon">
                <FaGraduationCap />
              </div>
              <h3>Study Space</h3>
              <p>
                Quiet, cozy environment for students and professionals. Conducive for focused learning.
              </p>
              <Link to="/services/study-space" className="btn btn-secondary">
                Learn More
              </Link>
            </div>
            <div className="service-card">
              <div className="service-icon">
                <FaCoffee />
              </div>
              <h3>Café</h3>
              <p>
                Minimal café serving refreshments to keep you energized while you read, work, or study.
              </p>
              <a href="#cafe" className="btn btn-secondary">
                View Menu
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* New Arrivals Section */}
      <section className="section section-alt">
        <div className="container">
          <div className="flex-between mb-xl">
            <div>
              <h2>New Arrivals</h2>
              <p className="text-muted">Check out our latest additions</p>
            </div>
            <Link to="/new-arrivals" className="btn btn-outline">
              View All
            </Link>
          </div>
          <div className="grid grid-3">
            {newArrivals.map((book) => (
              <BookCard key={book.book_id} book={book} />
            ))}
          </div>
        </div>
      </section>

      {/* Upcoming Events Section */}
      <section className="section">
        <div className="container">
          <div className="flex-between mb-xl">
            <div>
              <h2>Upcoming Events</h2>
              <p className="text-muted">Join us for exciting activities</p>
            </div>
            <Link to="/events" className="btn btn-outline">
              View All Events
            </Link>
          </div>
          <div className="grid grid-3">
            {upcomingEvents.map((event) => (
              <EventCard key={event.event_id} event={event} />
            ))}
          </div>
        </div>
      </section>

      {/* Activities Section */}
      <section className="section section-alt">
        <div className="container">
          <div className="text-center mb-xl">
            <h2>Activities & Classes</h2>
            <p className="text-muted">Explore your interests and develop new skills</p>
          </div>
          <div className="grid grid-3">
            <div className="card">
              <div style={{ textAlign: 'center', fontSize: '3rem', color: 'var(--accent-peru)', marginBottom: '1rem' }}>
                <FaMicrophone />
              </div>
              <h4 className="text-center">Toastmasters</h4>
              <p style={{ textAlign: 'center' }}>
                Public speaking clubs for children and adults. Affiliated with Toastmasters International.
              </p>
            </div>
            <div className="card">
              <div style={{ textAlign: 'center', fontSize: '3rem', color: 'var(--accent-peru)', marginBottom: '1rem' }}>
                <FaPalette />
              </div>
              <h4 className="text-center">Art Club</h4>
              <p style={{ textAlign: 'center' }}>
                Learn different art forms and create your own artwork with guidance from in-house artists.
              </p>
            </div>
            <div className="card">
              <div style={{ textAlign: 'center', fontSize: '3rem', color: 'var(--accent-peru)', marginBottom: '1rem' }}>
                <FaChess />
              </div>
              <h4 className="text-center">Chess & Rubik's Cube</h4>
              <p style={{ textAlign: 'center' }}>
                Enhance logical thinking and problem-solving skills through chess and Rubik's cube classes.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="section">
        <div className="container">
          <div className="text-center mb-xl">
            <h2>What Our Members Say</h2>
            <p className="text-muted">Hear from our community</p>
          </div>
          <div className="grid grid-3">
            <div className="testimonial-card">
              <div className="testimonial-rating">
                <FaStar /><FaStar /><FaStar /><FaStar /><FaStar />
              </div>
              <p className="testimonial-quote">
                "Nuk Library has been a second home for my kids. The reading environment and activities have greatly contributed to their development."
              </p>
              <div className="testimonial-author">
                <div className="testimonial-avatar">P</div>
                <div className="testimonial-info">
                  <h5>Priya Sharma</h5>
                  <p>Parent, Member since 2020</p>
                </div>
              </div>
            </div>
            <div className="testimonial-card">
              <div className="testimonial-rating">
                <FaStar /><FaStar /><FaStar /><FaStar /><FaStar />
              </div>
              <p className="testimonial-quote">
                "The cowork space is perfect for my startup. Quiet, professional, and surrounded by books - what more could I ask for?"
              </p>
              <div className="testimonial-author">
                <div className="testimonial-avatar">R</div>
                <div className="testimonial-info">
                  <h5>Rajesh Kumar</h5>
                  <p>Entrepreneur, Cowork Member</p>
                </div>
              </div>
            </div>
            <div className="testimonial-card">
              <div className="testimonial-rating">
                <FaStar /><FaStar /><FaStar /><FaStar /><FaStar />
              </div>
              <p className="testimonial-quote">
                "The Toastmasters club at Nuk helped me overcome my fear of public speaking. The supportive community is amazing!"
              </p>
              <div className="testimonial-author">
                <div className="testimonial-avatar">A</div>
                <div className="testimonial-info">
                  <h5>Anita Desai</h5>
                  <p>Toastmaster, Member since 2019</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="section section-alt">
        <div className="container text-center">
          <h2>Ready to Join Our Community?</h2>
          <p className="text-muted mb-lg" style={{ fontSize: '1.125rem' }}>
            Become a member today and experience the joy of reading, learning, and connecting.
          </p>
          <div>
            <Link to="/membership" className="btn btn-primary btn-large">
              View Membership Plans
            </Link>
            <Link to="/contact" className="btn btn-secondary btn-large" style={{ marginLeft: '1rem' }}>
              Contact Us
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
