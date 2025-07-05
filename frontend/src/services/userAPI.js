import api from './api';

// User API endpoints
export const userAPI = {
  getAllUsers: () => api.get('/api/users'),
  getUser: (id) => api.get(`/api/users/${id}`),
  updateUser: (id, userData) => api.put(`/api/users/${id}`, userData),
  deleteUser: (id) => api.delete(`/api/users/${id}`)
};

export default userAPI;
