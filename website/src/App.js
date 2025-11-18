import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Header from './components/layout/Header';
import Footer from './components/layout/Footer';
import Home from './components/pages/Home';
import AboutUs from './components/pages/AboutUs';
import Services from './components/pages/Services';
import LibraryService from './components/pages/LibraryService';
import CoworkService from './components/pages/CoworkService';
import StudySpaceService from './components/pages/StudySpaceService';
import Catalogue from './components/pages/Catalogue';
import BookDetail from './components/pages/BookDetail';
import NewArrivals from './components/pages/NewArrivals';
import Recommendations from './components/pages/Recommendations';
import Events from './components/pages/Events';
import EventDetail from './components/pages/EventDetail';
import Blog from './components/pages/Blog';
import BlogPost from './components/pages/BlogPost';
import Contact from './components/pages/Contact';
import MembershipPlans from './components/pages/MembershipPlans';
import Chatbot from './components/widgets/Chatbot';

function App() {
  return (
    <Router>
      <div className="App">
        <Header />
        <main>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/about" element={<AboutUs />} />
            <Route path="/services" element={<Services />} />
            <Route path="/services/library" element={<LibraryService />} />
            <Route path="/services/cowork" element={<CoworkService />} />
            <Route path="/services/study-space" element={<StudySpaceService />} />
            <Route path="/catalogue" element={<Catalogue />} />
            <Route path="/books/:id" element={<BookDetail />} />
            <Route path="/new-arrivals" element={<NewArrivals />} />
            <Route path="/recommendations" element={<Recommendations />} />
            <Route path="/events" element={<Events />} />
            <Route path="/events/:id" element={<EventDetail />} />
            <Route path="/blog" element={<Blog />} />
            <Route path="/blog/:id" element={<BlogPost />} />
            <Route path="/membership" element={<MembershipPlans />} />
            <Route path="/contact" element={<Contact />} />
          </Routes>
        </main>
        <Footer />
        <Chatbot />
      </div>
    </Router>
  );
}

export default App;
