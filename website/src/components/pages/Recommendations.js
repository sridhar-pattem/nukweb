import React from 'react';
import { FaChild, FaUser, FaBookOpen, FaHeart } from 'react-icons/fa';
import BookCard from '../shared/BookCard';

const Recommendations = () => {
  const toddlerBooks = [
    {
      book_id: 1,
      title: 'The Very Hungry Caterpillar',
      authors: ['Eric Carle'],
      cover_image_url: 'https://via.placeholder.com/200x300?text=Hungry+Caterpillar',
      rating: 4.9,
      available_items: 4,
    },
    {
      book_id: 2,
      title: 'Where the Wild Things Are',
      authors: ['Maurice Sendak'],
      cover_image_url: 'https://via.placeholder.com/200x300?text=Wild+Things',
      rating: 4.8,
      available_items: 3,
    },
    {
      book_id: 3,
      title: 'Goodnight Moon',
      authors: ['Margaret Wise Brown'],
      cover_image_url: 'https://via.placeholder.com/200x300?text=Goodnight+Moon',
      rating: 4.7,
      available_items: 5,
    },
  ];

  const childrenBooks = [
    {
      book_id: 4,
      title: 'Harry Potter Series',
      authors: ['J.K. Rowling'],
      cover_image_url: 'https://via.placeholder.com/200x300?text=Harry+Potter',
      rating: 4.9,
      available_items: 8,
    },
    {
      book_id: 5,
      title: 'Matilda',
      authors: ['Roald Dahl'],
      cover_image_url: 'https://via.placeholder.com/200x300?text=Matilda',
      rating: 4.8,
      available_items: 6,
    },
    {
      book_id: 6,
      title: 'The Secret Garden',
      authors: ['Frances Hodgson Burnett'],
      cover_image_url: 'https://via.placeholder.com/200x300?text=Secret+Garden',
      rating: 4.6,
      available_items: 4,
    },
  ];

  const adultFiction = [
    {
      book_id: 7,
      title: 'The Midnight Library',
      authors: ['Matt Haig'],
      cover_image_url: 'https://via.placeholder.com/200x300?text=Midnight+Library',
      rating: 4.5,
      available_items: 3,
    },
    {
      book_id: 8,
      title: 'The Alchemist',
      authors: ['Paulo Coelho'],
      cover_image_url: 'https://via.placeholder.com/200x300?text=Alchemist',
      rating: 4.7,
      available_items: 6,
    },
    {
      book_id: 9,
      title: 'Where the Crawdads Sing',
      authors: ['Delia Owens'],
      cover_image_url: 'https://via.placeholder.com/200x300?text=Crawdads+Sing',
      rating: 4.6,
      available_items: 4,
    },
  ];

  const nonFiction = [
    {
      book_id: 10,
      title: 'Sapiens',
      authors: ['Yuval Noah Harari'],
      cover_image_url: 'https://via.placeholder.com/200x300?text=Sapiens',
      rating: 4.8,
      available_items: 5,
    },
    {
      book_id: 11,
      title: 'Atomic Habits',
      authors: ['James Clear'],
      cover_image_url: 'https://via.placeholder.com/200x300?text=Atomic+Habits',
      rating: 4.9,
      available_items: 4,
    },
    {
      book_id: 12,
      title: 'Educated',
      authors: ['Tara Westover'],
      cover_image_url: 'https://via.placeholder.com/200x300?text=Educated',
      rating: 4.7,
      available_items: 3,
    },
  ];

  return (
    <div className="recommendations-page">
      {/* Hero */}
      <section className="hero" style={{ height: '350px' }}>
        <div className="hero-overlay"></div>
        <div className="hero-content">
          <h1><FaHeart style={{ marginRight: '1rem' }} />Book Recommendations</h1>
          <p>Curated selections for every age and interest</p>
        </div>
      </section>

      {/* Toddlers & Preschool */}
      <section className="section">
        <div className="container">
          <div className="text-center mb-xl">
            <FaChild style={{ fontSize: '3rem', color: 'var(--accent-peru)', marginBottom: '1rem' }} />
            <h2>For Toddlers & Preschoolers (Ages 0-5)</h2>
            <p className="text-muted">Picture books that spark imagination and learning</p>
          </div>
          <div className="grid grid-3">
            {toddlerBooks.map((book) => (
              <BookCard key={book.book_id} book={book} />
            ))}
          </div>
        </div>
      </section>

      {/* Children */}
      <section className="section section-alt">
        <div className="container">
          <div className="text-center mb-xl">
            <FaUser style={{ fontSize: '3rem', color: 'var(--accent-peru)', marginBottom: '1rem' }} />
            <h2>For Children (Ages 6-12)</h2>
            <p className="text-muted">Adventures, fantasies, and life lessons</p>
          </div>
          <div className="grid grid-3">
            {childrenBooks.map((book) => (
              <BookCard key={book.book_id} book={book} />
            ))}
          </div>
        </div>
      </section>

      {/* Adult Fiction */}
      <section className="section">
        <div className="container">
          <div className="text-center mb-xl">
            <FaBookOpen style={{ fontSize: '3rem', color: 'var(--accent-peru)', marginBottom: '1rem' }} />
            <h2>Adult Fiction Favorites</h2>
            <p className="text-muted">Stories that move, inspire, and entertain</p>
          </div>
          <div className="grid grid-3">
            {adultFiction.map((book) => (
              <BookCard key={book.book_id} book={book} />
            ))}
          </div>
        </div>
      </section>

      {/* Non-Fiction */}
      <section className="section section-alt">
        <div className="container">
          <div className="text-center mb-xl">
            <FaBookOpen style={{ fontSize: '3rem', color: 'var(--accent-peru)', marginBottom: '1rem' }} />
            <h2>Non-Fiction Must-Reads</h2>
            <p className="text-muted">Learn, grow, and expand your horizons</p>
          </div>
          <div className="grid grid-3">
            {nonFiction.map((book) => (
              <BookCard key={book.book_id} book={book} />
            ))}
          </div>
        </div>
      </section>

      {/* Staff Picks */}
      <section className="section">
        <div className="container">
          <h2 className="text-center mb-xl">Librarian's Picks</h2>
          <div className="grid grid-2">
            <div className="card">
              <h4>Quote of the Month</h4>
              <blockquote style={{ fontStyle: 'italic', fontSize: '1.125rem', marginTop: '1rem', paddingLeft: '1rem', borderLeft: '4px solid var(--accent-peru)' }}>
                "A reader lives a thousand lives before he dies. The man who never reads lives only one."
                <footer style={{ marginTop: '0.5rem', fontStyle: 'normal', fontSize: '0.9rem', color: '#6c757d' }}>
                  — George R.R. Martin
                </footer>
              </blockquote>
            </div>

            <div className="card">
              <h4>Reading Challenge</h4>
              <p>Join our annual reading challenge and read 24 books this year!</p>
              <ul style={{ marginTop: '1rem', marginLeft: '1.5rem' }}>
                <li>Track your reading progress</li>
                <li>Win exciting prizes</li>
                <li>Connect with fellow readers</li>
                <li>Get personalized recommendations</li>
              </ul>
              <a href="/membership" className="btn btn-primary" style={{ marginTop: '1rem' }}>
                Join as Member
              </a>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Recommendations;
