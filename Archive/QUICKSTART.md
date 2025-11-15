# Quick Start Guide - Nuk Library

## Local Development (5 minutes)

### 1. Setup Database
```bash
# Install PostgreSQL (if not installed)
# macOS: brew install postgresql
# Ubuntu: sudo apt install postgresql

# Create database
createdb nuk_library

# Run schema
psql -d nuk_library -f database/schema.sql
```

### 2. Start Backend
```bash
cd backend
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env
# Edit .env with your database URL
python run.py
```

Backend runs on http://localhost:5000

### 3. Start Frontend
```bash
cd frontend
npm install
npm start
```

Frontend runs on http://localhost:3000

### 4. Login
- Admin: admin@nuklibrary.com / admin123
- Create patrons through admin panel (default password: BookNook313)

## Deploy to Railway (10 minutes)

### Option 1: Using Railway CLI (Recommended)

```bash
# Install Railway CLI
npm install -g @railway/cli

# Login
railway login

# Initialize project
railway init

# Link to new project
railway link

# Add PostgreSQL
railway add

# Set environment variables
railway variables set JWT_SECRET_KEY="your-secret-key"
railway variables set SECRET_KEY="your-flask-secret"

# Deploy backend
cd backend
railway up

# Deploy frontend (separate service)
cd ../frontend
railway up
```

### Option 2: Using GitHub Integration

1. **Push to GitHub**
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin your-repo-url
   git push -u origin main
   ```

2. **Create Railway Project**
   - Go to railway.app
   - New Project → Deploy from GitHub
   - Select your repository

3. **Add Database**
   - New → Database → PostgreSQL
   - Wait for provisioning

4. **Configure Services**
   
   **Backend Service:**
   - Root Directory: `/backend`
   - Start Command: `gunicorn -w 4 -b 0.0.0.0:$PORT run:app`
   - Environment Variables:
     ```
     DATABASE_URL=${{Postgres.DATABASE_URL}}
     JWT_SECRET_KEY=random-secret-key-here
     SECRET_KEY=another-random-key
     PORT=5000
     ```

   **Frontend Service:**
   - Root Directory: `/frontend`
   - Build Command: `npm run build`
   - Start Command: `npx serve -s build -l $PORT`
   - Environment Variables:
     ```
     REACT_APP_API_URL=https://your-backend.railway.app/api
     ```

5. **Initialize Database**
   - Get database connection string from Railway
   - Run: `psql "connection-string" -f database/schema.sql`

6. **Done!** Your app is live

## Deploy Frontend to Vercel (Alternative)

If you want to use Vercel for frontend (free tier):

```bash
cd frontend
npm install -g vercel
vercel

# Set environment variable in Vercel dashboard:
REACT_APP_API_URL=https://your-backend.railway.app/api
```

## Troubleshooting

### Database connection fails
- Check DATABASE_URL format: `postgresql://user:pass@host:port/dbname`
- Ensure PostgreSQL is running
- Check firewall rules if using remote database

### CORS errors
- Verify REACT_APP_API_URL in frontend .env
- Check backend CORS configuration allows your frontend URL

### Books not fetching from ISBN
- Open Library API might be slow/down
- Check network connectivity
- Try again after a few seconds

### Email not sending
- Configure SMTP settings in backend .env
- For Gmail, use App Password, not regular password
- Enable "Less secure app access" if needed

## Environment Variables Reference

### Backend (.env)
```env
DATABASE_URL=postgresql://user:password@localhost:5432/nuk_library
JWT_SECRET_KEY=your-jwt-secret-minimum-32-characters
SECRET_KEY=your-flask-secret-minimum-32-characters
MAIL_SERVER=smtp.gmail.com
MAIL_PORT=587
MAIL_USERNAME=your-email@gmail.com
MAIL_PASSWORD=your-app-password
PORT=5000
```

### Frontend (.env)
```env
REACT_APP_API_URL=http://localhost:5000/api
```

## Next Steps

1. **Change admin password** immediately after first login
2. **Add membership plans** through admin panel
3. **Create initial patrons** with their subscriptions
4. **Add books** using ISBN lookup or manual entry
5. **Configure email** for invoice sending
6. **Set up social media** links in admin panel

## Cost Estimate

- **Railway (Backend + DB)**: $5/month
- **Vercel (Frontend)**: Free
- **Total**: $5/month

Or keep everything on Railway for ~$10/month (2 services + DB)

## Support

- Documentation: See README.md
- Issues: Create GitHub issue
- Email: info@nuklibrary.com
