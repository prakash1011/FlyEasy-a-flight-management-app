import axios from 'axios';
import { toast } from 'react-toastify';

// Create axios instance with base URL
const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5000/api',
});

// Request interceptor to attach token to every request
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

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const { response } = error;
    
    // Handle authentication errors
    if (response && response.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      
      // Don't redirect if we're already on the login page
      if (!window.location.pathname.includes('login')) {
        toast.error('Session expired. Please log in again.');
        window.location.href = '/login';
      }
    }
    
    // Display error message
    const errorMessage = 
      (response && response.data && response.data.error) || 
      'Something went wrong. Please try again.';
    
    toast.error(errorMessage);
    
    return Promise.reject(error);
  }
);

export default api;
