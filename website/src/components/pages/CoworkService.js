import React from 'react';
import { Link } from 'react-router-dom';
import { FaLaptop, FaWifi, FaSnowflake, FaBolt, FaUsers, FaDoorOpen, FaCheckCircle } from 'react-icons/fa';

const CoworkService = () => {
  return (
    <div className="cowork-service-page">
      {/* Hero */}
      <section className="hero" style={{ height: '400px' }}>
        <div className="hero-overlay"></div>
        <div className="hero-content">
          <h1><FaLaptop style={{ marginRight: '1rem' }} />Cowork Space</h1>
          <p>Professional workspace in a book-lover's paradise</p>
        </div>
      </section>

      {/* Overview */}
      <section className="section">
        <div className="container">
          <div className="text-center mb-xl">
            <h2>Work Among Books</h2>
            <p className="text-muted" style={{ maxWidth: '800px', margin: '0 auto' }}>
              Launched in 2023, our cowork space offers a unique blend of professional productivity
              and literary inspiration. Startups, freelancers, and remote workers love the cozy
              atmosphere and well-equipped facilities.
            </p>
          </div>

          <div className="grid grid-3">
            <div className="card text-center">
              <h3 style={{ color: 'var(--accent-peru)' }}>30+</h3>
              <p>Dedicated work seats</p>
            </div>
            <div className="card text-center">
              <h3 style={{ color: 'var(--accent-peru)' }}>100 Mbps</h3>
              <p>High-speed WiFi</p>
            </div>
            <div className="card text-center">
              <h3 style={{ color: 'var(--accent-peru)' }}>7 Days</h3>
              <p>Open all week</p>
            </div>
          </div>
        </div>
      </section>

      {/* Amenities */}
      <section className="section section-alt">
        <div className="container">
          <h2 className="text-center mb-xl">Amenities & Infrastructure</h2>
          <div className="grid grid-3">
            <div className="card text-center">
              <div style={{ fontSize: '3rem', color: 'var(--accent-peru)', marginBottom: '1rem' }}>
                <FaWifi />
              </div>
              <h4>High-Speed WiFi</h4>
              <p>100 Mbps dedicated internet connection with backup connectivity</p>
            </div>
            <div className="card text-center">
              <div style={{ fontSize: '3rem', color: 'var(--accent-peru)', marginBottom: '1rem' }}>
                <FaSnowflake />
              </div>
              <h4>Air Conditioning</h4>
              <p>Comfortable temperature-controlled environment throughout the space</p>
            </div>
            <div className="card text-center">
              <div style={{ fontSize: '3rem', color: 'var(--accent-peru)', marginBottom: '1rem' }}>
                <FaBolt />
              </div>
              <h4>Power Backup</h4>
              <p>Uninterrupted power supply with generator backup</p>
            </div>
            <div className="card text-center">
              <div style={{ fontSize: '3rem', color: 'var(--accent-peru)', marginBottom: '1rem' }}>
                <FaDoorOpen />
              </div>
              <h4>Clean Restrooms</h4>
              <p>Well-maintained, hygienic washroom facilities</p>
            </div>
            <div className="card text-center">
              <div style={{ fontSize: '3rem', color: 'var(--accent-peru)', marginBottom: '1rem' }}>
                <FaUsers />
              </div>
              <h4>Meeting Rooms</h4>
              <p>Bookable meeting rooms for discussions and presentations</p>
            </div>
            <div className="card text-center">
              <div style={{ fontSize: '3rem', color: 'var(--accent-peru)', marginBottom: '1rem' }}>
                <FaLaptop />
              </div>
              <h4>Ergonomic Setup</h4>
              <p>Comfortable chairs and spacious desks for productive work</p>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Plans */}
      <section className="section">
        <div className="container">
          <h2 className="text-center mb-xl">Cowork Pricing</h2>
          <div className="grid grid-3">
            <div className="card" style={{ border: '2px solid var(--light-gray)' }}>
              <div className="text-center">
                <h3>Day Pass</h3>
                <div style={{ fontSize: '2.5rem', fontWeight: '700', color: 'var(--accent-peru)', margin: '1rem 0' }}>
                  ₹300
                </div>
                <p className="text-muted">per day</p>
              </div>
              <hr className="divider" />
              <ul style={{ marginLeft: '1.5rem', lineHeight: '2' }}>
                <li><FaCheckCircle style={{ color: 'var(--success-green)' }} /> 9 AM - 9 PM access</li>
                <li><FaCheckCircle style={{ color: 'var(--success-green)' }} /> WiFi & power</li>
                <li><FaCheckCircle style={{ color: 'var(--success-green)' }} /> Café access</li>
                <li><FaCheckCircle style={{ color: 'var(--success-green)' }} /> Common seating</li>
              </ul>
              <Link to="/contact" className="btn btn-outline" style={{ marginTop: '1.5rem', width: '100%' }}>
                Book Now
              </Link>
            </div>

            <div className="card" style={{ border: '3px solid var(--accent-peru)', position: 'relative' }}>
              <span className="badge" style={{ position: 'absolute', top: '-12px', right: '20px' }}>Best Value</span>
              <div className="text-center">
                <h3>Monthly</h3>
                <div style={{ fontSize: '2.5rem', fontWeight: '700', color: 'var(--accent-peru)', margin: '1rem 0' }}>
                  ₹6,000
                </div>
                <p className="text-muted">per month</p>
              </div>
              <hr className="divider" />
              <ul style={{ marginLeft: '1.5rem', lineHeight: '2' }}>
                <li><FaCheckCircle style={{ color: 'var(--success-green)' }} /> 9 AM - 9 PM access (all days)</li>
                <li><FaCheckCircle style={{ color: 'var(--success-green)' }} /> WiFi & power</li>
                <li><FaCheckCircle style={{ color: 'var(--success-green)' }} /> Café access</li>
                <li><FaCheckCircle style={{ color: 'var(--success-green)' }} /> Dedicated desk</li>
                <li><FaCheckCircle style={{ color: 'var(--success-green)' }} /> Meeting room (2 hrs/week)</li>
                <li><FaCheckCircle style={{ color: 'var(--success-green)' }} /> Storage locker</li>
              </ul>
              <Link to="/contact" className="btn btn-primary" style={{ marginTop: '1.5rem', width: '100%' }}>
                Book Now
              </Link>
            </div>

            <div className="card" style={{ border: '2px solid var(--light-gray)' }}>
              <div className="text-center">
                <h3>Weekly</h3>
                <div style={{ fontSize: '2.5rem', fontWeight: '700', color: 'var(--accent-peru)', margin: '1rem 0' }}>
                  ₹1,800
                </div>
                <p className="text-muted">per week</p>
              </div>
              <hr className="divider" />
              <ul style={{ marginLeft: '1.5rem', lineHeight: '2' }}>
                <li><FaCheckCircle style={{ color: 'var(--success-green)' }} /> 9 AM - 9 PM access</li>
                <li><FaCheckCircle style={{ color: 'var(--success-green)' }} /> WiFi & power</li>
                <li><FaCheckCircle style={{ color: 'var(--success-green)' }} /> Café access</li>
                <li><FaCheckCircle style={{ color: 'var(--success-green)' }} /> Flexible seating</li>
                <li><FaCheckCircle style={{ color: 'var(--success-green)' }} /> Meeting room (1 hr)</li>
              </ul>
              <Link to="/contact" className="btn btn-outline" style={{ marginTop: '1.5rem', width: '100%' }}>
                Book Now
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Meeting Rooms */}
      <section className="section section-alt">
        <div className="container">
          <h2 className="text-center mb-xl">Meeting Room Booking</h2>
          <div className="grid grid-2">
            <div>
              <h4>Available Rooms</h4>
              <div className="card" style={{ marginTop: '1rem' }}>
                <h5>Small Meeting Room</h5>
                <p className="text-muted">Capacity: 4-6 people</p>
                <p><strong>₹200/hour</strong> (Non-members)<br />₹150/hour (Members)</p>
                <ul style={{ marginTop: '1rem', marginLeft: '1.5rem' }}>
                  <li>Whiteboard</li>
                  <li>TV screen for presentations</li>
                  <li>Air-conditioned</li>
                </ul>
              </div>
              <div className="card" style={{ marginTop: '1rem' }}>
                <h5>Large Meeting Room</h5>
                <p className="text-muted">Capacity: 10-12 people</p>
                <p><strong>₹400/hour</strong> (Non-members)<br />₹300/hour (Members)</p>
                <ul style={{ marginTop: '1rem', marginLeft: '1.5rem' }}>
                  <li>Whiteboard & flipchart</li>
                  <li>Projector & screen</li>
                  <li>Video conferencing setup</li>
                  <li>Air-conditioned</li>
                </ul>
              </div>
            </div>
            <div>
              <img
                src="https://via.placeholder.com/600x400?text=Meeting+Room"
                alt="Meeting Room"
                className="img-rounded"
              />
              <div className="card" style={{ marginTop: '1rem' }}>
                <h5>Booking Policy</h5>
                <ul style={{ marginLeft: '1.5rem' }}>
                  <li>Advance booking required (minimum 24 hours)</li>
                  <li>Cancellation: Free up to 12 hours before</li>
                  <li>Maximum booking: 4 hours at a time</li>
                  <li>Coffee/tea can be arranged (additional cost)</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Hours */}
      <section className="section">
        <div className="container">
          <div className="grid grid-2">
            <div className="card">
              <h4>Operating Hours</h4>
              <table style={{ width: '100%', marginTop: '1rem' }}>
                <tbody>
                  <tr style={{ borderBottom: '1px solid var(--light-gray)' }}>
                    <td style={{ padding: '0.75rem 0' }}><strong>Monday - Friday</strong></td>
                    <td style={{ padding: '0.75rem 0', textAlign: 'right' }}>9:00 AM - 9:00 PM</td>
                  </tr>
                  <tr style={{ borderBottom: '1px solid var(--light-gray)' }}>
                    <td style={{ padding: '0.75rem 0' }}><strong>Saturday - Sunday</strong></td>
                    <td style={{ padding: '0.75rem 0', textAlign: 'right' }}>10:00 AM - 9:00 PM</td>
                  </tr>
                  <tr>
                    <td style={{ padding: '0.75rem 0' }}><strong>Public Holidays</strong></td>
                    <td style={{ padding: '0.75rem 0', textAlign: 'right', color: '#dc3545' }}>Closed</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <div className="card">
              <h4>What to Bring</h4>
              <ul style={{ marginTop: '1rem', marginLeft: '1.5rem', lineHeight: '2' }}>
                <li>Your laptop and charger</li>
                <li>Valid ID for first-time visitors</li>
                <li>Headphones (for calls/meetings)</li>
                <li>Personal stationery (optional)</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="section section-alt">
        <div className="container text-center">
          <h2>Ready to Work with Us?</h2>
          <p className="text-muted mb-lg" style={{ fontSize: '1.125rem' }}>
            Book your cowork space today and experience productivity in a unique environment
          </p>
          <div>
            <Link to="/contact" className="btn btn-primary btn-large">
              Book Your Seat
            </Link>
            <Link to="/contact" className="btn btn-secondary btn-large" style={{ marginLeft: '1rem' }}>
              Schedule a Visit
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default CoworkService;
