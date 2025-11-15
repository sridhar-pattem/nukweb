# Nuk Library - System Architecture

## High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                      Client Browser                          │
│                   (React Application)                        │
└────────────────────────┬────────────────────────────────────┘
                         │ HTTP/HTTPS
                         │ REST API
                         ▼
┌─────────────────────────────────────────────────────────────┐
│                    Flask Backend API                         │
│  ┌──────────────────────────────────────────────────────┐  │
│  │              Authentication Layer                      │  │
│  │              (JWT Token Validation)                    │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                              │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │    Admin     │  │   Patron     │  │    Auth      │     │
│  │   Routes     │  │   Routes     │  │   Routes     │     │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘     │
│         │                  │                  │              │
│  ┌──────┴──────────────────┴──────────────────┴────────┐   │
│  │              Business Logic Layer                     │   │
│  │  • Patron Management  • Borrowing Logic              │   │
│  │  • Book Management    • Recommendation Engine        │   │
│  │  • Invoice Generation • Cowork Management            │   │
│  └───────────────────────┬───────────────────────────────┘  │
│                          │                                   │
│  ┌───────────────────────┴───────────────────────────────┐  │
│  │              Utility Services                          │  │
│  │  • Database Helper    • PDF Generator                 │  │
│  │  • Password Hashing   • Open Library API Client      │  │
│  └────────────────────────────────────────────────────────┘ │
└────────────────────────┬────────────────────────────────────┘
                         │ SQL Queries
                         ▼
┌─────────────────────────────────────────────────────────────┐
│                   PostgreSQL Database                        │
│  ┌────────────┐ ┌────────────┐ ┌────────────┐             │
│  │   Users    │ │  Patrons   │ │   Books    │             │
│  └────────────┘ └────────────┘ └────────────┘             │
│  ┌────────────┐ ┌────────────┐ ┌────────────┐             │
│  │ Borrowings │ │  Reviews   │ │  Invoices  │             │
│  └────────────┘ └────────────┘ └────────────┘             │
│  ┌────────────┐ ┌────────────┐                             │
│  │  Cowork    │ │  Reading   │                             │
│  │  Bookings  │ │  History   │                             │
│  └────────────┘ └────────────┘                             │
└─────────────────────────────────────────────────────────────┘

                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│                   External Services                          │
│  ┌────────────────┐  ┌────────────────┐                    │
│  │ Open Library   │  │  SMTP Server   │                    │
│  │  API (Books)   │  │  (Invoices)    │                    │
│  └────────────────┘  └────────────────┘                    │
└─────────────────────────────────────────────────────────────┘
```

## Data Flow Examples

### 1. Patron Login Flow
```
User enters credentials
       ↓
Frontend → POST /api/auth/login
       ↓
Backend validates credentials
       ↓
Database checks user table
       ↓
Generate JWT token
       ↓
Return token + user info
       ↓
Frontend stores in localStorage
       ↓
Redirect to dashboard
```

### 2. Book Borrowing Flow
```
Admin issues book
       ↓
Frontend → POST /api/admin/borrowings/issue
       ↓
Backend checks:
  - Is book available?
  - Is patron active?
       ↓
Create borrowing record
       ↓
Trigger auto-updates:
  - Decrease available_copies
  - Set due_date (14 days)
       ↓
Return success
       ↓
Frontend refreshes view
```

### 3. Book Recommendation Flow
```
Patron requests recommendations
       ↓
Frontend → GET /api/patron/recommendations
       ↓
Backend fetches:
  - Reading history
  - Age ratings from history
  - Preferred genres
       ↓
Algorithm computes:
  1. Genre-based matches
  2. Age-appropriate popular books
  3. Highly-rated books
       ↓
Return personalized list
       ↓
Frontend displays books
```

### 4. ISBN Book Lookup Flow
```
Admin enters ISBN
       ↓
Frontend → POST /api/admin/books/fetch-by-isbn
       ↓
Backend → Open Library API
       ↓
Parse response:
  - Title, Author
  - Cover image URL
  - Genre, Publisher
       ↓
Return book details
       ↓
Frontend pre-fills form
       ↓
Admin reviews and saves
```

## Deployment Architecture (Railway)

```
┌─────────────────────────────────────────────────────────┐
│                    Railway Platform                      │
│                                                          │
│  ┌──────────────────┐         ┌──────────────────┐     │
│  │  Frontend        │         │   Backend        │     │
│  │  Service         │◄────────┤   Service        │     │
│  │  (React)         │  API    │   (Flask)        │     │
│  │  Port: 3000      │  Calls  │   Port: 5000     │     │
│  └──────────────────┘         └────────┬─────────┘     │
│                                         │                │
│                                         │                │
│                          ┌──────────────┴─────────────┐ │
│                          │   PostgreSQL Database      │ │
│                          │   (Managed Service)        │ │
│                          └────────────────────────────┘ │
│                                                          │
└──────────────────────────────────────────────────────────┘
                           │
                           │ HTTPS
                           ▼
                     [User Browser]
```

## Security Layers

```
┌─────────────────────────────────────────────────────────┐
│                  Security Measures                       │
├─────────────────────────────────────────────────────────┤
│  1. Password Hashing (bcrypt)                           │
│     • Salt rounds: 12                                    │
│     • No plain text storage                              │
├─────────────────────────────────────────────────────────┤
│  2. JWT Authentication                                   │
│     • Token expiry: 24 hours                            │
│     • Role-based access control                          │
│     • Protected routes                                   │
├─────────────────────────────────────────────────────────┤
│  3. Input Validation                                     │
│     • SQL injection prevention                           │
│     • XSS protection                                     │
│     • CORS configuration                                 │
├─────────────────────────────────────────────────────────┤
│  4. Database Security                                    │
│     • Foreign key constraints                            │
│     • Check constraints                                  │
│     • Parameterized queries                              │
├─────────────────────────────────────────────────────────┤
│  5. HTTPS/TLS                                           │
│     • Railway auto-provisions SSL                        │
│     • Secure data transmission                           │
└─────────────────────────────────────────────────────────┘
```

## Scalability Considerations

```
Current Setup (Single Server):
  • Handles ~100 concurrent users
  • Database: 100GB storage
  • Cost: $5/month

Future Scaling Options:
  
  ┌────────────────────────────────────────┐
  │   Load Balancer                        │
  └───────────┬────────────────────────────┘
              │
       ┌──────┴──────┐
       │             │
   ┌───▼───┐    ┌───▼───┐
   │Backend│    │Backend│  (Horizontal scaling)
   │   1   │    │   2   │
   └───┬───┘    └───┬───┘
       │            │
       └──────┬─────┘
              │
      ┌───────▼────────┐
      │  PostgreSQL    │
      │  (Primary)     │
      └───────┬────────┘
              │
      ┌───────▼────────┐
      │  PostgreSQL    │
      │  (Replica)     │  (Read scaling)
      └────────────────┘

  Cost: $20-50/month for high traffic
```

## Technology Stack Details

```
┌────────────────────────────────────────────────────────┐
│                   Frontend Stack                        │
├────────────────────────────────────────────────────────┤
│  React 18         • Hooks, Context API                 │
│  React Router 6   • Client-side routing                │
│  Axios            • HTTP client                        │
│  CSS3             • Custom styling                     │
└────────────────────────────────────────────────────────┘

┌────────────────────────────────────────────────────────┐
│                   Backend Stack                         │
├────────────────────────────────────────────────────────┤
│  Python 3.10+     • Core language                      │
│  Flask 3.0        • Web framework                      │
│  Flask-CORS       • Cross-origin requests              │
│  Flask-JWT-Ext    • Authentication                     │
│  psycopg2         • PostgreSQL driver                  │
│  bcrypt           • Password hashing                   │
│  ReportLab        • PDF generation                     │
│  Requests         • HTTP client for APIs               │
│  Gunicorn         • WSGI server                        │
└────────────────────────────────────────────────────────┘

┌────────────────────────────────────────────────────────┐
│                   Database                              │
├────────────────────────────────────────────────────────┤
│  PostgreSQL 14+   • Relational database                │
│  • ACID compliance                                     │
│  • Advanced indexing                                   │
│  • Triggers & constraints                              │
│  • JSON support                                        │
└────────────────────────────────────────────────────────┘
```
