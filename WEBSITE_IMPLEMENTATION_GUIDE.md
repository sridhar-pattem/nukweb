# Nuk Library Website - Implementation Guide

## Quick Start: Restructuring the Project

### Step 1: Backup Current State

```bash
# Create a backup of current state
git add .
git commit -m "Backup before website restructuring"
git push origin claude/upgrade-catalogue-rda-01J2K57pP9nu4zhDfvNnhBap
```

### Step 2: Restructure Directories

```bash
# Navigate to project root
cd /path/to/nukweb

# Rename frontend to lms-frontend
mv frontend lms-frontend

# Create new directories
mkdir -p website
mkdir -p shared/chatbot
mkdir -p shared/assets

# Update .gitignore
cat >> .gitignore << 'EOF'

# Website
website/node_modules/
website/.next/
website/out/
website/.env.local

# Shared
shared/node_modules/
EOF
```

### Step 3: Initialize Next.js Website

```bash
# Navigate to website directory
cd website

# Initialize Next.js project with Tailwind CSS
npx create-next-app@latest . --typescript --tailwind --app --no-src-dir

# Install additional dependencies
npm install lucide-react axios date-fns

# Create directory structure
mkdir -p app/{about,services/{library,cowork,study-space},events,catalogue,new-arrivals,recommendations,reviews,blog,booking,contact,members}
mkdir -p components
mkdir -p services
mkdir -p styles/components
mkdir -p public/images/{hero,services,gallery,logo}
```

### Step 4: Setup Environment Variables

```bash
# Create .env.local in website/
cat > .env.local << 'EOF'
NEXT_PUBLIC_API_URL=http://localhost:5000
NEXT_PUBLIC_SITE_URL=http://localhost:3001
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_key_here
NEXT_PUBLIC_GOOGLE_PLACE_ID=your_place_id_here
INSTAGRAM_ACCESS_TOKEN=your_token_here
FACEBOOK_PAGE_ID=your_page_id_here
FACEBOOK_ACCESS_TOKEN=your_token_here
CLAUDE_API_KEY=your_claude_api_key_here
EOF

# Update backend/.env
cat >> backend/.env << 'EOF'

# Chatbot
CLAUDE_API_KEY=your_claude_api_key_here

# Social Media
GOOGLE_MAPS_API_KEY=your_key_here
INSTAGRAM_ACCESS_TOKEN=your_token_here
FACEBOOK_ACCESS_TOKEN=your_token_here
EOF
```

### Step 5: Update Backend for Public API

```bash
cd backend/app/routes

# Create new route files
touch public_api.py
touch chatbot_api.py
touch content_api.py
```

---

## Sample Code: Getting Started

### 1. Website Homepage (`website/app/page.js`)

```jsx
import Hero from '@/components/Hero';
import Services from '@/components/Services';
import Stats from '@/components/Stats';
import Events from '@/components/Events';
import NewArrivals from '@/components/NewArrivals';
import Testimonials from '@/components/Testimonials';
import SocialFeed from '@/components/SocialFeed';
import Newsletter from '@/components/Newsletter';

export default function Home() {
  return (
    <main className="min-h-screen">
      <Hero />
      <Stats />
      <Services />
      <Events />
      <NewArrivals />
      <Testimonials />
      <SocialFeed />
      <Newsletter />
    </main>
  );
}
```

### 2. Website Layout (`website/app/layout.js`)

```jsx
import { Inter, Playfair_Display } from 'next/font/google';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { ChatWidget } from '@/components/ChatWidget';
import './globals.css';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });
const playfair = Playfair_Display({ subsets: ['latin'], variable: '--font-playfair' });

export const metadata = {
  title: 'Nuk Library - Where Learning Lives, Community Thrives',
  description: '14+ years of inspiring minds in Bangalore. Library, Cowork, and Study Space services.',
  keywords: 'library bangalore, cowork space bangalore, study space, books, toastmasters',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${inter.variable} ${playfair.variable}`}>
      <body className="antialiased">
        <Header />
        {children}
        <Footer />
        <ChatWidget />
      </body>
    </html>
  );
}
```

### 3. Global Styles (`website/app/globals.css`)

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

:root {
  --primary: #2C5F2D;
  --secondary: #97BC62;
  --accent: #FFB84D;
  --background: #FEFDF8;
  --surface: #FFFFFF;
  --text-primary: #2D2D2D;
  --text-secondary: #6B6B6B;
  --border: #E8E8E8;

  --font-inter: 'Inter', sans-serif;
  --font-playfair: 'Playfair Display', serif;
}

@layer base {
  body {
    @apply bg-[var(--background)] text-[var(--text-primary)];
    font-family: var(--font-inter);
  }

  h1, h2, h3, h4, h5, h6 {
    font-family: var(--font-playfair);
    @apply font-semibold;
  }

  h1 {
    @apply text-5xl md:text-6xl lg:text-7xl;
  }

  h2 {
    @apply text-4xl md:text-5xl;
  }

  h3 {
    @apply text-3xl md:text-4xl;
  }
}

@layer components {
  .btn-primary {
    @apply bg-[var(--primary)] text-white px-6 py-3 rounded-lg
           hover:bg-[var(--primary)]/90 transition-colors
           font-medium shadow-sm hover:shadow-md;
  }

  .btn-secondary {
    @apply bg-[var(--secondary)] text-white px-6 py-3 rounded-lg
           hover:bg-[var(--secondary)]/90 transition-colors
           font-medium shadow-sm hover:shadow-md;
  }

  .btn-outline {
    @apply border-2 border-[var(--primary)] text-[var(--primary)]
           px-6 py-3 rounded-lg hover:bg-[var(--primary)]
           hover:text-white transition-colors font-medium;
  }

  .card {
    @apply bg-[var(--surface)] rounded-xl shadow-md
           hover:shadow-xl transition-shadow p-6;
  }

  .section {
    @apply py-16 md:py-24 px-4 md:px-8;
  }

  .container {
    @apply max-w-7xl mx-auto;
  }
}
```

### 4. Hero Component (`website/components/Hero.js`)

```jsx
import Image from 'next/image';
import Link from 'next/link';
import { BookOpen, Users, Coffee } from 'lucide-react';

export default function Hero() {
  return (
    <section className="relative h-screen flex items-center overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0 z-0">
        <Image
          src="/images/hero/library-interior.jpg"
          alt="Nuk Library Interior"
          fill
          className="object-cover brightness-50"
          priority
        />
      </div>

      {/* Content */}
      <div className="container relative z-10 text-white">
        <div className="max-w-3xl">
          <div className="flex items-center gap-2 mb-4">
            <BookOpen className="w-8 h-8 text-[var(--accent)]" />
            <span className="text-[var(--accent)] text-lg font-medium">
              Established 2010
            </span>
          </div>

          <h1 className="text-6xl md:text-7xl font-bold mb-6">
            Where Learning Lives,
            <br />
            <span className="text-[var(--accent)]">Community Thrives</span>
          </h1>

          <p className="text-xl md:text-2xl mb-8 text-gray-200">
            14+ Years of Inspiring Minds in Bangalore
          </p>

          <div className="flex flex-wrap gap-4 mb-12">
            <Link href="/services/library" className="btn-primary">
              <BookOpen className="inline-block w-5 h-5 mr-2" />
              Explore Library
            </Link>
            <Link href="/booking" className="btn-secondary">
              <Coffee className="inline-block w-5 h-5 mr-2" />
              Book Cowork Space
            </Link>
            <Link href="/catalogue" className="btn-outline bg-white/10 backdrop-blur-sm border-white text-white hover:bg-white hover:text-[var(--primary)]">
              Browse Catalogue
            </Link>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-3 gap-8 max-w-2xl">
            <div className="text-center">
              <div className="text-4xl font-bold text-[var(--accent)]">14+</div>
              <div className="text-sm text-gray-300">Years of Service</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-[var(--accent)]">10K+</div>
              <div className="text-sm text-gray-300">Books</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-[var(--accent)]">500+</div>
              <div className="text-sm text-gray-300">Active Members</div>
            </div>
          </div>
        </div>
      </div>

      {/* Scroll Indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 animate-bounce">
        <div className="w-6 h-10 border-2 border-white rounded-full flex justify-center p-1">
          <div className="w-1 h-3 bg-white rounded-full"></div>
        </div>
      </div>
    </section>
  );
}
```

### 5. Services Component (`website/components/Services.js`)

```jsx
import { BookOpen, Laptop, GraduationCap, Palette, Trophy, Puzzle } from 'lucide-react';
import Link from 'next/link';

const services = [
  {
    icon: BookOpen,
    title: 'Library Services',
    description: 'Curated collection for all ages - from toddlers to adults',
    features: ['10,000+ Books', 'All Age Groups', '6 Days/Week'],
    link: '/services/library',
    color: 'var(--primary)',
  },
  {
    icon: Laptop,
    title: 'Cowork Space',
    description: 'Professional workspace with all amenities',
    features: ['AC & Wi-Fi', 'Power Backup', 'Cafe Access'],
    link: '/services/cowork',
    color: 'var(--secondary)',
  },
  {
    icon: GraduationCap,
    title: 'Study Space',
    description: 'Quiet and focused environment for students',
    features: ['Quiet Zones', 'All-Day Access', 'Comfortable Seating'],
    link: '/services/study-space',
    color: 'var(--accent)',
  },
];

const activities = [
  { icon: Trophy, name: 'Toastmasters', description: 'Public speaking forum' },
  { icon: Palette, name: 'Art Club', description: 'Creative expression classes' },
  { icon: Puzzle, name: 'Chess & Rubik\'s', description: 'Brain development games' },
];

export default function Services() {
  return (
    <section className="section bg-white">
      <div className="container">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-4">Our Services</h2>
          <p className="text-xl text-[var(--text-secondary)] max-w-2xl mx-auto">
            A comprehensive hub for learning, working, and growing together
          </p>
        </div>

        {/* Main Services */}
        <div className="grid md:grid-cols-3 gap-8 mb-20">
          {services.map((service) => (
            <Link
              key={service.title}
              href={service.link}
              className="card group hover:-translate-y-2 transition-all"
            >
              <div
                className="w-16 h-16 rounded-full flex items-center justify-center mb-6"
                style={{ backgroundColor: `${service.color}20` }}
              >
                <service.icon
                  className="w-8 h-8"
                  style={{ color: service.color }}
                />
              </div>

              <h3 className="text-2xl font-bold mb-3 group-hover:text-[var(--primary)]">
                {service.title}
              </h3>

              <p className="text-[var(--text-secondary)] mb-6">
                {service.description}
              </p>

              <ul className="space-y-2 mb-6">
                {service.features.map((feature) => (
                  <li key={feature} className="flex items-center text-sm">
                    <svg
                      className="w-5 h-5 mr-2 text-green-500"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                    {feature}
                  </li>
                ))}
              </ul>

              <div className="text-[var(--primary)] font-medium group-hover:underline">
                Learn More →
              </div>
            </Link>
          ))}
        </div>

        {/* Activities */}
        <div className="bg-[var(--background)] rounded-2xl p-8 md:p-12">
          <h3 className="text-3xl font-bold text-center mb-8">
            Activities & Events
          </h3>
          <div className="grid md:grid-cols-3 gap-8">
            {activities.map((activity) => (
              <div key={activity.name} className="text-center">
                <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-[var(--primary)]/10 flex items-center justify-center">
                  <activity.icon className="w-6 h-6 text-[var(--primary)]" />
                </div>
                <h4 className="text-xl font-semibold mb-2">{activity.name}</h4>
                <p className="text-[var(--text-secondary)]">{activity.description}</p>
              </div>
            ))}
          </div>
          <div className="text-center mt-8">
            <Link href="/events" className="btn-primary">
              View All Events
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
```

### 6. Chatbot Component (`website/components/ChatWidget.js`)

```jsx
'use client';

import { useState, useRef, useEffect } from 'react';
import { MessageCircle, Send, X, Loader } from 'lucide-react';

export default function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: 'Hi! I\'m Nuk\'s assistant. I can help you with information about our services, facilities, membership plans, and book availability. What would you like to know?',
    },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage = { role: 'user', content: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/chatbot/query`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: input,
          user_type: 'anonymous',
        }),
      });

      const data = await response.json();

      const botMessage = {
        role: 'assistant',
        content: data.response || 'Sorry, I couldn\'t process that. Please try again.',
      };

      setMessages((prev) => [...prev, botMessage]);
    } catch (error) {
      console.error('Chatbot error:', error);
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: 'Sorry, I\'m having trouble connecting. Please try again later.',
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const quickQuestions = [
    'What are your library timings?',
    'Do you have cowork space?',
    'What are the membership plans?',
    'Where are you located?',
  ];

  return (
    <>
      {/* Chat Toggle Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 z-50 w-14 h-14 bg-[var(--primary)] text-white rounded-full shadow-lg hover:shadow-xl hover:scale-110 transition-all flex items-center justify-center"
          aria-label="Open chat"
        >
          <MessageCircle className="w-6 h-6" />
        </button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <div className="fixed bottom-6 right-6 z-50 w-96 h-[600px] bg-white rounded-2xl shadow-2xl flex flex-col overflow-hidden">
          {/* Header */}
          <div className="bg-[var(--primary)] text-white p-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <MessageCircle className="w-5 h-5" />
              <div>
                <h3 className="font-semibold">Nuk Assistant</h3>
                <p className="text-xs opacity-90">Always here to help</p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="hover:bg-white/20 rounded-full p-1 transition-colors"
              aria-label="Close chat"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((msg, idx) => (
              <div
                key={idx}
                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[80%] rounded-2xl px-4 py-2 ${
                    msg.role === 'user'
                      ? 'bg-[var(--primary)] text-white'
                      : 'bg-gray-100 text-[var(--text-primary)]'
                  }`}
                >
                  {msg.content}
                </div>
              </div>
            ))}

            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-gray-100 rounded-2xl px-4 py-2 flex items-center gap-2">
                  <Loader className="w-4 h-4 animate-spin" />
                  <span className="text-sm">Thinking...</span>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Quick Questions (show only at start) */}
          {messages.length === 1 && (
            <div className="px-4 pb-2">
              <p className="text-xs text-gray-500 mb-2">Quick questions:</p>
              <div className="space-y-1">
                {quickQuestions.map((q) => (
                  <button
                    key={q}
                    onClick={() => {
                      setInput(q);
                    }}
                    className="w-full text-left text-xs bg-gray-50 hover:bg-gray-100 rounded-lg px-3 py-2 transition-colors"
                  >
                    {q}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Input */}
          <form onSubmit={sendMessage} className="p-4 border-t">
            <div className="flex gap-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask me anything..."
                className="flex-1 px-4 py-2 border rounded-full focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
                disabled={isLoading}
              />
              <button
                type="submit"
                disabled={!input.trim() || isLoading}
                className="w-10 h-10 bg-[var(--primary)] text-white rounded-full flex items-center justify-center hover:bg-[var(--primary)]/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                aria-label="Send message"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </form>
        </div>
      )}
    </>
  );
}
```

### 7. Backend Public API (`backend/app/routes/public_api.py`)

```python
from flask import Blueprint, jsonify, request
from app.utils.db import get_db_connection

public_bp = Blueprint('public', __name__)

@public_bp.route('/api/public/catalogue/sample', methods=['GET'])
def get_sample_catalogue():
    """Return limited catalogue preview for non-members"""
    conn = get_db_connection()
    cur = conn.cursor()

    query = """
        SELECT
            b.book_id,
            b.title,
            b.subtitle,
            b.isbn,
            b.publisher,
            b.publication_year,
            b.cover_image_url,
            COALESCE((
                SELECT json_agg(
                    json_build_object('name', c.name, 'role', bc.role)
                    ORDER BY bc.role, bc.sequence_number
                )
                FROM book_contributors bc
                JOIN contributors c ON bc.contributor_id = c.contributor_id
                WHERE bc.book_id = b.book_id
            ), '[]'::json) as contributors
        FROM books b
        WHERE b.is_active = TRUE
        ORDER BY b.created_at DESC
        LIMIT 100
    """

    cur.execute(query)
    books = cur.fetchall()

    result = []
    for book in books:
        result.append({
            'book_id': book[0],
            'title': book[1],
            'subtitle': book[2],
            'isbn': book[3],
            'publisher': book[4],
            'publication_year': book[5],
            'cover_image_url': book[6],
            'contributors': book[7],
        })

    cur.close()
    conn.close()

    return jsonify(result)


@public_bp.route('/api/public/new-arrivals', methods=['GET'])
def get_new_arrivals():
    """Get recently added books"""
    conn = get_db_connection()
    cur = conn.cursor()

    limit = request.args.get('limit', 12, type=int)

    query = """
        SELECT
            b.book_id,
            b.title,
            b.cover_image_url,
            COALESCE((
                SELECT json_agg(
                    json_build_object('name', c.name, 'role', bc.role)
                    ORDER BY bc.role, bc.sequence_number
                )
                FROM book_contributors bc
                JOIN contributors c ON bc.contributor_id = c.contributor_id
                WHERE bc.book_id = b.book_id AND bc.role = 'author'
            ), '[]'::json) as authors,
            b.created_at
        FROM books b
        WHERE b.is_active = TRUE
        ORDER BY b.created_at DESC
        LIMIT %s
    """

    cur.execute(query, (limit,))
    books = cur.fetchall()

    result = []
    for book in books:
        result.append({
            'book_id': book[0],
            'title': book[1],
            'cover_image_url': book[2],
            'authors': book[3],
            'added_date': book[4].isoformat() if book[4] else None,
        })

    cur.close()
    conn.close()

    return jsonify(result)


@public_bp.route('/api/public/membership-plans', methods=['GET'])
def get_membership_plans():
    """Get all active membership plans"""
    conn = get_db_connection()
    cur = conn.cursor()

    query = """
        SELECT
            plan_id,
            plan_name,
            description,
            duration_months,
            fee,
            refundable_deposit,
            max_books_allowed,
            max_days_allowed,
            features
        FROM membership_plans
        WHERE is_active = TRUE
        ORDER BY fee ASC
    """

    cur.execute(query)
    plans = cur.fetchall()

    result = []
    for plan in plans:
        result.append({
            'plan_id': plan[0],
            'name': plan[1],
            'description': plan[2],
            'duration_months': plan[3],
            'fee': float(plan[4]) if plan[4] else 0,
            'deposit': float(plan[5]) if plan[5] else 0,
            'max_books': plan[6],
            'max_days': plan[7],
            'features': plan[8],
        })

    cur.close()
    conn.close()

    return jsonify(result)
```

### 8. Backend Chatbot API (`backend/app/routes/chatbot_api.py`)

```python
from flask import Blueprint, jsonify, request
from app.utils.db import get_db_connection
import re

chatbot_bp = Blueprint('chatbot', __name__)

# Facility information database
FACILITY_INFO = {
    'hours': {
        'weekdays': '9:00 AM - 9:00 PM (Monday - Friday)',
        'weekends': '10:00 AM - 9:00 PM (Saturday - Sunday)',
        'library_closed': 'Monday (Library only, facility remains open)',
        'holidays': 'Closed on public holidays',
    },
    'infrastructure': {
        'ac': 'Yes, fully air-conditioned',
        'wifi': 'Yes, high-speed Wi-Fi available',
        'restroom': 'Yes, clean restrooms available',
        'power_backup': 'Yes, complete power backup',
        'parking': 'Limited street parking available',
    },
    'location': {
        'address': 'Bangalore, Karnataka',  # Add actual address
        'area': 'Bangalore',
    },
}


def search_books(query, search_type='title'):
    """Search books in catalogue"""
    conn = get_db_connection()
    cur = conn.cursor()

    if search_type == 'isbn':
        sql = """
            SELECT b.title, c.name as author
            FROM books b
            LEFT JOIN book_contributors bc ON b.book_id = bc.book_id AND bc.role = 'author'
            LEFT JOIN contributors c ON bc.contributor_id = c.contributor_id
            WHERE b.isbn = %s AND b.is_active = TRUE
            LIMIT 1
        """
        cur.execute(sql, (query,))
    elif search_type == 'author':
        sql = """
            SELECT b.title, c.name as author
            FROM books b
            JOIN book_contributors bc ON b.book_id = bc.book_id
            JOIN contributors c ON bc.contributor_id = c.contributor_id
            WHERE LOWER(c.name) LIKE %s AND b.is_active = TRUE
            LIMIT 5
        """
        cur.execute(sql, (f'%{query.lower()}%',))
    else:  # title
        sql = """
            SELECT b.title, c.name as author
            FROM books b
            LEFT JOIN book_contributors bc ON b.book_id = bc.book_id AND bc.role = 'author'
            LEFT JOIN contributors c ON bc.contributor_id = c.contributor_id
            WHERE LOWER(b.title) LIKE %s AND b.is_active = TRUE
            LIMIT 5
        """
        cur.execute(sql, (f'%{query.lower()}%',))

    results = cur.fetchall()
    cur.close()
    conn.close()

    return results


@chatbot_bp.route('/api/chatbot/query', methods=['POST'])
def handle_chat_query():
    """Handle all chatbot queries"""
    data = request.json
    query = data.get('query', '').strip()
    user_type = data.get('user_type', 'anonymous')

    if not query:
        return jsonify({'response': 'Please ask me something!'})

    query_lower = query.lower()

    # Hours/Timings
    if re.search(r'(timing|hours|open|close|when|time)', query_lower):
        response = f"""Our operating hours are:

Weekdays: {FACILITY_INFO['hours']['weekdays']}
Weekends: {FACILITY_INFO['hours']['weekends']}

Note: The library is closed on Mondays (facility remains open for cowork/study space).
We're closed on public holidays."""
        return jsonify({'response': response})

    # Infrastructure
    if re.search(r'(wifi|wi-fi|internet)', query_lower):
        return jsonify({'response': f"Wi-Fi: {FACILITY_INFO['infrastructure']['wifi']}"})

    if re.search(r'(ac|air condition|cooling)', query_lower):
        return jsonify({'response': f"Air Conditioning: {FACILITY_INFO['infrastructure']['ac']}"})

    if re.search(r'(restroom|toilet|washroom|bathroom)', query_lower):
        return jsonify({'response': f"Restrooms: {FACILITY_INFO['infrastructure']['restroom']}"})

    if re.search(r'(power|backup|electricity|ups)', query_lower):
        return jsonify({'response': f"Power Backup: {FACILITY_INFO['infrastructure']['power_backup']}"})

    if re.search(r'(parking|car|vehicle)', query_lower):
        return jsonify({'response': f"Parking: {FACILITY_INFO['infrastructure']['parking']}"})

    # Location
    if re.search(r'(location|address|where|reach|directions)', query_lower):
        response = f"""We're located in {FACILITY_INFO['location']['area']}.

Address: {FACILITY_INFO['location']['address']}

You can find directions on our Contact page or use Google Maps."""
        return jsonify({'response': response})

    # Membership
    if re.search(r'(membership|plan|subscription|fee|cost|price)', query_lower):
        if 'cowork' in query_lower:
            response = """Our cowork space offers flexible plans:

- Hot Desk: Flexible seating
- Dedicated Desk: Your own space
- Monthly subscriptions available

Visit our Cowork page for detailed pricing and booking."""
        elif 'study' in query_lower:
            response = """Study space is available with:

- Hourly plans
- Daily plans
- Monthly subscriptions

Visit our Study Space page for pricing."""
        else:
            response = """We offer various membership plans:

Library Membership: Multiple plans for different reading needs
Cowork Space: Flexible and dedicated desk options
Study Space: Hourly, daily, and monthly plans

Visit our website or call us for detailed pricing!"""
        return jsonify({'response': response})

    # Book search - ISBN
    isbn_match = re.search(r'\b\d{10,13}\b', query)
    if isbn_match:
        isbn = isbn_match.group(0)
        books = search_books(isbn, 'isbn')
        if books:
            response = f"Yes! We have '{books[0][0]}'"
            if books[0][1]:
                response += f" by {books[0][1]}"
            response += ". Log in to see availability."
        else:
            response = f"Sorry, we don't have a book with ISBN {isbn} in our catalogue."
        return jsonify({'response': response})

    # Book search - Author
    if re.search(r'(by|author|written)', query_lower):
        # Extract author name
        author_match = re.search(r'(?:by|author)\s+([a-z\s]+)', query_lower)
        if author_match:
            author = author_match.group(1).strip()
            books = search_books(author, 'author')
            if books:
                response = f"Yes! We have books by {author}:\n\n"
                for book in books[:3]:
                    response += f"- {book[0]}\n"
                if len(books) > 3:
                    response += f"\n...and {len(books) - 3} more! Log in to see full list."
            else:
                response = f"Sorry, we don't have books by {author} in our current catalogue."
            return jsonify({'response': response})

    # Book search - Title
    if re.search(r'(book|have|title)', query_lower):
        # Try to extract book title
        title_match = re.search(r'(?:book|have|title)\s+"([^"]+)"', query)
        if not title_match:
            title_match = re.search(r'(?:book|have|title)\s+(.+)', query)

        if title_match:
            title = title_match.group(1).strip()
            books = search_books(title, 'title')
            if books:
                if len(books) == 1:
                    response = f"Yes! We have '{books[0][0]}'"
                    if books[0][1]:
                        response += f" by {books[0][1]}"
                    response += ". Log in to see availability."
                else:
                    response = f"We have {len(books)} books matching '{title}':\n\n"
                    for book in books[:3]:
                        author_info = f" by {book[1]}" if book[1] else ""
                        response += f"- {book[0]}{author_info}\n"
                    if len(books) > 3:
                        response += f"\n...and more! Log in to browse our full catalogue."
            else:
                response = f"Sorry, we don't have '{title}' in our current catalogue. We're always adding new books!"
            return jsonify({'response': response})

    # Default response
    response = """I can help you with:

- Library timings and hours
- Facilities (Wi-Fi, AC, restrooms, parking)
- Membership and pricing plans
- Book availability (search by title, author, or ISBN)
- Location and directions

What would you like to know?"""

    return jsonify({'response': response})
```

### 9. Register New Blueprints (`backend/app/__init__.py`)

Add to your existing `__init__.py`:

```python
# Add imports
from app.routes.public_api import public_bp
from app.routes.chatbot_api import chatbot_bp

# Register blueprints (add after existing registrations)
app.register_blueprint(public_bp)
app.register_blueprint(chatbot_bp)
```

### 10. Update LMS Frontend Package.json

```bash
cd lms-frontend

# Update build command if needed
cat > package.json << 'EOF'
{
  "name": "nuk-lms",
  "version": "2.0.0",
  "description": "Nuk Library Management System - Admin & Patron Portal",
  "scripts": {
    "start": "react-scripts start",
    "build": "react-scripts build",
    "test": "react-scripts test",
    "eject": "react-scripts eject"
  },
  // ... rest of your existing package.json
}
EOF
```

---

## Next Steps to Start Development

1. **Restructure the project** (follow Step 2)
2. **Initialize website** (follow Step 3)
3. **Add sample images** to `website/public/images/hero/`
4. **Start development servers:**
   ```bash
   # Terminal 1: Backend
   cd backend
   python run.py

   # Terminal 2: LMS
   cd lms-frontend
   npm start   # Runs on :3000

   # Terminal 3: Website
   cd website
   npm run dev  # Runs on :3001
   ```

5. **Test the chatbot** by visiting http://localhost:3001 and clicking the chat widget

6. **Gradually build out pages** following the design in the architecture document

---

## Deployment Checklist

- [ ] Add actual address and contact information
- [ ] Upload high-quality images
- [ ] Get Google Places API key
- [ ] Setup Instagram/Facebook developer accounts
- [ ] Configure domain (mynuk.com)
- [ ] Setup SSL certificates
- [ ] Configure production environment variables
- [ ] Test all chatbot queries
- [ ] Mobile responsiveness testing
- [ ] SEO optimization (meta tags, sitemap)
- [ ] Google Analytics setup
- [ ] Performance optimization (image compression, lazy loading)

---

**Ready to start? Follow the steps above and you'll have a beautiful, functional website integrated with your LMS!**
