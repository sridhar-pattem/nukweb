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
            <h2>Library Membership Plans</h2>
            <p className="text-muted">Access our collection of 10,000+ books. Exchange unlimited times!</p>
          </div>

          <div className="grid grid-3">
            {/* One Book Plan */}
            <div className="card" style={{ border: '2px solid var(--light-gray)' }}>
              <div className="text-center">
                <h3>One Book Plan</h3>
                <p className="text-muted" style={{ fontSize: '0.875rem', marginTop: '0.5rem' }}>Borrow 1 book at a time</p>
              </div>
              <hr className="divider" />
              <div style={{ marginBottom: '1.5rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                  <span>3 months:</span>
                  <strong style={{ color: 'var(--accent-peru)' }}>₹1,000</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                  <span>6 months:</span>
                  <strong style={{ color: 'var(--accent-peru)' }}>₹1,600</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>1 year:</span>
                  <strong style={{ color: 'var(--accent-peru)' }}>₹2,800</strong>
                </div>
              </div>
              <ul style={{ marginLeft: '1.5rem', lineHeight: '2' }}>
                <li><FaCheckCircle style={{ color: 'var(--success-green)' }} /> Full catalogue access</li>
                <li><FaCheckCircle style={{ color: 'var(--success-green)' }} /> Unlimited exchanges</li>
              </ul>
              <Link to="/contact" className="btn btn-outline" style={{ marginTop: '2rem', width: '100%' }}>
                Get Started
              </Link>
            </div>

            {/* Two Book Plan */}
            <div className="card" style={{ border: '2px solid var(--light-gray)' }}>
              <div className="text-center">
                <h3>Two Book Plan</h3>
                <p className="text-muted" style={{ fontSize: '0.875rem', marginTop: '0.5rem' }}>Borrow 2 books at a time</p>
              </div>
              <hr className="divider" />
              <div style={{ marginBottom: '1.5rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                  <span>3 months:</span>
                  <strong style={{ color: 'var(--accent-peru)' }}>₹1,300</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                  <span>6 months:</span>
                  <strong style={{ color: 'var(--accent-peru)' }}>₹2,300</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>1 year:</span>
                  <strong style={{ color: 'var(--accent-peru)' }}>₹4,100</strong>
                </div>
              </div>
              <ul style={{ marginLeft: '1.5rem', lineHeight: '2' }}>
                <li><FaCheckCircle style={{ color: 'var(--success-green)' }} /> Full catalogue access</li>
                <li><FaCheckCircle style={{ color: 'var(--success-green)' }} /> Unlimited exchanges</li>
              </ul>
              <Link to="/contact" className="btn btn-outline" style={{ marginTop: '2rem', width: '100%' }}>
                Get Started
              </Link>
            </div>

            {/* Three Book Plan */}
            <div className="card" style={{ border: '2px solid var(--light-gray)' }}>
              <div className="text-center">
                <h3>Three Book Plan</h3>
                <p className="text-muted" style={{ fontSize: '0.875rem', marginTop: '0.5rem' }}>Borrow 3 books at a time</p>
              </div>
              <hr className="divider" />
              <div style={{ marginBottom: '1.5rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                  <span>3 months:</span>
                  <strong style={{ color: 'var(--accent-peru)' }}>₹1,500</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                  <span>6 months:</span>
                  <strong style={{ color: 'var(--accent-peru)' }}>₹2,600</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>1 year:</span>
                  <strong style={{ color: 'var(--accent-peru)' }}>₹4,400</strong>
                </div>
              </div>
              <ul style={{ marginLeft: '1.5rem', lineHeight: '2' }}>
                <li><FaCheckCircle style={{ color: 'var(--success-green)' }} /> Full catalogue access</li>
                <li><FaCheckCircle style={{ color: 'var(--success-green)' }} /> Unlimited exchanges</li>
              </ul>
              <Link to="/contact" className="btn btn-outline" style={{ marginTop: '2rem', width: '100%' }}>
                Get Started
              </Link>
            </div>

            {/* Four Book Plan */}
            <div className="card" style={{ border: '3px solid var(--accent-peru)', position: 'relative' }}>
              <span className="badge" style={{ position: 'absolute', top: '-12px', right: '20px' }}>Popular</span>
              <div className="text-center">
                <h3>Four Book Plan</h3>
                <p className="text-muted" style={{ fontSize: '0.875rem', marginTop: '0.5rem' }}>Borrow 4 books at a time</p>
              </div>
              <hr className="divider" />
              <div style={{ marginBottom: '1.5rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                  <span>3 months:</span>
                  <strong style={{ color: 'var(--accent-peru)' }}>₹1,900</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                  <span>6 months:</span>
                  <strong style={{ color: 'var(--accent-peru)' }}>₹3,400</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>1 year:</span>
                  <strong style={{ color: 'var(--accent-peru)' }}>₹5,600</strong>
                </div>
              </div>
              <ul style={{ marginLeft: '1.5rem', lineHeight: '2' }}>
                <li><FaCheckCircle style={{ color: 'var(--success-green)' }} /> Full catalogue access</li>
                <li><FaCheckCircle style={{ color: 'var(--success-green)' }} /> Unlimited exchanges</li>
              </ul>
              <Link to="/contact" className="btn btn-primary" style={{ marginTop: '2rem', width: '100%' }}>
                Get Started
              </Link>
            </div>

            {/* Six Book Plan */}
            <div className="card" style={{ border: '2px solid var(--light-gray)' }}>
              <div className="text-center">
                <h3>Six Book Plan</h3>
                <p className="text-muted" style={{ fontSize: '0.875rem', marginTop: '0.5rem' }}>Borrow 6 books at a time</p>
              </div>
              <hr className="divider" />
              <div style={{ marginBottom: '1.5rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                  <span>3 months:</span>
                  <strong style={{ color: 'var(--accent-peru)' }}>₹2,300</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                  <span>6 months:</span>
                  <strong style={{ color: 'var(--accent-peru)' }}>₹4,100</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>1 year:</span>
                  <strong style={{ color: 'var(--accent-peru)' }}>₹6,800</strong>
                </div>
              </div>
              <ul style={{ marginLeft: '1.5rem', lineHeight: '2' }}>
                <li><FaCheckCircle style={{ color: 'var(--success-green)' }} /> Full catalogue access</li>
                <li><FaCheckCircle style={{ color: 'var(--success-green)' }} /> Unlimited exchanges</li>
              </ul>
              <Link to="/contact" className="btn btn-outline" style={{ marginTop: '2rem', width: '100%' }}>
                Get Started
              </Link>
            </div>
          </div>

          <div className="text-center" style={{ marginTop: '2rem' }}>
            <p className="text-muted">
              💡 All plans include a one-time registration fee of ₹200 and a refundable security deposit.<br/>
              Contact our front desk for higher plans.
            </p>
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

          <div className="grid grid-2" style={{ maxWidth: '900px', margin: '0 auto' }}>
            {/* Shared Desk */}
            <div className="card" style={{ border: '2px solid var(--light-gray)' }}>
              <div className="text-center">
                <h3>Shared Desk</h3>
                <p className="text-muted" style={{ fontSize: '0.875rem', marginTop: '0.5rem' }}>Library hall (first-come-first-serve)</p>
              </div>
              <hr className="divider" />
              <div style={{ marginBottom: '1.5rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                  <span>Half-day:</span>
                  <strong style={{ color: 'var(--accent-peru)', fontSize: '1.5rem' }}>₹300</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                  <span>Daily:</span>
                  <strong style={{ color: 'var(--accent-peru)', fontSize: '1.5rem' }}>₹500</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                  <span>Monthly:</span>
                  <strong style={{ color: 'var(--accent-peru)', fontSize: '1.5rem' }}>₹4,000</strong>
                </div>
              </div>
              <ul style={{ marginLeft: '1.5rem', lineHeight: '2.5' }}>
                <li><FaCheckCircle style={{ color: 'var(--success-green)' }} /> 300 Mbps WiFi + Backup WiFi</li>
                <li><FaCheckCircle style={{ color: 'var(--success-green)' }} /> Charging points</li>
                <li><FaCheckCircle style={{ color: 'var(--success-green)' }} /> AC & Power backup</li>
                <li><FaCheckCircle style={{ color: 'var(--success-green)' }} /> Meeting room (prior booking)</li>
                <li><FaCheckCircle style={{ color: 'var(--success-green)' }} /> Free one-day trial</li>
                <li><FaCheckCircle style={{ color: 'var(--success-green)' }} /> Special student discounts</li>
              </ul>
              <Link to="/contact" className="btn btn-outline" style={{ marginTop: '2rem', width: '100%' }}>
                Book Now
              </Link>
            </div>

            {/* Dedicated Desk */}
            <div className="card" style={{ border: '3px solid var(--accent-peru)', position: 'relative' }}>
              <span className="badge" style={{ position: 'absolute', top: '-12px', right: '20px' }}>Premium</span>
              <div className="text-center">
                <h3>Dedicated Desk</h3>
                <p className="text-muted" style={{ fontSize: '0.875rem', marginTop: '0.5rem' }}>Glass-partitioned cabins</p>
              </div>
              <hr className="divider" />
              <div style={{ marginBottom: '1.5rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                  <span>Half-day:</span>
                  <strong style={{ color: 'var(--accent-peru)', fontSize: '1.5rem' }}>₹500</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                  <span>Daily:</span>
                  <strong style={{ color: 'var(--accent-peru)', fontSize: '1.5rem' }}>₹750</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                  <span>Monthly:</span>
                  <strong style={{ color: 'var(--accent-peru)', fontSize: '1.5rem' }}>₹7,000</strong>
                </div>
              </div>
              <ul style={{ marginLeft: '1.5rem', lineHeight: '2.5' }}>
                <li><FaCheckCircle style={{ color: 'var(--success-green)' }} /> 300 Mbps WiFi + Backup WiFi</li>
                <li><FaCheckCircle style={{ color: 'var(--success-green)' }} /> Charging points</li>
                <li><FaCheckCircle style={{ color: 'var(--success-green)' }} /> AC & Power backup</li>
                <li><FaCheckCircle style={{ color: 'var(--success-green)' }} /> Meeting room (prior booking)</li>
                <li><FaCheckCircle style={{ color: 'var(--success-green)' }} /> Free one-day trial</li>
                <li><FaCheckCircle style={{ color: 'var(--success-green)' }} /> Special student discounts</li>
                <li><FaCheckCircle style={{ color: 'var(--success-green)' }} /> Private cabin space</li>
              </ul>
              <Link to="/contact" className="btn btn-primary" style={{ marginTop: '2rem', width: '100%' }}>
                Book Now
              </Link>
            </div>
          </div>

          <div className="text-center" style={{ marginTop: '2rem' }}>
            <p className="text-muted">
              🎓 Special student pricing available | 💰 Extra discount for students below 18 years
            </p>
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
