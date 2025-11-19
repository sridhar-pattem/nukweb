import React, { useState, useRef, useEffect } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  FaBook,
  FaBars,
  FaTimes,
  FaUser,
  FaSignInAlt,
  FaUserPlus,
  FaChevronDown,
  FaTachometerAlt,
  FaBookReader,
  FaCalendarAlt,
  FaPencilAlt,
  FaCog,
  FaSignOutAlt,
  FaGavel,
  FaTools,
  FaCreditCard,
  FaUserEdit,
  FaBoxes
} from 'react-icons/fa';

const Header = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [adminDropdownOpen, setAdminDropdownOpen] = useState(false);
  const userDropdownRef = useRef(null);
  const adminDropdownRef = useRef(null);

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setMobileMenuOpen(false);
  };

  const toggleUserDropdown = () => {
    setUserDropdownOpen(!userDropdownOpen);
    setAdminDropdownOpen(false);
  };

  const toggleAdminDropdown = () => {
    setAdminDropdownOpen(!adminDropdownOpen);
    setUserDropdownOpen(false);
  };

  const handleLogout = () => {
    logout();
    setUserDropdownOpen(false);
    setAdminDropdownOpen(false);
    navigate('/');
  };

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        userDropdownRef.current &&
        !userDropdownRef.current.contains(event.target)
      ) {
        setUserDropdownOpen(false);
      }
      if (
        adminDropdownRef.current &&
        !adminDropdownRef.current.contains(event.target)
      ) {
        setAdminDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <header className="header">
      <div className="header-container">
        <Link to="/" className="logo">
          <FaBook size={32} />
          <span>Nuk Library</span>
        </Link>

        <button
          className="mobile-menu-toggle"
          onClick={toggleMobileMenu}
          aria-label="Toggle navigation menu"
        >
          {mobileMenuOpen ? <FaTimes /> : <FaBars />}
        </button>

        <nav className={`nav ${mobileMenuOpen ? 'open' : ''}`}>
          <NavLink
            to="/"
            className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
            onClick={closeMobileMenu}
          >
            Home
          </NavLink>
          <NavLink
            to="/about"
            className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
            onClick={closeMobileMenu}
          >
            About Us
          </NavLink>
          <NavLink
            to="/services"
            className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
            onClick={closeMobileMenu}
          >
            Services
          </NavLink>
          <NavLink
            to="/catalogue"
            className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
            onClick={closeMobileMenu}
          >
            Catalogue
          </NavLink>
          <NavLink
            to="/events"
            className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
            onClick={closeMobileMenu}
          >
            Events
          </NavLink>
          <NavLink
            to="/blog"
            className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
            onClick={closeMobileMenu}
          >
            Blog
          </NavLink>
          <NavLink
            to="/contact"
            className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
            onClick={closeMobileMenu}
          >
            Contact
          </NavLink>

          {/* Auth-specific navigation */}
          {!isAuthenticated ? (
            <div className="auth-buttons">
              <Link
                to="/login"
                className="btn btn-outline btn-small"
                onClick={closeMobileMenu}
              >
                <FaSignInAlt /> Login
              </Link>
              <Link
                to="/register"
                className="btn btn-primary btn-small"
                onClick={closeMobileMenu}
              >
                <FaUserPlus /> Register
              </Link>
            </div>
          ) : (
            <div className="user-menu">
              {/* Admin Dropdown */}
              {isAdmin() && (
                <div className="dropdown" ref={adminDropdownRef}>
                  <button
                    className="dropdown-toggle admin-toggle"
                    onClick={toggleAdminDropdown}
                  >
                    <FaTools /> Admin <FaChevronDown />
                  </button>
                  {adminDropdownOpen && (
                    <div className="dropdown-menu">
                      <Link
                        to="/admin/dashboard"
                        className="dropdown-item"
                        onClick={() => {
                          setAdminDropdownOpen(false);
                          closeMobileMenu();
                        }}
                      >
                        <FaTachometerAlt /> Dashboard
                      </Link>
                      <Link
                        to="/admin/moderation"
                        className="dropdown-item"
                        onClick={() => {
                          setAdminDropdownOpen(false);
                          closeMobileMenu();
                        }}
                      >
                        <FaGavel /> Content Moderation
                      </Link>
                      <Link
                        to="/admin/events"
                        className="dropdown-item"
                        onClick={() => {
                          setAdminDropdownOpen(false);
                          closeMobileMenu();
                        }}
                      >
                        <FaCalendarAlt /> Event Management
                      </Link>
                      <div className="dropdown-divider"></div>
                      <div className="dropdown-header">Library Management</div>
                      <Link
                        to="/admin/library/cataloging"
                        className="dropdown-item"
                        onClick={() => {
                          setAdminDropdownOpen(false);
                          closeMobileMenu();
                        }}
                      >
                        <FaBook /> Cataloging
                      </Link>
                      <Link
                        to="/admin/library/circulation"
                        className="dropdown-item"
                        onClick={() => {
                          setAdminDropdownOpen(false);
                          closeMobileMenu();
                        }}
                      >
                        <FaBookReader /> Circulation
                      </Link>
                      <Link
                        to="/admin/library/members"
                        className="dropdown-item"
                        onClick={() => {
                          setAdminDropdownOpen(false);
                          closeMobileMenu();
                        }}
                      >
                        <FaUser /> Members
                      </Link>
                      <Link
                        to="/admin/library/collections"
                        className="dropdown-item"
                        onClick={() => {
                          setAdminDropdownOpen(false);
                          closeMobileMenu();
                        }}
                      >
                        <FaBook /> Collections
                      </Link>
                      <Link
                        to="/admin/library/membership-plans"
                        className="dropdown-item"
                        onClick={() => {
                          setAdminDropdownOpen(false);
                          closeMobileMenu();
                        }}
                      >
                        <FaCreditCard /> Membership Plans
                      </Link>
                      <Link
                        to="/admin/library/contributors"
                        className="dropdown-item"
                        onClick={() => {
                          setAdminDropdownOpen(false);
                          closeMobileMenu();
                        }}
                      >
                        <FaUserEdit /> Contributors
                      </Link>
                      <Link
                        to="/admin/library/items"
                        className="dropdown-item"
                        onClick={() => {
                          setAdminDropdownOpen(false);
                          closeMobileMenu();
                        }}
                      >
                        <FaBoxes /> Items/Inventory
                      </Link>
                    </div>
                  )}
                </div>
              )}

              {/* User Dropdown */}
              <div className="dropdown" ref={userDropdownRef}>
                <button
                  className="dropdown-toggle user-toggle"
                  onClick={toggleUserDropdown}
                >
                  <div className="user-avatar">
                    {user?.name?.charAt(0).toUpperCase() || 'U'}
                  </div>
                  <span className="user-name">
                    {isAdmin() ? 'My Account' : user?.name || 'User'}
                  </span>
                  <FaChevronDown />
                </button>
                {userDropdownOpen && (
                  <div className="dropdown-menu">
                    <Link
                      to="/patron/dashboard"
                      className="dropdown-item"
                      onClick={() => {
                        setUserDropdownOpen(false);
                        closeMobileMenu();
                      }}
                    >
                      <FaTachometerAlt /> My Dashboard
                    </Link>
                    <Link
                      to="/patron/library/borrowing"
                      className="dropdown-item"
                      onClick={() => {
                        setUserDropdownOpen(false);
                        closeMobileMenu();
                      }}
                    >
                      <FaBookReader /> My Library
                    </Link>
                    <Link
                      to="/patron/content/blog/new"
                      className="dropdown-item"
                      onClick={() => {
                        setUserDropdownOpen(false);
                        closeMobileMenu();
                      }}
                    >
                      <FaPencilAlt /> Contribute Content
                    </Link>
                    <div className="dropdown-divider"></div>
                    <Link
                      to="/profile"
                      className="dropdown-item"
                      onClick={() => {
                        setUserDropdownOpen(false);
                        closeMobileMenu();
                      }}
                    >
                      <FaCog /> Profile Settings
                    </Link>
                    <button
                      className="dropdown-item logout-btn"
                      onClick={handleLogout}
                    >
                      <FaSignOutAlt /> Logout
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}
        </nav>
      </div>
    </header>
  );
};

export default Header;
