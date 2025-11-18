# Nuk Library Website

A modern, responsive website for Nuk Library - Bangalore's premier community library offering library services, cowork space, study space, and cultural activities.

## 🌟 Features

### Public Website
- **Home Page**: Hero section, stats, services overview, new arrivals, upcoming events, testimonials
- **About Us**: Library history, mission, values, location details
- **Services**: Library, Cowork Space, Study Space, and Café information
- **Book Catalogue**: Browse books with search and filters (sample for non-members, full access for members)
- **New Arrivals**: Latest book additions with filtering
- **Recommendations**: Curated book lists by age group and genre
- **Events & Activities**: Upcoming events, regular activities, event registration
- **Blog**: Member stories, book reviews, and reading experiences
- **Contact**: Contact form, location map, FAQs
- **Membership Plans**: Detailed pricing for all services

### Interactive Features
- **AI Chatbot**: 24/7 assistance for facility information, membership queries, book searches
- **Social Media Integration**: Live feeds from Instagram and Facebook
- **Google Reviews Widget**: Display and encourage reviews
- **Responsive Design**: Mobile-first, works on all devices
- **SEO Optimized**: Meta tags, semantic HTML, structured data

## 🎨 Design Theme

- **Color Palette**: Light & elegant with warm beige and brown tones
- **Typography**: Playfair Display (headings) + Open Sans (body)
- **Style**: Clean, spacious, card-based layouts with ample white space
- **Components**: Reusable, modular design system

## 🛠️ Tech Stack

- **Framework**: React 18.2.0
- **Routing**: React Router DOM 6.20.0
- **HTTP Client**: Axios 1.6.2
- **Icons**: React Icons 4.12.0
- **Animations**: Framer Motion 10.16.16
- **Styling**: Custom CSS with CSS Variables
- **Build Tool**: Create React App

## 📋 Prerequisites

- Node.js 14+ and npm
- Git

## 🚀 Getting Started

### 1. Installation

```bash
# Navigate to the website directory
cd website

# Install dependencies
npm install
```

### 2. Environment Setup

Create a `.env` file in the website directory:

```bash
cp .env.example .env
```

Edit `.env` with your configuration:

```
REACT_APP_API_URL=http://localhost:5000/api
REACT_APP_GOOGLE_MAPS_API_KEY=your_google_maps_key
REACT_APP_GOOGLE_ANALYTICS_ID=your_ga_id
```

### 3. Run Development Server

```bash
npm start
```

The website will open at `http://localhost:3000`

### 4. Build for Production

```bash
npm run build
```

This creates an optimized production build in the `build/` directory.

## 📁 Project Structure

```
website/
├── public/
│   ├── index.html              # HTML template
│   ├── manifest.json           # PWA manifest
│   └── assets/
│       └── images/             # Static images
├── src/
│   ├── components/
│   │   ├── layout/             # Header, Footer
│   │   ├── pages/              # All page components
│   │   ├── widgets/            # Chatbot, SocialFeed, GoogleReviews
│   │   └── shared/             # Reusable components (BookCard, EventCard)
│   ├── services/
│   │   └── api.js              # API service layer
│   ├── styles/
│   │   ├── theme.css           # Design system, variables
│   │   └── components.css      # Component-specific styles
│   ├── App.js                  # Main app with routing
│   └── index.js                # Entry point
├── package.json
├── .env.example
└── README.md
```

## 🎯 Key Components

### Pages
- **Home**: `/` - Landing page with overview
- **About Us**: `/about` - Library information
- **Services**: `/services` - All services overview
- **Library Service**: `/services/library` - Library details
- **Cowork Service**: `/services/cowork` - Cowork space details
- **Study Space Service**: `/services/study-space` - Study space details
- **Catalogue**: `/catalogue` - Book catalogue
- **Book Detail**: `/books/:id` - Individual book page
- **New Arrivals**: `/new-arrivals` - Latest books
- **Recommendations**: `/recommendations` - Curated lists
- **Events**: `/events` - All events
- **Event Detail**: `/events/:id` - Individual event
- **Blog**: `/blog` - All blog posts
- **Blog Post**: `/blog/:id` - Individual post
- **Contact**: `/contact` - Contact form
- **Membership**: `/membership` - Membership plans

### Widgets
- **Chatbot**: Floating chat widget with FAQ responses
- **SocialFeed**: Instagram/Facebook feed integration
- **GoogleReviews**: Google Reviews display

## 🤖 Chatbot Capabilities

The chatbot can answer queries about:
- Facility information (hours, location, parking, amenities)
- Membership plans (library, cowork, study space)
- Services and pricing
- Activities and events (chess, art, Toastmasters, Rubik's cube)
- General FAQs

**Note**: Book search queries will be connected to the backend API when integrated.

## 🔌 API Integration

The website is ready for backend integration. All API calls are defined in `src/services/api.js`:

- **Website APIs**: Home data, services, contact form
- **Catalogue APIs**: Books, search, reviews, reservations
- **Events APIs**: Events list, registration
- **Blog APIs**: Posts, comments, submission
- **Bookings APIs**: Cowork, study space, meeting room bookings
- **Chatbot APIs**: Query processing, book search
- **Authentication APIs**: Login, register, user management

## 🎨 Customization

### Colors
Edit `src/styles/theme.css`:

```css
:root {
  --primary-bg: #F5F5DC;
  --secondary-brown: #8B7355;
  --accent-peru: #CD853F;
  /* ... more variables */
}
```

### Fonts
Change in `public/index.html` and `src/styles/theme.css`

### Content
Update text, images, and data in respective component files.

## 📱 Responsive Breakpoints

- **Desktop**: 1200px+
- **Tablet**: 768px - 1199px
- **Mobile**: < 768px

## 🌐 Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## 🚀 Deployment

### Vercel (Recommended)

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel
```

### Netlify

```bash
# Build
npm run build

# Deploy the build folder via Netlify UI or CLI
```

### Traditional Hosting

1. Run `npm run build`
2. Upload the `build/` folder to your web server
3. Configure server to serve `index.html` for all routes

## 🔧 Backend Integration

When connecting to the backend:

1. Update `.env` with your API URL
2. Backend should be running (Flask app from `/backend`)
3. Ensure CORS is configured on the backend
4. Test API endpoints using the defined service methods

## 📝 To-Do Before Going Live

- [ ] Replace placeholder images with actual library photos
- [ ] Update contact information (phone, email, address)
- [ ] Configure Google Maps integration
- [ ] Set up Google Analytics
- [ ] Configure social media API keys
- [ ] Test all forms and API integrations
- [ ] Add actual book data to catalogue
- [ ] Create real event listings
- [ ] Set up SSL certificate
- [ ] Configure custom domain

## 🤝 Contributing

This is a private project for Nuk Library. For any changes:

1. Create a feature branch
2. Make your changes
3. Test thoroughly
4. Submit for review

## 📄 License

Proprietary - © 2024 Nuk Library. All rights reserved.

## 📞 Support

For technical support, contact: [developer contact]

## 🎉 Acknowledgments

- React community for excellent documentation
- Open source libraries used in this project
- Nuk Library team for content and requirements

---

**Built with ❤️ for the Nuk Library community**
