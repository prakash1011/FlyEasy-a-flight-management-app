import axios from 'axios';

// Create axios instance with defaults
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Request interceptor for adding auth token
api.interceptors.request.use(
  config => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
      // Removed console.log to prevent console spam
    }
    return config;
  },
  error => {
    // Only log critical errors
    console.error('Request interceptor error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  response => response,
  error => {
    // Handle token expiration
    if (error.response?.status === 401) {
      // Clear token and redirect to login if unauthorized
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Flight API endpoints
export const flightAPI = {
  getAllFlights: () => api.get('/api/flights'),
  getFlightById: (id) => api.get(`/api/flights/${id}`),
  getStaticFlights: () => fetch('/flights.json').then(response => response.json()),
  getStaticFlightById: (id) => 
    fetch('/flights.json')
      .then(response => response.json())
      .then(flights => flights.find(flight => flight.id === id)),
  updateFlight: (id, flightData) => api.put(`/api/flights/${id}`, flightData),
  deleteFlight: (id) => api.delete(`/api/flights/${id}`),
  createFlight: (flightData) => api.post('/api/flights', flightData),
  // For static file data, these would normally use server endpoints
  // but for demo purposes, we're providing methods that would need server implementation
  updateStaticFlight: (id, flightData) => {
    console.log('Update flight in static file:', id, flightData);
    return Promise.resolve({ data: { success: true, data: flightData } });
  },
  deleteStaticFlight: (id) => {
    console.log('Delete flight from static file:', id);
    return Promise.resolve({ data: { success: true } });
  },
  createStaticFlight: (flightData) => {
    console.log('Create flight in static file:', flightData);
    return Promise.resolve({ data: { success: true, data: { ...flightData, id: 'FL' + Math.floor(1000 + Math.random() * 9000) } } });
  }
};

// Auth API endpoints
export const authAPI = {
  login: (credentials) => api.post('/api/auth/login', credentials),
  register: (userData) => api.post('/api/auth/register', userData),
  getCurrentUser: () => api.get('/api/auth/me'),
  logout: () => {
    localStorage.removeItem('token');
    return Promise.resolve();
  }
};

// Booking API endpoints
export const bookingAPI = {
  createBooking: (bookingData) => api.post('/api/bookings', bookingData),
  getUserBookings: () => api.get('/api/bookings/my-bookings'),
  getBookingById: (id) => api.get(`/api/bookings/${id}`),
  cancelBooking: (id) => api.patch(`/api/bookings/${id}/cancel`),
  rescheduleBooking: (id, data) => api.patch(`/api/bookings/${id}/reschedule`, data),
  getAllBookings: () => api.get('/api/bookings') // Admin endpoint for all bookings
};

export default api;
