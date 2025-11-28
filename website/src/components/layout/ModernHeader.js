import React, { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const ModernHeader = () => {
  const navigate = useNavigate();
  const { isAuthenticated, isAdmin, logout } = useAuth();
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
    <header className="nav">
      <div className="container nav-inner">
        {/* Brand */}
        <Link to="/" style={{ display: 'flex', gap: '6px', alignItems: 'center', textDecoration: 'none' }} onClick={closeMobileMenu}>
          <img
            src="/logo.png"
            alt="Nuk Library Cowork and Café"
            style={{
              width: '55px',
              height: '55px',
              borderRadius: '6px',
              objectFit: 'cover'
            }}
          />
          <div>
            <div style={{ fontWeight: '700', color: '#111', fontSize: '14px' }}>Library</div>
            <div style={{ marginTop: '-2px', fontSize: '12px', color: '#666', fontWeight: '500' }}>Cowork & Café · Bangalore</div>
          </div>
        </Link>

        {/* Desktop Navigation */}
        <nav className="desktop-nav" style={{ display: 'flex', gap: '2px' }}>
          {/* Public Links */}
          <NavLink to="/" className="btn btn-outline" onClick={closeMobileMenu}>
            Home
          </NavLink>
          <NavLink to="/about" className="btn btn-outline" onClick={closeMobileMenu}>
            About
          </NavLink>
          <NavLink to="/catalogue" className="btn btn-outline" onClick={closeMobileMenu}>
            Catalogue
          </NavLink>
          <NavLink to="/events" className="btn btn-outline" onClick={closeMobileMenu}>
            Events
          </NavLink>
          <NavLink to="/blog" className="btn btn-outline" onClick={closeMobileMenu}>
            Blog
          </NavLink>
          <NavLink to="/contact" className="btn btn-outline" onClick={closeMobileMenu}>
            Contact
          </NavLink>

          {/* Auth-based Navigation */}
          {!isAuthenticated ? (
            <Link to="/login" className="btn btn-primary" onClick={closeMobileMenu}>
              Sign In
            </Link>
          ) : (
            <>
              {/* Patron Links */}
              {!isAdmin() && (
                <>
                  <NavLink to="/patron/dashboard" className="btn btn-outline" onClick={closeMobileMenu}>
                    My Dashboard
                  </NavLink>
                  <NavLink to="/patron/library/borrowing" className="btn btn-outline" onClick={closeMobileMenu}>
                    My Library
                  </NavLink>
                </>
              )}

              {/* Admin Links */}
              {isAdmin() && (
                <NavLink to="/admin/website" className="btn btn-outline" onClick={closeMobileMenu}>
                  Website Admin
                </NavLink>
              )}

              {/* Profile & Logout */}
              <NavLink to="/profile" className="btn btn-outline" onClick={closeMobileMenu}>
                Profile
              </NavLink>
              <button onClick={handleLogout} className="btn btn-dark">
                Sign Out
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
          {mobileMenuOpen ? '✕' : '☰'}
        </button>
      </div>

      {/* Mobile Navigation */}
      {mobileMenuOpen && (
        <div className="mobile-nav">
          <div className="mobile-nav-section">
            <NavLink to="/" className="mobile-nav-link" onClick={closeMobileMenu}>
              Home
            </NavLink>
            <NavLink to="/about" className="mobile-nav-link" onClick={closeMobileMenu}>
              About
            </NavLink>
            <NavLink to="/catalogue" className="mobile-nav-link" onClick={closeMobileMenu}>
              Catalogue
            </NavLink>
            <NavLink to="/events" className="mobile-nav-link" onClick={closeMobileMenu}>
              Events
            </NavLink>
            <NavLink to="/blog" className="mobile-nav-link" onClick={closeMobileMenu}>
              Blog
            </NavLink>
            <NavLink to="/contact" className="mobile-nav-link" onClick={closeMobileMenu}>
              Contact
            </NavLink>
          </div>

          {isAuthenticated && (
            <div className="mobile-nav-section">
              {!isAdmin() && (
                <>
                  <NavLink to="/patron/dashboard" className="mobile-nav-link" onClick={closeMobileMenu}>
                    My Dashboard
                  </NavLink>
                  <NavLink to="/patron/library/borrowing" className="mobile-nav-link" onClick={closeMobileMenu}>
                    My Library
                  </NavLink>
                </>
              )}

              {isAdmin() && (
                <NavLink to="/admin/website" className="mobile-nav-link" onClick={closeMobileMenu}>
                  Website Admin
                </NavLink>
              )}

              <NavLink to="/profile" className="mobile-nav-link" onClick={closeMobileMenu}>
                Profile
              </NavLink>
              <button onClick={handleLogout} className="mobile-nav-link" style={{ font: 'inherit' }}>
                Sign Out
              </button>
            </div>
          )}

          {!isAuthenticated && (
            <div className="mobile-nav-section">
              <Link to="/login" className="btn btn-primary" onClick={closeMobileMenu}>
                Sign In
              </Link>
            </div>
          )}
        </div>
      )}
    </header>
  );
};

export default ModernHeader;
