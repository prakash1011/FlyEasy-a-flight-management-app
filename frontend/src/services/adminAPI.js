import api from './api';

// Admin API endpoints
export const adminAPI = {
  getDashboardStats: () => api.get('/api/admin/dashboard-stats'),
  getRecentBookings: () => api.get('/api/admin/recent-bookings'),
};

export default adminAPI;
