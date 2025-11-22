import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/common/ProtectedRoute';
import ModernHeader from './components/layout/ModernHeader';
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

// Auth Components
import Login from './components/auth/Login';
import Register from './components/auth/Register';
import Profile from './components/auth/Profile';

// Patron Components
import PatronDashboard from './components/patron/PatronDashboard';
import BlogPostEditor from './components/patron/BlogPostEditor';
import BookSuggestionForm from './components/patron/BookSuggestionForm';
import TestimonialForm from './components/patron/TestimonialForm';

// Patron Library Components
import LibraryDashboard from './components/patron/library/LibraryDashboard';
import BorrowingsList from './components/patron/library/BorrowingsList';
import BookBrowse from './components/patron/library/BookBrowse';
import PatronBookDetail from './components/patron/library/BookDetail';

// Admin Components
import AdminDashboard from './components/admin/AdminDashboard';
import ModerationQueue from './components/admin/ModerationQueue';
import EventManagement from './components/admin/EventManagement';
import EventForm from './components/admin/EventForm';

// Website Admin Component
import WebsiteAdminDashboard from './components/admin/WebsiteAdmin/WebsiteAdminDashboard';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="App">
          <ModernHeader />
          <main>
            <Routes>
              {/* Public Routes */}
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

              {/* Auth Routes */}
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route
                path="/profile"
                element={
                  <ProtectedRoute>
                    <Profile />
                  </ProtectedRoute>
                }
              />

              {/* Patron Routes (Protected) */}
              <Route
                path="/patron/dashboard"
                element={
                  <ProtectedRoute>
                    <PatronDashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/patron/blog/new"
                element={
                  <ProtectedRoute>
                    <BlogPostEditor />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/patron/blog/edit/:id"
                element={
                  <ProtectedRoute>
                    <BlogPostEditor />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/patron/suggestions/new"
                element={
                  <ProtectedRoute>
                    <BookSuggestionForm />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/patron/testimonials/new"
                element={
                  <ProtectedRoute>
                    <TestimonialForm />
                  </ProtectedRoute>
                }
              />

              {/* Patron Library Routes (Protected) */}
              <Route
                path="/patron/library/borrowing"
                element={
                  <ProtectedRoute>
                    <LibraryDashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/patron/library/all-borrowings"
                element={
                  <ProtectedRoute>
                    <BorrowingsList />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/patron/library/browse"
                element={
                  <ProtectedRoute>
                    <BookBrowse />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/patron/library/book/:id"
                element={
                  <ProtectedRoute>
                    <PatronBookDetail />
                  </ProtectedRoute>
                }
              />

              {/* Admin Routes (Protected - Admin Only) */}
              <Route
                path="/admin/dashboard"
                element={
                  <ProtectedRoute adminOnly={true}>
                    <AdminDashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/moderation"
                element={
                  <ProtectedRoute adminOnly={true}>
                    <ModerationQueue />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/events"
                element={
                  <ProtectedRoute adminOnly={true}>
                    <EventManagement />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/events/new"
                element={
                  <ProtectedRoute adminOnly={true}>
                    <EventForm />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/events/edit/:id"
                element={
                  <ProtectedRoute adminOnly={true}>
                    <EventForm />
                  </ProtectedRoute>
                }
              />

              {/* Website Admin Route (Protected - Admin Only) */}
              <Route
                path="/admin/website"
                element={
                  <ProtectedRoute adminOnly={true}>
                    <WebsiteAdminDashboard />
                  </ProtectedRoute>
                }
              />
            </Routes>
          </main>
          <Footer />
          <Chatbot />
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
