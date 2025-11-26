# Production Deployment Checklist - Nuk Library

## 🚨 Critical Issues Found & Fixes Required

### 1. **CORS Configuration - FIXED ✅**

**Previous Issue:** CORS was hardcoded to allow ALL origins (`origins="*"`).

**Status:** **FIXED** - Now uses `Config.CORS_ORIGINS` from environment variable.

**Railway Configuration Required:**
```bash
# In Railway backend service, set environment variable:
CORS_ORIGINS=https://yourdomain.com,https://www.yourdomain.com,https://admin.yourdomain.com
```

**Note:** Multiple origins should be comma-separated. The code will automatically split them:
```python
# config.py line 39
CORS_ORIGINS = os.getenv('CORS_ORIGINS', 'https://localhost:3001').split(',')
```

**For local development:**
```bash
# .env
CORS_ORIGINS=http://localhost:3000,http://localhost:3001
```

---

### 2. **Database Materialized View - CRITICAL**

**Issue:** `mv_book_availability` materialized view is NOT populated on initial deployment.

**Impact:** All book listing endpoints will fail with 500 error until view is refreshed.

**Fix Required - Add to migration/setup script:**
```sql
-- After creating the materialized view
CREATE MATERIALIZED VIEW mv_book_availability AS ...

-- CRITICAL: Add initial refresh
REFRESH MATERIALIZED VIEW mv_book_availability;
```

**Post-Deployment Task:**
```bash
# SSH into production server
psql -d nuk_library -c "REFRESH MATERIALIZED VIEW mv_book_availability;"
```

---

### 3. **PostgreSQL Vector Extension - REQUIRED**

**Issue:** Semantic search requires `pgvector` extension which must be installed on production database.

**Check if installed:**
```sql
SELECT * FROM pg_extension WHERE extname = 'vector';
```

**Install on production:**
```sql
CREATE EXTENSION IF NOT EXISTS vector;
```

**Version Required:** `vector >= 0.5.0`

**Migration Script Required:**
```sql
-- Add to database setup
CREATE EXTENSION IF NOT EXISTS vector;

CREATE TABLE book_embeddings (
    book_id INTEGER PRIMARY KEY REFERENCES books(book_id) ON DELETE CASCADE,
    embedding vector(384) NOT NULL,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX ON book_embeddings USING ivfflat (embedding vector_cosine_ops) WITH (lists = 100);
```

---

### 4. **Environment Variables - Configuration Required**

#### **Backend (.env)**

**Critical Variables:**
```bash
# Database
DATABASE_URL=postgresql://username:password@prod-host:5432/nuk_library

# Security Keys - MUST GENERATE NEW ONES
JWT_SECRET_KEY=<generate-random-64-char-string>
SECRET_KEY=<generate-random-64-char-string>

# CORS - Your production domains
CORS_ORIGINS=https://yourdomain.com,https://www.yourdomain.com

# Flask Environment
FLASK_ENV=production  # ⚠️ MUST be 'production'
PORT=5001

# File Upload
UPLOAD_FOLDER=/var/app/uploads  # Ensure this directory exists and has write permissions

# API Keys (Optional but recommended)
ISBNDB_API_KEY=your_production_key
```

**Security Key Generation:**
```bash
# Generate JWT_SECRET_KEY
python3 -c "import secrets; print(secrets.token_urlsafe(48))"

# Generate SECRET_KEY
python3 -c "import secrets; print(secrets.token_urlsafe(48))"
```

#### **Frontend (.env.production)**
```bash
REACT_APP_API_URL=https://api.yourdomain.com/api
```

#### **Website (.env.production)**
```bash
REACT_APP_API_URL=https://api.yourdomain.com/api
REACT_APP_GOOGLE_MAPS_API_KEY=your_key
REACT_APP_GOOGLE_ANALYTICS_ID=your_id
```

---

### 5. **Database Connection & Pooling**

**Current Issue:** No connection pooling configured.

**Recommended Fix:**

**Install pgbouncer or use SQLAlchemy pooling:**
```python
# backend/app/utils/database.py
from sqlalchemy import create_engine, pool

engine = create_engine(
    Config.DATABASE_URL,
    poolclass=pool.QueuePool,
    pool_size=10,
    max_overflow=20,
    pool_pre_ping=True  # Verify connections before use
)
```

---

### 6. **Hardcoded API URLs - Fix Required**

**Issue:** Some components have hardcoded `localhost:5001` URLs.

**Locations Found:**
- `frontend/src/App.js:69`
- `frontend/src/services/api.js:3`
- `website/src/services/api.js:4`
- `website/src/components/pages/Catalogue.js:15`
- `website/src/components/widgets/Chatbot.js:19`
- `website/src/components/admin/BannerImageManager.js:11`
- `website/src/components/pages/Home.js:12`

**All use fallback pattern:**
```javascript
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5001/api';
```

**✅ Good:** Uses environment variable
**⚠️ Warning:** Ensure `REACT_APP_API_URL` is set in production build

---

### 7. **Sensitive Data in .env File - SECURITY RISK**

**Current .env contains:**
- Database credentials: `EQawah13`
- API Keys: OPENAI_API_KEY, ANTHROPIC_API_KEY
- ISBNDB API Key

**Actions Required:**

1. **NEVER commit production `.env` to git**
   ```bash
   # Verify .env is in .gitignore
   echo ".env" >> .gitignore
   echo "backend/.env" >> .gitignore
   echo "website/.env" >> .gitignore
   echo "frontend/.env" >> .gitignore
   ```

2. **Rotate all secrets before production:**
   - Generate new database password
   - Generate new JWT keys
   - Use separate production API keys

3. **Use secrets management:**
   - AWS Secrets Manager
   - HashiCorp Vault
   - Or platform-specific (Heroku Config Vars, Railway Variables, etc.)

---

## 📋 Pre-Deployment Checklist

### Database Preparation

- [ ] **Backup existing data** (if migrating)
- [ ] **Install PostgreSQL vector extension** on production DB
  ```sql
  CREATE EXTENSION IF NOT EXISTS vector;
  ```
- [ ] **Run clean_setup.sql** or migration scripts
- [ ] **Verify materialized view created:**
  ```sql
  \d mv_book_availability
  ```
- [ ] **Refresh materialized view:**
  ```sql
  REFRESH MATERIALIZED VIEW mv_book_availability;
  ```
- [ ] **Verify embeddings table exists:**
  ```sql
  \d book_embeddings
  ```
- [ ] **Create indexes on large tables** (if not in migration):
  ```sql
  CREATE INDEX idx_books_is_active ON books(is_active);
  CREATE INDEX idx_items_circulation_status ON items(circulation_status);
  CREATE INDEX idx_borrowings_status ON borrowings(status);
  ```

### Backend Configuration

- [ ] **Generate new production secrets:**
  - [ ] New JWT_SECRET_KEY
  - [ ] New SECRET_KEY
  - [ ] New database password
- [ ] **Update CORS_ORIGINS** to production domains only
- [ ] **Fix CORS configuration** in `app/__init__.py`
- [ ] **Set FLASK_ENV=production**
- [ ] **Configure UPLOAD_FOLDER** with proper permissions
- [ ] **Test database connection** with production credentials
- [ ] **Install Python dependencies:**
  ```bash
  pip install -r requirements.txt
  ```
- [ ] **Verify sentence-transformers model downloads** (one-time ~400MB download)

### Frontend Configuration

- [ ] **Set REACT_APP_API_URL** to production backend URL
- [ ] **Build production bundle:**
  ```bash
  cd frontend && npm run build
  ```
- [ ] **Test build output** in `frontend/build/`
- [ ] **Configure web server** (nginx/apache) to serve build files

### Website Configuration

- [ ] **Set REACT_APP_API_URL** to production backend URL
- [ ] **Add Google Maps API key** (if using)
- [ ] **Add Google Analytics ID** (if using)
- [ ] **Build production bundle:**
  ```bash
  cd website && npm run build
  ```
- [ ] **Test build output** in `website/build/`

### Security Hardening

- [ ] **Review all CORS origins** - remove wildcards
- [ ] **Enable HTTPS only** - no HTTP in production
- [ ] **Set secure cookie flags** if using sessions
- [ ] **Rate limiting** on API endpoints (use Flask-Limiter)
- [ ] **SQL injection review** - verify all parameterized queries
- [ ] **XSS protection** - verify React escapes user input
- [ ] **Remove debug endpoints/prints** from production code
- [ ] **Disable Flask debug mode** (`app.debug = False`)

### Testing Before Launch

- [ ] **Test login flow** (admin & patron)
- [ ] **Test book browsing** with materialized view
- [ ] **Test semantic search** (verify embeddings exist)
- [ ] **Test keyword search**
- [ ] **Test checkout/return flow**
- [ ] **Test patron management**
- [ ] **Test responsive design** on mobile
- [ ] **Load test critical endpoints** (e.g., book listing)
- [ ] **Verify CORS works** from production frontend domain

---

## 🔧 Production Deployment Steps

### Option 1: Traditional Server Deployment

1. **Provision Server:**
   - Ubuntu 20.04+ or similar
   - PostgreSQL 14+ with pgvector
   - Python 3.10+
   - Node.js 18+

2. **Database Setup:**
   ```bash
   # Install PostgreSQL and pgvector
   sudo apt-get install postgresql postgresql-contrib
   sudo apt-get install postgresql-14-pgvector

   # Create database
   sudo -u postgres createdb nuk_library
   sudo -u postgres psql nuk_library -c "CREATE EXTENSION vector;"

   # Run migration
   psql -d nuk_library -f database/clean_setup.sql
   psql -d nuk_library -c "REFRESH MATERIALIZED VIEW mv_book_availability;"
   ```

3. **Backend Setup:**
   ```bash
   cd backend
   python3 -m venv venv
   source venv/bin/activate
   pip install -r requirements.txt

   # Configure .env with production values
   # Run with gunicorn
   gunicorn -w 4 -b 0.0.0.0:5001 "app:create_app()"
   ```

4. **Frontend/Website Build:**
   ```bash
   # Frontend
   cd frontend
   npm install
   REACT_APP_API_URL=https://api.yourdomain.com/api npm run build

   # Website
   cd ../website
   npm install
   REACT_APP_API_URL=https://api.yourdomain.com/api npm run build
   ```

5. **Nginx Configuration:**
   ```nginx
   # Backend API
   server {
       listen 443 ssl;
       server_name api.yourdomain.com;

       location / {
           proxy_pass http://127.0.0.1:5001;
           proxy_set_header Host $host;
           proxy_set_header X-Real-IP $remote_addr;
       }
   }

   # Website
   server {
       listen 443 ssl;
       server_name yourdomain.com www.yourdomain.com;
       root /var/www/nuk-library/website/build;

       location / {
           try_files $uri /index.html;
       }
   }
   ```

### Option 2: Docker Deployment

**Create Dockerfile for backend:**
```dockerfile
FROM python:3.10-slim

WORKDIR /app
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

CMD ["gunicorn", "-w", "4", "-b", "0.0.0.0:5001", "app:create_app()"]
```

**Docker Compose:**
```yaml
version: '3.8'
services:
  db:
    image: ankane/pgvector:latest
    environment:
      POSTGRES_DB: nuk_library
      POSTGRES_USER: user
      POSTGRES_PASSWORD: ${DB_PASSWORD}
    volumes:
      - pgdata:/var/lib/postgresql/data

  backend:
    build: ./backend
    environment:
      DATABASE_URL: postgresql://user:${DB_PASSWORD}@db:5432/nuk_library
      JWT_SECRET_KEY: ${JWT_SECRET_KEY}
      SECRET_KEY: ${SECRET_KEY}
      CORS_ORIGINS: ${CORS_ORIGINS}
    depends_on:
      - db
    ports:
      - "5001:5001"

volumes:
  pgdata:
```

---

## 🚀 Post-Deployment Tasks

### Immediate After Launch

1. **Refresh materialized view:**
   ```sql
   REFRESH MATERIALIZED VIEW mv_book_availability;
   ```

2. **Generate book embeddings** for semantic search:
   ```python
   from app.utils.semantic_search import backfill_missing_embeddings
   backfill_missing_embeddings(batch_size=200)
   ```

3. **Verify all endpoints:**
   ```bash
   curl https://api.yourdomain.com/health
   curl https://api.yourdomain.com/api/patron/books/new-arrivals
   ```

4. **Monitor logs** for errors:
   ```bash
   tail -f /var/log/nuk-library/error.log
   ```

### Ongoing Maintenance

- **Daily:** Monitor error logs
- **Weekly:** `REFRESH MATERIALIZED VIEW mv_book_availability;`
- **Monthly:** Database backup and cleanup
- **As needed:** Regenerate book embeddings when adding new books

---

## 📊 Performance Recommendations

1. **Add database indexes** (if missing):
   ```sql
   CREATE INDEX CONCURRENTLY idx_books_active_title ON books(is_active, title) WHERE is_active = TRUE;
   CREATE INDEX CONCURRENTLY idx_items_book_status ON items(book_id, circulation_status);
   ```

2. **Enable query caching** in Flask
3. **Use CDN** for static assets (React builds)
4. **Implement Redis caching** for frequent queries
5. **Set up automatic materialized view refresh**:
   ```sql
   -- Create a cron job or pg_cron extension
   SELECT cron.schedule('refresh-mv', '0 */6 * * *',
       'REFRESH MATERIALIZED VIEW CONCURRENTLY mv_book_availability;');
   ```

---

## ⚠️ Known Issues & Limitations

1. **Sentence Transformer Model:**
   - First request will be slow (~30s) as model loads
   - Consider warming up on server start

2. **Materialized View Staleness:**
   - View is only refreshed when items change
   - Manual refresh needed if data seems stale

3. **CORS Configuration:**
   - Currently allows all origins (`*`) - MUST fix before production

4. **No Rate Limiting:**
   - Recommend adding Flask-Limiter for API protection

---

## 🆘 Troubleshooting

### "Materialized view not populated" Error
```sql
REFRESH MATERIALIZED VIEW mv_book_availability;
```

### "operator does not exist: vector <-> numeric[]"
- Vector extension not installed or semantic_search.py not using `::vector(384)` cast

### CORS Errors
- Check `CORS_ORIGINS` environment variable
- Verify frontend is using correct `REACT_APP_API_URL`

### Semantic Search Returns Empty
- Check embeddings exist: `SELECT COUNT(*) FROM book_embeddings;`
- Run backfill: `python -c "from app.utils.semantic_search import backfill_missing_embeddings; backfill_missing_embeddings()"`

---

## 📞 Support Checklist

Before deploying, ensure you have:
- [ ] Database backup strategy
- [ ] Monitoring/alerting setup
- [ ] Log aggregation
- [ ] Rollback plan
- [ ] Emergency contacts
- [ ] Documentation for your team

---

**Last Updated:** November 27, 2025
**Version:** 1.0
**Review Required Before:** Every deployment
