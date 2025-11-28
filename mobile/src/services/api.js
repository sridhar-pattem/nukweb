import axios from 'axios';
import * as SecureStore from 'expo-secure-store';
import Constants from 'expo-constants';

const API_BASE_URL = Constants.expoConfig?.extra?.apiUrl || 'http://localhost:5001/api';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

apiClient.interceptors.request.use(async (config) => {
  const token = await SecureStore.getItemAsync('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      SecureStore.deleteItemAsync('token');
      SecureStore.deleteItemAsync('user');
    }
    return Promise.reject(error);
  }
);

export const authAPI = {
  login: (credentials) => apiClient.post('/auth/login', credentials),
};

export const patronAPI = {
  getBorrowings: (status = 'active') => apiClient.get('/patron/my-borrowings', { params: { status } }),
  getRecommendations: () => apiClient.get('/patron/recommendations'),
  semanticSearch: (query, limit = 6) => apiClient.post('/patron/books/semantic-search', { query, limit }),
};

export default apiClient;
