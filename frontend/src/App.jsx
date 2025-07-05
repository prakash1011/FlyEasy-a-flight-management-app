import { useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';

// Layout Components
import MainLayout from './layouts/MainLayout';
import AuthLayout from './layouts/AuthLayout';
import AdminLayout from './layouts/AdminLayout';

// Pages
import Home from './pages/Home';
import TestPage from './pages/TestPage';

// Auth Pages
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import LoginTest from './pages/auth/LoginTest';

// User Pages
import Dashboard from './pages/user/Dashboard';
import SearchFlights from './pages/user/SearchFlights';
import BookingPage from './pages/user/BookingPage';
import BookingConfirmation from './pages/user/BookingConfirmation';
import AvailableFlights from './pages/user/AvailableFlights';
import Profile from './pages/user/Profile';
import MyBookings from './pages/user/MyBookings';
import TravelHistory from './pages/user/TravelHistory';
import PaymentMethods from './pages/user/PaymentMethods';

// Admin Pages
import AdminDashboard from './pages/admin/Dashboard';
import AdminFlights from './pages/admin/Flights';
import AdminUsers from './pages/admin/Users';
import AdminBookings from './pages/admin/Bookings';

// Redux slice
import { checkAuthStatus } from './store/slices/authSlice';

// Protected Route Components
const ProtectedRoute = ({ children, requiredRole = null }) => {
  const { isAuthenticated, user } = useSelector((state) => state.auth);
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  if (requiredRole && user?.role !== requiredRole) {
    return <Navigate to="/" replace />;
  }
  
  return children;
};

function App() {
  const dispatch = useDispatch();
  
  useEffect(() => {
    // Check authentication status when app loads
    dispatch(checkAuthStatus());
  }, [dispatch]);

  return (
    <Routes>
      {/* Home Route */}
      <Route path="/" element={<Home />} />
      
      {/* Test Route - for debugging */}
      <Route path="/test" element={<TestPage />} />
      
      {/* Auth Routes */}
      <Route element={<AuthLayout />}>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/login-test" element={<LoginTest />} />
      </Route>
      
      {/* User Routes */}
      <Route element={<MainLayout />}>
        {/* Public route for viewing flights */}
        <Route path="/flights" element={<AvailableFlights />} />
        
        <Route 
          path="/dashboard" 
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          } 
        />
        
        <Route 
          path="/search" 
          element={
            <ProtectedRoute>
              <SearchFlights />
            </ProtectedRoute>
          } 
        />
        
        <Route 
          path="/profile" 
          element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          } 
        />
        
        <Route 
          path="/my-bookings" 
          element={
            <ProtectedRoute>
              <MyBookings />
            </ProtectedRoute>
          } 
        />
        
        <Route 
          path="/travel-history" 
          element={
            <ProtectedRoute>
              <TravelHistory />
            </ProtectedRoute>
          } 
        />
        
        <Route 
          path="/payment-methods" 
          element={
            <ProtectedRoute>
              <PaymentMethods />
            </ProtectedRoute>
          } 
        />
        
        <Route 
          path="/book/:flightId" 
          element={
            <ProtectedRoute>
              <BookingPage />
            </ProtectedRoute>
          } 
        />
        
        <Route 
          path="/booking-confirmation/:bookingId" 
          element={
            <ProtectedRoute>
              <BookingConfirmation />
            </ProtectedRoute>
          } 
        />
      </Route>
      
      {/* Admin Routes */}
      <Route element={<AdminLayout />}>
        <Route 
          path="/admin/dashboard" 
          element={
            <ProtectedRoute requiredRole="admin">
              <AdminDashboard />
            </ProtectedRoute>
          } 
        />
        
        <Route 
          path="/admin/flights" 
          element={
            <ProtectedRoute requiredRole="admin">
              <AdminFlights />
            </ProtectedRoute>
          } 
        />
        
        <Route 
          path="/admin/users" 
          element={
            <ProtectedRoute requiredRole="admin">
              <AdminUsers />
            </ProtectedRoute>
          } 
        />
        
        <Route 
          path="/admin/bookings" 
          element={
            <ProtectedRoute requiredRole="admin">
              <AdminBookings />
            </ProtectedRoute>
          } 
        />
      </Route>
      
      {/* 404 Route */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
