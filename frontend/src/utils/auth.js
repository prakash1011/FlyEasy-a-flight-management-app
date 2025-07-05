// Auth utilities for login, logout, and role checking

/**
 * Login user and save token and user data to localStorage
 * @param {Object} data - User data and token from API
 */
export const login = (data) => {
  localStorage.setItem('token', data.token);
  localStorage.setItem('user', JSON.stringify(data.user));
};

/**
 * Logout user and remove token and user data from localStorage
 */
export const logout = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  window.location.href = '/login';
};

/**
 * Check if user is logged in
 * @returns {Boolean} - True if user has token, false otherwise
 */
export const isAuthenticated = () => {
  const token = localStorage.getItem('token');
  return !!token;
};

/**
 * Get current user data from localStorage
 * @returns {Object|null} - User data object or null if not logged in
 */
export const getCurrentUser = () => {
  const user = localStorage.getItem('user');
  return user ? JSON.parse(user) : null;
};

/**
 * Check if current user is an admin
 * @returns {Boolean} - True if user has admin role, false otherwise
 */
export const isAdmin = () => {
  const user = getCurrentUser();
  return user && user.role === 'admin';
};

/**
 * Redirect to appropriate dashboard based on user role
 */
export const redirectToDashboard = () => {
  if (isAuthenticated()) {
    if (isAdmin()) {
      window.location.href = '/admin/dashboard';
    } else {
      window.location.href = '/dashboard';
    }
  }
};
