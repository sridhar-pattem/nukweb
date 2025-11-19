import React, { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

// Minimal, elegant icons using Unicode/Symbols
const Icon = ({ name, className = '' }) => {
  const icons = {
    menu: '☰',
    close: '✕',
    home: '⌂',
    books: '◫',
    events: '◉',
    blog: '◈',
    contact: '✉',
    user: '◯',
    admin: '⚙',
    library: '◫',
    dashboard: '◼',
    logout: '→',
    login: '←'
  };

  return <span className={`icon ${className}`}>{icons[name] || '◯'}</span>;
};

const ModernHeader = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
    setMobileMenuOpen(false);
  };

  const closeMobileMenu = () => {
    setMobileMenuOpen(false);
  };

  return (
    <header className="header">
      <div className="header-container">
        {/* Brand */}
        <Link to="/" className="header-brand" onClick={closeMobileMenu}>
          <Icon name="books" className="header-logo" />
          <h1 className="header-title">Nuk Library</h1>
        </Link>

        {/* Desktop Navigation */}
        <nav className="header-nav desktop-nav">
          {/* Public Links */}
          <NavLink to="/" className="nav-link" onClick={closeMobileMenu}>
            Home
          </NavLink>
          <NavLink to="/catalogue" className="nav-link" onClick={closeMobileMenu}>
            Catalogue
          </NavLink>
          <NavLink to="/events" className="nav-link" onClick={closeMobileMenu}>
            Events
          </NavLink>
          <NavLink to="/blog" className="nav-link" onClick={closeMobileMenu}>
            Blog
          </NavLink>
          <NavLink to="/contact" className="nav-link" onClick={closeMobileMenu}>
            Contact
          </NavLink>

          {/* Auth Links */}
          {!isAuthenticated() ? (
            <>
              <Link to="/login" className="btn btn-ghost btn-sm" onClick={closeMobileMenu}>
                Sign In
              </Link>
              <Link to="/register" className="btn btn-primary btn-sm" onClick={closeMobileMenu}>
                Join Now
              </Link>
            </>
          ) : (
            <>
              {/* User Navigation */}
              {!isAdmin() && (
                <>
                  <NavLink to="/patron/dashboard" className="nav-link" onClick={closeMobileMenu}>
                    My Dashboard
                  </NavLink>
                  <NavLink to="/patron/library/borrowing" className="nav-link" onClick={closeMobileMenu}>
                    My Library
                  </NavLink>
                </>
              )}

              {/* Admin Navigation */}
              {isAdmin() && (
                <>
                  <NavLink to="/admin/dashboard" className="nav-link" onClick={closeMobileMenu}>
                    Admin
                  </NavLink>
                  <NavLink to="/admin/library/cataloging" className="nav-link" onClick={closeMobileMenu}>
                    Library Admin
                  </NavLink>
                </>
              )}

              {/* Profile & Logout */}
              <NavLink to="/profile" className="btn btn-ghost btn-sm" onClick={closeMobileMenu}>
                <Icon name="user" /> Profile
              </NavLink>
              <button onClick={handleLogout} className="btn btn-ghost btn-sm">
                <Icon name="logout" /> Sign Out
              </button>
            </>
          )}
        </nav>

        {/* Mobile Menu Toggle */}
        <button
          className="mobile-menu-toggle"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label="Toggle menu"
        >
          <Icon name={mobileMenuOpen ? 'close' : 'menu'} />
        </button>
      </div>

      {/* Mobile Navigation */}
      {mobileMenuOpen && (
        <div className="mobile-nav">
          <div className="mobile-nav-section">
            <NavLink to="/" className="mobile-nav-link" onClick={closeMobileMenu}>
              <Icon name="home" /> Home
            </NavLink>
            <NavLink to="/catalogue" className="mobile-nav-link" onClick={closeMobileMenu}>
              <Icon name="books" /> Catalogue
            </NavLink>
            <NavLink to="/events" className="mobile-nav-link" onClick={closeMobileMenu}>
              <Icon name="events" /> Events
            </NavLink>
            <NavLink to="/blog" className="mobile-nav-link" onClick={closeMobileMenu}>
              <Icon name="blog" /> Blog
            </NavLink>
            <NavLink to="/contact" className="mobile-nav-link" onClick={closeMobileMenu}>
              <Icon name="contact" /> Contact
            </NavLink>
          </div>

          {isAuthenticated() && (
            <div className="mobile-nav-section">
              {!isAdmin() && (
                <>
                  <NavLink to="/patron/dashboard" className="mobile-nav-link" onClick={closeMobileMenu}>
                    <Icon name="dashboard" /> My Dashboard
                  </NavLink>
                  <NavLink to="/patron/library/borrowing" className="mobile-nav-link" onClick={closeMobileMenu}>
                    <Icon name="library" /> My Library
                  </NavLink>
                </>
              )}

              {isAdmin() && (
                <>
                  <NavLink to="/admin/dashboard" className="mobile-nav-link" onClick={closeMobileMenu}>
                    <Icon name="admin" /> Admin Dashboard
                  </NavLink>
                  <NavLink to="/admin/library/cataloging" className="mobile-nav-link" onClick={closeMobileMenu}>
                    <Icon name="library" /> Library Admin
                  </NavLink>
                </>
              )}

              <NavLink to="/profile" className="mobile-nav-link" onClick={closeMobileMenu}>
                <Icon name="user" /> Profile
              </NavLink>
              <button onClick={handleLogout} className="mobile-nav-link">
                <Icon name="logout" /> Sign Out
              </button>
            </div>
          )}

          {!isAuthenticated() && (
            <div className="mobile-nav-section">
              <Link to="/login" className="btn btn-ghost" onClick={closeMobileMenu}>
                Sign In
              </Link>
              <Link to="/register" className="btn btn-primary" onClick={closeMobileMenu}>
                Join Now
              </Link>
            </div>
          )}
        </div>
      )}

      <style jsx>{`
        .icon {
          font-size: 18px;
          line-height: 1;
          display: inline-block;
        }

        .header-logo {
          font-size: 32px;
        }

        .desktop-nav {
          display: flex;
          align-items: center;
          gap: var(--space-sm);
        }

        .mobile-menu-toggle {
          display: none;
          padding: var(--space-sm);
          background: transparent;
          border: none;
          font-size: 24px;
          color: var(--neutral-700);
          cursor: pointer;
        }

        .mobile-nav {
          display: none;
        }

        @media (max-width: 968px) {
          .desktop-nav {
            display: none;
          }

          .mobile-menu-toggle {
            display: block;
          }

          .mobile-nav {
            display: block;
            padding: var(--space-lg);
            background: white;
            border-top: 1px solid var(--neutral-200);
          }

          .mobile-nav-section {
            display: flex;
            flex-direction: column;
            gap: var(--space-xs);
            padding: var(--space-md) 0;
          }

          .mobile-nav-section:not(:last-child) {
            border-bottom: 1px solid var(--neutral-200);
          }

          .mobile-nav-link {
            display: flex;
            align-items: center;
            gap: var(--space-md);
            padding: var(--space-md);
            font-size: var(--text-base);
            color: var(--neutral-700);
            text-decoration: none;
            border-radius: var(--radius-md);
            transition: all var(--transition-fast);
            width: 100%;
            text-align: left;
            background: transparent;
            border: none;
            cursor: pointer;
          }

          .mobile-nav-link:hover,
          .mobile-nav-link.active {
            background: var(--cream-100);
            color: var(--neutral-900);
          }
        }
      `}</style>
    </header>
  );
};

export default ModernHeader;
