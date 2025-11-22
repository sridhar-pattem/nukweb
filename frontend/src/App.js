import React, { useState, useEffect, createContext, useContext } from 'react';
import { BrowserRouter, Routes, Route, Navigate, Link, useLocation } from 'react-router-dom';
import './styles/App.css';
import PatronManagement from './components/PatronManagement';
import BookCatalogue from './components/BookCatalogue';
import BookDetail from './components/BookDetail';
import BorrowingsManagement from './components/BorrowingsManagement';
import BrowseBooks from './components/BrowseBooks';
import MembershipPlans from './components/MembershipPlans';
import Collections from './components/Collections';
import Dashboard from './components/Dashboard';
import CoworkInvoices from './components/CoworkInvoices';
import Import from './components/Import';
import Items from './components/Items';

// Context for authentication
export const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

// Auth Provider Component
function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');

    if (token && userData) {
      setUser(JSON.parse(userData));
    }
    setLoading(false);
  }, []);

  const login = (userData, token) => {
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(userData));
    setUser(userData);
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

// Login Page Component
function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await fetch('http://localhost:5001/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Login failed');
      }

      login(data.user, data.access_token);
      window.location.href = data.user.role === 'admin' ? '/admin' : '/patron';
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-left">
        <div className="login-left-content">
          <h1>📚 Nuk Library</h1>
          <p>Your gateway to knowledge and discovery. Access thousands of books, manage your collection, and explore new worlds through reading.</p>
        </div>
      </div>

      <div className="login-right">
        <div className="login-box">
          <h1>Nuk Library</h1>
          <h2>Welcome back</h2>

          {error && <div className="error-message">{error}</div>}

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label>Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Logging in...' : 'Login'}
            </button>
          </form>

          <div className="login-help">
            <p>Default patron password: <strong>BookNook313</strong></p>
          </div>
        </div>
      </div>
    </div>
  );
}

// Top Navigation Component for Admin
function AdminTopNav() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [showLibraryDropdown, setShowLibraryDropdown] = useState(false);
  const [showLendingDropdown, setShowLendingDropdown] = useState(false);
  const [showPatronsDropdown, setShowPatronsDropdown] = useState(false);
  const [showCoworkDropdown, setShowCoworkDropdown] = useState(false);

  const isActive = (path) => location.pathname.includes(path);

  return (
    <nav className="top-nav">
      <div className="nav-brand">📚 Nuk Library</div>

      <div className="nav-links">
        <Link to="/admin/dashboard" className={`nav-link ${isActive('/admin/dashboard') ? 'active' : ''}`}>
          Dashboard
        </Link>

        <div
          className="nav-dropdown"
          onMouseEnter={() => setShowLibraryDropdown(true)}
          onMouseLeave={() => setShowLibraryDropdown(false)}
        >
          <span className={`nav-link ${isActive('/admin/books') || isActive('/admin/collections') || isActive('/admin/items') || isActive('/admin/import') ? 'active' : ''}`}>
            Library ▾
          </span>
          {showLibraryDropdown && (
            <div className="nav-dropdown-menu">
              <Link to="/admin/books" className="nav-dropdown-item">
                📚 Catalogue
              </Link>
              <Link to="/admin/collections" className="nav-dropdown-item">
                📂 Collections
              </Link>
              <Link to="/admin/items" className="nav-dropdown-item">
                📦 Items
              </Link>
              <Link to="/admin/import" className="nav-dropdown-item">
                📥 Import
              </Link>
            </div>
          )}
        </div>

        <div
          className="nav-dropdown"
          onMouseEnter={() => setShowLendingDropdown(true)}
          onMouseLeave={() => setShowLendingDropdown(false)}
        >
          <span className={`nav-link ${isActive('/admin/checkouts') ? 'active' : ''}`}>
            Lending ▾
          </span>
          {showLendingDropdown && (
            <div className="nav-dropdown-menu">
              <Link to="/admin/checkouts" className="nav-dropdown-item">
                📖 Checkouts
              </Link>
            </div>
          )}
        </div>

        <div
          className="nav-dropdown"
          onMouseEnter={() => setShowPatronsDropdown(true)}
          onMouseLeave={() => setShowPatronsDropdown(false)}
        >
          <span className={`nav-link ${isActive('/admin/patron') || isActive('/admin/membership') || isActive('/admin/invoicing') ? 'active' : ''}`}>
            Patrons ▾
          </span>
          {showPatronsDropdown && (
            <div className="nav-dropdown-menu">
              <Link to="/admin/patron-management" className="nav-dropdown-item">
                👥 Patron Management
              </Link>
              <Link to="/admin/membership-plans" className="nav-dropdown-item">
                💳 Membership Plans
              </Link>
              <Link to="/admin/invoicing" className="nav-dropdown-item">
                💰 Invoicing
              </Link>
            </div>
          )}
        </div>

        <div
          className="nav-dropdown"
          onMouseEnter={() => setShowCoworkDropdown(true)}
          onMouseLeave={() => setShowCoworkDropdown(false)}
        >
          <span className={`nav-link ${isActive('/admin/cowork') ? 'active' : ''}`}>
            Cowork ▾
          </span>
          {showCoworkDropdown && (
            <div className="nav-dropdown-menu">
              <Link to="/admin/cowork-requests" className="nav-dropdown-item">
                📅 Booking Requests
              </Link>
              <Link to="/admin/cowork-invoices" className="nav-dropdown-item">
                🧾 Invoices & Receipts
              </Link>
            </div>
          )}
        </div>
      </div>

      <div className="nav-right">
        <div className="nav-icon">🔔</div>
        <div className="nav-user" onClick={logout}>
          <div className="nav-user-avatar">{user?.name?.charAt(0) || 'A'}</div>
          <span className="nav-user-name">{user?.name}</span>
        </div>
      </div>
    </nav>
  );
}

// Top Navigation Component for Patron
function PatronTopNav() {
  const { user, logout } = useAuth();
  const location = useLocation();

  const isActive = (path) => location.pathname.includes(path);

  return (
    <nav className="top-nav">
      <div className="nav-brand">📚 Nuk Library</div>

      <div className="nav-links">
        <Link to="/patron/browse" className={`nav-link ${isActive('/patron/browse') ? 'active' : ''}`}>
          Browse Books
        </Link>
        <Link to="/patron/my-books" className={`nav-link ${isActive('/patron/my-books') ? 'active' : ''}`}>
          My Borrowings
        </Link>
        <Link to="/patron/recommendations" className={`nav-link ${isActive('/patron/recommendations') ? 'active' : ''}`}>
          Recommendations
        </Link>
        <Link to="/patron/cowork" className={`nav-link ${isActive('/patron/cowork') ? 'active' : ''}`}>
          Cowork Booking
        </Link>
        <Link to="/patron/profile" className={`nav-link ${isActive('/patron/profile') ? 'active' : ''}`}>
          My Profile
        </Link>
      </div>

      <div className="nav-right">
        <div className="nav-icon">🔔</div>
        <div className="nav-user" onClick={logout}>
          <div className="nav-user-avatar">{user?.name?.charAt(0) || 'P'}</div>
          <span className="nav-user-name">{user?.name}</span>
        </div>
      </div>
    </nav>
  );
}

// Admin Dashboard Component
function AdminDashboard() {
  return (
    <div className="app-container">
      <AdminTopNav />
      <main className="main-content">
        <Routes>
          <Route index element={<AdminHome />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="patron-management" element={<PatronManagement />} />
          <Route path="membership-plans" element={<MembershipPlans />} />
          <Route path="books" element={<BookCatalogue />} />
          <Route path="books/:bookId" element={<BookDetail />} />
          <Route path="collections" element={<Collections />} />
          <Route path="items" element={<Items />} />
          <Route path="import" element={<Import />} />
          <Route path="checkouts" element={<BorrowingsManagement />} />
          <Route path="invoicing" element={<div>Invoicing - Coming Soon</div>} />
          <Route path="cowork-requests" element={<div>Cowork Booking Requests - Coming Soon</div>} />
          <Route path="cowork-invoices" element={<CoworkInvoices />} />
        </Routes>
      </main>
    </div>
  );
}

function AdminHome() {
  return (
    <div>
      <h1>Welcome to Nuk Library Admin Panel</h1>
      <p>Select an option from the navigation to get started.</p>
    </div>
  );
}

// Patron Dashboard Component
function PatronDashboard() {
  return (
    <div className="app-container">
      <PatronTopNav />
      <main className="main-content">
        <Routes>
          <Route index element={<PatronHome />} />
          <Route path="browse" element={<BrowseBooks />} />
          <Route path="my-books" element={<div>My Borrowings - Coming Soon</div>} />
          <Route path="recommendations" element={<div>Recommendations - Coming Soon</div>} />
          <Route path="cowork" element={<div>Cowork Booking - Coming Soon</div>} />
          <Route path="profile" element={<div>My Profile - Coming Soon</div>} />
        </Routes>
      </main>
    </div>
  );
}

function PatronHome() {
  return (
    <div>
      <h1>Welcome to Nuk Library</h1>
      <p>Explore our collection and discover your next read!</p>
    </div>
  );
}

// Protected Route Component
function ProtectedRoute({ children, requiredRole }) {
  const { user, loading } = useAuth();

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  if (!user) {
    return <Navigate to="/login" />;
  }

  if (requiredRole && user.role !== requiredRole) {
    return <Navigate to={`/${user.role}`} />;
  }

  return children;
}

// Main App Component
function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<LoginPage />} />

          <Route
            path="/admin/*"
            element={
              <ProtectedRoute requiredRole="admin">
                <AdminDashboard />
              </ProtectedRoute>
            }
          />

          <Route
            path="/patron/*"
            element={
              <ProtectedRoute requiredRole="patron">
                <PatronDashboard />
              </ProtectedRoute>
            }
          />

          <Route path="/" element={<Navigate to="/login" />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
