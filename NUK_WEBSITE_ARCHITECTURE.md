# Nuk Library Website + LMS Integration Architecture

## Executive Summary

This document outlines the architecture for integrating a public-facing website with the existing Library Management System (LMS) while maintaining clear code separation for easy future extraction.

---

## 1. Proposed Directory Structure

```
nukweb/
├── backend/                          # Shared Flask API (existing + new endpoints)
│   ├── app/
│   │   ├── routes/
│   │   │   ├── auth.py              # Existing LMS auth
│   │   │   ├── admin_*.py           # Existing LMS admin routes
│   │   │   ├── patron_*.py          # Existing LMS patron routes
│   │   │   ├── public_api.py        # NEW: Public website API
│   │   │   ├── chatbot_api.py       # NEW: Chatbot endpoints
│   │   │   └── content_api.py       # NEW: Website content management
│   │   ├── utils/
│   │   │   ├── chatbot/             # NEW: Chatbot logic
│   │   │   │   ├── query_handler.py
│   │   │   │   ├── catalogue_search.py
│   │   │   │   └── facility_info.py
│   │   └── __init__.py
│   ├── requirements.txt
│   └── run.py
│
├── lms-frontend/                     # RENAMED from 'frontend/'
│   ├── public/
│   ├── src/
│   │   ├── components/              # Existing LMS components
│   │   ├── services/                # Existing API services
│   │   ├── styles/
│   │   ├── App.js                   # LMS routing
│   │   └── index.js
│   ├── package.json
│   └── README.md
│
├── website/                          # NEW: Public website (Next.js)
│   ├── public/
│   │   ├── images/
│   │   │   ├── hero/
│   │   │   ├── services/
│   │   │   ├── gallery/
│   │   │   └── logo/
│   │   └── favicon.ico
│   ├── src/
│   │   ├── app/                     # Next.js 13+ app directory
│   │   │   ├── layout.js
│   │   │   ├── page.js              # Home page
│   │   │   ├── about/
│   │   │   ├── services/
│   │   │   │   ├── library/
│   │   │   │   ├── cowork/
│   │   │   │   └── study-space/
│   │   │   ├── events/
│   │   │   ├── catalogue/           # Public catalogue preview
│   │   │   ├── new-arrivals/
│   │   │   ├── recommendations/
│   │   │   ├── reviews/
│   │   │   ├── blog/
│   │   │   ├── booking/
│   │   │   ├── contact/
│   │   │   └── members/             # Redirects to LMS login
│   │   ├── components/
│   │   │   ├── Header.js
│   │   │   ├── Footer.js
│   │   │   ├── Hero.js
│   │   │   ├── ServiceCard.js
│   │   │   ├── EventCard.js
│   │   │   ├── BookCard.js
│   │   │   ├── Chatbot.js           # Shared chatbot component
│   │   │   ├── SocialFeed.js
│   │   │   └── BookingForm.js
│   │   ├── services/
│   │   │   ├── api.js               # API client for backend
│   │   │   ├── chatbot.js
│   │   │   └── social.js
│   │   └── styles/
│   │       ├── globals.css
│   │       ├── theme.css            # Light elegant theme
│   │       └── components/
│   ├── package.json
│   ├── next.config.js
│   └── README.md
│
├── shared/                           # NEW: Shared resources
│   ├── chatbot/                     # Chatbot UI component (React)
│   │   ├── ChatWidget.js
│   │   ├── ChatMessage.js
│   │   └── chatbot.css
│   └── assets/
│       ├── logo.svg
│       └── brand-colors.json
│
├── database/                         # Existing database scripts
│   ├── clean_setup.sql
│   └── ...
│
├── docs/                             # Documentation
│   ├── WEBSITE_DESIGN.md            # NEW: Website design guide
│   ├── CHATBOT_GUIDE.md             # NEW: Chatbot implementation
│   └── API_PUBLIC.md                # NEW: Public API docs
│
├── .env.example
├── docker-compose.yml               # NEW: Multi-service orchestration
└── README.md

```

---

## 2. Architecture Principles

### Clear Separation of Concerns

1. **LMS Frontend** (`lms-frontend/`): Admin and patron portals - existing functionality
2. **Public Website** (`website/`): Marketing, content, public catalogue preview
3. **Shared Backend** (`backend/`): Single Flask API serving both frontends
4. **Shared Components** (`shared/`): Reusable components like chatbot

### Why This Structure?

- **Easy Extraction**: Each frontend is in its own directory and can be moved to a separate repo
- **Code Reuse**: Backend API is shared, reducing duplication
- **Independent Deployment**: Each frontend can be deployed separately
- **Clear Boundaries**: Developers immediately know where to work

---

## 3. Website Design & Structure

### Design Theme: Light Elegant

**Color Palette:**
```css
:root {
  --primary: #2C5F2D;        /* Forest green - knowledge, growth */
  --secondary: #97BC62;      /* Sage green - calm, welcoming */
  --accent: #FFB84D;         /* Warm amber - creativity, warmth */
  --background: #FEFDF8;     /* Warm white - clean, spacious */
  --surface: #FFFFFF;        /* Pure white - cards, sections */
  --text-primary: #2D2D2D;   /* Charcoal - readable */
  --text-secondary: #6B6B6B; /* Gray - secondary text */
  --border: #E8E8E8;         /* Light gray - subtle dividers */
}
```

**Typography:**
- Headings: 'Playfair Display' or 'Lora' (elegant serif)
- Body: 'Inter' or 'Open Sans' (clean sans-serif)
- Accent: 'Montserrat' (headings for services)

**Design Style:**
- Clean, spacious layouts with ample whitespace
- Soft shadows and rounded corners
- High-quality imagery mixed with text
- Responsive grid layouts
- Smooth animations and transitions

### Website Sections

#### A. Homepage
**Hero Section:**
- Large hero image: Cozy library interior with books and people reading
- Headline: "Where Learning Lives, Community Thrives"
- Subheading: "14+ Years of Inspiring Minds in Bangalore"
- CTA Buttons: "Explore Library" | "Book Cowork Space" | "Browse Catalogue"
- Floating Chatbot icon (bottom right)

**Services Overview:**
- 3-column grid with icons and images
  1. Library Services (book icon, kids reading image)
  2. Cowork Space (desk icon, professionals working)
  3. Study Space (lamp icon, student studying)

**Numbers That Matter:**
- 14+ Years of Service
- 10,000+ Books
- 500+ Active Members
- 6 Days/Week Library Operations

**Events & Activities Preview:**
- Carousel of upcoming events
- Toastmasters Forum | Art Club | Chess Classes

**New Arrivals Showcase:**
- Horizontal scroll of recent book additions
- Cover images with "View in Catalogue" link

**Testimonials:**
- Google Reviews integration
- 3-card carousel with member testimonials

**Social Media Feed:**
- Instagram photo gallery (latest 6 posts)
- Facebook updates

**Newsletter Signup:**
- "Stay Updated" section
- Email capture form

#### B. About Page
- History: 14 years journey
- Mission & Vision
- Team introduction (optional)
- Gallery of library spaces
- Location map (Google Maps embed)

#### C. Services Pages

**Library Services (`/services/library`):**
- Age groups served: Toddlers → Teenagers → Adults
- Collection highlights
- Membership plans (overview, link to detailed plans)
- Operating hours: Mon-Sun (Mon library closed)
- Activities: Toastmasters, Art Club, Chess, Rubik's Cube

**Cowork Space (`/services/cowork`):**
- Features: AC, Wi-Fi, Power backup, Restroom
- Workspace types: Hot desk, Dedicated desk
- Subscription plans
- Amenities: Cafe, Books, Meeting room
- Booking form
- Photo gallery

**Study Space (`/services/study-space`):**
- Features: Quiet zones, AC, Wi-Fi
- Plans: Hourly, Daily, Monthly
- Booking form
- Photo gallery

#### D. Catalogue (`/catalogue`)
**Public View:**
- Browse limited sample catalogue (100 books)
- Search by title, author, ISBN
- Book details page (no availability info)
- "Login to see full catalogue" prompt

**Member View:**
- Redirects to LMS login
- Full access to catalogue in LMS portal

#### E. Events & Activities (`/events`)
- Calendar view of upcoming events
- Event categories: Toastmasters, Art Club, Chess, Workshops
- Past events gallery
- Registration forms (Google Forms integration)

#### F. New Arrivals (`/new-arrivals`)
- Grid view of recently added books
- Filter by category/age group
- "Add to wishlist" for members
- Link to full catalogue

#### G. Recommendations (`/recommendations`)
- Curated reading lists
- Age-wise recommendations
  - Toddlers (0-3)
  - Early Readers (4-7)
  - Middle Grade (8-12)
  - Young Adult (13-18)
  - Adults
- Genre-based lists
- Staff picks

#### H. Reviews & Ratings (`/reviews`)
**Member-Only Feature:**
- Login required
- Rate books (1-5 stars)
- Write reviews
- See other members' reviews
- "Most loved books" section

#### I. Blog (`/blog`)
**Member-Only Feature:**
- Login required
- Create posts about reading experiences
- Comment on others' posts
- Categories: Book Reviews, Reading Journey, Recommendations
- Rich text editor

#### J. Booking (`/booking`)
- Cowork space booking calendar
- Study space booking calendar
- Meeting room booking
- Availability checker
- Pricing calculator
- Booking form with payment integration

#### K. Contact (`/contact`)
- Location: Address in Bangalore
- Map with directions
- Phone & email
- Operating hours
- Parking information
- Contact form

---

## 4. Chatbot Architecture

### Chatbot Features

**Query Categories:**

1. **Facility & Services**
   - What services does Nuk offer?
   - Library timings?
   - Is it open on holidays?

2. **Infrastructure**
   - Do you have AC?
   - Is Wi-Fi available?
   - Power backup?
   - Restroom facilities?

3. **Membership Plans**
   - Library membership costs?
   - Cowork subscription plans?
   - Study space pricing?

4. **Availability**
   - Seating space available today?
   - Meeting room availability?
   - Meeting room pricing?

5. **Location**
   - Where is Nuk located?
   - Parking options?
   - How to reach by metro?

6. **Catalogue Queries**
   - Do you have [book title]?
   - Books by [author name]?
   - ISBN lookup?

### Technical Implementation

**Option 1: Rule-Based + AI Hybrid (Recommended)**

```python
# backend/app/routes/chatbot_api.py
from flask import Blueprint, request, jsonify
from app.utils.chatbot.query_handler import ChatbotQueryHandler

chatbot_bp = Blueprint('chatbot', __name__)

@chatbot_bp.route('/api/chatbot/query', methods=['POST'])
def handle_chat_query():
    """Handle chatbot queries from any user (anonymous, patron, admin)"""
    data = request.json
    user_query = data.get('query')
    user_type = data.get('user_type', 'anonymous')  # anonymous, patron, admin

    handler = ChatbotQueryHandler()
    response = handler.process_query(user_query, user_type)

    return jsonify(response)
```

```python
# backend/app/utils/chatbot/query_handler.py
import re
from .facility_info import get_facility_info
from .catalogue_search import search_catalogue

class ChatbotQueryHandler:
    def __init__(self):
        self.patterns = {
            'facility': r'(timing|hours|open|closed|holiday)',
            'infrastructure': r'(wifi|ac|air condition|restroom|toilet|backup|power)',
            'membership': r'(membership|subscription|plan|cost|price|fee)',
            'availability': r'(seating|space|available|meeting room)',
            'location': r'(location|address|where|parking|reach)',
            'catalogue': r'(book|author|isbn|title)',
        }

    def process_query(self, query, user_type):
        query_lower = query.lower()

        # Categorize query
        category = self._categorize(query_lower)

        if category == 'catalogue':
            return self._handle_catalogue_query(query, user_type)
        elif category == 'facility':
            return get_facility_info('hours')
        elif category == 'infrastructure':
            return get_facility_info('infrastructure')
        elif category == 'membership':
            return get_facility_info('membership')
        # ... more categories

        # Fallback to AI if no pattern matches
        return self._ai_fallback(query)

    def _handle_catalogue_query(self, query, user_type):
        """Search catalogue database"""
        # Extract book title, author, or ISBN
        # Query database
        # Return results with access level based on user_type
        pass
```

**Option 2: Full AI Integration (Claude API)**

Use Anthropic's Claude API for natural language understanding:

```python
import anthropic

def ai_query(user_message, context):
    client = anthropic.Client(api_key=os.getenv('CLAUDE_API_KEY'))

    system_prompt = """You are Nuk Library's helpful assistant.
    Answer questions about:
    - Library services, timings, and facilities
    - Membership and cowork plans
    - Book availability in our catalogue

    Context: {context}
    """

    response = client.messages.create(
        model="claude-3-sonnet-20240229",
        max_tokens=500,
        system=system_prompt,
        messages=[{"role": "user", "content": user_message}]
    )

    return response.content[0].text
```

### Chatbot UI Component

**Shared Component** (`shared/chatbot/ChatWidget.js`):

```jsx
import React, { useState, useEffect } from 'react';
import './chatbot.css';

export const ChatWidget = ({ userType = 'anonymous' }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');

  const sendMessage = async () => {
    if (!input.trim()) return;

    // Add user message
    const userMessage = { role: 'user', content: input };
    setMessages([...messages, userMessage]);

    // Call backend API
    const response = await fetch('/api/chatbot/query', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        query: input,
        user_type: userType
      })
    });

    const data = await response.json();

    // Add bot response
    const botMessage = { role: 'assistant', content: data.response };
    setMessages([...messages, userMessage, botMessage]);
    setInput('');
  };

  return (
    <div className={`chat-widget ${isOpen ? 'open' : ''}`}>
      <button
        className="chat-toggle"
        onClick={() => setIsOpen(!isOpen)}
      >
        💬
      </button>

      {isOpen && (
        <div className="chat-window">
          <div className="chat-header">
            <h3>Nuk Assistant</h3>
            <button onClick={() => setIsOpen(false)}>×</button>
          </div>

          <div className="chat-messages">
            {messages.map((msg, idx) => (
              <div key={idx} className={`message ${msg.role}`}>
                {msg.content}
              </div>
            ))}
          </div>

          <div className="chat-input">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
              placeholder="Ask me anything..."
            />
            <button onClick={sendMessage}>Send</button>
          </div>
        </div>
      )}
    </div>
  );
};
```

---

## 5. Integration Points

### A. Shared Backend API

**Public Endpoints** (no auth required):
```
GET  /api/public/catalogue/sample       # Limited catalogue preview
GET  /api/public/new-arrivals           # Recent books
GET  /api/public/events                 # Upcoming events
GET  /api/public/membership-plans       # Plans info
GET  /api/public/reviews                # Public book reviews
POST /api/public/booking/check          # Check availability
POST /api/chatbot/query                 # Chatbot queries
```

**Protected Endpoints** (require auth):
```
GET  /api/catalogue/search              # Full catalogue (existing)
POST /api/reviews/create                # Create review
POST /api/blog/create                   # Create blog post
GET  /api/patron/wishlist               # User wishlist
```

### B. Authentication Flow

**Public Website → LMS:**
1. User clicks "Login" or "Member Access" on website
2. Redirects to: `https://lms.mynuk.com/login` or `https://mynuk.com/lms/login`
3. After login, redirects back to: `https://mynuk.com/catalogue` or `https://mynuk.com/profile`
4. Token stored in localStorage, shared between subdomains

**URL Structure Options:**

**Option 1: Subdomains**
- Public: `https://mynuk.com`
- LMS: `https://lms.mynuk.com`

**Option 2: Paths**
- Public: `https://mynuk.com/`
- LMS: `https://mynuk.com/lms/`

**Recommendation:** Option 2 (paths) for easier sharing of authentication

### C. Database Schema Extensions

**New Tables for Website:**

```sql
-- Events
CREATE TABLE events (
    event_id SERIAL PRIMARY KEY,
    title VARCHAR(200) NOT NULL,
    description TEXT,
    event_type VARCHAR(50), -- 'toastmasters', 'art', 'chess', 'workshop'
    event_date TIMESTAMP NOT NULL,
    location VARCHAR(100),
    image_url VARCHAR(500),
    registration_link VARCHAR(500),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Blog Posts
CREATE TABLE blog_posts (
    post_id SERIAL PRIMARY KEY,
    author_patron_id INTEGER REFERENCES patrons(patron_id),
    title VARCHAR(200) NOT NULL,
    content TEXT NOT NULL,
    category VARCHAR(50), -- 'review', 'journey', 'recommendation'
    published_at TIMESTAMP DEFAULT NOW(),
    is_published BOOLEAN DEFAULT TRUE,
    views_count INTEGER DEFAULT 0
);

-- Book Reviews
CREATE TABLE book_reviews (
    review_id SERIAL PRIMARY KEY,
    book_id INTEGER REFERENCES books(book_id),
    patron_id INTEGER REFERENCES patrons(patron_id),
    rating INTEGER CHECK (rating >= 1 AND rating <= 5),
    review_text TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    is_public BOOLEAN DEFAULT TRUE
);

-- Bookings (Cowork/Study Space)
CREATE TABLE space_bookings (
    booking_id SERIAL PRIMARY KEY,
    patron_id INTEGER REFERENCES patrons(patron_id),
    space_type VARCHAR(50), -- 'cowork_hotdesk', 'cowork_dedicated', 'study_space', 'meeting_room'
    booking_date DATE NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    status VARCHAR(20) DEFAULT 'pending', -- 'pending', 'confirmed', 'cancelled'
    payment_status VARCHAR(20) DEFAULT 'pending',
    total_amount DECIMAL(10,2),
    created_at TIMESTAMP DEFAULT NOW()
);

-- Reading Lists (Recommendations)
CREATE TABLE reading_lists (
    list_id SERIAL PRIMARY KEY,
    title VARCHAR(200) NOT NULL,
    description TEXT,
    age_group VARCHAR(50), -- 'toddler', 'early_reader', 'middle_grade', 'ya', 'adult'
    genre VARCHAR(50),
    created_by INTEGER REFERENCES users(user_id),
    is_staff_pick BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE reading_list_books (
    list_id INTEGER REFERENCES reading_lists(list_id),
    book_id INTEGER REFERENCES books(book_id),
    sequence_number INTEGER,
    recommendation_note TEXT,
    PRIMARY KEY (list_id, book_id)
);
```

---

## 6. Deployment Architecture

### Development

```yaml
# docker-compose.yml
version: '3.8'

services:
  postgres:
    image: postgres:14
    environment:
      POSTGRES_DB: nukweb
      POSTGRES_USER: nukuser
      POSTGRES_PASSWORD: password
    ports:
      - "5432:5432"
    volumes:
      - ./database:/docker-entrypoint-initdb.d

  backend:
    build: ./backend
    ports:
      - "5000:5000"
    environment:
      DATABASE_URL: postgresql://nukuser:password@postgres:5432/nukweb
      FLASK_ENV: development
    depends_on:
      - postgres

  lms-frontend:
    build: ./lms-frontend
    ports:
      - "3000:3000"
    environment:
      REACT_APP_API_URL: http://localhost:5000

  website:
    build: ./website
    ports:
      - "3001:3000"
    environment:
      NEXT_PUBLIC_API_URL: http://localhost:5000
```

### Production Deployment Options

**Option 1: Single Server (Railway/Heroku)**
- Backend: Flask on port 5000
- LMS Frontend: Static build served by Nginx
- Website: Next.js on port 3001, proxied to `/` by Nginx
- Database: PostgreSQL addon

**Option 2: Vercel (Recommended for Website)**
- Backend: Railway/Heroku
- LMS Frontend: Vercel (static export)
- Website: Vercel (Next.js)
- Database: Railway/Supabase PostgreSQL

**Nginx Configuration:**
```nginx
# Serve public website at root
location / {
    proxy_pass http://localhost:3001;
}

# Serve LMS at /lms
location /lms/ {
    alias /var/www/lms-build/;
    try_files $uri /lms/index.html;
}

# API endpoints
location /api/ {
    proxy_pass http://localhost:5000;
}
```

---

## 7. Social Media Integration

### Google Reviews
Use Google Places API:

```javascript
// website/src/services/social.js
export const fetchGoogleReviews = async () => {
  const placeId = 'YOUR_GOOGLE_PLACE_ID';
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_API_KEY;

  const response = await fetch(
    `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&key=${apiKey}`
  );

  const data = await response.json();
  return data.result.reviews;
};
```

### Instagram Feed
Use Instagram Basic Display API or embed:

```javascript
export const fetchInstagramPosts = async () => {
  const accessToken = process.env.INSTAGRAM_ACCESS_TOKEN;

  const response = await fetch(
    `https://graph.instagram.com/me/media?fields=id,caption,media_url,permalink&access_token=${accessToken}`
  );

  return await response.json();
};
```

### Facebook Feed
Use Facebook Graph API:

```javascript
export const fetchFacebookPosts = async () => {
  const pageId = process.env.FACEBOOK_PAGE_ID;
  const accessToken = process.env.FACEBOOK_ACCESS_TOKEN;

  const response = await fetch(
    `https://graph.facebook.com/${pageId}/posts?fields=message,created_time,full_picture&access_token=${accessToken}`
  );

  return await response.json();
};
```

---

## 8. Migration Strategy

### Phase 1: Setup (Week 1-2)
1. Restructure directories
   - Rename `frontend/` → `lms-frontend/`
   - Create `website/` directory
   - Create `shared/` directory
2. Setup Next.js website project
3. Create basic layout and homepage
4. Setup routing structure

### Phase 2: Core Pages (Week 3-4)
1. Design and implement homepage
2. Create services pages
3. Implement about and contact pages
4. Setup basic API endpoints in backend

### Phase 3: Dynamic Features (Week 5-6)
1. Public catalogue preview
2. New arrivals page
3. Events page with CMS
4. Recommendations system

### Phase 4: Member Features (Week 7-8)
1. Reviews and ratings
2. Blog platform
3. Wishlist feature
4. Integration with LMS login

### Phase 5: Booking System (Week 9-10)
1. Cowork space booking
2. Study space booking
3. Meeting room booking
4. Payment integration

### Phase 6: Chatbot (Week 11-12)
1. Implement chatbot backend
2. Create chatbot UI component
3. Train/configure responses
4. Integrate catalogue search
5. Test and refine

### Phase 7: Social & Polish (Week 13-14)
1. Social media integration
2. Google reviews
3. Performance optimization
4. SEO optimization
5. Mobile responsiveness testing
6. Launch!

---

## 9. Technology Stack

### Frontend

**Public Website:**
- **Framework:** Next.js 14+ (App Router)
- **Styling:** Tailwind CSS + Custom CSS
- **Components:** React 18
- **Forms:** React Hook Form
- **Icons:** Lucide React or Heroicons
- **Calendar:** FullCalendar or React Big Calendar
- **Rich Text:** TipTap or Draft.js
- **Analytics:** Google Analytics 4

**LMS (Existing):**
- React 18
- React Router
- Custom CSS

### Backend
- **Framework:** Flask (existing)
- **Database:** PostgreSQL
- **ORM:** Raw SQL (existing pattern)
- **AI:** Anthropic Claude API (optional)
- **Social APIs:** Google Places, Instagram Basic Display, Facebook Graph

### Deployment
- **Website:** Vercel
- **LMS:** Vercel (static export) or Netlify
- **Backend:** Railway or Heroku
- **Database:** Railway PostgreSQL or Supabase
- **Media Storage:** Cloudinary or AWS S3

---

## 10. Security Considerations

1. **CORS Configuration:**
   ```python
   # backend/app/__init__.py
   CORS(app, origins=[
       'https://mynuk.com',
       'https://www.mynuk.com',
       'http://localhost:3000',  # LMS dev
       'http://localhost:3001',  # Website dev
   ])
   ```

2. **Rate Limiting for Chatbot:**
   ```python
   from flask_limiter import Limiter

   limiter = Limiter(app, key_func=get_remote_address)

   @chatbot_bp.route('/api/chatbot/query', methods=['POST'])
   @limiter.limit("20 per minute")
   def handle_chat_query():
       pass
   ```

3. **API Key Management:**
   - Store in environment variables
   - Never commit to git
   - Use different keys for dev/production

4. **Input Validation:**
   - Sanitize all user inputs
   - Validate chatbot queries
   - Prevent SQL injection in catalogue search

---

## 11. Cost Estimation

### Monthly Costs (Estimated)

**Hosting:**
- Vercel (Website): $0 (Hobby) - $20 (Pro)
- Railway (Backend + DB): $5-20
- **Total Hosting: $5-40/month**

**APIs:**
- Claude API: $0-50/month (depends on chatbot usage)
- Google Maps API: $0-50/month (low usage)
- Instagram/Facebook: Free
- **Total APIs: $0-100/month**

**Total Estimated: $5-140/month**

---

## 12. Next Steps

1. **Review and approve this architecture**
2. **Provide design assets:**
   - Logo files
   - High-quality photos of library spaces
   - Event photos
   - Any existing brand guidelines

3. **Content gathering:**
   - Membership plan details and pricing
   - Cowork/study space pricing
   - Detailed service descriptions
   - Staff information (optional)

4. **Third-party accounts:**
   - Google Place ID for reviews
   - Instagram Business Account
   - Facebook Page ID
   - Google Analytics property

5. **Begin implementation** following the phased approach

---

## Questions for Consideration

1. Do you have a preferred design style/reference websites you like?
2. Do you want a CMS for managing events and blog posts, or should staff do it through admin panel?
3. What payment gateway for bookings? (Razorpay, Stripe, etc.)
4. Do you want automated email notifications? (booking confirmations, event reminders)
5. Should the chatbot be AI-powered (costs more) or rule-based (cheaper, less flexible)?

---

**Document Version:** 1.0
**Last Updated:** 2025-11-18
**Author:** Claude (Anthropic)
