import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { FaFacebook, FaInstagram, FaTwitter, FaYoutube, FaEnvelope, FaPhone, FaMapMarkerAlt } from 'react-icons/fa';

const Footer = () => {
  const { isAuthenticated } = useAuth();

  // Hide footer for authenticated users
  if (isAuthenticated) {
    return null;
  }

  return (
    <footer className="footer">
      <div className="footer-content">
        <div className="footer-section">
          <h4>About Nuk Library</h4>
          <p>
            A 14-year-old community hub in Bangalore offering library, cowork space,
            study space, and cultural activities. Serving all ages from toddlers to adults.
          </p>
          <div className="social-links">
            <a
              href="https://www.facebook.com/nuklibrary"
              className="social-link"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Facebook"
            >
              <FaFacebook />
            </a>
            <a
              href="https://www.instagram.com/nuklibrary"
              className="social-link"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Instagram"
            >
              <FaInstagram />
            </a>
            <a
              href="https://twitter.com/nuklibrary"
              className="social-link"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Twitter"
            >
              <FaTwitter />
            </a>
            <a
              href="https://www.youtube.com/nuklibrary"
              className="social-link"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="YouTube"
            >
              <FaYoutube />
            </a>
          </div>
        </div>

        <div className="footer-section">
          <h4>Quick Links</h4>
          <ul className="footer-links">
            <li><Link to="/about">About Us</Link></li>
            <li><Link to="/services">Services</Link></li>
            <li><Link to="/catalogue">Book Catalogue</Link></li>
            <li><Link to="/new-arrivals">New Arrivals</Link></li>
            <li><Link to="/recommendations">Recommendations</Link></li>
            <li><Link to="/events">Events & Activities</Link></li>
            <li><Link to="/blog">Blog</Link></li>
          </ul>
        </div>

        <div className="footer-section">
          <h4>Services</h4>
          <ul className="footer-links">
            <li><Link to="/services/library">Library Membership</Link></li>
            <li><Link to="/services/cowork">Cowork Space</Link></li>
            <li><Link to="/services/study-space">Study Space</Link></li>
            <li><Link to="/membership">Membership Plans</Link></li>
            <li><a href="#activities">Chess Classes</a></li>
            <li><a href="#activities">Art Club</a></li>
            <li><a href="#activities">Toastmasters</a></li>
          </ul>
        </div>

        <div className="footer-section">
          <h4>Contact Us</h4>
          <p>
            <FaMapMarkerAlt style={{ marginRight: '8px' }} />
            Bangalore, Karnataka, India
          </p>
          <p>
            <FaPhone style={{ marginRight: '8px' }} />
            +91 12345 67890
          </p>
          <p>
            <FaEnvelope style={{ marginRight: '8px' }} />
            <a href="mailto:info@mynuk.com">info@mynuk.com</a>
          </p>
          <p style={{ marginTop: '1rem', fontSize: '0.875rem' }}>
            <strong>Hours:</strong><br />
            Mon-Fri: 9 AM - 9 PM<br />
            Sat-Sun: 10 AM - 9 PM<br />
            <em>(Library closed on Mondays)</em>
          </p>
        </div>
      </div>

      <div className="footer-bottom">
        <div className="container">
          <p>&copy; {new Date().getFullYear()} Nuk Library. All rights reserved. | <Link to="/privacy">Privacy Policy</Link> | <Link to="/terms">Terms of Service</Link></p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
