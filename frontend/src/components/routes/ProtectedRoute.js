import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { isAuthenticated } from '../../utils/auth';

/**
 * Protected Route Component
 * Ensures the user is authenticated before accessing protected routes
 * Redirects to login page if not authenticated
 */
const ProtectedRoute = () => {
  if (!isAuthenticated()) {
    // Redirect to login if not authenticated
    return <Navigate to="/login" replace />;
  }
  
  // Render child routes if authenticated
  return <Outlet />;
};

export default ProtectedRoute;
