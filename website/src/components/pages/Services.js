import React from 'react';
import { Link } from 'react-router-dom';
import { FaBook, FaLaptop, FaGraduationCap, FaCoffee, FaCheckCircle } from 'react-icons/fa';

const Services = () => {
  return (
    <div className="services-page">
      {/* Hero */}
      <section className="hero" style={{ height: '400px' }}>
        <div className="hero-overlay"></div>
        <div className="hero-content">
          <h1>Our Services</h1>
          <p>Everything you need for reading, working, and learning</p>
        </div>
      </section>

      {/* Library Service */}
      <section className="section">
        <div className="container">
          <div className="grid grid-2" style={{ alignItems: 'center' }}>
            <div>
              <img
                src="https://via.placeholder.com/600x400?text=Library+Collection"
                alt="Library"
                className="img-rounded"
              />
            </div>
            <div>
              <h2><FaBook style={{ marginRight: '0.5rem', color: 'var(--accent-peru)' }} />Library Membership</h2>
              <p>
                Access our extensive collection of 10,000+ books across all genres and age groups.
                From toddlers to adults, we have something for every reader.
              </p>
              <ul style={{ marginTop: '1.5rem', marginBottom: '1.5rem', marginLeft: '1.5rem' }}>
                <li><FaCheckCircle style={{ color: 'var(--success-green)', marginRight: '0.5rem' }} />Fiction, Non-fiction, Children's books</li>
                <li><FaCheckCircle style={{ color: 'var(--success-green)', marginRight: '0.5rem' }} />Borrow up to 6 books at a time (Premium plan)</li>
                <li><FaCheckCircle style={{ color: 'var(--success-green)', marginRight: '0.5rem' }} />Flexible borrowing periods</li>
                <li><FaCheckCircle style={{ color: 'var(--success-green)', marginRight: '0.5rem' }} />New arrivals every month</li>
                <li><FaCheckCircle style={{ color: 'var(--success-green)', marginRight: '0.5rem' }} />Reservation service</li>
              </ul>
              <Link to="/services/library" className="btn btn-primary">
                Learn More
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Cowork Space */}
      <section className="section section-alt">
        <div className="container">
          <div className="grid grid-2" style={{ alignItems: 'center' }}>
            <div>
              <h2><FaLaptop style={{ marginRight: '0.5rem', color: 'var(--accent-peru)' }} />Cowork Space</h2>
              <p>
                Professional workspace designed for startups, freelancers, and remote workers.
                Work in a cozy atmosphere surrounded by books and like-minded professionals.
              </p>
              <ul style={{ marginTop: '1.5rem', marginBottom: '1.5rem', marginLeft: '1.5rem' }}>
                <li><FaCheckCircle style={{ color: 'var(--success-green)', marginRight: '0.5rem' }} />High-speed WiFi (100 Mbps)</li>
                <li><FaCheckCircle style={{ color: 'var(--success-green)', marginRight: '0.5rem' }} />Air-conditioned workspace</li>
                <li><FaCheckCircle style={{ color: 'var(--success-green)', marginRight: '0.5rem' }} />Power backup</li>
                <li><FaCheckCircle style={{ color: 'var(--success-green)', marginRight: '0.5rem' }} />Meeting rooms available</li>
                <li><FaCheckCircle style={{ color: 'var(--success-green)', marginRight: '0.5rem' }} />Café on premises</li>
              </ul>
              <Link to="/services/cowork" className="btn btn-primary">
                Learn More
              </Link>
            </div>
            <div>
              <img
                src="https://via.placeholder.com/600x400?text=Cowork+Space"
                alt="Cowork Space"
                className="img-rounded"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Study Space */}
      <section className="section">
        <div className="container">
          <div className="grid grid-2" style={{ alignItems: 'center' }}>
            <div>
              <img
                src="https://via.placeholder.com/600x400?text=Study+Space"
                alt="Study Space"
                className="img-rounded"
              />
            </div>
            <div>
              <h2><FaGraduationCap style={{ marginRight: '0.5rem', color: 'var(--accent-peru)' }} />Study Space</h2>
              <p>
                Quiet, distraction-free environment perfect for students and professionals preparing
                for exams or working on research. Conducive atmosphere for focused learning.
              </p>
              <ul style={{ marginTop: '1.5rem', marginBottom: '1.5rem', marginLeft: '1.5rem' }}>
                <li><FaCheckCircle style={{ color: 'var(--success-green)', marginRight: '0.5rem' }} />Completely silent zones</li>
                <li><FaCheckCircle style={{ color: 'var(--success-green)', marginRight: '0.5rem' }} />Individual study desks</li>
                <li><FaCheckCircle style={{ color: 'var(--success-green)', marginRight: '0.5rem' }} />Comfortable seating</li>
                <li><FaCheckCircle style={{ color: 'var(--success-green)', marginRight: '0.5rem' }} />Air-conditioned</li>
                <li><FaCheckCircle style={{ color: 'var(--success-green)', marginRight: '0.5rem' }} />Access to reference materials</li>
              </ul>
              <Link to="/services/study-space" className="btn btn-primary">
                Learn More
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Café */}
      <section className="section section-alt">
        <div className="container">
          <div className="grid grid-2" style={{ alignItems: 'center' }}>
            <div>
              <h2><FaCoffee style={{ marginRight: '0.5rem', color: 'var(--accent-peru)' }} />Café</h2>
              <p>
                Our minimal café serves a selection of beverages and light snacks to keep you
                refreshed while you read, work, or study.
              </p>
              <ul style={{ marginTop: '1.5rem', marginBottom: '1.5rem', marginLeft: '1.5rem' }}>
                <li><FaCheckCircle style={{ color: 'var(--success-green)', marginRight: '0.5rem' }} />Coffee & Tea</li>
                <li><FaCheckCircle style={{ color: 'var(--success-green)', marginRight: '0.5rem' }} />Fresh Juices</li>
                <li><FaCheckCircle style={{ color: 'var(--success-green)', marginRight: '0.5rem' }} />Sandwiches & Snacks</li>
                <li><FaCheckCircle style={{ color: 'var(--success-green)', marginRight: '0.5rem' }} />Cookies & Pastries</li>
              </ul>
            </div>
            <div>
              <img
                src="https://via.placeholder.com/600x400?text=Cafe"
                alt="Café"
                className="img-rounded"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Overview */}
      <section className="section">
        <div className="container text-center">
          <h2>Ready to Get Started?</h2>
          <p className="text-muted mb-lg" style={{ fontSize: '1.125rem' }}>
            Choose the service that fits your needs
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

export default Services;
