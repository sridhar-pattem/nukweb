# Nuk Library Management System

A comprehensive web application for managing Nuk Library in Bangalore, featuring patron management, book cataloguing, borrowing system, and coworking space bookings.

## Features

### Admin Features
- **Patron Management**: Add, update, search, and manage library members with pagination
- **Membership Plans**: Create and manage different membership types
- **Book Catalogue**: Add books via ISBN (Open Library API integration), manage collections, genres, and age ratings
- **Borrowing System**: Issue books, track due dates, manage renewals (max 2, 14 days each)
- **Automated Invoicing**: Generate and email PDF invoices 14 days before membership expiry
- **Coworking Management**: Review and approve coworking space booking requests
- **Payment Recording**: Manual payment tracking (UPI, Cash, Card, Bank Transfer, Gift Coupons)

### Patron Features
- **Browse Books**: Search and filter by collection, genre, age rating
- **Book Reviews**: Write reviews and rate books
- **Borrowing History**: View current and past borrowings
- **Personalized Recommendations**: Age-appropriate suggestions based on reading history and preferences
- **Coworking Booking**: Request day/half-day coworking space
- **Profile Management**: Update details, change password

## Technology Stack

### Backend
- Python 3.10+
- Flask (REST API)
- PostgreSQL (Database)
- JWT Authentication
- Open Library API Integration
- ReportLab (PDF Generation)

### Frontend
- React 18
- React Router
- Axios
- CSS3

## Installation & Setup

### Prerequisites
- Python 3.10+
- Node.js 16+
- PostgreSQL 14+

### Backend Setup

1. **Navigate to backend directory:**
```bash
cd backend
```

2. **Create virtual environment:**
```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

3. **Install dependencies:**
```bash
pip install -r requirements.txt
```

4. **Setup PostgreSQL database:**
```bash
# Create database
createdb nuk_library

# Run schema
psql -d nuk_library -f ../database/schema.sql
```

5. **Configure environment variables:**
```bash
cp .env.example .env
# Edit .env with your database credentials and settings
```

6. **Run the backend:**
```bash
python run.py
```

Backend will run on `http://localhost:5000`

### Frontend Setup

1. **Navigate to frontend directory:**
```bash
cd frontend
```

2. **Install dependencies:**
```bash
npm install
```

3. **Configure API URL (if needed):**
Create `.env` file:
```
REACT_APP_API_URL=http://localhost:5000/api
```

4. **Run the frontend:**
```bash
npm start
```

Frontend will run on `http://localhost:3000`

## Default Login Credentials

### Admin
- Email: `admin@nuklibrary.com`
- Password: `admin123` (Change immediately after first login)

### New Patrons
- Email: As registered
- Password: `BookNook313` (Should be changed on first login)

## Deployment to Railway

### Why Railway?
- **Cost**: $5/month includes PostgreSQL database
- **Easy Setup**: Git-based deployment
- **Auto-scaling**: Handles traffic automatically
- **SSL**: Free HTTPS certificates

### Deployment Steps

1. **Create Railway Account**
   - Go to [railway.app](https://railway.app)
   - Sign up with GitHub

2. **Create New Project**
   - Click "New Project"
   - Select "Deploy from GitHub repo"
   - Connect your repository

3. **Add PostgreSQL Database**
   - In your project, click "New"
   - Select "Database" → "PostgreSQL"
   - Railway will provision a database

4. **Configure Backend Service**
   - Click "New" → "GitHub Repo"
   - Select your repository
   - Railway will auto-detect Python
   - Set root directory to `/backend`
   - Add environment variables:
     ```
     DATABASE_URL=${{Postgres.DATABASE_URL}}
     JWT_SECRET_KEY=your-secret-key-here
     SECRET_KEY=your-flask-secret-here
     PORT=5000
     ```

5. **Run Database Migrations**
   - In Railway dashboard, go to PostgreSQL service
   - Click "Connect"
   - Copy connection details
   - Run: `psql -d <connection_url> -f database/schema.sql`

6. **Configure Frontend Service**
   - Add another service for frontend
   - Set root directory to `/frontend`
   - Add environment variable:
     ```
     REACT_APP_API_URL=https://your-backend-url.railway.app/api
     ```

7. **Deploy**
   - Railway will automatically deploy on every push to main branch
   - Get your deployment URLs from the dashboard

### Alternative: Deploy Backend Only

If you prefer to host frontend separately (e.g., on Vercel/Netlify):

1. Deploy backend on Railway as above
2. Deploy frontend on Vercel:
   ```bash
   npm install -g vercel
   cd frontend
   vercel
   ```

## API Documentation

### Authentication Endpoints
- `POST /api/auth/login` - User login
- `POST /api/auth/change-password` - Change password
- `GET /api/auth/me` - Get current user info

### Admin Endpoints

#### Patrons
- `GET /api/admin/patrons` - List patrons (with pagination)
- `GET /api/admin/patrons/:id` - Get patron details
- `POST /api/admin/patrons` - Create new patron
- `PUT /api/admin/patrons/:id` - Update patron
- `POST /api/admin/patrons/:id/reset-password` - Reset password
- `PATCH /api/admin/patrons/:id/status` - Update status (renew/freeze/close)

#### Books
- `GET /api/admin/books` - List books (with filters)
- `POST /api/admin/books/fetch-by-isbn` - Fetch book from Open Library
- `POST /api/admin/books` - Add new book
- `PUT /api/admin/books/:id` - Update book
- `PATCH /api/admin/books/:id/status` - Update status
- `PATCH /api/admin/books/:id/copies` - Update copy count
- `GET /api/admin/books/collections` - Get all collections
- `GET /api/admin/books/genres` - Get all genres
- `GET /api/admin/age-ratings` - Get age ratings

#### Borrowings
- `POST /api/admin/borrowings/issue` - Issue book
- `POST /api/admin/borrowings/:id/renew` - Renew borrowing
- `POST /api/admin/borrowings/:id/return` - Return book
- `GET /api/admin/borrowings/search` - Search borrowings
- `GET /api/admin/borrowings/overdue` - Get overdue borrowings

### Patron Endpoints
- `GET /api/patron/books` - Browse books
- `GET /api/patron/books/:id` - Get book details
- `POST /api/patron/books/:id/review` - Add/update review
- `GET /api/patron/my-borrowings` - Get borrowings
- `GET /api/patron/recommendations` - Get recommendations
- `POST /api/patron/cowork-booking` - Request cowork booking
- `GET /api/patron/my-cowork-bookings` - Get cowork bookings

## Database Schema

Key tables:
- `users` - User accounts (admin/patron)
- `patrons` - Patron details and membership info
- `membership_plans` - Membership plan definitions
- `books` - Book catalogue
- `borrowings` - Book checkout records
- `reviews` - Book reviews and ratings
- `cowork_bookings` - Coworking space requests
- `invoices` - Membership invoices
- `age_ratings` - Age rating definitions
- `reading_history` - For recommendation algorithm

## Development

### Running Tests
```bash
# Backend tests (when implemented)
cd backend
pytest

# Frontend tests
cd frontend
npm test
```

### Code Style
- Backend: Follow PEP 8
- Frontend: Use ESLint with React rules

## Support & Maintenance

### Common Issues

1. **Database Connection Error**
   - Check DATABASE_URL in .env
   - Ensure PostgreSQL is running

2. **CORS Errors**
   - Verify API_URL in frontend .env
   - Check Flask-CORS configuration

3. **JWT Token Expired**
   - Re-login to get new token
   - Check JWT_ACCESS_TOKEN_EXPIRES in config

### Backup Database
```bash
pg_dump -U username -d nuk_library > backup.sql
```

### Restore Database
```bash
psql -U username -d nuk_library < backup.sql
```

## License

Proprietary - Nuk Library, Bangalore

## Contact

For support: info@nuklibrary.com
