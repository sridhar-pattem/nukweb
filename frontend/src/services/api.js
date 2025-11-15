import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5001/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Handle responses and errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  login: (email, password) => api.post('/auth/login', { email, password }),
  changePassword: (oldPassword, newPassword) => 
    api.post('/auth/change-password', { old_password: oldPassword, new_password: newPassword }),
  getCurrentUser: () => api.get('/auth/me'),
};

// Admin - Patrons API
export const adminPatronsAPI = {
  getPatrons: (page = 1, search = '', status = '') =>
    api.get('/admin/patrons', { params: { page, search, status } }),
  getPatronDetails: (patronId) => api.get(`/admin/patrons/${patronId}`),
  createPatron: (patronData) => api.post('/admin/patrons', patronData),
  updatePatron: (patronId, patronData) => api.put(`/admin/patrons/${patronId}`, patronData),
  resetPassword: (patronId) => api.post(`/admin/patrons/${patronId}/reset-password`),
  updateStatus: (patronId, action) =>
    api.patch(`/admin/patrons/${patronId}/status`, { action }),
  getMembershipPlans: () => api.get('/admin/membership-plans'),
  createMembershipPlan: (planData) => api.post('/admin/membership-plans', planData),
  updateMembershipPlan: (planId, planData) => api.put(`/admin/membership-plans/${planId}`, planData),
  deleteMembershipPlan: (planId) => api.delete(`/admin/membership-plans/${planId}`),
};

// Admin - Books API
export const adminBooksAPI = {
  getBooks: (page = 1, filters = {}) => 
    api.get('/admin/books', { params: { page, ...filters } }),
  fetchByISBN: (isbn) => api.post('/admin/books/fetch-by-isbn', { isbn }),
  addBook: (bookData) => api.post('/admin/books', bookData),
  updateBook: (bookId, bookData) => api.put(`/admin/books/${bookId}`, bookData),
  updateBookStatus: (bookId, status) => 
    api.patch(`/admin/books/${bookId}/status`, { status }),
  updateCopies: (bookId, action, count) => 
    api.patch(`/admin/books/${bookId}/copies`, { action, count }),
  getCollections: () => api.get('/admin/books/collections'),
  getGenres: () => api.get('/admin/books/genres'),
  getAgeRatings: () => api.get('/admin/age-ratings'),
  addAgeRating: (ratingData) => api.post('/admin/age-ratings', ratingData),
};

// Admin - Borrowings API
export const adminBorrowingsAPI = {
  issueBook: (patronId, bookId) =>
    api.post('/admin/borrowings/issue', { patron_id: patronId, book_id: bookId }),
  renewBorrowing: (borrowingId) =>
    api.post(`/admin/borrowings/${borrowingId}/renew`),
  returnBook: (borrowingId) =>
    api.post(`/admin/borrowings/${borrowingId}/return`),
  searchBorrowings: (type, value, status = 'active') =>
    api.get('/admin/borrowings/search', { params: { type, value, status } }),
  getAllBorrowings: (patronFilter = '', bookFilter = '') =>
    api.get('/admin/borrowings/all', { params: { patron: patronFilter, book: bookFilter } }),
  getBorrowingHistory: (patronId, bookId) =>
    api.get('/admin/borrowings/history', { params: { patron_id: patronId, book_id: bookId } }),
  getOverdue: () => api.get('/admin/borrowings/overdue'),
  searchPatrons: (query) => api.get('/admin/patrons/search', { params: { q: query } }),
  searchBooks: (query) => api.get('/admin/books/search', { params: { q: query } }),
};

// Patron API
export const patronAPI = {
  getBooks: (page = 1, collection = '', search = '') => 
    api.get('/patron/books', { params: { page, collection, search } }),
  getBookDetails: (bookId) => api.get(`/patron/books/${bookId}`),
  addReview: (bookId, rating, comment) => 
    api.post(`/patron/books/${bookId}/review`, { rating, comment }),
  getMyBorrowings: (status = 'active') => 
    api.get('/patron/my-borrowings', { params: { status } }),
  getRecommendations: () => api.get('/patron/recommendations'),
  requestCoworkBooking: (bookingData) => 
    api.post('/patron/cowork-booking', bookingData),
  getMyCoworkBookings: () => api.get('/patron/my-cowork-bookings'),
};

export default api;
