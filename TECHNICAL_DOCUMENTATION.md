# Nuk Library - Technical Documentation
## Comprehensive Code-Level Guide for Novice Developers

---

## Table of Contents

1. [Project Overview](#1-project-overview)
2. [Technology Stack](#2-technology-stack)
3. [Project Structure](#3-project-structure)
4. [Backend Architecture (Python/Flask)](#4-backend-architecture-pythonflask)
5. [Frontend Architecture (JavaScript/React)](#5-frontend-architecture-javascriptreact)
6. [Database Design](#6-database-design)
7. [API Interfaces & Interactions](#7-api-interfaces--interactions)
8. [Authentication & Authorization Flow](#8-authentication--authorization-flow)
9. [Key Python Features Used](#9-key-python-features-used)
10. [Key JavaScript/React Features Used](#10-key-javascriptreact-features-used)
11. [Complete Request-Response Flow](#11-complete-request-response-flow)

---

## 1. Project Overview

### What is Nuk Library?

Nuk Library is a comprehensive library management system with three main applications:

1. **Admin Dashboard** (`/frontend`) - Internal tool for library staff to manage books, patrons, borrowings, and invoices
2. **Public Website** (`/website`) - Public-facing website for visitors and members
3. **Backend API** (`/backend`) - RESTful API server that powers both frontends

### Key Features

- **Library Management**: Catalog books, manage items, track borrowings
- **Patron Management**: Member accounts, membership plans, user authentication
- **Content Management**: Blog posts, events, testimonials, book suggestions
- **Coworking Space**: Booking management and invoice generation
- **Website Administration**: Dynamic content management for the public website

---

## 2. Technology Stack

### Backend
- **Language**: Python 3.x
- **Web Framework**: Flask 3.0.0
- **Database**: PostgreSQL (via psycopg2-binary)
- **Authentication**: Flask-JWT-Extended (JSON Web Tokens)
- **Password Hashing**: bcrypt
- **CORS**: Flask-CORS (Cross-Origin Resource Sharing)
- **PDF Generation**: ReportLab, PyPDF2
- **Environment Variables**: python-dotenv

### Frontend (Admin Dashboard)
- **Library**: React 18.2.0
- **Routing**: React Router DOM 6.20.0
- **HTTP Client**: Axios 1.6.2
- **Charts**: Recharts 3.4.1
- **Build Tool**: Create React App (react-scripts 5.0.1)

### Frontend (Public Website)
- **Library**: React 18.2.0
- **Routing**: React Router DOM 6.20.0
- **HTTP Client**: Axios 1.6.2
- **Icons**: React Icons 4.12.0
- **Animations**: Framer Motion 10.16.16

### Database
- **DBMS**: PostgreSQL
- **Connection**: Direct SQL queries (no ORM)
- **Features**: Materialized views, triggers, constraints

---

## 3. Project Structure

```
nukweb/
├── backend/                    # Python Flask API
│   ├── app/
│   │   ├── __init__.py        # Flask app factory
│   │   ├── config.py          # Configuration settings
│   │   ├── routes/            # API endpoint blueprints
│   │   │   ├── auth.py        # Authentication endpoints
│   │   │   ├── admin_books.py # Book management
│   │   │   ├── admin_patrons.py # Patron management
│   │   │   ├── admin_borrowings.py # Circulation
│   │   │   ├── admin_content.py # Content moderation
│   │   │   ├── patron.py      # Patron features
│   │   │   └── ...            # Other route modules
│   │   └── utils/             # Utility modules
│   │       ├── database.py    # Database connection helpers
│   │       ├── auth.py        # Authentication utilities
│   │       ├── pdf_generator.py # PDF generation
│   │       └── ...            # Other utilities
│   ├── run.py                 # Application entry point
│   └── requirements.txt       # Python dependencies
│
├── frontend/                  # Admin Dashboard (React)
│   ├── src/
│   │   ├── App.js            # Main application component
│   │   ├── index.js          # React DOM rendering
│   │   ├── components/       # React components
│   │   │   ├── Dashboard.js
│   │   │   ├── BookCatalogue.js
│   │   │   ├── PatronManagement.js
│   │   │   ├── BorrowingsManagement.js
│   │   │   ├── WebsiteAdmin/ # Website CMS components
│   │   │   └── ...
│   │   ├── services/
│   │   │   └── api.js        # API client & endpoints
│   │   └── styles/
│   │       └── App.css       # Application styles
│   └── package.json          # Node dependencies
│
├── website/                   # Public Website (React)
│   ├── src/
│   │   ├── App.js            # Main app component
│   │   ├── components/
│   │   │   ├── layout/       # Header, Footer
│   │   │   ├── pages/        # Public pages
│   │   │   ├── patron/       # Patron dashboard
│   │   │   ├── admin/        # Admin features
│   │   │   └── auth/         # Login/Register
│   │   ├── context/
│   │   │   └── AuthContext.js # Authentication state
│   │   └── services/
│   │       └── api.js        # API client
│   └── package.json
│
└── database/                  # Database schemas
    ├── schema.sql            # Main database schema
    └── sample_data.sql       # Sample data
```

---

## 4. Backend Architecture (Python/Flask)

### 4.1 Application Factory Pattern

**File**: `backend/app/__init__.py`

The backend uses the **Application Factory Pattern**, which means the Flask app is created by a function rather than as a global variable.

```python
from flask import Flask
from flask_cors import CORS
from flask_jwt_extended import JWTManager
from app.config import Config

def create_app():
    # Create Flask application instance
    app = Flask(__name__)

    # Load configuration from Config class
    app.config.from_object(Config)

    # Initialize extensions
    CORS(app, origins="*", supports_credentials=False)  # Enable CORS
    jwt = JWTManager(app)  # Initialize JWT authentication

    # Register blueprints (route modules)
    from app.routes.auth import auth_bp
    from app.routes.admin_books import admin_books_bp
    # ... more blueprint imports

    app.register_blueprint(auth_bp, url_prefix='/api/auth')
    app.register_blueprint(admin_books_bp, url_prefix='/api/admin')
    # ... more blueprint registrations

    return app
```

**Key Concepts for Novices:**

1. **Blueprint**: A way to organize related routes into modules. Think of it as a mini-app within your main app.
2. **URL Prefix**: All routes in a blueprint are prefixed with this path (e.g., `/api/auth/login`)
3. **CORS**: Allows the frontend (running on a different port) to make requests to the backend
4. **JWT Manager**: Handles JSON Web Token authentication

### 4.2 Configuration Management

**File**: `backend/app/config.py`

```python
import os
from datetime import timedelta

class Config:
    # Database connection string from environment variable
    DATABASE_URL = os.getenv('DATABASE_URL', 'postgresql://user:password@localhost:5432/nuk_library')

    # JWT secret key for token signing
    JWT_SECRET_KEY = os.getenv('JWT_SECRET_KEY', 'your-secret-key-change-in-production')
    JWT_ACCESS_TOKEN_EXPIRES = timedelta(hours=24)  # Token expires after 24 hours

    # Flask secret key for session management
    SECRET_KEY = os.getenv('SECRET_KEY', 'your-flask-secret-key-change-in-production')

    # Application settings
    ITEMS_PER_PAGE = 20  # Pagination size
    CHECKOUT_DURATION_DAYS = 14  # Default borrowing period
    MAX_RENEWALS = 2  # Maximum times a book can be renewed
```

**Python Features Used:**

- **`os.getenv()`**: Reads environment variables with a fallback default value
- **`timedelta`**: Represents a duration (24 hours in this case)
- **Class-based config**: All settings in one place, easy to manage

### 4.3 Database Connection Layer

**File**: `backend/app/utils/database.py`

This module provides clean database access using **context managers** and the **psycopg2** library.

```python
import psycopg2
from psycopg2.extras import RealDictCursor
from contextlib import contextmanager
from app.config import Config

@contextmanager
def get_db_connection():
    """Context manager for database connections"""
    conn = psycopg2.connect(Config.DATABASE_URL)
    try:
        yield conn  # Give connection to the caller
        conn.commit()  # Commit if no errors
    except Exception as e:
        conn.rollback()  # Undo changes if error
        raise e
    finally:
        conn.close()  # Always close connection

@contextmanager
def get_db_cursor(commit=True):
    """Context manager for database cursor with automatic commit/rollback"""
    with get_db_connection() as conn:
        cursor = conn.cursor(cursor_factory=RealDictCursor)
        try:
            yield cursor
            if commit:
                conn.commit()
        except Exception as e:
            conn.rollback()
            raise e
        finally:
            cursor.close()

def execute_query(query, params=None, fetch_one=False, fetch_all=False):
    """Execute a query and return results"""
    with get_db_cursor() as cursor:
        cursor.execute(query, params or ())

        if fetch_one:
            return cursor.fetchone()  # Return single row as dict
        elif fetch_all:
            return cursor.fetchall()  # Return all rows as list of dicts
        else:
            return cursor.rowcount  # Return number of affected rows
```

**Key Python Features:**

1. **Context Managers (`@contextmanager`)**: Ensures resources (connections/cursors) are properly cleaned up
2. **`yield`**: Temporarily returns control to caller, resumes after `with` block
3. **`RealDictCursor`**: Returns rows as dictionaries instead of tuples
4. **Automatic transaction management**: Commit on success, rollback on error

**How to Use:**

```python
# Fetch all books
books = execute_query("SELECT * FROM books WHERE is_active = TRUE", fetch_all=True)

# Fetch one user
user = execute_query("SELECT * FROM users WHERE email = %s", (email,), fetch_one=True)

# Insert data
execute_query("INSERT INTO patrons (patron_id, user_id) VALUES (%s, %s)", (patron_id, user_id))
```

### 4.4 Authentication & Authorization

**File**: `backend/app/utils/auth.py`

This module handles password hashing and role-based access control.

```python
import bcrypt
from functools import wraps
from flask import jsonify
from flask_jwt_extended import verify_jwt_in_request, get_jwt_identity
from app.utils.database import execute_query

def hash_password(password):
    """Hash a password using bcrypt"""
    # bcrypt.gensalt() generates a random salt
    # bcrypt.hashpw() hashes the password with the salt
    return bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')

def verify_password(password, hashed_password):
    """Verify a password against its hash"""
    return bcrypt.checkpw(password.encode('utf-8'), hashed_password.encode('utf-8'))

def admin_required(fn):
    """Decorator to require admin role"""
    @wraps(fn)  # Preserves original function metadata
    def wrapper(*args, **kwargs):
        verify_jwt_in_request()  # Check JWT token is present and valid
        user_id = get_jwt_identity()  # Extract user_id from token

        # Query database for user's role
        query = "SELECT role FROM users WHERE user_id = %s"
        user = execute_query(query, (user_id,), fetch_one=True)

        if not user or user['role'] != 'admin':
            return jsonify({"error": "Admin access required"}), 403

        return fn(*args, **kwargs)  # Call the original function
    return wrapper
```

**Key Python Features:**

1. **Decorators (`@wraps`)**: Functions that modify other functions
2. **`*args, **kwargs`**: Accept any number of positional/keyword arguments
3. **bcrypt**: Industry-standard password hashing (slow by design to prevent brute force)
4. **Higher-order functions**: Functions that return functions

**How to Use:**

```python
@admin_books_bp.route('/books', methods=['POST'])
@jwt_required()  # Requires valid JWT token
@admin_required  # Requires admin role
def create_book():
    # Only admins with valid tokens can access this
    pass
```

### 4.5 Authentication Routes

**File**: `backend/app/routes/auth.py`

```python
from flask import Blueprint, request, jsonify
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity
from app.utils.database import execute_query
from app.utils.auth import verify_password, hash_password

auth_bp = Blueprint('auth', __name__)

@auth_bp.route('/login', methods=['POST'])
def login():
    """User login endpoint"""
    # 1. Get JSON data from request
    data = request.get_json()

    # 2. Validate input
    if not data or not data.get('email') or not data.get('password'):
        return jsonify({"error": "Email and password are required"}), 400

    email = data['email']
    password = data['password']

    # 3. Query database for user
    query = """
        SELECT u.user_id, u.email, u.password_hash, u.role, u.status,
               p.patron_id, p.first_name, p.last_name
        FROM users u
        LEFT JOIN patrons p ON u.user_id = p.user_id
        WHERE u.email = %s
    """
    user = execute_query(query, (email,), fetch_one=True)

    # 4. Check if user exists
    if not user:
        return jsonify({"error": "Invalid credentials"}), 401

    # 5. Check account status
    if user['status'] != 'active':
        return jsonify({"error": f"Account is {user['status']}"}), 403

    # 6. Verify password
    if not verify_password(password, user['password_hash']):
        return jsonify({"error": "Invalid credentials"}), 401

    # 7. Create JWT token
    access_token = create_access_token(identity=str(user['user_id']))

    # 8. Build user display name
    if user.get('first_name') and user.get('last_name'):
        display_name = f"{user['first_name']} {user['last_name']}"
    else:
        display_name = user['email'].split('@')[0]

    # 9. Return token and user info
    return jsonify({
        "access_token": access_token,
        "user": {
            "user_id": user['user_id'],
            "email": user['email'],
            "name": display_name,
            "role": user['role'],
            "patron_id": user.get('patron_id')
        }
    }), 200
```

**Request-Response Flow:**

```
Client → POST /api/auth/login
         Body: {"email": "user@example.com", "password": "secret123"}

Backend → 1. Validate input
          2. Query database
          3. Verify password
          4. Generate JWT token
          5. Return token + user info

Client ← Response: {"access_token": "eyJ...", "user": {...}}
```

### 4.6 Book Management Routes

**File**: `backend/app/routes/admin_books.py` (excerpt)

```python
from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required
from app.utils.auth import admin_required
from app.utils.database import execute_query
from app.config import Config

admin_books_bp = Blueprint('admin_books', __name__)

@admin_books_bp.route('/books', methods=['GET'])
@jwt_required()
@admin_required
def get_books():
    """Get all books with pagination and filters"""

    # 1. Get query parameters
    page = request.args.get('page', 1, type=int)
    search = request.args.get('search', '')
    collection = request.args.get('collection', '')

    # 2. Calculate offset for pagination
    offset = (page - 1) * Config.ITEMS_PER_PAGE

    # 3. Build dynamic WHERE clause
    where_clauses = ["b.is_active = TRUE"]
    params = []

    if search:
        where_clauses.append("""
            (b.title ILIKE %s OR b.subtitle ILIKE %s OR b.isbn ILIKE %s)
        """)
        search_param = f'%{search}%'
        params.extend([search_param, search_param, search_param])

    if collection:
        where_clauses.append("b.collection_id = %s")
        params.append(collection)

    where_sql = "WHERE " + " AND ".join(where_clauses)

    # 4. Get total count
    count_query = f"SELECT COUNT(*) as total FROM books b {where_sql}"
    total_result = execute_query(count_query, tuple(params), fetch_one=True)
    total = total_result['total']

    # 5. Get paginated books with availability
    query = f"""
        SELECT b.book_id, b.isbn, b.title, b.subtitle, b.publisher,
               b.publication_year, c.collection_name,
               ba.total_items, ba.available_items
        FROM books b
        LEFT JOIN collections c ON b.collection_id = c.collection_id
        LEFT JOIN mv_book_availability ba ON b.book_id = ba.book_id
        {where_sql}
        ORDER BY b.created_at DESC
        LIMIT %s OFFSET %s
    """
    params.extend([Config.ITEMS_PER_PAGE, offset])
    books = execute_query(query, tuple(params), fetch_all=True)

    # 6. Return JSON response
    return jsonify({
        "books": [dict(b) for b in books],
        "total": total,
        "page": page,
        "per_page": Config.ITEMS_PER_PAGE,
        "pages": (total + Config.ITEMS_PER_PAGE - 1) // Config.ITEMS_PER_PAGE
    }), 200
```

**Key Concepts:**

1. **Query Parameters**: Data passed in URL (e.g., `?page=1&search=python`)
2. **Dynamic SQL**: Building queries based on filters
3. **ILIKE**: PostgreSQL case-insensitive pattern matching
4. **Pagination**: Showing subset of results (LIMIT/OFFSET)
5. **LEFT JOIN**: Include books even if they don't have items yet

### 4.7 PDF Generation Utility

**File**: `backend/app/utils/pdf_generator.py`

```python
from reportlab.lib.pagesizes import letter
from reportlab.platypus import SimpleDocTemplate, Table, TableStyle, Paragraph
from reportlab.lib.styles import getSampleStyleSheet
from reportlab.lib import colors
import io

def generate_invoice_pdf(invoice_data):
    """Generate a PDF invoice"""

    # 1. Create PDF in memory (BytesIO buffer)
    buffer = io.BytesIO()

    # 2. Create document
    doc = SimpleDocTemplate(buffer, pagesize=letter)
    elements = []
    styles = getSampleStyleSheet()

    # 3. Add title
    title = Paragraph(f"Invoice #{invoice_data['invoice_number']}", styles['Title'])
    elements.append(title)

    # 4. Add invoice details as table
    data = [
        ['Invoice Number:', invoice_data['invoice_number']],
        ['Date:', invoice_data['issue_date']],
        ['Patron:', invoice_data['patron_name']],
        ['Amount:', f"₹{invoice_data['amount']}"],
        ['Status:', invoice_data['payment_status']],
    ]

    table = Table(data)
    table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (0, -1), colors.grey),
        ('TEXTCOLOR', (0, 0), (-1, -1), colors.black),
        ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
        ('FONTNAME', (0, 0), (-1, -1), 'Helvetica'),
        ('FONTSIZE', (0, 0), (-1, -1), 12),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 12),
    ]))
    elements.append(table)

    # 5. Build PDF
    doc.build(elements)

    # 6. Get PDF bytes
    pdf_bytes = buffer.getvalue()
    buffer.close()

    return pdf_bytes
```

**Python Features:**

1. **`io.BytesIO`**: In-memory file-like buffer (no disk I/O)
2. **ReportLab**: Professional PDF generation library
3. **List comprehension potential**: Creating table data from loops

---

## 5. Frontend Architecture (JavaScript/React)

### 5.1 Admin Dashboard App Structure

**File**: `frontend/src/App.js`

The admin dashboard is a **Single Page Application (SPA)** built with React and React Router.

```javascript
import React, { useState, useEffect, createContext, useContext } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

// 1. Create Authentication Context
export const AuthContext = createContext();

// 2. Custom hook to access auth context
export const useAuth = () => useContext(AuthContext);

// 3. Auth Provider Component - manages authentication state
function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Check localStorage for existing session on mount
  useEffect(() => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');

    if (token && userData) {
      setUser(JSON.parse(userData));  // Parse JSON string to object
    }
    setLoading(false);
  }, []);  // Empty dependency array = run once on mount

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

  // Provide auth state and functions to all children
  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
}
```

**Key React Concepts:**

1. **Context API**: Share data across components without prop drilling
2. **Custom Hooks**: Reusable logic (`useAuth()`)
3. **`useState`**: Component state management
4. **`useEffect`**: Side effects (runs after render)
5. **Dependency Array**: Controls when effect runs
6. **localStorage**: Browser storage that persists across sessions

### 5.2 Login Component

```javascript
function LoginPage() {
  // Component state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Access auth context
  const { login } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();  // Prevent page reload
    setError('');
    setLoading(true);

    try {
      // Make API request
      const response = await fetch('http://localhost:5001/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Login failed');
      }

      // Update auth context
      login(data.user, data.access_token);

      // Redirect based on role
      window.location.href = data.user.role === 'admin' ? '/admin' : '/patron';

    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <form onSubmit={handleSubmit}>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <button type="submit" disabled={loading}>
          {loading ? 'Logging in...' : 'Login'}
        </button>
        {error && <div className="error">{error}</div>}
      </form>
    </div>
  );
}
```

**Key JavaScript/React Features:**

1. **`async/await`**: Modern promise handling
2. **`fetch` API**: HTTP requests (modern alternative to XMLHttpRequest)
3. **Controlled components**: Input values controlled by React state
4. **Event handlers**: `onChange`, `onSubmit`
5. **Conditional rendering**: `{loading ? 'A' : 'B'}`
6. **Try-catch-finally**: Error handling

### 5.3 Protected Route Component

```javascript
function ProtectedRoute({ children, requiredRole }) {
  const { user, loading } = useAuth();

  // Show loading while checking auth
  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  // Redirect to login if not authenticated
  if (!user) {
    return <Navigate to="/login" />;
  }

  // Redirect if wrong role
  if (requiredRole && user.role !== requiredRole) {
    return <Navigate to={`/${user.role}`} />;
  }

  // Render protected content
  return children;
}
```

**How It Works:**

```javascript
// Only admins can access
<Route path="/admin/*" element={
  <ProtectedRoute requiredRole="admin">
    <AdminDashboard />
  </ProtectedRoute>
} />
```

### 5.4 API Client (Axios)

**File**: `frontend/src/services/api.js`

```javascript
import axios from 'axios';

// 1. Create axios instance with defaults
const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5001/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// 2. Request interceptor - add auth token to every request
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 3. Response interceptor - handle errors globally
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Unauthorized - clear session and redirect
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// 4. Organized API endpoints
export const adminBooksAPI = {
  getBooks: (page = 1, filters = {}) =>
    api.get('/admin/books', { params: { page, ...filters } }),

  getBookDetails: (bookId) =>
    api.get(`/admin/books/${bookId}`),

  addBook: (bookData) =>
    api.post('/admin/books', bookData),

  updateBook: (bookId, bookData) =>
    api.put(`/admin/books/${bookId}`, bookData),

  deleteBook: (bookId) =>
    api.delete(`/admin/books/${bookId}`),
};

export default api;
```

**Key JavaScript Features:**

1. **Axios Interceptors**: Middleware for requests/responses
2. **Spread operator (`...filters`)**: Merge objects
3. **Template literals**: `` `string ${variable}` ``
4. **Arrow functions**: Concise function syntax
5. **Optional chaining (`?.`)**: Safe property access
6. **Object shorthand**: `{ page }` same as `{ page: page }`

**How to Use:**

```javascript
import { adminBooksAPI } from './services/api';

// In a component
const fetchBooks = async () => {
  try {
    const response = await adminBooksAPI.getBooks(1, { search: 'python' });
    setBooks(response.data.books);
  } catch (error) {
    console.error('Failed to fetch books:', error);
  }
};
```

### 5.5 Book Catalogue Component

**File**: `frontend/src/components/BookCatalogue.js` (simplified)

```javascript
import React, { useState, useEffect } from 'react';
import { adminBooksAPI } from '../services/api';

function BookCatalogue() {
  // State management
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState('');

  // Fetch books when dependencies change
  useEffect(() => {
    fetchBooks();
  }, [page, search]);  // Re-run when page or search changes

  const fetchBooks = async () => {
    setLoading(true);
    try {
      const response = await adminBooksAPI.getBooks(page, { search });
      setBooks(response.data.books);
      setTotalPages(response.data.pages);
    } catch (error) {
      console.error('Error fetching books:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    setSearch(e.target.value);
    setPage(1);  // Reset to first page on new search
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div className="book-catalogue">
      <input
        type="text"
        placeholder="Search books..."
        value={search}
        onChange={handleSearch}
      />

      <div className="books-grid">
        {books.map(book => (
          <div key={book.book_id} className="book-card">
            <h3>{book.title}</h3>
            <p>{book.author}</p>
            <p>Available: {book.available_items}/{book.total_items}</p>
          </div>
        ))}
      </div>

      <div className="pagination">
        <button
          onClick={() => setPage(p => p - 1)}
          disabled={page === 1}
        >
          Previous
        </button>
        <span>Page {page} of {totalPages}</span>
        <button
          onClick={() => setPage(p => p + 1)}
          disabled={page === totalPages}
        >
          Next
        </button>
      </div>
    </div>
  );
}

export default BookCatalogue;
```

**Key React Patterns:**

1. **Component lifecycle**: Mount → Update → Unmount
2. **Effect dependencies**: Control when effects run
3. **Array mapping**: Render lists
4. **Key prop**: Help React identify which items changed
5. **Functional updates**: `setPage(p => p + 1)` for state based on previous state
6. **Conditional rendering**: Show loading state

### 5.6 Website App Structure

**File**: `website/src/App.js`

```javascript
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/common/ProtectedRoute';
import ModernHeader from './components/layout/ModernHeader';
import Footer from './components/layout/Footer';
import Home from './components/pages/Home';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="App">
          <ModernHeader />
          <main>
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<Home />} />
              <Route path="/catalogue" element={<Catalogue />} />
              <Route path="/login" element={<Login />} />

              {/* Protected Routes */}
              <Route path="/patron/dashboard" element={
                <ProtectedRoute>
                  <PatronDashboard />
                </ProtectedRoute>
              } />

              {/* Admin Routes */}
              <Route path="/admin/dashboard" element={
                <ProtectedRoute adminOnly={true}>
                  <AdminDashboard />
                </ProtectedRoute>
              } />
            </Routes>
          </main>
          <Footer />
        </div>
      </Router>
    </AuthProvider>
  );
}
```

**Layout Structure:**

```
┌─────────────────────────────────┐
│      ModernHeader               │
├─────────────────────────────────┤
│                                 │
│      Main Content               │
│      (Route changes here)       │
│                                 │
├─────────────────────────────────┤
│      Footer                     │
└─────────────────────────────────┘
```

### 5.7 Auth Context (Website)

**File**: `website/src/context/AuthContext.js`

```javascript
import React, { createContext, useState, useContext, useEffect } from 'react';
import { authAPI } from '../services/api';

const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState(localStorage.getItem('token'));

  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');

    if (storedToken && storedUser) {
      setToken(storedToken);
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    try {
      const response = await authAPI.login({ email, password });
      const { access_token, user: userData } = response.data;

      localStorage.setItem('token', access_token);
      localStorage.setItem('user', JSON.stringify(userData));

      setToken(access_token);
      setUser(userData);

      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.error || 'Login failed'
      };
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setToken(null);
    setUser(null);
  };

  const isAdmin = () => user && user.role === 'admin';
  const isPatron = () => user && (user.role === 'patron' || user.role === 'admin');

  const value = {
    user,
    token,
    loading,
    login,
    logout,
    isAdmin,
    isPatron,
    isAuthenticated: !!token  // !! converts to boolean
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
```

**Key Patterns:**

1. **Provider pattern**: Wrap app to provide global state
2. **Error handling**: Return success/error objects instead of throwing
3. **Helper methods**: `isAdmin()`, `isPatron()` for role checking
4. **Double negation (`!!`)**: Convert truthy/falsy to true/false

---

## 6. Database Design

### 6.1 Core Tables

#### Users Table

```sql
CREATE TABLE users (
    user_id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(20) NOT NULL CHECK (role IN ('admin', 'patron')),
    name VARCHAR(255) NOT NULL,
    phone VARCHAR(20),
    status VARCHAR(20) DEFAULT 'active'
        CHECK (status IN ('active', 'frozen', 'closed')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

**Key Features:**

- **SERIAL**: Auto-incrementing integer
- **UNIQUE constraint**: Prevent duplicate emails
- **CHECK constraint**: Validate values
- **DEFAULT**: Set default values

#### Patrons Table (Extends Users)

```sql
CREATE TABLE patrons (
    patron_id VARCHAR(20) PRIMARY KEY,
    user_id INTEGER UNIQUE REFERENCES users(user_id) ON DELETE CASCADE,
    membership_plan_id INTEGER REFERENCES membership_plans(plan_id),
    membership_type VARCHAR(50),
    membership_start_date DATE,
    membership_expiry_date DATE,
    address TEXT,
    join_date DATE DEFAULT CURRENT_DATE,
    mobile_number VARCHAR(20),
    CONSTRAINT patron_id_format CHECK (patron_id ~ '^[A-Z0-9]+$')
);
```

**Key Features:**

- **REFERENCES**: Foreign key relationship
- **ON DELETE CASCADE**: Delete patron when user is deleted
- **Regular expression check**: `patron_id ~ '^[A-Z0-9]+$'` (only uppercase letters and numbers)

#### Books Table

```sql
CREATE TABLE books (
    book_id SERIAL PRIMARY KEY,
    isbn VARCHAR(13) UNIQUE NOT NULL,
    title VARCHAR(500) NOT NULL,
    author VARCHAR(255),
    publisher VARCHAR(255),
    publication_year INTEGER,
    collection_id INTEGER NOT NULL
        REFERENCES collections(collection_id) ON DELETE RESTRICT,
    age_rating VARCHAR(50),
    cover_image_url TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

**Key Features:**

- **ON DELETE RESTRICT**: Prevent deletion of collection if books exist
- **TEXT type**: Unlimited length (for URLs, descriptions)

#### Borrowings Table

```sql
CREATE TABLE borrowings (
    borrowing_id SERIAL PRIMARY KEY,
    patron_id VARCHAR(20) REFERENCES patrons(patron_id) ON DELETE CASCADE,
    book_id INTEGER REFERENCES books(book_id) ON DELETE CASCADE,
    checkout_date DATE NOT NULL DEFAULT CURRENT_DATE,
    due_date DATE NOT NULL,
    return_date DATE,
    renewal_count INTEGER DEFAULT 0 CHECK (renewal_count <= 2),
    status VARCHAR(20) DEFAULT 'active'
        CHECK (status IN ('active', 'returned', 'overdue')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### 6.2 Database Relationships

```
users (1) ──────→ (1) patrons
                       │
                       │ (1)
                       │
                       ↓
                  borrowings (many)
                       │
                       │ (many)
                       │
                       ↓
                  books (1)
                       │
                       │ (many)
                       │
                       ↓
                  collections (1)
```

**Relationship Types:**

1. **One-to-One**: users ↔ patrons
2. **One-to-Many**: patrons → borrowings
3. **One-to-Many**: books → borrowings
4. **Many-to-One**: books → collections

### 6.3 Materialized View (Performance Optimization)

```sql
CREATE MATERIALIZED VIEW mv_book_availability AS
SELECT
    b.book_id,
    COUNT(i.item_id) as total_items,
    COUNT(CASE WHEN i.status = 'available' THEN 1 END) as available_items,
    COUNT(CASE WHEN i.status = 'checked_out' THEN 1 END) as checked_out_items
FROM books b
LEFT JOIN items i ON b.book_id = i.book_id
GROUP BY b.book_id;

-- Create index for fast lookups
CREATE UNIQUE INDEX idx_mv_book_availability
ON mv_book_availability(book_id);
```

**What is a Materialized View?**

- **Regular View**: Virtual table, query runs every time you select from it
- **Materialized View**: Physical table, stores query results
- **Benefit**: Much faster reads, but needs periodic refresh
- **Use case**: Complex aggregations that don't change frequently

**How to Refresh:**

```sql
REFRESH MATERIALIZED VIEW mv_book_availability;
```

---

## 7. API Interfaces & Interactions

### 7.1 RESTful API Design

The backend follows REST principles:

| HTTP Method | Purpose | Example |
|-------------|---------|---------|
| GET | Retrieve data | `GET /api/admin/books` - Get all books |
| POST | Create new resource | `POST /api/admin/books` - Create book |
| PUT | Update entire resource | `PUT /api/admin/books/123` - Update book |
| PATCH | Partial update | `PATCH /api/admin/patrons/456/status` |
| DELETE | Remove resource | `DELETE /api/admin/books/123` |

### 7.2 API Endpoint Structure

```
/api
├── /auth
│   ├── POST /login
│   ├── POST /change-password
│   └── GET /me
├── /admin
│   ├── /books
│   │   ├── GET / (list books)
│   │   ├── POST / (create book)
│   │   ├── GET /:id (get book details)
│   │   ├── PUT /:id (update book)
│   │   └── DELETE /:id (delete book)
│   ├── /patrons
│   │   ├── GET /
│   │   ├── POST /
│   │   ├── GET /:id
│   │   └── PUT /:id
│   └── /borrowings
│       ├── POST /issue (checkout book)
│       ├── POST /:id/return
│       └── POST /:id/renew
└── /patron
    ├── GET /books
    ├── GET /my-borrowings
    └── POST /cowork-booking
```

### 7.3 Request/Response Examples

#### Example 1: Login

**Request:**
```http
POST /api/auth/login HTTP/1.1
Content-Type: application/json

{
  "email": "admin@nuk.com",
  "password": "SecurePassword123"
}
```

**Response:**
```http
HTTP/1.1 200 OK
Content-Type: application/json

{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "user_id": 1,
    "email": "admin@nuk.com",
    "name": "Admin User",
    "role": "admin",
    "patron_id": null
  }
}
```

#### Example 2: Get Books (with filters)

**Request:**
```http
GET /api/admin/books?page=1&search=python&collection=3 HTTP/1.1
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Response:**
```http
HTTP/1.1 200 OK
Content-Type: application/json

{
  "books": [
    {
      "book_id": 42,
      "isbn": "9780134190440",
      "title": "The Go Programming Language",
      "author": "Alan Donovan",
      "collection_name": "Technology",
      "total_items": 3,
      "available_items": 1
    }
  ],
  "total": 1,
  "page": 1,
  "per_page": 20,
  "pages": 1
}
```

#### Example 3: Create Book

**Request:**
```http
POST /api/admin/books HTTP/1.1
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: application/json

{
  "isbn": "9780134190440",
  "title": "The Go Programming Language",
  "author": "Alan Donovan",
  "publisher": "Addison-Wesley",
  "publication_year": 2015,
  "collection_id": 3,
  "age_rating": "All Ages"
}
```

**Response:**
```http
HTTP/1.1 201 Created
Content-Type: application/json

{
  "message": "Book created successfully",
  "book_id": 42
}
```

### 7.4 Error Responses

The API uses standard HTTP status codes:

| Code | Meaning | Example |
|------|---------|---------|
| 200 | OK | Successful GET/PUT |
| 201 | Created | Successful POST |
| 400 | Bad Request | Invalid input data |
| 401 | Unauthorized | Missing/invalid token |
| 403 | Forbidden | Insufficient permissions |
| 404 | Not Found | Resource doesn't exist |
| 500 | Server Error | Database error, etc. |

**Error Response Format:**

```json
{
  "error": "Human-readable error message"
}
```

---

## 8. Authentication & Authorization Flow

### 8.1 Complete Login Flow

```
┌─────────┐                ┌─────────┐                ┌──────────┐
│ Browser │                │ Backend │                │ Database │
└────┬────┘                └────┬────┘                └────┬─────┘
     │                          │                          │
     │ 1. POST /api/auth/login  │                          │
     │ {email, password}        │                          │
     ├─────────────────────────>│                          │
     │                          │                          │
     │                          │ 2. SELECT user           │
     │                          │    WHERE email = ?       │
     │                          ├─────────────────────────>│
     │                          │                          │
     │                          │ 3. User record           │
     │                          │<─────────────────────────┤
     │                          │                          │
     │                          │ 4. Verify password       │
     │                          │    (bcrypt.checkpw)      │
     │                          │                          │
     │                          │ 5. Generate JWT token    │
     │                          │    (includes user_id)    │
     │                          │                          │
     │ 6. Return token & user   │                          │
     │<─────────────────────────┤                          │
     │                          │                          │
     │ 7. Store in localStorage │                          │
     │                          │                          │
```

### 8.2 Authenticated Request Flow

```
┌─────────┐                ┌─────────┐                ┌──────────┐
│ Browser │                │ Backend │                │ Database │
└────┬────┘                └────┬────┘                └────┬─────┘
     │                          │                          │
     │ 1. GET /api/admin/books  │                          │
     │ Authorization: Bearer    │                          │
     │ <token>                  │                          │
     ├─────────────────────────>│                          │
     │                          │                          │
     │                          │ 2. Verify JWT signature  │
     │                          │    Extract user_id       │
     │                          │                          │
     │                          │ 3. Check user role       │
     │                          │    SELECT role           │
     │                          │    WHERE user_id = ?     │
     │                          ├─────────────────────────>│
     │                          │                          │
     │                          │ 4. User role             │
     │                          │<─────────────────────────┤
     │                          │                          │
     │                          │ 5. If admin, execute     │
     │                          │    SELECT books...       │
     │                          ├─────────────────────────>│
     │                          │                          │
     │                          │ 6. Books data            │
     │                          │<─────────────────────────┤
     │                          │                          │
     │ 7. Return books JSON     │                          │
     │<─────────────────────────┤                          │
     │                          │                          │
```

### 8.3 JWT Token Structure

A JWT token has three parts separated by dots:

```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjoxLCJleHAiOjE2OTAwMDAwMDB9.signature
│────────── Header ──────────││────────── Payload ──────────││─ Signature ─│
```

**Header (decoded):**
```json
{
  "alg": "HS256",
  "typ": "JWT"
}
```

**Payload (decoded):**
```json
{
  "user_id": 1,
  "exp": 1690000000
}
```

**Signature:**
- Created by: `HMAC-SHA256(header + payload, secret_key)`
- Ensures token hasn't been tampered with

### 8.4 Role-Based Access Control

```python
# Three levels of protection

# 1. Public endpoint - no authentication
@books_bp.route('/public/books', methods=['GET'])
def get_public_books():
    # Anyone can access
    pass

# 2. Authenticated endpoint - valid token required
@patron_bp.route('/my-borrowings', methods=['GET'])
@jwt_required()
def get_my_borrowings():
    # Any logged-in user can access
    user_id = get_jwt_identity()
    pass

# 3. Admin-only endpoint - valid token + admin role
@admin_books_bp.route('/books', methods=['POST'])
@jwt_required()
@admin_required
def create_book():
    # Only admin users can access
    pass
```

---

## 9. Key Python Features Used

### 9.1 Decorators

Decorators wrap functions to add functionality.

```python
def admin_required(fn):
    """Decorator that checks if user is admin"""
    @wraps(fn)
    def wrapper(*args, **kwargs):
        # Check authentication
        verify_jwt_in_request()
        user_id = get_jwt_identity()

        # Check role
        user = get_user(user_id)
        if user['role'] != 'admin':
            return jsonify({"error": "Admin required"}), 403

        # Call original function
        return fn(*args, **kwargs)
    return wrapper

# Usage
@app.route('/admin/books')
@admin_required
def manage_books():
    # Only runs if user is admin
    pass
```

### 9.2 Context Managers

Ensure resources are properly cleaned up.

```python
@contextmanager
def get_db_connection():
    conn = psycopg2.connect(DATABASE_URL)
    try:
        yield conn  # Give connection to caller
        conn.commit()  # Commit if successful
    except Exception as e:
        conn.rollback()  # Rollback on error
        raise e
    finally:
        conn.close()  # Always close connection

# Usage
with get_db_connection() as conn:
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM books")
    # Connection automatically closes
```

### 9.3 List Comprehensions

Concise way to create lists.

```python
# Traditional loop
books = []
for book in all_books:
    if book['available']:
        books.append(book)

# List comprehension
books = [book for book in all_books if book['available']]

# With transformation
titles = [book['title'].upper() for book in books]

# Nested comprehension
authors = [contributor['name']
           for book in books
           for contributor in book['contributors']]
```

### 9.4 F-Strings (Formatted Strings)

Modern string formatting.

```python
name = "Python"
year = 2024

# Old way
message = "Learning %s in %d" % (name, year)

# Format method
message = "Learning {} in {}".format(name, year)

# F-string (modern)
message = f"Learning {name} in {year}"

# With expressions
message = f"Learning {name.upper()} in {year + 1}"

# Multi-line
query = f"""
    SELECT * FROM books
    WHERE publication_year = {year}
    AND title ILIKE '%{name}%'
"""
```

### 9.5 Type Hints (Modern Python)

Optional type annotations for better code documentation.

```python
def get_books(page: int = 1, search: str = '') -> dict:
    """
    Get paginated books.

    Args:
        page: Page number (default 1)
        search: Search term (default empty)

    Returns:
        Dictionary with books and pagination info
    """
    offset = (page - 1) * 20
    # ...
    return {
        'books': books,
        'page': page,
        'total': total
    }
```

### 9.6 Dictionary Comprehension

Create dictionaries concisely.

```python
# Traditional
book_dict = {}
for book in books:
    book_dict[book['isbn']] = book['title']

# Dictionary comprehension
book_dict = {book['isbn']: book['title'] for book in books}

# With condition
available_books = {
    book['isbn']: book
    for book in books
    if book['available_items'] > 0
}
```

### 9.7 *args and **kwargs

Accept variable number of arguments.

```python
def log_event(event_type, *args, **kwargs):
    """
    Log an event with flexible arguments.

    *args: Positional arguments (tuple)
    **kwargs: Keyword arguments (dict)
    """
    print(f"Event: {event_type}")
    print(f"Args: {args}")
    print(f"Kwargs: {kwargs}")

# Usage
log_event('book_borrowed', 'ISBN123', 'Patron456',
          timestamp='2024-01-01', librarian='Admin')
# Output:
# Event: book_borrowed
# Args: ('ISBN123', 'Patron456')
# Kwargs: {'timestamp': '2024-01-01', 'librarian': 'Admin'}
```

---

## 10. Key JavaScript/React Features Used

### 10.1 Arrow Functions

Concise function syntax with lexical `this` binding.

```javascript
// Traditional function
function add(a, b) {
  return a + b;
}

// Arrow function
const add = (a, b) => a + b;

// With block body
const fetchBooks = async () => {
  const response = await api.get('/books');
  return response.data;
};

// In array methods
const titles = books.map(book => book.title);
const available = books.filter(book => book.available_items > 0);
```

### 10.2 Destructuring

Extract values from objects/arrays.

```javascript
// Object destructuring
const user = { id: 1, name: 'John', email: 'john@example.com' };
const { name, email } = user;  // Extract properties

// With renaming
const { name: userName, email: userEmail } = user;

// Nested destructuring
const book = {
  title: 'Python Guide',
  author: { name: 'Jane Doe', country: 'USA' }
};
const { title, author: { name: authorName } } = book;

// Array destructuring
const [first, second, ...rest] = [1, 2, 3, 4, 5];
// first = 1, second = 2, rest = [3, 4, 5]

// In function parameters
function BookCard({ title, author, isbn }) {
  return <div>{title} by {author}</div>;
}
```

### 10.3 Spread Operator

Expand arrays/objects.

```javascript
// Array spreading
const arr1 = [1, 2, 3];
const arr2 = [4, 5, 6];
const combined = [...arr1, ...arr2];  // [1, 2, 3, 4, 5, 6]

// Object spreading
const user = { name: 'John', age: 30 };
const updatedUser = { ...user, age: 31 };  // { name: 'John', age: 31 }

// Merging objects
const defaults = { page: 1, perPage: 20 };
const filters = { search: 'python' };
const params = { ...defaults, ...filters };
// { page: 1, perPage: 20, search: 'python' }

// In React (copying state)
setBooks([...books, newBook]);  // Add to array
setUser({ ...user, name: 'Jane' });  // Update property
```

### 10.4 Template Literals

String interpolation and multi-line strings.

```javascript
const name = 'Python';
const year = 2024;

// String interpolation
const message = `Learning ${name} in ${year}`;

// Expressions
const nextYear = `Next year is ${year + 1}`;

// Multi-line
const html = `
  <div>
    <h1>${name}</h1>
    <p>Published in ${year}</p>
  </div>
`;

// Tagged templates (advanced)
const query = sql`SELECT * FROM books WHERE year = ${year}`;
```

### 10.5 Async/Await

Handle promises with synchronous-looking code.

```javascript
// Promise chain (old way)
fetch('/api/books')
  .then(response => response.json())
  .then(data => console.log(data))
  .catch(error => console.error(error));

// Async/await (modern)
async function fetchBooks() {
  try {
    const response = await fetch('/api/books');
    const data = await response.json();
    console.log(data);
  } catch (error) {
    console.error(error);
  }
}

// Multiple awaits
async function loadData() {
  const [books, patrons, borrowings] = await Promise.all([
    api.get('/books'),
    api.get('/patrons'),
    api.get('/borrowings')
  ]);
  // All requests run in parallel
}
```

### 10.6 Optional Chaining

Safely access nested properties.

```javascript
// Without optional chaining
const authorName = user && user.patron && user.patron.author && user.patron.author.name;

// With optional chaining
const authorName = user?.patron?.author?.name;

// Returns undefined if any part is null/undefined
const firstBook = library?.books?.[0]?.title;

// With function calls
const result = obj.method?.();  // Only calls if method exists
```

### 10.7 Nullish Coalescing

Default values for null/undefined.

```javascript
// Logical OR (can be problematic)
const count = 0;
const display = count || 'No items';  // 'No items' (0 is falsy!)

// Nullish coalescing (only null/undefined)
const display = count ?? 'No items';  // 0 (only null/undefined trigger default)

// Common use case
const port = process.env.PORT ?? 5001;
const user = localStorage.getItem('user') ?? null;
```

### 10.8 React Hooks

#### useState

```javascript
function BookForm() {
  const [title, setTitle] = useState('');
  const [author, setAuthor] = useState('');
  const [errors, setErrors] = useState({});

  // Update single value
  const handleTitleChange = (e) => {
    setTitle(e.target.value);
  };

  // Update based on previous state
  const addError = (field, message) => {
    setErrors(prev => ({
      ...prev,
      [field]: message
    }));
  };

  return (
    <input value={title} onChange={handleTitleChange} />
  );
}
```

#### useEffect

```javascript
function BookList() {
  const [books, setBooks] = useState([]);

  // Run once on mount
  useEffect(() => {
    fetchBooks();
  }, []);  // Empty array = only on mount

  // Run when page changes
  useEffect(() => {
    fetchBooks(page);
  }, [page]);  // Re-run when page changes

  // Cleanup
  useEffect(() => {
    const subscription = subscribeToUpdates();

    return () => {
      // Cleanup function runs on unmount
      subscription.unsubscribe();
    };
  }, []);

  const fetchBooks = async () => {
    const response = await api.get('/books');
    setBooks(response.data);
  };
}
```

#### useContext

```javascript
// Create context
const ThemeContext = createContext();

// Provider
function App() {
  const [theme, setTheme] = useState('light');

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      <BookList />
    </ThemeContext.Provider>
  );
}

// Consumer
function BookCard() {
  const { theme } = useContext(ThemeContext);

  return (
    <div className={theme === 'dark' ? 'dark-card' : 'light-card'}>
      ...
    </div>
  );
}
```

#### Custom Hooks

```javascript
// Custom hook for API calls
function useAPI(url) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await api.get(url);
        setData(response.data);
      } catch (err) {
        setError(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [url]);

  return { data, loading, error };
}

// Usage
function BookList() {
  const { data: books, loading, error } = useAPI('/api/books');

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <div>
      {books.map(book => <BookCard key={book.id} book={book} />)}
    </div>
  );
}
```

### 10.9 Array Methods

```javascript
const books = [
  { id: 1, title: 'Python Guide', available: true, price: 299 },
  { id: 2, title: 'JavaScript Book', available: false, price: 399 },
  { id: 3, title: 'React Guide', available: true, price: 499 },
];

// map - transform each element
const titles = books.map(book => book.title);
// ['Python Guide', 'JavaScript Book', 'React Guide']

// filter - select elements
const available = books.filter(book => book.available);
// [{ id: 1, ... }, { id: 3, ... }]

// find - get first matching element
const pythonBook = books.find(book => book.title.includes('Python'));
// { id: 1, title: 'Python Guide', ... }

// reduce - aggregate
const totalPrice = books.reduce((sum, book) => sum + book.price, 0);
// 1197

// some - check if any match
const hasAvailable = books.some(book => book.available);
// true

// every - check if all match
const allAvailable = books.every(book => book.available);
// false

// sort - order elements
const sorted = [...books].sort((a, b) => a.price - b.price);
```

---

## 11. Complete Request-Response Flow

### Example: Borrowing a Book

Let's trace a complete flow from user clicking "Borrow" to database update.

#### Step 1: User Interaction (Frontend)

```javascript
// BorrowingsManagement.js
function BorrowingsManagement() {
  const handleIssueBook = async () => {
    try {
      // Call API
      await adminBorrowingsAPI.issueBook(patronId, itemId);
      alert('Book issued successfully!');
      fetchBorrowings();  // Refresh list
    } catch (error) {
      alert('Failed to issue book: ' + error.message);
    }
  };

  return (
    <button onClick={handleIssueBook}>Issue Book</button>
  );
}
```

#### Step 2: API Client (Frontend)

```javascript
// services/api.js
export const adminBorrowingsAPI = {
  issueBook: (patronId, itemId) =>
    api.post('/admin/borrowings/issue', {
      patron_id: patronId,
      item_id: itemId
    }),
};
```

#### Step 3: Axios Interceptor Adds Token

```javascript
// Automatically adds Authorization header
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
```

#### Step 4: HTTP Request

```http
POST /api/admin/borrowings/issue HTTP/1.1
Host: localhost:5001
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: application/json

{
  "patron_id": "P001",
  "item_id": 42
}
```

#### Step 5: Flask Route Handler (Backend)

```python
# admin_borrowings.py
@admin_borrowings_bp.route('/borrowings/issue', methods=['POST'])
@jwt_required()  # Step 6: Verify JWT
@admin_required  # Step 7: Check admin role
def issue_book():
    data = request.get_json()
    patron_id = data['patron_id']
    item_id = data['item_id']

    # Validation
    if not patron_id or not item_id:
        return jsonify({"error": "Missing required fields"}), 400

    # Check patron exists and is active
    patron = execute_query(
        "SELECT status FROM patrons WHERE patron_id = %s",
        (patron_id,),
        fetch_one=True
    )

    if not patron:
        return jsonify({"error": "Patron not found"}), 404

    if patron['status'] != 'active':
        return jsonify({"error": "Patron account is not active"}), 400

    # Check item exists and is available
    item = execute_query(
        "SELECT book_id, status FROM items WHERE item_id = %s",
        (item_id,),
        fetch_one=True
    )

    if not item:
        return jsonify({"error": "Item not found"}), 404

    if item['status'] != 'available':
        return jsonify({"error": "Item is not available"}), 400

    # Calculate due date (14 days from now)
    from datetime import datetime, timedelta
    due_date = datetime.now() + timedelta(days=Config.CHECKOUT_DURATION_DAYS)

    # Step 8: Create borrowing record
    execute_query("""
        INSERT INTO borrowings (patron_id, item_id, book_id, due_date, status)
        VALUES (%s, %s, %s, %s, 'active')
    """, (patron_id, item_id, item['book_id'], due_date))

    # Step 9: Update item status
    execute_query("""
        UPDATE items
        SET status = 'checked_out'
        WHERE item_id = %s
    """, (item_id,))

    # Step 10: Return success
    return jsonify({
        "message": "Book issued successfully",
        "due_date": due_date.strftime('%Y-%m-%d')
    }), 201
```

#### Step 6-7: JWT Verification (Automatic)

```python
# Handled by @jwt_required() decorator
# 1. Extract token from Authorization header
# 2. Verify signature using JWT_SECRET_KEY
# 3. Check expiration
# 4. Extract user_id from payload

# Then @admin_required checks role
# 1. Query database for user's role
# 2. Return 403 if not admin
```

#### Step 8-9: Database Transactions

```sql
-- PostgreSQL executes these queries

-- Step 8: Insert borrowing
INSERT INTO borrowings (patron_id, item_id, book_id, due_date, status)
VALUES ('P001', 42, 15, '2024-02-01', 'active');

-- Step 9: Update item
UPDATE items
SET status = 'checked_out'
WHERE item_id = 42;

-- Automatic COMMIT (via context manager)
```

#### Step 10: HTTP Response

```http
HTTP/1.1 201 Created
Content-Type: application/json

{
  "message": "Book issued successfully",
  "due_date": "2024-02-01"
}
```

#### Step 11: Frontend Handles Response

```javascript
// Back in the React component
try {
  await adminBorrowingsAPI.issueBook(patronId, itemId);
  alert('Book issued successfully!');  // Show success
  fetchBorrowings();  // Refresh the list
} catch (error) {
  alert('Failed to issue book: ' + error.message);  // Show error
}
```

### Complete Flow Diagram

```
┌──────────┐     ┌──────────┐     ┌──────────┐     ┌──────────┐
│ Browser  │     │  Axios   │     │  Flask   │     │PostgreSQL│
└────┬─────┘     └────┬─────┘     └────┬─────┘     └────┬─────┘
     │                │                │                │
     │ 1. Click      │                │                │
     │   "Borrow"     │                │                │
     │                │                │                │
     │ 2. Call API   │                │                │
     ├──────────────>│                │                │
     │                │                │                │
     │                │ 3. Add Token  │                │
     │                │    POST        │                │
     │                ├───────────────>│                │
     │                │                │                │
     │                │                │ 4. Verify JWT  │
     │                │                │                │
     │                │                │ 5. Check Role  │
     │                │                │                │
     │                │                │ 6. Validate    │
     │                │                │    SELECT      │
     │                │                ├───────────────>│
     │                │                │                │
     │                │                │ 7. Data        │
     │                │                │<───────────────┤
     │                │                │                │
     │                │                │ 8. INSERT      │
     │                │                ├───────────────>│
     │                │                │                │
     │                │                │ 9. UPDATE      │
     │                │                ├───────────────>│
     │                │                │                │
     │                │                │ 10. COMMIT     │
     │                │                │<───────────────┤
     │                │                │                │
     │                │ 11. Response   │                │
     │                │<───────────────┤                │
     │                │                │                │
     │ 12. Success   │                │                │
     │<──────────────┤                │                │
     │                │                │                │
     │ 13. Refresh   │                │                │
     │    List       │                │                │
     │                │                │                │
```

---

## Summary

This documentation covers:

1. **Project Structure**: Three applications (admin frontend, public website, backend API)
2. **Backend (Python/Flask)**: Application factory, blueprints, database layer, authentication
3. **Frontend (React)**: Component architecture, state management, routing, API integration
4. **Database**: PostgreSQL schema, relationships, materialized views
5. **API Design**: RESTful endpoints, request/response formats, error handling
6. **Authentication**: JWT tokens, role-based access control, protected routes
7. **Python Features**: Decorators, context managers, list comprehensions, f-strings
8. **JavaScript/React Features**: Arrow functions, hooks, async/await, destructuring
9. **Complete Flows**: End-to-end request tracing from UI to database

### Key Takeaways for Novice Developers

1. **Separation of Concerns**: Frontend handles UI, backend handles business logic, database stores data
2. **API-First Design**: Backend exposes REST API, multiple frontends can consume it
3. **Authentication**: JWT tokens identify users, decorators enforce permissions
4. **State Management**: React state for UI, localStorage for persistence, context for sharing
5. **Error Handling**: Try-catch in frontend, exceptions in backend, transactions in database
6. **Code Organization**: Blueprints (backend), components (frontend), modules (both)

---

**Document Version**: 1.0
**Last Updated**: 2024
**Author**: Generated for Nuk Library Project
