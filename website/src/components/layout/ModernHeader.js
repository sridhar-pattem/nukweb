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
          <div style={{
            width: '40px',
            height: '40px',
            borderRadius: '6px',
            background: 'var(--teal)',
            color: '#fff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: '700',
            fontSize: '16px'
          }}>
            NUK
          </div>
          <div>
            <div style={{ fontWeight: '700', color: '#111', fontSize: '20px' }}>Nuk Library</div>
            <div className="text-muted" style={{ marginTop: '-2px', fontSize: '12px' }}>Cowork & Café · Bangalore</div>
          </div>
        </Link>

        {/* Desktop Navigation */}
        <nav className="desktop-nav" style={{ display: 'flex', gap: '4px' }}>
          {/* Public Links */}
          <NavLink to="/" className="btn btn-outline" onClick={closeMobileMenu}>
            Home
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
            <>
              <Link to="/login" className="btn btn-outline" onClick={closeMobileMenu}>
                Sign In
              </Link>
              <Link to="/register" className="btn btn-primary" onClick={closeMobileMenu}>
                Join Now
              </Link>
            </>
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
                <>
                  <NavLink to="/admin/library" className="btn btn-outline" onClick={closeMobileMenu}>
                    Library Admin
                  </NavLink>
                  <NavLink to="/admin/website" className="btn btn-outline" onClick={closeMobileMenu}>
                    🌐 Website Admin
                  </NavLink>
                </>
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
                <>
                  <NavLink to="/admin/library" className="mobile-nav-link" onClick={closeMobileMenu}>
                    Library Admin
                  </NavLink>
                  <NavLink to="/admin/website" className="mobile-nav-link" onClick={closeMobileMenu}>
                    🌐 Website Admin
                  </NavLink>
                </>
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
              <Link to="/login" className="btn btn-outline" onClick={closeMobileMenu}>
                Sign In
              </Link>
              <Link to="/register" className="btn btn-primary" onClick={closeMobileMenu}>
                Join Now
              </Link>
            </div>
          )}
        </div>
      )}
    </header>
  );
};

export default ModernHeader;
