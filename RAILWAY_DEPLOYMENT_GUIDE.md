# Railway Deployment Guide for Nuk Library

## Overview
This guide provides step-by-step instructions to deploy your Nuk Library application to Railway with all your existing data.

---

## Prerequisites

✅ Railway account (sign up at https://railway.app)
✅ GitHub account (for connecting your repository)
✅ Your codebase pushed to GitHub
✅ Local PostgreSQL database with current data

---

## Part 1: Export Your Current Data

### Step 1: Export Data from Local Database

```bash
cd /home/user/nukweb/database
./export_data.sh
```

This will create a file like `data_export/nukweb_data_YYYYMMDD_HHMMSS.sql` containing all your current data.

**Alternative Manual Export:**
```bash
pg_dump -h localhost -U postgres -d nukweb \
  --data-only --column-inserts --disable-triggers \
  --exclude-table=mv_book_availability \
  -f my_data_export.sql
```

> **Note:** We exclude `mv_book_availability` because it's a materialized view that will be regenerated.

---

## Part 2: Set Up Railway Project

### Step 2: Create Railway Account and Project

1. Go to https://railway.app
2. Click "Start a New Project"
3. Choose "Deploy from GitHub repo"
4. Authorize Railway to access your GitHub
5. Select your `nukweb` repository

### Step 3: Add PostgreSQL Database

1. In your Railway project, click "+ New"
2. Select "Database" → "PostgreSQL"
3. Wait for the database to be provisioned (takes ~30 seconds)
4. Railway will automatically create a PostgreSQL instance

### Step 4: Get Database Connection Details

1. Click on your PostgreSQL service in Railway
2. Go to the "Variables" tab
3. Note down these variables (you'll need them):
   - `PGHOST`
   - `PGPORT`
   - `PGDATABASE`
   - `PGUSER`
   - `PGPASSWORD`
   - `DATABASE_URL` (complete connection string)

---

## Part 3: Deploy Database Schema

### Step 5: Connect to Railway Database

**Option A: Using Railway CLI (Recommended)**

```bash
# Install Railway CLI
npm install -g @railway/cli

# Login to Railway
railway login

# Link to your project
railway link

# Connect to PostgreSQL
railway connect postgres
```

**Option B: Using psql with Connection String**

```bash
psql "postgresql://PGUSER:PGPASSWORD@PGHOST:PGPORT/PGDATABASE"
```

Replace the variables with your actual values from Step 4.

### Step 6: Run the Consolidated Schema

**If using Railway CLI:**

```bash
# Navigate to database directory
cd /home/user/nukweb/database

# Run the schema file
railway run psql < railway_complete_schema.sql
```

**If using psql directly:**

```bash
psql "your_database_url_from_railway" < /home/user/nukweb/database/railway_complete_schema.sql
```

This will create all tables, indexes, triggers, functions, and default data.

### Step 7: Import Your Existing Data

**Using Railway CLI:**

```bash
railway run psql < data_export/nukweb_data_YYYYMMDD_HHMMSS.sql
```

**Using psql:**

```bash
psql "your_database_url" < data_export/nukweb_data_YYYYMMDD_HHMMSS.sql
```

### Step 8: Refresh Materialized Views

After importing data, refresh the materialized view:

```sql
REFRESH MATERIALIZED VIEW mv_book_availability;
```

You can do this by connecting to the database and running:

```bash
railway run psql -c "REFRESH MATERIALIZED VIEW mv_book_availability;"
```

---

## Part 4: Deploy Backend (Flask)

### Step 9: Add Backend Service

1. In Railway dashboard, click "+ New"
2. Select "GitHub Repo" → Choose your nukweb repository
3. Railway will detect it's a Python app
4. Click "Add Service"

### Step 10: Configure Backend Environment Variables

1. Click on your backend service
2. Go to "Variables" tab
3. Add these variables:

```
DATABASE_URL=${PostgreSQL.DATABASE_URL}
FLASK_ENV=production
SECRET_KEY=<generate-a-secure-random-key>
JWT_SECRET_KEY=<generate-another-secure-random-key>
CORS_ORIGINS=*
```

**To generate secure keys:**
```bash
python -c "import secrets; print(secrets.token_urlsafe(32))"
```

### Step 11: Configure Build Settings

1. Go to "Settings" tab
2. Set **Root Directory**: `backend`
3. Set **Build Command**: `pip install -r requirements.txt`
4. Set **Start Command**: `gunicorn -w 4 -b 0.0.0.0:$PORT app.app:app`

### Step 12: Add gunicorn to requirements.txt

If not already present, add this line to `/home/user/nukweb/backend/requirements.txt`:

```
gunicorn==21.2.0
```

Then commit and push:

```bash
cd /home/user/nukweb
git add backend/requirements.txt
git commit -m "Add gunicorn for Railway deployment"
git push origin claude/website-admin-dashboard-012iw7WaGWyk1XYwvUoM9YBa
```

---

## Part 5: Deploy Frontend (React)

### Step 13: Add Frontend Service

1. In Railway dashboard, click "+ New"
2. Select "GitHub Repo" → Choose your nukweb repository again
3. Click "Add Service"

### Step 14: Configure Frontend Environment Variables

1. Click on your frontend service
2. Go to "Variables" tab
3. Add these variables:

```
REACT_APP_API_URL=https://your-backend-service.railway.app
```

Replace `your-backend-service` with the actual domain Railway assigned to your backend (found in backend service settings).

### Step 15: Configure Frontend Build Settings

1. Go to "Settings" tab
2. Set **Root Directory**: `website`
3. Set **Build Command**: `npm install && npm run build`
4. Set **Start Command**: `npx serve -s build -l $PORT`

### Step 16: Install serve package

Add `serve` to your website dependencies:

```bash
cd /home/user/nukweb/website
npm install --save serve
git add package.json package-lock.json
git commit -m "Add serve for Railway deployment"
git push
```

---

## Part 6: Configure Custom Domains (Optional)

### Step 17: Add Custom Domain

1. Click on your frontend service
2. Go to "Settings" tab
3. Click "Generate Domain" or add your custom domain
4. Update your DNS records as instructed by Railway

---

## Part 7: Final Configuration and Testing

### Step 18: Update Backend CORS Settings

Update your backend to allow requests from your Railway frontend domain:

In `/home/user/nukweb/backend/app/config.py`, update CORS_ORIGINS:

```python
CORS_ORIGINS = os.getenv('CORS_ORIGINS', 'https://your-frontend.railway.app').split(',')
```

### Step 19: Update Frontend API URL

Make sure your frontend is pointing to the correct backend URL. Check that all API calls use the `REACT_APP_API_URL` environment variable.

### Step 20: Test Your Deployment

1. Visit your Railway frontend URL
2. Test login with `admin@nuklibrary.com` / `admin123`
3. **IMMEDIATELY change the admin password!**
4. Test key features:
   - Book catalogue search
   - Chatbot functionality
   - Admin dashboard
   - Creating new members
   - Checking out books

---

## Part 8: Database Backups (Important!)

### Step 21: Set Up Automated Backups

Railway doesn't provide automatic backups by default. Set up regular backups:

**Option A: Railway CLI Backup Script**

Create a file `backup_railway_db.sh`:

```bash
#!/bin/bash
railway login
railway link
BACKUP_FILE="backup_$(date +%Y%m%d_%H%M%S).sql"
railway run pg_dump > $BACKUP_FILE
gzip $BACKUP_FILE
echo "Backup created: ${BACKUP_FILE}.gz"
```

Run this weekly via cron or GitHub Actions.

**Option B: Use Railway's PostgreSQL Plugin Backups**

1. In Railway dashboard, click on PostgreSQL service
2. Go to "Backups" tab (if available in your plan)
3. Configure automated backups

---

## Complete Deployment Checklist

- [ ] Export local data using `export_data.sh`
- [ ] Create Railway account and project
- [ ] Add PostgreSQL database to Railway
- [ ] Note down database connection details
- [ ] Run `railway_complete_schema.sql` on Railway database
- [ ] Import your data export file
- [ ] Refresh materialized views
- [ ] Add backend service and configure environment variables
- [ ] Add frontend service and configure environment variables
- [ ] Update backend CORS settings
- [ ] Update frontend API URL
- [ ] Generate domains or add custom domains
- [ ] Test deployment thoroughly
- [ ] **Change default admin password immediately!**
- [ ] Set up automated database backups
- [ ] Monitor application logs

---

## Troubleshooting

### Backend won't start
- Check logs in Railway dashboard
- Verify DATABASE_URL is correctly set
- Ensure all required environment variables are set
- Check that gunicorn is in requirements.txt

### Frontend shows 404 or blank page
- Verify build completed successfully
- Check that serve is installed
- Verify REACT_APP_API_URL points to backend

### Database connection errors
- Verify DATABASE_URL format
- Check that PostgreSQL service is running
- Ensure database schema was applied

### CORS errors
- Update CORS_ORIGINS in backend config
- Ensure frontend domain is whitelisted

---

## Quick Reference Commands

### Export Local Data
```bash
cd /home/user/nukweb/database
./export_data.sh
```

### Connect to Railway Database
```bash
railway connect postgres
```

### Run SQL on Railway
```bash
railway run psql < your_file.sql
```

### View Backend Logs
```bash
railway logs --service=backend
```

### View Frontend Logs
```bash
railway logs --service=frontend
```

### Refresh Materialized View
```bash
railway run psql -c "REFRESH MATERIALIZED VIEW mv_book_availability;"
```

---

## Security Checklist

Post-deployment security tasks:

- [ ] Change admin password from default `admin123`
- [ ] Review and restrict CORS_ORIGINS
- [ ] Set strong SECRET_KEY and JWT_SECRET_KEY
- [ ] Enable HTTPS (Railway provides this by default)
- [ ] Review database user permissions
- [ ] Set up monitoring and alerts
- [ ] Configure rate limiting if needed

---

## Support and Resources

- **Railway Documentation**: https://docs.railway.app
- **Railway CLI**: https://docs.railway.app/develop/cli
- **Railway Community**: https://discord.gg/railway

---

## Cost Estimation

Railway pricing (as of 2025):
- **Hobby Plan**: $5/month + usage
  - PostgreSQL: ~$5-10/month depending on size
  - Backend service: ~$5-10/month
  - Frontend service: ~$5-10/month
- **Estimated Total**: $20-35/month for small to medium traffic

Monitor your usage in Railway dashboard to avoid surprises.

---

**Deployment prepared by:** Claude Code
**Date:** November 2025
**Version:** 1.0
