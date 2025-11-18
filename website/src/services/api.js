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
