import React from 'react';
import { Link } from 'react-router-dom';
import { FaBook, FaUsers, FaAward, FaHeart } from 'react-icons/fa';

const AboutUs = () => {
  return (
    <div className="about-page">
      {/* Hero Section */}
      <section
        className="hero"
        style={{
          height: '400px',
          backgroundImage: 'url(/assets/images/Nuk-10.jpeg)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
          position: 'relative'
        }}
      >
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
                <strong>1st Floor, PGK Chambers</strong><br />
                Hosa Road, Kasavanahalli<br />
                Bengaluru 560035<br />
                Diagonally opposite La Casa Restaurant
              </p>
              <p style={{ marginTop: '1rem' }}>
                We're located on Hosa Road, 1 km from Sarjapur Road in South Bengaluru.
                Easily accessible by public transport and personal vehicles.
              </p>
              <h4 style={{ marginTop: '1.5rem' }}>Contact</h4>
              <p>
                <strong>Phone:</strong> <a href="tel:+917259528336">+91 725 952 8336</a><br />
                <strong>Email:</strong> <a href="mailto:sridhar@mynuk.com">sridhar@mynuk.com</a>
              </p>
              <h4 style={{ marginTop: '1.5rem' }}>Parking</h4>
              <p>
                Ample street parking available in the lane opposite to the library and
                adjacent to La Casa Restaurant on a first-come, first-served basis.
              </p>
              <a
                href="https://maps.app.goo.gl/Sd8rqGCfzvc42Jyr9"
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-primary"
                style={{ marginTop: '1rem' }}
              >
                Get Directions
              </a>
            </div>
            <div>
              {/* Google Maps Embed */}
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3889.059633998531!2d77.6734572750037!3d12.9038869874053!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3bae13dca99ee72b%3A0x3f3200cbc7b53c0d!2sNuk%20Library%20Caf%C4%97%20and%20Cowork!5e0!3m2!1sen!2sin!4v1763819333991!5m2!1sen!2sin"
                width="100%"
                height="400"
                style={{
                  border: 0,
                  borderRadius: 'var(--radius-lg)',
                }}
                allowFullScreen=""
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="Nuk Library Location"
              ></iframe>
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
