import axios from 'axios';

// Base API URL - will be configured via environment variables
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// Create axios instance with default config
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token if available
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Handle unauthorized access
      localStorage.removeItem('authToken');
      // Optionally redirect to login
    }
    return Promise.reject(error);
  }
);

// ===================================
// WEBSITE PUBLIC APIs
// ===================================

export const websiteAPI = {
  // Home page data
  getHomeData: () => apiClient.get('/website/home'),

  // About page
  getAboutData: () => apiClient.get('/website/about'),

  // Services
  getServices: () => apiClient.get('/website/services'),
  getMembershipPlans: () => apiClient.get('/website/membership-plans'),

  // Contact
  submitContactForm: (data) => apiClient.post('/website/contact', data),

  // Social Media
  getGoogleReviews: () => apiClient.get('/website/google-reviews'),
  getSocialFeed: (platform) => apiClient.get(`/website/social-feed/${platform}`), // platform: 'instagram' or 'facebook'
};

// ===================================
// CATALOGUE APIs
// ===================================

export const catalogueAPI = {
  // Browse books (public - limited to sample)
  getBooks: (params) => apiClient.get('/website/catalogue/sample', { params }),

  // Full catalogue (members only)
  getFullCatalogue: (params) => apiClient.get('/website/catalogue/full', { params }),

  // Book details
  getBookById: (id) => apiClient.get(`/website/catalogue/books/${id}`),

  // Search books
  searchBooks: (query) => apiClient.get('/website/catalogue/search', { params: { q: query } }),

  // New arrivals
  getNewArrivals: (days = 30) => apiClient.get('/website/new-arrivals', { params: { days } }),

  // Recommendations
  getRecommendations: (category) => apiClient.get('/website/recommendations', { params: { category } }),

  // Book reviews
  getBookReviews: (bookId) => apiClient.get(`/website/books/${bookId}/reviews`),
  addBookReview: (bookId, review) => apiClient.post(`/website/books/${bookId}/review`, review),

  // Reserve book (members only)
  reserveBook: (bookId) => apiClient.post(`/website/books/${bookId}/reserve`),
};

// ===================================
// EVENTS APIs
// ===================================

export const eventsAPI = {
  // Get all events
  getEvents: (params) => apiClient.get('/website/events', { params }),

  // Get event by ID
  getEventById: (id) => apiClient.get(`/website/events/${id}`),

  // Register for event
  registerForEvent: (eventId, data) => apiClient.post(`/website/events/${eventId}/register`, data),
};

// ===================================
// BLOG APIs
// ===================================

export const blogAPI = {
  // Get all blog posts
  getPosts: (params) => apiClient.get('/website/blog/posts', { params }),

  // Get post by ID
  getPostById: (id) => apiClient.get(`/website/blog/posts/${id}`),

  // Get comments
  getPostComments: (postId) => apiClient.get(`/website/blog/posts/${postId}/comments`),

  // Add comment (members only)
  addComment: (postId, comment) => apiClient.post(`/website/blog/posts/${postId}/comments`, comment),

  // Submit blog post (members only)
  submitPost: (post) => apiClient.post('/website/blog/posts', post),

  // Like post
  likePost: (postId) => apiClient.post(`/website/blog/posts/${postId}/like`),
};

// ===================================
// BOOKINGS APIs
// ===================================

export const bookingsAPI = {
  // Cowork space booking
  bookCoworkSpace: (data) => apiClient.post('/website/bookings/cowork', data),

  // Study space booking
  bookStudySpace: (data) => apiClient.post('/website/bookings/study', data),

  // Meeting room booking
  bookMeetingRoom: (data) => apiClient.post('/website/bookings/meeting-room', data),

  // Get user's bookings
  getMyBookings: () => apiClient.get('/website/my-bookings'),

  // Check availability
  checkAvailability: (type, date) => apiClient.get('/website/bookings/availability', {
    params: { type, date },
  }),
};

// ===================================
// CHATBOT APIs
// ===================================

export const chatbotAPI = {
  // Send query to chatbot
  sendQuery: (query) => apiClient.post('/chatbot/query', { query }),

  // Get chatbot context (for initialization)
  getContext: () => apiClient.get('/chatbot/context'),

  // Search books via chatbot
  searchBooksViaChat: (query) => apiClient.post('/chatbot/search-books', { query }),
};

// ===================================
// AUTHENTICATION APIs (for future use)
// ===================================

export const authAPI = {
  // Login
  login: (credentials) => apiClient.post('/auth/login', credentials),

  // Register
  register: (userData) => apiClient.post('/auth/register', userData),

  // Logout
  logout: () => apiClient.post('/auth/logout'),

  // Get current user
  getCurrentUser: () => apiClient.get('/auth/me'),

  // Change password
  changePassword: (data) => apiClient.post('/auth/change-password', data),
};

// ===================================
// PATRON CONTENT APIs
// ===================================

export const patronContentAPI = {
  // Blog Posts
  getBlogPosts: (params) => apiClient.get('/patron/content/blog/posts', { params }),
  getBlogPostById: (id) => apiClient.get(`/patron/content/blog/posts/${id}`),
  createBlogPost: (data) => apiClient.post('/patron/content/blog/posts', data),
  updateBlogPost: (id, data) => apiClient.put(`/patron/content/blog/posts/${id}`, data),
  deleteBlogPost: (id) => apiClient.delete(`/patron/content/blog/posts/${id}`),
  submitBlogPost: (id) => apiClient.post(`/patron/content/blog/posts/${id}/submit`),

  // Book Suggestions
  getBookSuggestions: (params) => apiClient.get('/patron/content/suggestions', { params }),
  createBookSuggestion: (data) => apiClient.post('/patron/content/suggestions', data),

  // Testimonials
  getTestimonials: (params) => apiClient.get('/patron/content/testimonials', { params }),
  createTestimonial: (data) => apiClient.post('/patron/content/testimonials', data),

  // Notifications
  getNotifications: (params) => apiClient.get('/patron/content/notifications', { params }),
  markNotificationAsRead: (id) => apiClient.put(`/patron/content/notifications/${id}/read`),
  markAllNotificationsAsRead: () => apiClient.put('/patron/content/notifications/read-all'),

  // Dashboard Stats
  getDashboardStats: () => apiClient.get('/patron/content/dashboard/stats'),
};

// ===================================
// ADMIN CONTENT APIs
// ===================================

export const adminContentAPI = {
  // Dashboard
  getDashboardStats: () => apiClient.get('/admin/content/dashboard/stats'),
  getPendingContent: () => apiClient.get('/admin/content/dashboard/pending'),

  // Blog Post Moderation
  getAllBlogPosts: (params) => apiClient.get('/admin/content/blog', { params }),
  getBlogPostById: (id) => apiClient.get(`/admin/content/blog/${id}`),
  approveBlogPost: (id, data) => apiClient.post(`/admin/content/blog/${id}/approve`, data),
  rejectBlogPost: (id, data) => apiClient.post(`/admin/content/blog/${id}/reject`, data),
  requestChanges: (id, data) => apiClient.post(`/admin/content/blog/${id}/request-changes`, data),
  featureBlogPost: (id) => apiClient.post(`/admin/content/blog/${id}/feature`),
  unfeatureBlogPost: (id) => apiClient.delete(`/admin/content/blog/${id}/feature`),

  // Book Suggestion Moderation
  getAllSuggestions: (params) => apiClient.get('/admin/content/suggestions', { params }),
  approveSuggestion: (id, data) => apiClient.post(`/admin/content/suggestions/${id}/approve`, data),
  rejectSuggestion: (id, data) => apiClient.post(`/admin/content/suggestions/${id}/reject`, data),

  // Testimonial Moderation
  getAllTestimonials: (params) => apiClient.get('/admin/content/testimonials', { params }),
  approveTestimonial: (id) => apiClient.post(`/admin/content/testimonials/${id}/approve`),
  rejectTestimonial: (id, data) => apiClient.post(`/admin/content/testimonials/${id}/reject`, data),
  featureTestimonial: (id) => apiClient.post(`/admin/content/testimonials/${id}/feature`),
  unfeatureTestimonial: (id) => apiClient.delete(`/admin/content/testimonials/${id}/feature`),

  // Activity Log
  getActivityLog: (params) => apiClient.get('/admin/content/activity', { params }),
};

// ===================================
// EVENT MANAGEMENT APIs (Admin)
// ===================================

export const eventManagementAPI = {
  // Event CRUD
  getAllEvents: (params) => apiClient.get('/events', { params }),
  getEventById: (id) => apiClient.get(`/events/${id}`),
  createEvent: (data) => apiClient.post('/events', data),
  updateEvent: (id, data) => apiClient.put(`/events/${id}`, data),
  deleteEvent: (id) => apiClient.delete(`/events/${id}`),

  // Event Registration Management
  getEventRegistrations: (eventId, params) => apiClient.get(`/events/${eventId}/registrations`, { params }),
  cancelRegistration: (eventId, registrationId) => apiClient.delete(`/events/${eventId}/registrations/${registrationId}`),

  // Public Event Operations
  registerForEvent: (eventId, data) => apiClient.post(`/events/${eventId}/register`, data),
  getMyRegistrations: () => apiClient.get('/events/my-registrations'),
};

// ===================================
// HELPER FUNCTIONS
// ===================================

export const setAuthToken = (token) => {
  if (token) {
    localStorage.setItem('authToken', token);
  } else {
    localStorage.removeItem('authToken');
  }
};

export const getAuthToken = () => {
  return localStorage.getItem('authToken');
};

export const isAuthenticated = () => {
  return !!getAuthToken();
};

// Default export
export default apiClient;
