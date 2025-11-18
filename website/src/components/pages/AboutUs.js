import React from 'react';
import { Link } from 'react-router-dom';
import { FaBook, FaUsers, FaAward, FaHeart } from 'react-icons/fa';

const AboutUs = () => {
  return (
    <div className="about-page">
      {/* Hero Section */}
      <section className="hero" style={{ height: '400px' }}>
        <div className="hero-overlay"></div>
        <div className="hero-content">
          <h1>About Nuk Library</h1>
          <p>14 years of fostering a love for reading and learning in Bangalore</p>
        </div>
      </section>

      {/* Our Story */}
      <section className="section">
        <div className="container">
          <div className="grid grid-2" style={{ alignItems: 'center' }}>
            <div>
              <h2>Our Story</h2>
              <p>
                Founded over 14 years ago, Nuk Library has been a cornerstone of learning and community
                engagement in Bangalore. What started as a small collection of books has grown into
                a vibrant hub that serves all ages - from toddlers taking their first steps in reading
                to adults seeking knowledge and personal growth.
              </p>
              <p>
                Over the years, we've expanded our services beyond just books. We launched our cowork
                and study spaces in 2023, providing professionals and students with a quiet, inspiring
                environment to work and learn. Our facility has become a place where startups are born,
                students excel, and communities thrive.
              </p>
              <p>
                At Nuk, we believe that reading and learning are lifelong journeys. We're committed to
                providing resources, spaces, and programs that support every stage of that journey.
              </p>
            </div>
            <div>
              <img
                src="https://via.placeholder.com/600x400?text=Nuk+Library+Building"
                alt="Nuk Library"
                className="img-rounded"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Mission & Values */}
      <section className="section section-alt">
        <div className="container">
          <div className="text-center mb-xl">
            <h2>Our Mission & Values</h2>
            <p className="text-muted">What drives us every day</p>
          </div>
          <div className="grid grid-4">
            <div className="card text-center">
              <div style={{ fontSize: '3rem', color: 'var(--accent-peru)', marginBottom: '1rem' }}>
                <FaBook />
              </div>
              <h4>Knowledge</h4>
              <p>
                We believe in making knowledge accessible to everyone, regardless of age or background.
              </p>
            </div>
            <div className="card text-center">
              <div style={{ fontSize: '3rem', color: 'var(--accent-peru)', marginBottom: '1rem' }}>
                <FaUsers />
              </div>
              <h4>Community</h4>
              <p>
                We foster a sense of belonging and connection through shared learning experiences.
              </p>
            </div>
            <div className="card text-center">
              <div style={{ fontSize: '3rem', color: 'var(--accent-peru)', marginBottom: '1rem' }}>
                <FaAward />
              </div>
              <h4>Excellence</h4>
              <p>
                We maintain high standards in our collection, services, and facilities.
              </p>
            </div>
            <div className="card text-center">
              <div style={{ fontSize: '3rem', color: 'var(--accent-peru)', marginBottom: '1rem' }}>
                <FaHeart />
              </div>
              <h4>Passion</h4>
              <p>
                We're passionate about books, learning, and helping our members grow.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* What We Offer */}
      <section className="section">
        <div className="container">
          <div className="text-center mb-xl">
            <h2>What Makes Us Special</h2>
            <p className="text-muted">Comprehensive services for the entire community</p>
          </div>
          <div className="grid grid-2">
            <div className="card">
              <h4>Extensive Collection</h4>
              <p>
                Our library boasts a diverse collection of over 10,000 books spanning multiple genres,
                age groups, and subjects. From toddler board books to advanced academic texts, we have
                something for everyone.
              </p>
              <ul style={{ marginTop: '1rem', marginLeft: '1.5rem' }}>
                <li>Fiction: Classics, contemporary, bestsellers</li>
                <li>Non-Fiction: Science, history, biographies, self-help</li>
                <li>Children's Section: Picture books, early readers, middle grade</li>
                <li>Young Adult: Coming-of-age stories, fantasy, adventure</li>
                <li>Reference Materials: Encyclopedias, dictionaries, atlases</li>
              </ul>
            </div>
            <div className="card">
              <h4>Cultural Activities</h4>
              <p>
                Beyond books, we host a variety of cultural and educational activities that enrich
                our members' lives and build community connections.
              </p>
              <ul style={{ marginTop: '1rem', marginLeft: '1.5rem' }}>
                <li><strong>Toastmasters Clubs:</strong> Public speaking for children and adults</li>
                <li><strong>Art Club:</strong> Explore various art forms with in-house artists</li>
                <li><strong>Chess Classes:</strong> Develop strategic thinking skills</li>
                <li><strong>Rubik's Cube:</strong> Enhance problem-solving abilities</li>
                <li><strong>Author Talks:</strong> Meet and interact with writers</li>
                <li><strong>Reading Circles:</strong> Discuss books with fellow readers</li>
              </ul>
            </div>
            <div className="card">
              <h4>Modern Facilities</h4>
              <p>
                We've invested in creating comfortable, well-equipped spaces that support various
                needs - from quiet reading to collaborative work.
              </p>
              <ul style={{ marginTop: '1rem', marginLeft: '1.5rem' }}>
                <li>Air-conditioned spaces throughout</li>
                <li>High-speed WiFi connectivity</li>
                <li>Power backup for uninterrupted service</li>
                <li>Clean, well-maintained restrooms</li>
                <li>Ergonomic seating arrangements</li>
                <li>Dedicated children's area</li>
              </ul>
            </div>
            <div className="card">
              <h4>Flexible Hours</h4>
              <p>
                We understand that people have different schedules, so we're open 7 days a week
                with extended hours.
              </p>
              <ul style={{ marginTop: '1rem', marginLeft: '1.5rem' }}>
                <li><strong>Weekdays:</strong> 9:00 AM - 9:00 PM</li>
                <li><strong>Weekends:</strong> 10:00 AM - 9:00 PM</li>
                <li><strong>Library Hours:</strong> 6 days/week (closed Mondays)</li>
                <li><strong>Cowork/Study:</strong> All 7 days</li>
                <li>Closed on public holidays</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Location */}
      <section className="section section-alt">
        <div className="container">
          <div className="grid grid-2" style={{ alignItems: 'center' }}>
            <div>
              <h2>Visit Us</h2>
              <h4>Location</h4>
              <p>
                We're located in the heart of Bangalore, easily accessible by public transport
                and with convenient parking options nearby.
              </p>
              <h4 style={{ marginTop: '1.5rem' }}>Parking</h4>
              <p>
                Street parking is available on a first-come, first-served basis. We also have
                tie-ups with nearby parking facilities for long-term parking needs.
              </p>
              <Link to="/contact" className="btn btn-primary" style={{ marginTop: '1rem' }}>
                Get Directions
              </Link>
            </div>
            <div>
              {/* Placeholder for Google Maps */}
              <div
                style={{
                  height: '400px',
                  backgroundColor: 'var(--light-gray)',
                  borderRadius: 'var(--radius-lg)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'var(--text-charcoal)',
                }}
              >
                <p>Google Maps Integration</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="section">
        <div className="container text-center">
          <h2>Join Our Growing Community</h2>
          <p className="text-muted mb-lg" style={{ fontSize: '1.125rem' }}>
            Experience the warmth and richness of Nuk Library. Become a member today!
          </p>
          <Link to="/membership" className="btn btn-primary btn-large">
            View Membership Plans
          </Link>
        </div>
      </section>
    </div>
  );
};

export default AboutUs;
