import React, { useState } from 'react';
import { FaMapMarkerAlt, FaPhone, FaEnvelope, FaClock, FaParking, FaBus } from 'react-icons/fa';

const Contact = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: '',
  });

  const [submitted, setSubmitted] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // API call will be made here
    console.log('Form submitted:', formData);
    setSubmitted(true);
    setTimeout(() => setSubmitted(false), 5000);
  };

  return (
    <div className="contact-page">
      {/* Hero */}
      <section className="hero" style={{ height: '350px' }}>
        <div className="hero-overlay"></div>
        <div className="hero-content">
          <h1>Contact Us</h1>
          <p>We'd love to hear from you</p>
        </div>
      </section>

      {/* Contact Information */}
      <section className="section">
        <div className="container">
          <div className="grid grid-3">
            <div className="card text-center">
              <div style={{ fontSize: '3rem', color: 'var(--accent-peru)', marginBottom: '1rem' }}>
                <FaMapMarkerAlt />
              </div>
              <h4>Location</h4>
              <p>
                Nuk Library<br />
                [Address Line 1]<br />
                Bangalore, Karnataka<br />
                India - 560001
              </p>
            </div>

            <div className="card text-center">
              <div style={{ fontSize: '3rem', color: 'var(--accent-peru)', marginBottom: '1rem' }}>
                <FaPhone />
              </div>
              <h4>Phone</h4>
              <p>
                <a href="tel:+911234567890" style={{ color: 'var(--text-charcoal)' }}>
                  +91 12345 67890
                </a>
              </p>
              <p className="text-muted">Mon-Fri: 9 AM - 9 PM<br />Sat-Sun: 10 AM - 9 PM</p>
            </div>

            <div className="card text-center">
              <div style={{ fontSize: '3rem', color: 'var(--accent-peru)', marginBottom: '1rem' }}>
                <FaEnvelope />
              </div>
              <h4>Email</h4>
              <p>
                General Inquiries:<br />
                <a href="mailto:info@mynuk.com">info@mynuk.com</a>
              </p>
              <p>
                Membership:<br />
                <a href="mailto:membership@mynuk.com">membership@mynuk.com</a>
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Form & Map */}
      <section className="section section-alt">
        <div className="container">
          <div className="grid grid-2">
            {/* Contact Form */}
            <div>
              <h2>Send Us a Message</h2>
              <p className="text-muted" style={{ marginBottom: '2rem' }}>
                Have a question? Fill out the form below and we'll get back to you as soon as possible.
              </p>

              {submitted && (
                <div className="card" style={{ backgroundColor: '#d4edda', color: '#155724', marginBottom: '1rem', border: '1px solid #c3e6cb' }}>
                  <p style={{ margin: 0, fontWeight: '500' }}>✓ Thank you! Your message has been sent successfully.</p>
                </div>
              )}

              <form onSubmit={handleSubmit}>
                <div className="form-group">
                  <label className="form-label">Name *</label>
                  <input
                    type="text"
                    name="name"
                    className="form-input"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    placeholder="Your full name"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Email *</label>
                  <input
                    type="email"
                    name="email"
                    className="form-input"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    placeholder="your.email@example.com"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Phone</label>
                  <input
                    type="tel"
                    name="phone"
                    className="form-input"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="+91 12345 67890"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Subject *</label>
                  <select
                    name="subject"
                    className="form-select"
                    value={formData.subject}
                    onChange={handleChange}
                    required
                  >
                    <option value="">Select a subject</option>
                    <option value="membership">Membership Inquiry</option>
                    <option value="cowork">Cowork Space Booking</option>
                    <option value="study">Study Space Booking</option>
                    <option value="events">Events & Activities</option>
                    <option value="suggestion">Book Suggestion</option>
                    <option value="feedback">Feedback</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Message *</label>
                  <textarea
                    name="message"
                    className="form-textarea"
                    value={formData.message}
                    onChange={handleChange}
                    required
                    placeholder="Your message here..."
                    rows="6"
                  ></textarea>
                </div>

                <button type="submit" className="btn btn-primary btn-large" style={{ width: '100%' }}>
                  Send Message
                </button>
              </form>
            </div>

            {/* Map & Additional Info */}
            <div>
              <h2>Find Us</h2>
              <p className="text-muted" style={{ marginBottom: '1rem' }}>
                We're located in the heart of Bangalore, easily accessible by public transport.
              </p>

              {/* Google Maps Placeholder */}
              <div
                style={{
                  height: '350px',
                  backgroundColor: 'var(--light-gray)',
                  borderRadius: 'var(--radius-lg)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '2rem',
                }}
              >
                <p style={{ color: 'var(--text-charcoal)' }}>Google Maps Integration</p>
              </div>

              <div className="card">
                <h4><FaClock style={{ marginRight: '0.5rem', color: 'var(--accent-peru)' }} />Operating Hours</h4>
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
                <p style={{ marginTop: '1rem', fontSize: '0.875rem', color: '#6c757d' }}>
                  <em>* Library services closed on Mondays (facility remains open)</em>
                </p>
              </div>

              <div className="card" style={{ marginTop: '1rem' }}>
                <h4><FaParking style={{ marginRight: '0.5rem', color: 'var(--accent-peru)' }} />Parking</h4>
                <p>
                  Street parking available on a first-come, first-served basis.
                  Paid parking facilities nearby for extended visits.
                </p>
              </div>

              <div className="card" style={{ marginTop: '1rem' }}>
                <h4><FaBus style={{ marginRight: '0.5rem', color: 'var(--accent-peru)' }} />Public Transport</h4>
                <p>
                  Nearest Metro Station: [Station Name] (10 min walk)<br />
                  Bus Routes: 123, 456, 789
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="section">
        <div className="container">
          <h2 className="text-center mb-xl">Frequently Asked Questions</h2>
          <div className="grid grid-2">
            <div className="card">
              <h5>What are your membership fees?</h5>
              <p>
                We offer three library membership plans starting from ₹500/month.
                Cowork and study space have separate pricing. Visit our{' '}
                <a href="/membership">Membership Plans</a> page for details.
              </p>
            </div>

            <div className="card">
              <h5>Can I visit without being a member?</h5>
              <p>
                Yes! You're welcome to visit us during operating hours. However, borrowing books
                and accessing certain facilities requires a membership.
              </p>
            </div>

            <div className="card">
              <h5>Do you offer trial memberships?</h5>
              <p>
                Yes, we offer a 7-day trial membership for new members. Contact us to learn more
                about our trial period and get started.
              </p>
            </div>

            <div className="card">
              <h5>Can I book a meeting room?</h5>
              <p>
                Yes, we have meeting rooms available for booking. Rates are ₹200-400/hour
                depending on room size. Contact us or visit the{' '}
                <a href="/services/cowork">Cowork Space</a> page for details.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Contact;
