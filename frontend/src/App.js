import React, { useState, useEffect, createContext, useContext } from 'react';
import { BrowserRouter, Routes, Route, Navigate, Link } from 'react-router-dom';
import './styles/App.css';
import PatronManagement from './components/PatronManagement';
import BookCatalogue from './components/BookCatalogue';
import BorrowingsManagement from './components/BorrowingsManagement';
import BrowseBooks from './components/BrowseBooks';

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
      <div className="login-box">
        <h1>Nuk Library</h1>
        <h2>Login</h2>
        
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
          
          <button type="submit" disabled={loading}>
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>
        
        <div className="login-help">
          <p>Default patron password: <strong>BookNook313</strong></p>
        </div>
      </div>
    </div>
  );
}

// Admin Dashboard Component
function AdminDashboard() {
  const { user, logout } = useAuth();

  return (
    <div className="dashboard">
      <nav className="sidebar">
        <h2>Nuk Library Admin</h2>
        <ul>
          <li><Link to="/admin/patrons">Patron Management</Link></li>
          <li><Link to="/admin/books">Book Catalogue</Link></li>
          <li><Link to="/admin/borrowings">Borrowings</Link></li>
          <li><Link to="/admin/cowork">Cowork Requests</Link></li>
        </ul>
        <div className="user-info">
          <p>{user?.name}</p>
          <button onClick={logout}>Logout</button>
        </div>
      </nav>
      
      <main className="main-content">
        <Routes>
          <Route index element={<AdminHome />} />
          <Route path="patrons" element={<PatronManagement />} />
          <Route path="books" element={<BookCatalogue />} />
          <Route path="borrowings" element={<BorrowingsManagement />} />
          <Route path="cowork" element={<div>Cowork Requests - Coming Soon</div>} />
        </Routes>
      </main>
    </div>
  );
}

function AdminHome() {
  return (
    <div>
      <h1>Welcome to Nuk Library Admin Panel</h1>
      <p>Select an option from the sidebar to get started.</p>
    </div>
  );
}

// Patron Dashboard Component
function PatronDashboard() {
  const { user, logout } = useAuth();

  return (
    <div className="dashboard">
      <nav className="sidebar">
        <h2>Nuk Library</h2>
        <ul>
          <li><Link to="/patron/browse">Browse Books</Link></li>
          <li><Link to="/patron/my-books">My Borrowings</Link></li>
          <li><Link to="/patron/recommendations">Recommendations</Link></li>
          <li><Link to="/patron/cowork">Cowork Booking</Link></li>
          <li><Link to="/patron/profile">My Profile</Link></li>
        </ul>
        <div className="user-info">
          <p>{user?.name}</p>
          <button onClick={logout}>Logout</button>
        </div>
      </nav>
      
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
    return <div>Loading...</div>;
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
