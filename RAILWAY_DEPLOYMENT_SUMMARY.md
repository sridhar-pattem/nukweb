# Railway Deployment Summary - Nuk Library System

**Date Completed**: November 23, 2025
**Platform**: Railway (https://railway.app)
**Domain**: mynuk.com
**Status**: ✅ Fully Operational

---

## Table of Contents

1. [Deployment Overview](#deployment-overview)
2. [Architecture](#architecture)
3. [Services Deployed](#services-deployed)
4. [Deployment Process](#deployment-process)
5. [Issues Encountered & Solutions](#issues-encountered--solutions)
6. [Configuration Reference](#configuration-reference)
7. [Maintenance & Monitoring](#maintenance--monitoring)
8. [Cost Analysis](#cost-analysis)
9. [Troubleshooting Guide](#troubleshooting-guide)

---

## Deployment Overview

Successfully deployed a complete library management system to Railway consisting of:
- **Backend API** (Flask/Python)
- **PostgreSQL Database** with full data migration
- **Public Website** (React) with custom domain
- **Admin Frontend** (React) for library staff

**Total Deployment Time**: ~8 hours (including troubleshooting)

---

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    USERS & ACCESS                           │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  Public Users/Patrons          Library Staff/Admin         │
│         ↓                              ↓                    │
│    mynuk.com                  library-admin-production      │
│  (Public Website)               .up.railway.app             │
│                                (Admin Frontend)             │
│         ↓                              ↓                    │
└─────────┼──────────────────────────────┼───────────────────┘
          │                              │
          └──────────────┬───────────────┘
                         ↓
          ┌──────────────────────────────┐
          │   Backend API (Flask)        │
          │  nukweb-production           │
          │    .up.railway.app           │
          └──────────────┬───────────────┘
                         ↓
          ┌──────────────────────────────┐
          │   PostgreSQL Database        │
          │   (Railway Managed)          │
          └──────────────────────────────┘
```

---

## Services Deployed

### 1. Backend Service
- **URL**: `https://nukweb-production.up.railway.app`
- **Root Directory**: `backend`
- **Runtime**: Python 3.11.7
- **Framework**: Flask 3.0.0
- **Server**: Gunicorn
- **Branch**: `main` (or `claude/deploy-railway-01GDbJwJ7SgWGvYysL5hHpfh`)

**Key Files**:
- `backend/requirements.txt` - Dependencies
- `backend/runtime.txt` - Python version
- `backend/Procfile` - Process definition
- `backend/railway.json` - Railway configuration

### 2. PostgreSQL Database
- **Type**: Railway Managed PostgreSQL
- **Connection**: Private network + public URL
- **Schema Source**: `database/railway_actual_schema.sql`
- **Data Source**: `database/data_export/nukweb_data_20251123_015044.sql`

**Tables**: 40+ tables including:
- Core: users, patrons, books, borrowings
- RDA Cataloging: items, contributors, manifestations
- CMS: blog posts, events, testimonials
- Website Admin: pages, sections, theme settings
- Invoicing: invoices, cowork spaces

### 3. Website Service (Public)
- **Custom Domain**: `https://mynuk.com`
- **Railway URL**: `https://nukweb-website-production.up.railway.app`
- **Root Directory**: `website`
- **Runtime**: Node.js
- **Framework**: React 18.2.0
- **Server**: serve (static file server)

**Key Files**:
- `website/package.json` - Dependencies (includes serve)
- `website/railway.json` - Railway configuration

### 4. Frontend Service (Admin)
- **URL**: `https://library-admin-production.up.railway.app`
- **Root Directory**: `frontend`
- **Runtime**: Node.js
- **Framework**: React 18.2.0
- **Server**: serve (static file server)
- **Access**: Library staff only (private URL)

**Key Files**:
- `frontend/package.json` - Dependencies (includes serve)
- `frontend/src/App.js` - Login logic (fixed hardcoded URLs)

---

## Deployment Process

### Phase 1: Backend Deployment

1. **Create Backend Service**
   - Connected GitHub repository
   - Set root directory: `backend`
   - Set branch: `main`

2. **Configure Environment Variables**
   ```
   DATABASE_URL = ${{Postgres.DATABASE_URL}}
   FLASK_ENV = production
   SECRET_KEY = <32-char-random-string>
   JWT_SECRET_KEY = <32-char-random-string>
   CORS_ORIGINS = https://mynuk.com,https://www.mynuk.com,https://nukweb-website-production.up.railway.app,https://library-admin-production.up.railway.app
   ```

3. **Created Configuration Files**
   - `backend/Procfile`: Process definition
   - `backend/runtime.txt`: Python version specification
   - `backend/railway.json`: Railway-specific config

4. **Deployment Success**
   - Nixpacks auto-detected Python
   - Installed dependencies from requirements.txt
   - Started with gunicorn

### Phase 2: Database Migration

1. **Added PostgreSQL Service**
   - Railway managed PostgreSQL instance
   - Automatic DATABASE_URL generation

2. **Schema Migration**
   ```bash
   # Exported local database schema
   pg_dump -h localhost -U postgres -d nukweb \
     --schema-only --no-owner --no-privileges \
     -f railway_actual_schema.sql

   # Deployed to Railway
   railway connect postgres < railway_actual_schema.sql
   ```

3. **Data Import**
   ```bash
   # Imported data export
   railway connect postgres < data_export/nukweb_data_20251123_015044.sql

   # Refreshed materialized views
   railway connect postgres -c "REFRESH MATERIALIZED VIEW mv_book_availability;"
   ```

4. **Verification**
   - Confirmed table counts matched local database
   - Tested key queries
   - Verified user authentication data

### Phase 3: Website Deployment

1. **Create Website Service**
   - Set root directory: `website`
   - Set branch: `main`

2. **Add serve Package**
   - Added `serve@14.2.1` to package.json
   - Regenerated package-lock.json
   - Committed changes

3. **Configure Environment Variables**
   ```
   REACT_APP_API_URL = https://nukweb-production.up.railway.app/api
   CI = false
   ```

4. **Generate Domain & Add Custom Domain**
   - Generated Railway domain
   - Added custom domain: `mynuk.com`
   - Updated DNS at Hostinger (ALIAS record)
   - SSL certificate auto-provisioned

### Phase 4: Frontend (Admin) Deployment

1. **Create Frontend Service**
   - Set root directory: `frontend`
   - Set branch: `main`

2. **Fix Dependencies**
   - Added `serve@14.2.5` to package.json
   - Updated package-lock.json

3. **Configure Environment Variables**
   ```
   REACT_APP_API_URL = https://nukweb-production.up.railway.app/api
   CI = false
   ```

4. **Generate Domain**
   - Generated Railway URL (keep private)

---

## Issues Encountered & Solutions

### Issue 1: "pip: command not found"
**Error**: Build failed with "pip: command not found"
**Cause**: Nix environment doesn't have pip in PATH
**Solution**: Created `nixpacks.toml` (later removed as it caused more issues)
**Final Fix**: Let Nixpacks auto-detect everything - removed all custom configs

### Issue 2: package.json and package-lock.json Out of Sync
**Error**: `npm ci` failing with "Missing: serve@14.2.5 from lock file"
**Cause**: Added serve to package.json manually without running npm install
**Solution**:
```bash
cd website  # or frontend
npm install  # Properly regenerate lock file
git add package-lock.json
git commit -m "Sync package-lock.json"
```

### Issue 3: Railway Caching Old Files
**Error**: Deployment using old package.json/railway.json despite new commits
**Cause**: Railway cached the old configuration
**Solution**:
- Disconnected and reconnected GitHub repo
- Switched branches temporarily
- Cleared build cache in Railway settings

### Issue 4: Database Schema Mismatch
**Error**: Multiple "column does not exist" errors during data import
- `column "phone" of relation "users" does not exist`
- `column "invoice_type" of relation "invoices" does not exist`

**Cause**: Used generic schema instead of actual database schema
**Solution**: Exported actual schema from local database
```bash
pg_dump -h localhost -U postgres -d nukweb \
  --schema-only --no-owner --no-privileges \
  -f railway_actual_schema.sql
```

### Issue 5: ESLint Warnings as Errors
**Error**: Build failed with "Failed to compile" due to ESLint warnings
**Cause**: Railway sets CI=true, making React Scripts treat warnings as errors
**Solution**: Added environment variable `CI=false`

### Issue 6: CORS Errors After Login
**Error**: `{"msg":"Signature verification failed"}`
**Cause**: Old JWT token signed with different secret key
**Solution**: Logout and login again to get new token with current JWT_SECRET_KEY

### Issue 7: Frontend Calling Localhost Instead of Railway Backend
**Error**: `Access to fetch at 'http://localhost:5001/api/auth/login' blocked by CORS`
**Causes**:
1. Proxy setting in package.json: `"proxy": "http://localhost:5001"`
2. Hardcoded URL in App.js: `fetch('http://localhost:5001/api/auth/login')`

**Solutions**:
1. Removed proxy setting from frontend/package.json
2. Fixed hardcoded URL in frontend/src/App.js:
```javascript
// Before
const response = await fetch('http://localhost:5001/api/auth/login', {

// After
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5001/api';
const response = await fetch(`${API_URL}/auth/login`, {
```

### Issue 8: DNS Configuration Confusion
**Error**: User confused about nameservers vs DNS records
**Cause**: Mixing up domain nameservers with DNS zone records
**Solution**:
- Keep Hostinger nameservers (ns1.hostinger.com, ns2.hostinger.com)
- Only update DNS zone records:
  - Type: ALIAS (auto-converted from CNAME)
  - Name: @
  - Points to: npb024mi.up.railway.app

### Issue 9: SSL Certificate "Not Secure" in Chrome
**Error**: Chrome showed "Not Secure" despite SSL working in Safari/Opera
**Cause**: Chrome cached the old insecure state
**Solution**:
- Clear Chrome SSL cache: `chrome://net-internals/#hsts`
- Delete domain security policies for mynuk.com
- Hard refresh: Ctrl+Shift+R

---

## Configuration Reference

### Environment Variables

#### Backend Service
```bash
DATABASE_URL=${{Postgres.DATABASE_URL}}
FLASK_ENV=production
SECRET_KEY=<generated-32-char-string>
JWT_SECRET_KEY=<generated-32-char-string>
CORS_ORIGINS=https://mynuk.com,https://www.mynuk.com,https://nukweb-website-production.up.railway.app,https://library-admin-production.up.railway.app
```

**To generate secure keys**:
```bash
python3 -c "import secrets; print(secrets.token_urlsafe(32))"
```

#### Website Service
```bash
REACT_APP_API_URL=https://nukweb-production.up.railway.app/api
CI=false
```

#### Frontend Service
```bash
REACT_APP_API_URL=https://nukweb-production.up.railway.app/api
CI=false
```

### DNS Configuration (Hostinger)

**Root Domain (@)**:
- Type: ALIAS (auto-converted from CNAME)
- Name: @
- Points to: npb024mi.up.railway.app
- TTL: 3600

**WWW Subdomain**:
- Type: CNAME
- Name: www
- Points to: npb024mi.up.railway.app
- TTL: 3600

### Build & Start Commands

#### Backend
```json
{
  "build": {
    "builder": "NIXPACKS"
  },
  "deploy": {
    "restartPolicyType": "ON_FAILURE",
    "restartPolicyMaxRetries": 10
  }
}
```
**Start Command**: Defined in Procfile
```
web: gunicorn -w 4 -b 0.0.0.0:$PORT run:app
```

#### Website & Frontend
```json
{
  "build": {
    "builder": "NIXPACKS",
    "buildCommand": "npm install && npm run build"
  },
  "deploy": {
    "startCommand": "npx serve -s build -l $PORT"
  }
}
```

---

## Maintenance & Monitoring

### Database Backups

**Manual Backup**:
```bash
# Using Railway CLI
railway connect postgres

# In psql
\! pg_dump > backup_$(date +%Y%m%d_%H%M%S).sql
```

**Recommended**: Set up automated backups using Railway's backup feature (if available in your plan) or create a scheduled GitHub Action.

### Monitoring Checklist

- [ ] Monitor Railway usage dashboard weekly
- [ ] Check backend logs for errors regularly
- [ ] Verify database connection is stable
- [ ] Monitor SSL certificate renewal (automatic via Railway)
- [ ] Check domain DNS configuration monthly
- [ ] Review user activity and system performance

### Updating the Application

**For Code Changes**:
1. Make changes locally
2. Test thoroughly
3. Commit and push to GitHub
4. Railway auto-deploys from connected branch

**For Environment Variable Changes**:
1. Update in Railway dashboard → Service → Variables
2. Service automatically redeploys

**For Database Schema Changes**:
```bash
# Create migration SQL file
# Apply to Railway database
railway connect postgres < migration.sql

# Or use Flask-Migrate if implemented
railway run flask db upgrade
```

### Log Access

**Backend Logs**:
1. Railway → Backend service → Deployments
2. Click on deployment → View logs
3. Or use Railway CLI: `railway logs`

**Frontend/Website Logs**:
- Check build logs in Railway dashboard
- Use browser DevTools for client-side errors

---

## Cost Analysis

### Monthly Costs (Estimated)

| Service | Cost |
|---------|------|
| PostgreSQL Database | $5-10 |
| Backend Service | $5-10 |
| Website Service | $5-10 |
| Frontend Service | $5-10 |
| **Total Railway** | **$20-40/month** |

**Additional Costs**:
- Domain (mynuk.com): ~$10-15/year at Hostinger

### Cost Optimization Tips

1. **Monitor Resource Usage**: Check Railway dashboard for actual usage
2. **Scale Down if Needed**: Reduce worker count if traffic is low
3. **Database Size**: Monitor database growth, optimize queries
4. **Consolidate Services**: Consider if website and frontend can share a service (not recommended for security)

### Free Tier Limits

Railway offers a free trial with credits. After trial:
- Usage-based pricing
- $5/month hobby plan + usage fees
- Monitor to avoid unexpected charges

---

## Troubleshooting Guide

### Common Issues & Quick Fixes

#### 1. "502 Bad Gateway" on Website
**Possible Causes**:
- Backend service is down
- Database connection failed
- CORS misconfiguration

**Solutions**:
```bash
# Check backend logs
railway logs --service=backend

# Verify DATABASE_URL is set
# Check CORS_ORIGINS includes your domain
```

#### 2. Login Not Working
**Check**:
- Is REACT_APP_API_URL set correctly?
- Is CORS_ORIGINS in backend configured?
- Check browser console for errors
- Verify JWT_SECRET_KEY hasn't changed

**Fix**:
- Clear localStorage: `localStorage.clear()`
- Check backend logs for authentication errors

#### 3. Database Connection Issues
**Symptoms**: 500 errors, "psycopg2 connection failed"

**Solutions**:
```bash
# Test database connection
railway connect postgres -c "SELECT 1;"

# Verify DATABASE_URL
railway run env | grep DATABASE_URL
```

#### 4. Build Failures
**Common Causes**:
- package-lock.json out of sync
- Missing dependencies
- ESLint errors (when CI=true)

**Solutions**:
```bash
# Regenerate lock file
npm install
git add package-lock.json
git commit -m "Update lock file"

# Set CI=false in Railway
```

#### 5. CORS Errors
**Error**: "blocked by CORS policy"

**Check**:
1. Backend CORS_ORIGINS includes the requesting domain
2. Frontend REACT_APP_API_URL is correct
3. No hardcoded localhost URLs in code

**Fix**:
```bash
# Update CORS_ORIGINS in backend service
CORS_ORIGINS=https://mynuk.com,https://frontend-url.railway.app
```

#### 6. SSL Certificate Issues
**Symptoms**: "Not Secure" warning

**Solutions**:
- Wait 5-15 minutes for certificate provisioning
- Check Railway domain settings for SSL status
- Clear browser cache
- Clear Chrome SSL state: `chrome://net-internals/#hsts`

---

## Security Best Practices

### Implemented

✅ **HTTPS Everywhere**: All services use SSL/TLS
✅ **Environment Variables**: Secrets stored securely in Railway
✅ **CORS Restrictions**: Backend only allows specific origins
✅ **JWT Authentication**: Token-based auth for API access
✅ **Private Admin URL**: Frontend not exposed publicly

### Recommended Actions

- [ ] Change default admin password (`admin123`)
- [ ] Enforce strong password policy for all users
- [ ] Regularly update dependencies (`npm audit`, `pip check`)
- [ ] Monitor for security vulnerabilities
- [ ] Implement rate limiting on login endpoints
- [ ] Set up database backup automation
- [ ] Review and audit user permissions quarterly

---

## Important Files Reference

### Configuration Files
```
/backend/
  ├── railway.json         # Railway config
  ├── Procfile            # Process definition
  ├── runtime.txt         # Python version
  └── requirements.txt    # Python dependencies

/website/
  ├── railway.json        # Railway config
  ├── package.json        # Node dependencies (includes serve)
  └── package-lock.json   # Dependency lock file

/frontend/
  ├── package.json        # Node dependencies (includes serve)
  ├── package-lock.json   # Dependency lock file
  └── src/App.js          # Fixed hardcoded URLs

/database/
  ├── railway_actual_schema.sql    # Database schema (exported from local)
  ├── export_data.sh               # Data export script
  └── data_export/
      └── nukweb_data_20251123_015044.sql  # Data dump
```

### Key Code Locations

**Backend**:
- Routes: `backend/app/routes/`
- Database: `backend/app/utils/database.py`
- Config: `backend/app/config.py`
- Auth: `backend/app/routes/auth.py`

**Frontend API Configuration**:
- Website: `website/src/services/api.js`
- Frontend: `frontend/src/services/api.js`
- Frontend Login: `frontend/src/App.js` (line 69)

---

## Contact & Support

### Railway Support
- Documentation: https://docs.railway.app
- Discord: https://discord.gg/railway
- Status: https://status.railway.app

### Domain Management
- Hostinger: https://hpanel.hostinger.com

### Repository
- GitHub: https://github.com/sridhar-pattem/nukweb
- Branch: `main` or `claude/deploy-railway-01GDbJwJ7SgWGvYysL5hHpfh`

---

## Lessons Learned

### What Worked Well
1. **Auto-detection**: Letting Nixpacks auto-detect worked better than custom configs
2. **Actual Schema Export**: Using pg_dump from local DB prevented schema mismatches
3. **Separate Services**: Clear separation between public website and admin frontend
4. **Environment Variables**: Railway's variable management is straightforward

### What Was Challenging
1. **Multiple localhost references**: Proxy settings and hardcoded URLs required careful hunting
2. **npm ci strictness**: Required exact package-lock.json sync
3. **Railway caching**: Sometimes needed to disconnect/reconnect repo
4. **CORS configuration**: Required multiple URLs in CORS_ORIGINS

### Key Takeaways
- Always use environment variables, never hardcode URLs
- Test in incognito window to avoid browser cache issues
- Check actual response bodies in Network tab for debugging
- Export actual database schema rather than relying on manually created schemas
- Remove development proxy settings before production deployment

---

## Appendix: Useful Commands

### Railway CLI
```bash
# Install
npm install -g @railway/cli

# Login
railway login

# Link project
railway link

# Connect to database
railway connect postgres

# Run command in Railway context
railway run <command>

# View logs
railway logs
railway logs --service=backend

# Deploy
railway up
```

### Database Operations
```bash
# Export local schema
pg_dump -h localhost -U postgres -d nukweb \
  --schema-only --no-owner --no-privileges \
  -f railway_actual_schema.sql

# Export data only
pg_dump -h localhost -U postgres -d nukweb \
  --data-only --column-inserts \
  -f data_export.sql

# Connect and run SQL
railway connect postgres < schema.sql

# Run single command
railway connect postgres -c "SELECT COUNT(*) FROM users;"

# Refresh materialized view
railway connect postgres -c "REFRESH MATERIALIZED VIEW mv_book_availability;"
```

### Git Operations
```bash
# Check what will be deployed
git log origin/main..HEAD

# View current branch
git branch

# Push to Railway-connected branch
git push origin main

# Create new branch for Railway
git checkout -b claude/new-feature-<session-id>
```

### Testing
```bash
# Test backend health
curl https://nukweb-production.up.railway.app/health

# Test API endpoint
curl https://nukweb-production.up.railway.app/api/admin/dashboard/stats \
  -H "Authorization: Bearer <token>"

# Check DNS propagation
nslookup mynuk.com
dig mynuk.com

# Online DNS checker
# Visit: https://dnschecker.org
```

---

**Document Version**: 1.0
**Last Updated**: November 23, 2025
**Deployment Status**: ✅ Production Ready
