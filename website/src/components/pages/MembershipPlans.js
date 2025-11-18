import React from 'react';
import { Link } from 'react-router-dom';
import { FaCheckCircle, FaBook, FaLaptop, FaGraduationCap } from 'react-icons/fa';

const MembershipPlans = () => {
  return (
    <div className="membership-plans-page">
      {/* Hero */}
      <section className="hero" style={{ height: '400px' }}>
        <div className="hero-overlay"></div>
        <div className="hero-content">
          <h1>Membership Plans</h1>
          <p>Choose the plan that's right for you</p>
        </div>
      </section>

      {/* Library Membership */}
      <section className="section">
        <div className="container">
          <div className="text-center mb-xl">
            <FaBook style={{ fontSize: '3rem', color: 'var(--accent-peru)', marginBottom: '1rem' }} />
            <h2>Library Membership</h2>
            <p className="text-muted">Access our collection of 10,000+ books</p>
          </div>

          <div className="grid grid-3">
            <div className="card" style={{ border: '2px solid var(--light-gray)' }}>
              <div className="text-center">
                <h3>Basic</h3>
                <div style={{ fontSize: '3rem', fontWeight: '700', color: 'var(--accent-peru)', margin: '1.5rem 0' }}>
                  ₹500
                </div>
                <p className="text-muted">per month</p>
              </div>
              <hr className="divider" />
              <ul style={{ marginLeft: '1.5rem', lineHeight: '2.5' }}>
                <li><FaCheckCircle style={{ color: 'var(--success-green)' }} /> Borrow 2 books at a time</li>
                <li><FaCheckCircle style={{ color: 'var(--success-green)' }} /> 14-day borrowing period</li>
                <li><FaCheckCircle style={{ color: 'var(--success-green)' }} /> Full catalogue access</li>
                <li><FaCheckCircle style={{ color: 'var(--success-green)' }} /> Reserve books</li>
                <li><FaCheckCircle style={{ color: 'var(--success-green)' }} /> Write reviews</li>
              </ul>
              <Link to="/contact" className="btn btn-outline" style={{ marginTop: '2rem', width: '100%' }}>
                Get Started
              </Link>
            </div>

            <div className="card" style={{ border: '3px solid var(--accent-peru)', position: 'relative', transform: 'scale(1.05)', zIndex: 1 }}>
              <span className="badge" style={{ position: 'absolute', top: '-12px', right: '20px', fontSize: '0.875rem' }}>Most Popular</span>
              <div className="text-center">
                <h3>Standard</h3>
                <div style={{ fontSize: '3rem', fontWeight: '700', color: 'var(--accent-peru)', margin: '1.5rem 0' }}>
                  ₹800
                </div>
                <p className="text-muted">per month</p>
              </div>
              <hr className="divider" />
              <ul style={{ marginLeft: '1.5rem', lineHeight: '2.5' }}>
                <li><FaCheckCircle style={{ color: 'var(--success-green)' }} /> Borrow 4 books at a time</li>
                <li><FaCheckCircle style={{ color: 'var(--success-green)' }} /> 21-day borrowing period</li>
                <li><FaCheckCircle style={{ color: 'var(--success-green)' }} /> Full catalogue access</li>
                <li><FaCheckCircle style={{ color: 'var(--success-green)' }} /> Reserve books</li>
                <li><FaCheckCircle style={{ color: 'var(--success-green)' }} /> Write reviews</li>
                <li><FaCheckCircle style={{ color: 'var(--success-green)' }} /> Priority new arrivals</li>
                <li><FaCheckCircle style={{ color: 'var(--success-green)' }} /> 10% discount on events</li>
              </ul>
              <Link to="/contact" className="btn btn-primary" style={{ marginTop: '2rem', width: '100%' }}>
                Get Started
              </Link>
            </div>

            <div className="card" style={{ border: '2px solid var(--light-gray)' }}>
              <div className="text-center">
                <h3>Premium</h3>
                <div style={{ fontSize: '3rem', fontWeight: '700', color: 'var(--accent-peru)', margin: '1.5rem 0' }}>
                  ₹1,200
                </div>
                <p className="text-muted">per month</p>
              </div>
              <hr className="divider" />
              <ul style={{ marginLeft: '1.5rem', lineHeight: '2.5' }}>
                <li><FaCheckCircle style={{ color: 'var(--success-green)' }} /> Borrow 6 books at a time</li>
                <li><FaCheckCircle style={{ color: 'var(--success-green)' }} /> 30-day borrowing period</li>
                <li><FaCheckCircle style={{ color: 'var(--success-green)' }} /> Full catalogue access</li>
                <li><FaCheckCircle style={{ color: 'var(--success-green)' }} /> Reserve books</li>
                <li><FaCheckCircle style={{ color: 'var(--success-green)' }} /> Write reviews</li>
                <li><FaCheckCircle style={{ color: 'var(--success-green)' }} /> Priority new arrivals</li>
                <li><FaCheckCircle style={{ color: 'var(--success-green)' }} /> 20% discount on events</li>
                <li><FaCheckCircle style={{ color: 'var(--success-green)' }} /> 1 free activity pass/month</li>
              </ul>
              <Link to="/contact" className="btn btn-outline" style={{ marginTop: '2rem', width: '100%' }}>
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Cowork Space */}
      <section className="section section-alt">
        <div className="container">
          <div className="text-center mb-xl">
            <FaLaptop style={{ fontSize: '3rem', color: 'var(--accent-peru)', marginBottom: '1rem' }} />
            <h2>Cowork Space Plans</h2>
            <p className="text-muted">Professional workspace with all amenities</p>
          </div>

          <div className="grid grid-3">
            <div className="card" style={{ border: '2px solid var(--light-gray)' }}>
              <div className="text-center">
                <h3>Day Pass</h3>
                <div style={{ fontSize: '3rem', fontWeight: '700', color: 'var(--accent-peru)', margin: '1.5rem 0' }}>
                  ₹300
                </div>
                <p className="text-muted">per day</p>
              </div>
              <hr className="divider" />
              <ul style={{ marginLeft: '1.5rem', lineHeight: '2.5' }}>
                <li><FaCheckCircle style={{ color: 'var(--success-green)' }} /> 9 AM - 9 PM access</li>
                <li><FaCheckCircle style={{ color: 'var(--success-green)' }} /> High-speed WiFi</li>
                <li><FaCheckCircle style={{ color: 'var(--success-green)' }} /> Power & AC</li>
                <li><FaCheckCircle style={{ color: 'var(--success-green)' }} /> Café access</li>
                <li><FaCheckCircle style={{ color: 'var(--success-green)' }} /> Common seating</li>
              </ul>
              <Link to="/contact" className="btn btn-outline" style={{ marginTop: '2rem', width: '100%' }}>
                Book Now
              </Link>
            </div>

            <div className="card" style={{ border: '3px solid var(--accent-peru)', position: 'relative' }}>
              <span className="badge" style={{ position: 'absolute', top: '-12px', right: '20px' }}>Best Value</span>
              <div className="text-center">
                <h3>Monthly</h3>
                <div style={{ fontSize: '3rem', fontWeight: '700', color: 'var(--accent-peru)', margin: '1.5rem 0' }}>
                  ₹6,000
                </div>
                <p className="text-muted">per month</p>
              </div>
              <hr className="divider" />
              <ul style={{ marginLeft: '1.5rem', lineHeight: '2.5' }}>
                <li><FaCheckCircle style={{ color: 'var(--success-green)' }} /> Unlimited access (all days)</li>
                <li><FaCheckCircle style={{ color: 'var(--success-green)' }} /> High-speed WiFi</li>
                <li><FaCheckCircle style={{ color: 'var(--success-green)' }} /> Power & AC</li>
                <li><FaCheckCircle style={{ color: 'var(--success-green)' }} /> Café access</li>
                <li><FaCheckCircle style={{ color: 'var(--success-green)' }} /> Dedicated desk</li>
                <li><FaCheckCircle style={{ color: 'var(--success-green)' }} /> Meeting room (2 hrs/week)</li>
                <li><FaCheckCircle style={{ color: 'var(--success-green)' }} /> Storage locker</li>
              </ul>
              <Link to="/contact" className="btn btn-primary" style={{ marginTop: '2rem', width: '100%' }}>
                Book Now
              </Link>
            </div>

            <div className="card" style={{ border: '2px solid var(--light-gray)' }}>
              <div className="text-center">
                <h3>Weekly</h3>
                <div style={{ fontSize: '3rem', fontWeight: '700', color: 'var(--accent-peru)', margin: '1.5rem 0' }}>
                  ₹1,800
                </div>
                <p className="text-muted">per week</p>
              </div>
              <hr className="divider" />
              <ul style={{ marginLeft: '1.5rem', lineHeight: '2.5' }}>
                <li><FaCheckCircle style={{ color: 'var(--success-green)' }} /> 9 AM - 9 PM access</li>
                <li><FaCheckCircle style={{ color: 'var(--success-green)' }} /> High-speed WiFi</li>
                <li><FaCheckCircle style={{ color: 'var(--success-green)' }} /> Power & AC</li>
                <li><FaCheckCircle style={{ color: 'var(--success-green)' }} /> Café access</li>
                <li><FaCheckCircle style={{ color: 'var(--success-green)' }} /> Flexible seating</li>
                <li><FaCheckCircle style={{ color: 'var(--success-green)' }} /> Meeting room (1 hr)</li>
              </ul>
              <Link to="/contact" className="btn btn-outline" style={{ marginTop: '2rem', width: '100%' }}>
                Book Now
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Study Space */}
      <section className="section">
        <div className="container">
          <div className="text-center mb-xl">
            <FaGraduationCap style={{ fontSize: '3rem', color: 'var(--accent-peru)', marginBottom: '1rem' }} />
            <h2>Study Space Plans</h2>
            <p className="text-muted">Quiet, focused environment for learners</p>
          </div>

          <div className="grid grid-3">
            <div className="card" style={{ border: '2px solid var(--light-gray)' }}>
              <div className="text-center">
                <h3>Half-Day</h3>
                <div style={{ fontSize: '3rem', fontWeight: '700', color: 'var(--accent-peru)', margin: '1.5rem 0' }}>
                  ₹100
                </div>
                <p className="text-muted">4 hours</p>
              </div>
              <hr className="divider" />
              <ul style={{ marginLeft: '1.5rem', lineHeight: '2.5' }}>
                <li><FaCheckCircle style={{ color: 'var(--success-green)' }} /> 4-hour access</li>
                <li><FaCheckCircle style={{ color: 'var(--success-green)' }} /> Individual desk</li>
                <li><FaCheckCircle style={{ color: 'var(--success-green)' }} /> AC & power</li>
                <li><FaCheckCircle style={{ color: 'var(--success-green)' }} /> WiFi access</li>
              </ul>
              <Link to="/contact" className="btn btn-outline" style={{ marginTop: '2rem', width: '100%' }}>
                Book Now
              </Link>
            </div>

            <div className="card" style={{ border: '2px solid var(--light-gray)' }}>
              <div className="text-center">
                <h3>Full Day</h3>
                <div style={{ fontSize: '3rem', fontWeight: '700', color: 'var(--accent-peru)', margin: '1.5rem 0' }}>
                  ₹150
                </div>
                <p className="text-muted">per day</p>
              </div>
              <hr className="divider" />
              <ul style={{ marginLeft: '1.5rem', lineHeight: '2.5' }}>
                <li><FaCheckCircle style={{ color: 'var(--success-green)' }} /> Full-day access</li>
                <li><FaCheckCircle style={{ color: 'var(--success-green)' }} /> Individual desk</li>
                <li><FaCheckCircle style={{ color: 'var(--success-green)' }} /> AC & power</li>
                <li><FaCheckCircle style={{ color: 'var(--success-green)' }} /> WiFi access</li>
              </ul>
              <Link to="/contact" className="btn btn-outline" style={{ marginTop: '2rem', width: '100%' }}>
                Book Now
              </Link>
            </div>

            <div className="card" style={{ border: '3px solid var(--accent-peru)', position: 'relative' }}>
              <span className="badge" style={{ position: 'absolute', top: '-12px', right: '20px' }}>Popular</span>
              <div className="text-center">
                <h3>Monthly</h3>
                <div style={{ fontSize: '3rem', fontWeight: '700', color: 'var(--accent-peru)', margin: '1.5rem 0' }}>
                  ₹3,000
                </div>
                <p className="text-muted">per month</p>
              </div>
              <hr className="divider" />
              <ul style={{ marginLeft: '1.5rem', lineHeight: '2.5' }}>
                <li><FaCheckCircle style={{ color: 'var(--success-green)' }} /> Unlimited access</li>
                <li><FaCheckCircle style={{ color: 'var(--success-green)' }} /> Reserved desk</li>
                <li><FaCheckCircle style={{ color: 'var(--success-green)' }} /> AC & power</li>
                <li><FaCheckCircle style={{ color: 'var(--success-green)' }} /> WiFi access</li>
                <li><FaCheckCircle style={{ color: 'var(--success-green)' }} /> Personal locker</li>
                <li><FaCheckCircle style={{ color: 'var(--success-green)' }} /> Free printing (50 pages)</li>
              </ul>
              <Link to="/contact" className="btn btn-primary" style={{ marginTop: '2rem', width: '100%' }}>
                Book Now
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="section section-alt">
        <div className="container text-center">
          <h2>Ready to Join Nuk Library?</h2>
          <p className="text-muted mb-lg" style={{ fontSize: '1.125rem' }}>
            Choose your plan and start your journey with us today
          </p>
          <div>
            <Link to="/contact" className="btn btn-primary btn-large">
              Contact Us
            </Link>
            <Link to="/about" className="btn btn-secondary btn-large" style={{ marginLeft: '1rem' }}>
              Learn More About Us
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default MembershipPlans;
