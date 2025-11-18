import React from 'react';
import { Link } from 'react-router-dom';
import { FaBook, FaCheckCircle, FaClock, FaCalendar } from 'react-icons/fa';

const LibraryService = () => {
  return (
    <div className="library-service-page">
      {/* Hero */}
      <section className="hero" style={{ height: '400px' }}>
        <div className="hero-overlay"></div>
        <div className="hero-content">
          <h1><FaBook style={{ marginRight: '1rem' }} />Library Membership</h1>
          <p>10,000+ books for readers of all ages</p>
        </div>
      </section>

      {/* Overview */}
      <section className="section">
        <div className="container">
          <div className="text-center mb-xl">
            <h2>Welcome to Our Library</h2>
            <p className="text-muted" style={{ maxWidth: '800px', margin: '0 auto' }}>
              For over 14 years, Nuk Library has been curating a diverse collection that caters
              to readers of all ages and interests. From board books for toddlers to advanced
              academic texts for adults, we have something for everyone.
            </p>
          </div>

          <div className="grid grid-3">
            <div className="card text-center">
              <h3 style={{ color: 'var(--accent-peru)' }}>10,000+</h3>
              <p>Books in our collection</p>
            </div>
            <div className="card text-center">
              <h3 style={{ color: 'var(--accent-peru)' }}>50+</h3>
              <p>New arrivals every month</p>
            </div>
            <div className="card text-center">
              <h3 style={{ color: 'var(--accent-peru)' }}>6 Days</h3>
              <p>Weekly (closed Mondays)</p>
            </div>
          </div>
        </div>
      </section>

      {/* Collections */}
      <section className="section section-alt">
        <div className="container">
          <h2 className="text-center mb-xl">Our Collections</h2>
          <div className="grid grid-2">
            <div className="card">
              <h4>Children's Section</h4>
              <ul style={{ marginTop: '1rem', marginLeft: '1.5rem' }}>
                <li><strong>Toddlers (0-3 years):</strong> Board books, picture books</li>
                <li><strong>Preschool (3-5 years):</strong> Early readers, interactive books</li>
                <li><strong>Children (6-12 years):</strong> Chapter books, adventures, fantasy</li>
                <li><strong>Young Adult (13-17 years):</strong> Coming-of-age, dystopian, romance</li>
              </ul>
            </div>
            <div className="card">
              <h4>Adult Section</h4>
              <ul style={{ marginTop: '1rem', marginLeft: '1.5rem' }}>
                <li><strong>Fiction:</strong> Literary, contemporary, classics, thrillers</li>
                <li><strong>Non-Fiction:</strong> Biographies, history, science, self-help</li>
                <li><strong>Business:</strong> Management, entrepreneurship, finance</li>
                <li><strong>Reference:</strong> Encyclopedias, dictionaries, atlases</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Membership Plans */}
      <section className="section">
        <div className="container">
          <h2 className="text-center mb-xl">Membership Plans</h2>
          <div className="grid grid-3">
            <div className="card" style={{ border: '2px solid var(--light-gray)' }}>
              <div className="text-center">
                <h3>Basic</h3>
                <div style={{ fontSize: '2.5rem', fontWeight: '700', color: 'var(--accent-peru)', margin: '1rem 0' }}>
                  ₹500
                </div>
                <p className="text-muted">per month</p>
              </div>
              <hr className="divider" />
              <ul style={{ marginLeft: '1.5rem', lineHeight: '2' }}>
                <li><FaCheckCircle style={{ color: 'var(--success-green)' }} /> Borrow 2 books at a time</li>
                <li><FaCheckCircle style={{ color: 'var(--success-green)' }} /> 14-day borrowing period</li>
                <li><FaCheckCircle style={{ color: 'var(--success-green)' }} /> Access to full catalogue</li>
                <li><FaCheckCircle style={{ color: 'var(--success-green)' }} /> Reserve books</li>
              </ul>
              <Link to="/membership" className="btn btn-outline" style={{ marginTop: '1.5rem', width: '100%' }}>
                Get Started
              </Link>
            </div>

            <div className="card" style={{ border: '3px solid var(--accent-peru)', position: 'relative' }}>
              <span className="badge" style={{ position: 'absolute', top: '-12px', right: '20px' }}>Popular</span>
              <div className="text-center">
                <h3>Standard</h3>
                <div style={{ fontSize: '2.5rem', fontWeight: '700', color: 'var(--accent-peru)', margin: '1rem 0' }}>
                  ₹800
                </div>
                <p className="text-muted">per month</p>
              </div>
              <hr className="divider" />
              <ul style={{ marginLeft: '1.5rem', lineHeight: '2' }}>
                <li><FaCheckCircle style={{ color: 'var(--success-green)' }} /> Borrow 4 books at a time</li>
                <li><FaCheckCircle style={{ color: 'var(--success-green)' }} /> 21-day borrowing period</li>
                <li><FaCheckCircle style={{ color: 'var(--success-green)' }} /> Access to full catalogue</li>
                <li><FaCheckCircle style={{ color: 'var(--success-green)' }} /> Reserve books</li>
                <li><FaCheckCircle style={{ color: 'var(--success-green)' }} /> Priority new arrivals</li>
              </ul>
              <Link to="/membership" className="btn btn-primary" style={{ marginTop: '1.5rem', width: '100%' }}>
                Get Started
              </Link>
            </div>

            <div className="card" style={{ border: '2px solid var(--light-gray)' }}>
              <div className="text-center">
                <h3>Premium</h3>
                <div style={{ fontSize: '2.5rem', fontWeight: '700', color: 'var(--accent-peru)', margin: '1rem 0' }}>
                  ₹1,200
                </div>
                <p className="text-muted">per month</p>
              </div>
              <hr className="divider" />
              <ul style={{ marginLeft: '1.5rem', lineHeight: '2' }}>
                <li><FaCheckCircle style={{ color: 'var(--success-green)' }} /> Borrow 6 books at a time</li>
                <li><FaCheckCircle style={{ color: 'var(--success-green)' }} /> 30-day borrowing period</li>
                <li><FaCheckCircle style={{ color: 'var(--success-green)' }} /> Access to full catalogue</li>
                <li><FaCheckCircle style={{ color: 'var(--success-green)' }} /> Reserve books</li>
                <li><FaCheckCircle style={{ color: 'var(--success-green)' }} /> Priority new arrivals</li>
                <li><FaCheckCircle style={{ color: 'var(--success-green)' }} /> Free activity pass (1/month)</li>
              </ul>
              <Link to="/membership" className="btn btn-outline" style={{ marginTop: '1.5rem', width: '100%' }}>
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Library Hours */}
      <section className="section section-alt">
        <div className="container">
          <div className="grid grid-2">
            <div className="card">
              <h4><FaClock style={{ marginRight: '0.5rem', color: 'var(--accent-peru)' }} />Library Hours</h4>
              <table style={{ width: '100%', marginTop: '1rem' }}>
                <tbody>
                  <tr style={{ borderBottom: '1px solid var(--light-gray)' }}>
                    <td style={{ padding: '0.75rem 0' }}><strong>Tuesday - Friday</strong></td>
                    <td style={{ padding: '0.75rem 0', textAlign: 'right' }}>9:00 AM - 9:00 PM</td>
                  </tr>
                  <tr style={{ borderBottom: '1px solid var(--light-gray)' }}>
                    <td style={{ padding: '0.75rem 0' }}><strong>Saturday - Sunday</strong></td>
                    <td style={{ padding: '0.75rem 0', textAlign: 'right' }}>10:00 AM - 9:00 PM</td>
                  </tr>
                  <tr>
                    <td style={{ padding: '0.75rem 0' }}><strong>Monday</strong></td>
                    <td style={{ padding: '0.75rem 0', textAlign: 'right', color: '#dc3545' }}>Closed</td>
                  </tr>
                </tbody>
              </table>
              <p style={{ marginTop: '1rem', fontSize: '0.875rem', color: '#6c757d' }}>
                <em>Closed on public holidays</em>
              </p>
            </div>

            <div className="card">
              <h4><FaCalendar style={{ marginRight: '0.5rem', color: 'var(--accent-peru)' }} />Borrowing Rules</h4>
              <ul style={{ marginTop: '1rem', marginLeft: '1.5rem', lineHeight: '2' }}>
                <li>Books can be renewed once if no one else has reserved them</li>
                <li>Late fee: ₹5 per day per book</li>
                <li>Lost/damaged books must be replaced or paid for</li>
                <li>New arrivals can be borrowed by Premium members first</li>
                <li>Reference books cannot be borrowed (in-library use only)</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="section">
        <div className="container text-center">
          <h2>Ready to Start Reading?</h2>
          <p className="text-muted mb-lg" style={{ fontSize: '1.125rem' }}>
            Join hundreds of happy readers at Nuk Library
          </p>
          <div>
            <Link to="/membership" className="btn btn-primary btn-large">
              Become a Member
            </Link>
            <Link to="/catalogue" className="btn btn-secondary btn-large" style={{ marginLeft: '1rem' }}>
              Browse Catalogue
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default LibraryService;
