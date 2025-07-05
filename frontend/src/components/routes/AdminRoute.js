import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { isAuthenticated, isAdmin } from '../../utils/auth';

/**
 * Admin Route Component
 * Ensures the user is authenticated AND has admin role
 * Redirects to login page if not authenticated
 * Redirects to dashboard if authenticated but not admin
 */
const AdminRoute = () => {
  if (!isAuthenticated()) {
    // Redirect to login if not authenticated
    return <Navigate to="/login" replace />;
  }
  
  if (!isAdmin()) {
    // Redirect to user dashboard if authenticated but not admin
    return <Navigate to="/dashboard" replace />;
  }
  
  // Render child routes if authenticated and admin
  return <Outlet />;
};

export default AdminRoute;
