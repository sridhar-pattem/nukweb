import React from 'react';
import { Link } from 'react-router-dom';
import { FaGraduationCap, FaCheckCircle, FaBookReader, FaLightbulb, FaLock } from 'react-icons/fa';

const StudySpaceService = () => {
  return (
    <div className="study-space-service-page">
      {/* Hero */}
      <section className="hero" style={{ height: '400px' }}>
        <div className="hero-overlay"></div>
        <div className="hero-content">
          <h1><FaGraduationCap style={{ marginRight: '1rem' }} />Study Space</h1>
          <p>Quiet, focused environment for serious learners</p>
        </div>
      </section>

      {/* Overview */}
      <section className="section">
        <div className="container">
          <div className="text-center mb-xl">
            <h2>Your Quiet Study Haven</h2>
            <p className="text-muted" style={{ maxWidth: '800px', margin: '0 auto' }}>
              Whether you're preparing for competitive exams, working on research, or need a
              distraction-free space for focused study, our study space provides the perfect
              environment for deep learning and concentration.
            </p>
          </div>

          <div className="grid grid-3">
            <div className="card text-center">
              <h3 style={{ color: 'var(--accent-peru)' }}>50+</h3>
              <p>Individual study seats</p>
            </div>
            <div className="card text-center">
              <h3 style={{ color: 'var(--accent-peru)' }}>100%</h3>
              <p>Silent zones</p>
            </div>
            <div className="card text-center">
              <h3 style={{ color: 'var(--accent-peru)' }}>7 Days</h3>
              <p>Open all week</p>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="section section-alt">
        <div className="container">
          <h2 className="text-center mb-xl">Why Choose Our Study Space</h2>
          <div className="grid grid-3">
            <div className="card text-center">
              <div style={{ fontSize: '3rem', color: 'var(--accent-peru)', marginBottom: '1rem' }}>
                <FaBookReader />
              </div>
              <h4>Completely Silent</h4>
              <p>Strictly enforced no-talking policy in study zones for maximum concentration</p>
            </div>
            <div className="card text-center">
              <div style={{ fontSize: '3rem', color: 'var(--accent-peru)', marginBottom: '1rem' }}>
                <FaLightbulb />
              </div>
              <h4>Excellent Lighting</h4>
              <p>Well-lit spaces with natural and artificial lighting to reduce eye strain</p>
            </div>
            <div className="card text-center">
              <div style={{ fontSize: '3rem', color: 'var(--accent-peru)', marginBottom: '1rem' }}>
                <FaLock />
              </div>
              <h4>Secure Storage</h4>
              <p>Personal lockers available for monthly members to store study materials</p>
            </div>
          </div>
        </div>
      </section>

      {/* Amenities */}
      <section className="section">
        <div className="container">
          <h2 className="text-center mb-xl">Study Space Amenities</h2>
          <div className="grid grid-2">
            <div className="card">
              <h4>Facilities</h4>
              <ul style={{ marginTop: '1rem', marginLeft: '1.5rem', lineHeight: '2' }}>
                <li><FaCheckCircle style={{ color: 'var(--success-green)' }} /> Individual study desks with partitions</li>
                <li><FaCheckCircle style={{ color: 'var(--success-green)' }} /> Comfortable ergonomic chairs</li>
                <li><FaCheckCircle style={{ color: 'var(--success-green)' }} /> Air-conditioned environment</li>
                <li><FaCheckCircle style={{ color: 'var(--success-green)' }} /> Power outlets at every desk</li>
                <li><FaCheckCircle style={{ color: 'var(--success-green)' }} /> WiFi connectivity (optional use)</li>
                <li><FaCheckCircle style={{ color: 'var(--success-green)' }} /> Clean restrooms</li>
                <li><FaCheckCircle style={{ color: 'var(--success-green)' }} /> Water dispenser</li>
              </ul>
            </div>
            <div className="card">
              <h4>Additional Benefits</h4>
              <ul style={{ marginTop: '1rem', marginLeft: '1.5rem', lineHeight: '2' }}>
                <li><FaCheckCircle style={{ color: 'var(--success-green)' }} /> Access to reference books</li>
                <li><FaCheckCircle style={{ color: 'var(--success-green)' }} /> Printing/scanning facilities (paid)</li>
                <li><FaCheckCircle style={{ color: 'var(--success-green)' }} /> Minimal café for refreshments</li>
                <li><FaCheckCircle style={{ color: 'var(--success-green)' }} /> CCTV surveillance for security</li>
                <li><FaCheckCircle style={{ color: 'var(--success-green)' }} /> Separate break area</li>
                <li><FaCheckCircle style={{ color: 'var(--success-green)' }} /> Monthly motivational sessions</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="section section-alt">
        <div className="container">
          <h2 className="text-center mb-xl">Study Space Pricing</h2>
          <div className="grid grid-3">
            <div className="card" style={{ border: '2px solid var(--light-gray)' }}>
              <div className="text-center">
                <h3>Day Pass</h3>
                <div style={{ fontSize: '2.5rem', fontWeight: '700', color: 'var(--accent-peru)', margin: '1rem 0' }}>
                  ₹150
                </div>
                <p className="text-muted">per day</p>
              </div>
              <hr className="divider" />
              <ul style={{ marginLeft: '1.5rem', lineHeight: '2' }}>
                <li><FaCheckCircle style={{ color: 'var(--success-green)' }} /> Full-day access</li>
                <li><FaCheckCircle style={{ color: 'var(--success-green)' }} /> Individual desk</li>
                <li><FaCheckCircle style={{ color: 'var(--success-green)' }} /> AC & power</li>
                <li><FaCheckCircle style={{ color: 'var(--success-green)' }} /> WiFi access</li>
              </ul>
              <Link to="/contact" className="btn btn-outline" style={{ marginTop: '1.5rem', width: '100%' }}>
                Book Now
              </Link>
            </div>

            <div className="card" style={{ border: '3px solid var(--accent-peru)', position: 'relative' }}>
              <span className="badge" style={{ position: 'absolute', top: '-12px', right: '20px' }}>Popular</span>
              <div className="text-center">
                <h3>Monthly</h3>
                <div style={{ fontSize: '2.5rem', fontWeight: '700', color: 'var(--accent-peru)', margin: '1rem 0' }}>
                  ₹3,000
                </div>
                <p className="text-muted">per month</p>
              </div>
              <hr className="divider" />
              <ul style={{ marginLeft: '1.5rem', lineHeight: '2' }}>
                <li><FaCheckCircle style={{ color: 'var(--success-green)' }} /> Unlimited access (all days)</li>
                <li><FaCheckCircle style={{ color: 'var(--success-green)' }} /> Reserved desk</li>
                <li><FaCheckCircle style={{ color: 'var(--success-green)' }} /> AC & power</li>
                <li><FaCheckCircle style={{ color: 'var(--success-green)' }} /> WiFi access</li>
                <li><FaCheckCircle style={{ color: 'var(--success-green)' }} /> Personal locker</li>
                <li><FaCheckCircle style={{ color: 'var(--success-green)' }} /> Free printing (50 pages)</li>
              </ul>
              <Link to="/contact" className="btn btn-primary" style={{ marginTop: '1.5rem', width: '100%' }}>
                Book Now
              </Link>
            </div>

            <div className="card" style={{ border: '2px solid var(--light-gray)' }}>
              <div className="text-center">
                <h3>Half-Day Pass</h3>
                <div style={{ fontSize: '2.5rem', fontWeight: '700', color: 'var(--accent-peru)', margin: '1rem 0' }}>
                  ₹100
                </div>
                <p className="text-muted">4 hours</p>
              </div>
              <hr className="divider" />
              <ul style={{ marginLeft: '1.5rem', lineHeight: '2' }}>
                <li><FaCheckCircle style={{ color: 'var(--success-green)' }} /> 4-hour access</li>
                <li><FaCheckCircle style={{ color: 'var(--success-green)' }} /> Individual desk</li>
                <li><FaCheckCircle style={{ color: 'var(--success-green)' }} /> AC & power</li>
                <li><FaCheckCircle style={{ color: 'var(--success-green)' }} /> WiFi access</li>
              </ul>
              <Link to="/contact" className="btn btn-outline" style={{ marginTop: '1.5rem', width: '100%' }}>
                Book Now
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Rules */}
      <section className="section">
        <div className="container">
          <div className="grid grid-2">
            <div className="card">
              <h4>Study Space Rules</h4>
              <ul style={{ marginTop: '1rem', marginLeft: '1.5rem', lineHeight: '2' }}>
                <li>Maintain complete silence in study zones</li>
                <li>Keep mobile phones on silent/vibrate mode</li>
                <li>Take phone calls in designated break area only</li>
                <li>No food allowed at study desks (beverages with lids ok)</li>
                <li>Keep your study area clean and organized</li>
                <li>No reservation of seats without actual presence</li>
                <li>Respect other students' focus and space</li>
              </ul>
            </div>
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
              <p style={{ marginTop: '1.5rem', fontSize: '0.875rem' }}>
                <strong>Note:</strong> Last entry is 30 minutes before closing time.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="section section-alt">
        <div className="container text-center">
          <h2>Focus on Your Goals</h2>
          <p className="text-muted mb-lg" style={{ fontSize: '1.125rem' }}>
            Book your study space and experience the power of focused learning
          </p>
          <div>
            <Link to="/contact" className="btn btn-primary btn-large">
              Book Your Seat
            </Link>
            <Link to="/contact" className="btn btn-secondary btn-large" style={{ marginLeft: '1rem' }}>
              Visit Us
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default StudySpaceService;
