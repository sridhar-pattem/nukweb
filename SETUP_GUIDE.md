# Nuk Library - Setup Guide

## Quick Start Guide

This guide will help you set up the Nuk Library Management System on your local machine.

### Prerequisites

- PostgreSQL 12+ installed and running
- Python 3.8+ installed
- Node.js 14+ and npm installed
- Git installed

---

## Step 1: Database Setup

### 1.1 Create Database

```bash
# Create the database
createdb nuk_library

# Or using psql
psql -U postgres
CREATE DATABASE nuk_library;
\q
```

### 1.2 Run Schema

```bash
# Navigate to the database folder
cd database

# Run the schema file
psql -d nuk_library -f schema.sql

# Run sample data (optional but recommended)
psql -d nuk_library -f sample_data.sql
```

**Note:** The schema.sql file will create:
- All required tables
- Default admin user (email: `admin@nuklibrary.com`, password: `admin123`)
- Age ratings

The sample_data.sql will add 6 sample membership plans.

---

## Step 2: Backend Setup

### 2.1 Install Dependencies

```bash
cd backend
pip install -r requirements.txt
```

### 2.2 Configure Environment

```bash
# Copy the example .env file
cp .env.example .env

# Edit the .env file with your settings
nano .env  # or use any text editor
```

Update these values in `.env`:
- `DATABASE_URL`: Your PostgreSQL connection string
  - Format: `postgresql://username:password@localhost:5432/nuk_library`
  - Example: `postgresql://postgres:mypassword@localhost:5432/nuk_library`
- `JWT_SECRET_KEY`: A random secret key for JWT tokens
- `SECRET_KEY`: A random secret key for Flask

### 2.3 Start Backend

```bash
python run.py
```

The backend should start on `http://localhost:5001`

---

## Step 3: Frontend Setup

### 3.1 Install Dependencies

```bash
cd frontend
npm install
```

### 3.2 Configure Environment (Optional)

If your backend is running on a different port or host, create a `.env` file:

```bash
# Create .env in the frontend folder
echo "REACT_APP_API_URL=http://localhost:5001/api" > .env
```

### 3.3 Start Frontend

```bash
npm start
```

The frontend should open automatically at `http://localhost:3000`

---

## Step 4: Login and Test

### 4.1 Admin Login

1. Navigate to `http://localhost:3000`
2. Login with:
   - Email: `admin@nuklibrary.com`
   - Password: `admin123`
3. **IMPORTANT:** Change this password immediately!

### 4.2 Test Functionality

1. **Membership Plans**:
   - Go to "Membership Plans" in the sidebar
   - You should see 6 sample plans
   - Try adding a new plan

2. **Patron Management**:
   - Go to "Patron Management"
   - Try adding a new patron
   - Select a membership plan from the dropdown

3. **Book Catalogue**:
   - Go to "Book Catalogue"
   - Try adding a book using ISBN lookup

4. **Borrowings**:
   - Go to "Borrowings"
   - Try issuing a book to a patron

---

## Troubleshooting

### Backend won't start

**Error: "Could not connect to database"**
- Check that PostgreSQL is running: `pg_isready`
- Verify DATABASE_URL in `.env` file
- Test connection: `psql -d nuk_library`

**Error: "No module named 'psycopg2'"**
- Install dependencies: `pip install -r requirements.txt`
- On Mac, try: `pip install psycopg2-binary`

### Frontend won't start

**Error: "Module not found"**
- Delete node_modules and reinstall: `rm -rf node_modules && npm install`

**Error: "Network Error" when logging in**
- Check that backend is running on port 5001
- Check browser console for CORS errors
- Verify REACT_APP_API_URL in frontend/.env

### No membership plans showing

- Run the sample_data.sql file:
  ```bash
  psql -d nuk_library -f database/sample_data.sql
  ```
- Or manually add plans through the UI

### Can't create patrons

- Ensure you have at least one membership plan
- Check that the database schema was created correctly
- Verify the backend logs for errors

---

## Database Connection Strings

Different database setups require different connection strings:

**Local PostgreSQL (default user):**
```
postgresql://postgres:password@localhost:5432/nuk_library
```

**Local PostgreSQL (custom user):**
```
postgresql://myuser:mypassword@localhost:5432/nuk_library
```

**Remote PostgreSQL:**
```
postgresql://user:password@remote-host:5432/nuk_library
```

**Railway/Heroku (automatically provided):**
```
Use the DATABASE_URL provided by the platform
```

---

## Default Credentials

**Admin:**
- Email: `admin@nuklibrary.com`
- Password: `admin123`

**New Patrons:**
- Default Password: `BookNook313`
- Patrons must change password on first login

---

## Next Steps

1. Change admin password
2. Add membership plans (if not using sample data)
3. Add books to the catalogue
4. Create patron accounts
5. Start issuing books!

---

## Production Deployment

For production deployment:
1. Change all secret keys in .env
2. Set FLASK_ENV=production
3. Use a production-grade WSGI server (Gunicorn)
4. Enable HTTPS
5. Use a managed PostgreSQL database
6. See DEPLOYMENT_CHECKLIST.md for more details

---

## Need Help?

- Check README.md for API documentation
- See ARCHITECTURE.md for system design
- See QUICKSTART.md for Railway deployment
- Review database/schema.sql for database structure
