import axios from 'axios';

/**
 * Centralized Axios instance for QuickFix.
 * Configured with configurable base URL, timeout, and request/response interceptors.
 */
const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api',
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor: attach auth token if available
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('quickfix_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor: handle 401 Unauthorized and standard error reporting
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response) {
      // 401 Unauthorized: token expired or invalid
      if (error.response.status === 401) {
        localStorage.removeItem('quickfix_token');
        localStorage.removeItem('quickfix_user');
        window.dispatchEvent(new CustomEvent('quickfix:unauthorized'));
      }
    }
    return Promise.reject(error);
  }
);

/**
 * Normalizes error messages from Axios responses or network failures
 * @param {Error} error 
 * @returns {string} user-friendly error message
 */
export function getApiErrorMessage(error) {
  if (!error) return 'An unexpected error occurred.';
  if (error.response?.data?.message) {
    return error.response.data.message;
  }
  if (error.response?.data?.error) {
    return error.response.data.error;
  }
  if (error.message === 'Network Error') {
    return 'Unable to connect to the QuickFix server. Please check your network or backend server connection.';
  }
  if (error.code === 'ECONNABORTED') {
    return 'The request timed out. Please try again.';
  }
  return error.message || 'An unexpected error occurred.';
}

export default api;
