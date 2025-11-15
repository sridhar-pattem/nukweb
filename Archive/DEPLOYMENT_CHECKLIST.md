# Deployment Checklist - Nuk Library

Use this checklist to ensure a smooth deployment process.

## Pre-Deployment Checklist

### Code Review
- [ ] Review all backend routes for security
- [ ] Check frontend API endpoints match backend
- [ ] Verify error handling is in place
- [ ] Test password hashing and JWT implementation
- [ ] Review database schema for any issues

### Local Testing
- [ ] Backend runs without errors (`python run.py`)
- [ ] Frontend builds successfully (`npm start`)
- [ ] Can login as admin (admin@nuklibrary.com / admin123)
- [ ] Can create a new patron
- [ ] Can add a book using ISBN lookup
- [ ] Can issue and return a book
- [ ] Can write a review as patron
- [ ] Database triggers work (available_copies update)

### Environment Setup
- [ ] Create `.env` file from `.env.example`
- [ ] Set strong JWT_SECRET_KEY (min 32 characters)
- [ ] Set strong SECRET_KEY (min 32 characters)
- [ ] Configure database URL
- [ ] Set email credentials (if using email features)

## Railway Deployment Checklist

### Account Setup
- [ ] Created Railway account at railway.app
- [ ] Connected GitHub account
- [ ] Created new project

### Database Setup
- [ ] Added PostgreSQL service to project
- [ ] Database is provisioning/ready
- [ ] Noted down database connection string
- [ ] Run database schema: `psql <connection-url> -f database/schema.sql`
- [ ] Verified tables are created (check in Railway dashboard)
- [ ] Verified default admin user exists

### Backend Service
- [ ] Created backend service from GitHub repo
- [ ] Set root directory to `/backend`
- [ ] Set start command: `gunicorn -w 4 -b 0.0.0.0:$PORT run:app`
- [ ] Added environment variables:
  - [ ] DATABASE_URL (use ${{Postgres.DATABASE_URL}})
  - [ ] JWT_SECRET_KEY
  - [ ] SECRET_KEY
  - [ ] PORT (set to 5000 or use Railway default)
  - [ ] MAIL_SERVER (if using email)
  - [ ] MAIL_USERNAME (if using email)
  - [ ] MAIL_PASSWORD (if using email)
- [ ] Deployment successful
- [ ] Backend URL is accessible
- [ ] Test: Visit `https://your-backend.railway.app/health`
- [ ] Response should be: `{"status": "healthy"}`

### Frontend Service
- [ ] Created frontend service from GitHub repo
- [ ] Set root directory to `/frontend`
- [ ] Set build command: `npm run build`
- [ ] Set start command: `npx serve -s build -l $PORT`
- [ ] Added environment variable:
  - [ ] REACT_APP_API_URL (https://your-backend.railway.app/api)
- [ ] Deployment successful
- [ ] Frontend URL is accessible
- [ ] Can access login page

### Initial Configuration
- [ ] Login to admin panel works
- [ ] Changed default admin password
- [ ] Created first membership plan
- [ ] Created first test patron
- [ ] Added first book via ISBN
- [ ] Tested book borrowing flow
- [ ] Tested patron login

## Post-Deployment Checklist

### Security
- [ ] Changed admin password from default
- [ ] All environment variables are set securely
- [ ] No sensitive data in git repository
- [ ] CORS is properly configured
- [ ] HTTPS is working (Railway auto-configures)

### Functionality Testing
- [ ] Login works for both admin and patron
- [ ] Password change works
- [ ] Patron management (CRUD) works
- [ ] Book management (CRUD) works
- [ ] ISBN lookup works
- [ ] Book borrowing/returning works
- [ ] Book renewals work (max 2 times)
- [ ] Reviews and ratings work
- [ ] Recommendations appear for patrons
- [ ] Cowork booking requests work
- [ ] Pagination works on all list pages
- [ ] Search functionality works

### Performance
- [ ] Pages load in under 3 seconds
- [ ] API responses are fast (<500ms)
- [ ] No console errors in browser
- [ ] Database queries are efficient
- [ ] Images load properly

### Data
- [ ] Database has default age ratings
- [ ] Admin user exists and is functional
- [ ] Sample data added for testing
- [ ] No dummy/test data in production

### Documentation
- [ ] README.md is accessible
- [ ] QUICKSTART.md is up to date
- [ ] API documentation is correct
- [ ] Environment variables documented

## Maintenance Checklist

### Daily
- [ ] Check for any errors in Railway logs
- [ ] Monitor database size

### Weekly
- [ ] Review overdue borrowings
- [ ] Check cowork booking requests
- [ ] Monitor user registrations

### Monthly
- [ ] Database backup
- [ ] Review and renew memberships
- [ ] Update any dependencies
- [ ] Check for security updates

## Rollback Plan

If deployment fails:

1. **Check Railway logs** for errors
   - Go to service → Deployments → View logs
   
2. **Common issues:**
   - Database connection: Check DATABASE_URL
   - Module not found: Check requirements.txt/package.json
   - Port binding: Ensure using $PORT variable
   - CORS errors: Check CORS configuration

3. **Quick rollback:**
   ```bash
   # In Railway dashboard
   Deployments → Previous deployment → Redeploy
   ```

4. **Local testing:**
   ```bash
   # Test backend
   cd backend
   python run.py
   
   # Test frontend
   cd frontend
   npm start
   ```

## Support Contacts

- **Railway Support**: railway.app/help
- **Database Issues**: Check Railway PostgreSQL logs
- **Code Issues**: Review GitHub repository
- **Email Setup**: Check SMTP provider documentation

## Success Criteria

Deployment is successful when:
- [ ] Admin can login and manage patrons
- [ ] Admin can add books and manage borrowings
- [ ] Patrons can login and browse books
- [ ] Patrons can write reviews
- [ ] Patrons receive recommendations
- [ ] All CRUD operations work
- [ ] No errors in production logs
- [ ] Database is accessible
- [ ] Performance is acceptable

## Cost Monitoring

- [ ] Railway dashboard shows current usage
- [ ] Monthly cost is within budget ($5-10)
- [ ] Database storage is monitored
- [ ] Set up usage alerts if needed

---

## Quick Command Reference

### Railway CLI Commands
```bash
railway login
railway init
railway link
railway up
railway logs
railway variables set KEY=value
railway open
```

### Database Commands
```bash
# Connect to Railway database
railway run psql

# Run schema
psql <connection-url> -f database/schema.sql

# Backup
pg_dump -d nuk_library > backup.sql

# Restore
psql -d nuk_library < backup.sql
```

### Git Commands
```bash
git add .
git commit -m "Deploy to production"
git push origin main
```

---

**Last Updated**: Implementation Complete
**Status**: Ready for Deployment ✅
