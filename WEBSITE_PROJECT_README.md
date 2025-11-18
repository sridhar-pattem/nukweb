# Nuk Library Website Project

## Overview

This project integrates a public-facing website with the existing Library Management System (LMS) while maintaining clear code separation for easy future extraction.

---

## 📚 Documentation Index

### Primary Documents (Read in Order)

1. **[NUK_WEBSITE_ARCHITECTURE.md](./NUK_WEBSITE_ARCHITECTURE.md)** - Complete architecture design
   - Directory structure
   - Website design (colors, typography, sections)
   - Chatbot architecture
   - Integration points
   - Deployment strategy
   - Technology stack

2. **[WEBSITE_IMPLEMENTATION_GUIDE.md](./WEBSITE_IMPLEMENTATION_GUIDE.md)** - Step-by-step implementation
   - Quick start instructions
   - Sample code for all major components
   - Backend API implementations
   - Development workflow

3. **[CHATBOT_QUERY_REFERENCE.md](./CHATBOT_QUERY_REFERENCE.md)** - Chatbot capabilities
   - Supported queries
   - Response patterns
   - Testing scenarios
   - Future enhancements

---

## 🎯 Project Goals

### Primary Objectives

1. **Public Website**: Marketing and content site for mynuk.com
2. **Member Portal**: Integrated access to library management features
3. **Chatbot**: AI assistant for facility, membership, and catalogue queries
4. **Booking System**: Cowork and study space reservations
5. **Community Features**: Reviews, ratings, and blog platform

### Key Requirements

✅ **Clear Code Separation**: Website and LMS in separate directories
✅ **Shared Backend**: Single Flask API serving both frontends
✅ **Chatbot Accessibility**: Available to anonymous, patron, and admin users
✅ **Mobile Responsive**: Works on all devices
✅ **SEO Optimized**: Next.js for server-side rendering
✅ **Easy Deployment**: Independent deployment of each component

---

## 📁 Project Structure

```
nukweb/
├── backend/              # Shared Flask API
├── lms-frontend/         # Admin & Patron Portal (React)
├── website/              # Public Website (Next.js)
├── shared/               # Shared components (chatbot)
├── database/             # Database schemas
└── docs/                 # Documentation
```

---

## 🚀 Quick Start

### Prerequisites

- Python 3.9+
- Node.js 18+
- PostgreSQL 14+
- npm or yarn

### Initial Setup

```bash
# 1. Restructure the project
mv frontend lms-frontend

# 2. Create new directories
mkdir -p website shared/chatbot shared/assets

# 3. Initialize Next.js website
cd website
npx create-next-app@latest . --typescript --tailwind --app

# 4. Install dependencies
cd ../backend && pip install -r requirements.txt
cd ../lms-frontend && npm install
cd ../website && npm install lucide-react axios date-fns
```

### Development

```bash
# Terminal 1: Backend
cd backend
python run.py

# Terminal 2: LMS Frontend
cd lms-frontend
npm start          # http://localhost:3000

# Terminal 3: Public Website
cd website
npm run dev        # http://localhost:3001
```

---

## 🎨 Design System

### Color Palette

- **Primary**: `#2C5F2D` (Forest Green) - Knowledge, growth
- **Secondary**: `#97BC62` (Sage Green) - Calm, welcoming
- **Accent**: `#FFB84D` (Warm Amber) - Creativity, warmth
- **Background**: `#FEFDF8` (Warm White) - Clean, spacious
- **Surface**: `#FFFFFF` (Pure White) - Cards, sections

### Typography

- **Headings**: Playfair Display (elegant serif)
- **Body**: Inter (clean sans-serif)
- **Accent**: Montserrat (service headings)

---

## 🌐 Website Sections

### Public Pages

1. **Home** (`/`) - Hero, services, events, new arrivals
2. **About** (`/about`) - History, mission, team
3. **Services** - Library, cowork, study space
4. **Events** (`/events`) - Toastmasters, art club, chess
5. **Catalogue** (`/catalogue`) - Public preview (100 books)
6. **New Arrivals** (`/new-arrivals`) - Recent additions
7. **Recommendations** (`/recommendations`) - Curated reading lists
8. **Booking** (`/booking`) - Cowork/study space reservations
9. **Contact** (`/contact`) - Location, hours, contact form

### Member-Only Pages

10. **Reviews** (`/reviews`) - Rate and review books
11. **Blog** (`/blog`) - Share reading experiences
12. **My Account** - Redirects to LMS portal

---

## 🤖 Chatbot Capabilities

### Query Types

1. **Facility & Services** - Hours, services offered
2. **Infrastructure** - Wi-Fi, AC, restrooms, power backup, parking
3. **Membership** - Plans, pricing, subscriptions
4. **Availability** - Seating, meeting rooms
5. **Location** - Address, directions, parking
6. **Catalogue** - Search by title, author, ISBN

### Implementation Options

**Option 1**: Rule-based (included in implementation guide)
- Fast responses
- No API costs
- Limited to predefined patterns

**Option 2**: AI-powered (Claude API)
- Natural language understanding
- Flexible conversations
- Monthly API costs (~$50)

---

## 🔌 API Endpoints

### Public API (No Auth Required)

```
GET  /api/public/catalogue/sample       # Limited preview
GET  /api/public/new-arrivals          # Recent books
GET  /api/public/events                # Upcoming events
GET  /api/public/membership-plans      # Plans info
POST /api/chatbot/query                # Chatbot
```

### Protected API (Auth Required)

```
GET  /api/catalogue/search             # Full catalogue
POST /api/reviews/create               # Book reviews
POST /api/blog/create                  # Blog posts
POST /api/booking/create               # Space booking
```

---

## 🗄️ Database Schema Extensions

New tables for website features:

- **events** - Event listings and registrations
- **blog_posts** - Member blog platform
- **book_reviews** - Ratings and reviews
- **space_bookings** - Cowork/study space bookings
- **reading_lists** - Curated recommendations

See `NUK_WEBSITE_ARCHITECTURE.md` for full schema.

---

## 📱 Social Media Integration

### Google Reviews
- Display testimonials on homepage
- Link to Google Business page

### Instagram Feed
- Latest 6 posts on homepage
- Gallery page with all posts

### Facebook Feed
- Event announcements
- Updates and news

---

## 🚢 Deployment

### Recommended Stack

- **Website**: Vercel (Next.js optimized)
- **LMS Frontend**: Vercel or Netlify
- **Backend**: Railway or Heroku
- **Database**: Railway PostgreSQL or Supabase

### Cost Estimate

- Hosting: $5-40/month
- APIs (optional AI): $0-100/month
- **Total**: $5-140/month

---

## 📋 Implementation Phases

### Phase 1: Setup (Week 1-2)
- [x] Architecture design ✓
- [ ] Restructure directories
- [ ] Initialize Next.js project
- [ ] Basic layout and routing

### Phase 2: Core Pages (Week 3-4)
- [ ] Homepage with hero and services
- [ ] About and contact pages
- [ ] Services pages
- [ ] Backend public API endpoints

### Phase 3: Dynamic Features (Week 5-6)
- [ ] Catalogue preview
- [ ] New arrivals page
- [ ] Events calendar
- [ ] Recommendations system

### Phase 4: Member Features (Week 7-8)
- [ ] Reviews and ratings
- [ ] Blog platform
- [ ] Authentication integration
- [ ] Member dashboard

### Phase 5: Booking System (Week 9-10)
- [ ] Cowork space booking
- [ ] Study space booking
- [ ] Meeting room booking
- [ ] Payment integration

### Phase 6: Chatbot (Week 11-12)
- [ ] Backend API implementation
- [ ] Chatbot UI component
- [ ] Catalogue search integration
- [ ] Testing and refinement

### Phase 7: Launch (Week 13-14)
- [ ] Social media integration
- [ ] Performance optimization
- [ ] SEO optimization
- [ ] Mobile testing
- [ ] Production deployment

---

## ✅ Pre-Launch Checklist

### Content
- [ ] High-quality images collected
- [ ] All copy written and reviewed
- [ ] Membership plans documented
- [ ] Pricing finalized
- [ ] Events calendar populated

### Technical
- [ ] All pages mobile responsive
- [ ] SEO meta tags added
- [ ] Google Analytics configured
- [ ] Social media APIs setup
- [ ] Chatbot tested with 50+ queries
- [ ] Performance audit passed
- [ ] Security audit completed

### Legal & Admin
- [ ] Privacy policy
- [ ] Terms of service
- [ ] Cookie consent
- [ ] Contact information updated
- [ ] Domain configured (mynuk.com)
- [ ] SSL certificates installed

---

## 🧪 Testing

### Manual Testing

1. **Chatbot**: Test all query types from reference doc
2. **Responsive**: Test on mobile, tablet, desktop
3. **Forms**: Test all input validation
4. **Authentication**: Login/logout flow
5. **Booking**: End-to-end reservation flow

### Automated Testing (Future)

```bash
# Frontend tests
cd website
npm test

# Backend tests
cd backend
pytest
```

---

## 🛠️ Development Tools

### Frontend

- **React DevTools** - Component debugging
- **Next.js DevTools** - Performance monitoring
- **Lighthouse** - Performance and SEO audits
- **Responsively** - Multi-device testing

### Backend

- **Postman** - API testing
- **pgAdmin** - Database management
- **Flask Debug Toolbar** - Request profiling

---

## 📊 Analytics & Monitoring

### Track These Metrics

1. **Traffic**: Page views, unique visitors, bounce rate
2. **Engagement**: Time on site, pages per session
3. **Conversions**: Membership signups, bookings
4. **Chatbot**: Query volume, response accuracy
5. **Performance**: Page load time, Core Web Vitals

### Tools

- Google Analytics 4
- Google Search Console
- Vercel Analytics
- Custom logging in backend

---

## 🔐 Security Considerations

### Best Practices

1. **CORS**: Whitelist specific origins only
2. **Rate Limiting**: Prevent abuse of chatbot and APIs
3. **Input Validation**: Sanitize all user inputs
4. **SQL Injection**: Use parameterized queries
5. **XSS Protection**: Escape user-generated content
6. **HTTPS Only**: Force SSL in production
7. **Environment Variables**: Never commit secrets

---

## 🤝 Contributing

### Code Style

- **Frontend**: Prettier + ESLint
- **Backend**: Black + Flake8
- **Git**: Conventional commits

### Branch Strategy

- `main` - Production
- `develop` - Staging
- `feature/*` - New features
- `bugfix/*` - Bug fixes

---

## 📞 Support & Questions

### For Development Issues

1. Check documentation first
2. Search existing issues
3. Ask in team chat
4. Create GitHub issue

### For Content Updates

Contact: [Your email/contact]

---

## 🎓 Learning Resources

### Next.js
- [Official Docs](https://nextjs.org/docs)
- [Learn Next.js](https://nextjs.org/learn)

### React
- [React Docs](https://react.dev)
- [React Patterns](https://reactpatterns.com)

### Flask
- [Flask Docs](https://flask.palletsprojects.com)
- [Flask Mega-Tutorial](https://blog.miguelgrinberg.com/post/the-flask-mega-tutorial-part-i-hello-world)

### PostgreSQL
- [PostgreSQL Tutorial](https://www.postgresqltutorial.com)

---

## 📝 Notes

### Design Assets Needed

Before starting development, collect:

- [ ] High-res library photos (interior, exterior, people)
- [ ] Cowork space photos
- [ ] Study space photos
- [ ] Event photos (Toastmasters, Art Club, Chess)
- [ ] Logo files (SVG, PNG in multiple sizes)
- [ ] Staff photos (optional)
- [ ] Book cover images

### Third-Party Accounts

Setup required:

- [ ] Google Cloud Console (Maps API, Places API)
- [ ] Instagram Developer Account
- [ ] Facebook Developer Account
- [ ] Google Analytics 4 property
- [ ] Vercel account
- [ ] Railway/Heroku account
- [ ] Domain registrar (mynuk.com)
- [ ] Cloudinary or AWS S3 (image hosting)

---

## 🎉 Success Criteria

The project will be considered successful when:

1. ✅ Public website is live at mynuk.com
2. ✅ All pages are mobile responsive
3. ✅ Chatbot answers 90%+ of common queries correctly
4. ✅ Page load time < 3 seconds
5. ✅ Lighthouse score > 90 (Performance, Accessibility, SEO)
6. ✅ Zero critical security vulnerabilities
7. ✅ Booking system processes reservations successfully
8. ✅ LMS integration works seamlessly
9. ✅ Social media feeds update automatically
10. ✅ Positive user feedback from first 100 visitors

---

## 📅 Timeline

**Estimated Duration**: 14 weeks (3.5 months)

**Start Date**: [To be determined]
**Target Launch**: [To be determined]

**Milestones**:
- Week 4: Core website pages complete
- Week 8: Member features live
- Week 12: Chatbot fully functional
- Week 14: Public launch 🚀

---

## 🙏 Acknowledgments

- Built with ❤️ for Nuk Library community
- Powered by Next.js, React, Flask, and PostgreSQL
- AI assistance by Claude (Anthropic)

---

**Version**: 1.0
**Last Updated**: 2025-11-18
**Status**: Planning Complete ✓

**Next Step**: Begin Phase 1 - Setup and Directory Restructuring

---

For detailed implementation instructions, refer to:
- **[NUK_WEBSITE_ARCHITECTURE.md](./NUK_WEBSITE_ARCHITECTURE.md)**
- **[WEBSITE_IMPLEMENTATION_GUIDE.md](./WEBSITE_IMPLEMENTATION_GUIDE.md)**
- **[CHATBOT_QUERY_REFERENCE.md](./CHATBOT_QUERY_REFERENCE.md)**

Good luck with the build! 🚀📚
