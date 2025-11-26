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
  // Patron Import
  previewPatronImport: (formData) => api.post('/admin/import/patrons/preview', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  executePatronImport: (data) => api.post('/admin/import/patrons/execute', data),
};

// Admin - Books API
export const adminBooksAPI = {
  getBooks: (page = 1, filters = {}) =>
    api.get('/admin/books', { params: { page, ...filters } }),
  getBookDetails: (bookId) => api.get(`/admin/books/${bookId}`),
  fetchByISBN: (isbn) => api.post('/admin/books/fetch-by-isbn', { isbn }),
  addBook: (bookData) => api.post('/admin/books', bookData),
  updateBook: (bookId, bookData) => api.put(`/admin/books/${bookId}`, bookData),
  deleteBook: (bookId) => api.delete(`/admin/books/${bookId}`),
  addBookContributor: (bookId, contributorData) =>
    api.post(`/admin/books/${bookId}/contributors`, contributorData),
  updateBookContributor: (bookId, bookContributorId, contributorData) =>
    api.put(`/admin/books/${bookId}/contributors/${bookContributorId}`, contributorData),
  removeBookContributor: (bookId, bookContributorId) =>
    api.delete(`/admin/books/${bookId}/contributors/${bookContributorId}`),
  getAgeRatings: () => api.get('/admin/age-ratings'),
  addAgeRating: (ratingData) => api.post('/admin/age-ratings', ratingData),
  // Book Import
  previewBookImport: (formData) => api.post('/admin/import/books/preview', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  executeBookImport: (data) => api.post('/admin/import/books/execute', data),
};

// Admin - Contributors API
export const adminContributorsAPI = {
  getContributors: (page = 1, filters = {}) =>
    api.get('/admin/contributors', { params: { page, ...filters } }),
  getContributorDetails: (contributorId) =>
    api.get(`/admin/contributors/${contributorId}`),
  searchContributors: (query, type = '') =>
    api.get('/admin/contributors/search', { params: { q: query, type } }),
  addContributor: (contributorData) => api.post('/admin/contributors', contributorData),
  updateContributor: (contributorId, contributorData) =>
    api.put(`/admin/contributors/${contributorId}`, contributorData),
  deleteContributor: (contributorId) =>
    api.delete(`/admin/contributors/${contributorId}`),
  getRoles: () => api.get('/admin/contributors/roles'),
};

// Admin - Items API
export const adminItemsAPI = {
  getItems: (page = 1, filters = {}) =>
    api.get('/admin/items', { params: { page, ...filters } }),
  getItemDetails: (itemId) => api.get(`/admin/items/${itemId}`),
  getItemByBarcode: (barcode) => api.get(`/admin/items/by-barcode/${barcode}`),
  searchItems: (query, status = '') =>
    api.get('/admin/items/search', { params: { q: query, status } }),
  addItem: (itemData) => api.post('/admin/items', itemData),
  updateItem: (itemId, itemData) => api.put(`/admin/items/${itemId}`, itemData),
  updateItemStatus: (itemId, status) =>
    api.patch(`/admin/items/${itemId}/status`, { status }),
  deleteItem: (itemId) => api.delete(`/admin/items/${itemId}`),
  getStatuses: () => api.get('/admin/items/statuses'),
};

// Admin - RDA Vocabularies API
export const adminRDAVocabulariesAPI = {
  getContentTypes: () => api.get('/admin/rda/content-types'),
  getMediaTypes: () => api.get('/admin/rda/media-types'),
  getCarrierTypes: (mediaType = '') =>
    api.get('/admin/rda/carrier-types', { params: { media_type: mediaType } }),
  getAllVocabularies: () => api.get('/admin/rda/vocabularies'),
};

// Admin - Collections API
export const adminCollectionsAPI = {
  getCollections: () => api.get('/admin/collections'),
  createCollection: (collectionData) => api.post('/admin/collections', collectionData),
  updateCollection: (collectionId, collectionData) =>
    api.put(`/admin/collections/${collectionId}`, collectionData),
  deleteCollection: (collectionId) => api.delete(`/admin/collections/${collectionId}`),
};

// Admin - Dashboard API
export const adminDashboardAPI = {
  getStats: () => api.get('/admin/dashboard/stats'),
  getBorrowingTrends: (days = 30) => api.get('/admin/dashboard/borrowing-trends', { params: { days } }),
  getPopularBooks: (limit = 10) => api.get('/admin/dashboard/popular-books', { params: { limit } }),
  getCollectionDistribution: () => api.get('/admin/dashboard/collection-distribution'),
  getMembershipDistribution: () => api.get('/admin/dashboard/membership-distribution'),
  getOverdueBooks: () => api.get('/admin/dashboard/overdue-books'),
  getRecentActivity: (limit = 20) => api.get('/admin/dashboard/recent-activity', { params: { limit } }),
  getPatronActivity: () => api.get('/admin/dashboard/patron-activity'),
};

// Admin - Borrowings API
export const adminBorrowingsAPI = {
  issueBook: (patronId, itemId) =>
    api.post('/admin/borrowings/issue', { patron_id: patronId, item_id: itemId }),
  renewBorrowing: (borrowingId) =>
    api.post(`/admin/borrowings/${borrowingId}/renew`),
  returnBook: (borrowingId) =>
    api.post(`/admin/borrowings/${borrowingId}/return`),
  searchBorrowings: (type, value, status = 'active') =>
    api.get('/admin/borrowings/search', { params: { type, value, status } }),
  getAllBorrowings: (patronFilter = '', bookFilter = '') =>
    api.get('/admin/borrowings/all', { params: { patron: patronFilter, book: bookFilter } }),
  getBorrowingHistory: (patronId, itemId, bookId) =>
    api.get('/admin/borrowings/history', { params: { patron_id: patronId, item_id: itemId, book_id: bookId } }),
  getOverdue: () => api.get('/admin/borrowings/overdue'),
  searchPatrons: (query) => api.get('/admin/patrons/search', { params: { q: query } }),
  searchItems: (query) => api.get('/admin/items/search', { params: { q: query } }),
  getStats: () => api.get('/admin/borrowings/stats'),
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
  semanticSearch: (query, limit = 20) =>
    api.post('/patron/books/semantic-search', { query, limit }),
};

// Admin - Cowork Invoices API
export const adminCoworkInvoicesAPI = {
  getInvoices: (page = 1, perPage = 20, paymentStatus = '', search = '') =>
    api.get('/admin/cowork-invoices', {
      params: { page, per_page: perPage, payment_status: paymentStatus, search }
    }),
  getInvoice: (invoiceId) => api.get(`/admin/cowork-invoices/${invoiceId}`),
  createInvoice: (invoiceData) => api.post('/admin/cowork-invoices', invoiceData),
  updateInvoice: (invoiceId, invoiceData) =>
    api.put(`/admin/cowork-invoices/${invoiceId}`, invoiceData),
  deleteInvoice: (invoiceId) => api.delete(`/admin/cowork-invoices/${invoiceId}`),
  downloadPDF: (invoiceId) =>
    api.get(`/admin/cowork-invoices/${invoiceId}/pdf`, {
      responseType: 'blob'
    }),
};

export default api;
