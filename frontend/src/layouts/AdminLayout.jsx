import { useEffect } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';

import AdminNavbar from '../components/navigation/AdminNavbar';
import AdminSidebar from '../components/navigation/AdminSidebar';
import Footer from '../components/navigation/Footer';
import Loader from '../components/ui/Loader';
import Modal from '../components/ui/Modal';
import { setDarkTheme } from '../store/slices/uiSlice';

const AdminLayout = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { isAuthenticated, user } = useSelector((state) => state.auth);
  const { isLoading, isModalOpen, modalContent, modalType, isSidebarOpen } = useSelector(
    (state) => state.ui
  );

  useEffect(() => {
    // Apply dark theme on load (based on user preference)
    dispatch(setDarkTheme());
    
    // Debug user role information
    console.log('AdminLayout - Auth state:', { isAuthenticated, userRole: user?.role });
    
    // If not authenticated, redirect to login
    if (!isAuthenticated) {
      console.log('AdminLayout - Not authenticated, redirecting to login');
      navigate('/login');
    }
    // Only redirect if user exists and is definitely not an admin
    else if (user && user.role !== 'admin') {
      console.log('AdminLayout - User is not admin, redirecting to dashboard');
      navigate('/dashboard');
    }
  }, [isAuthenticated, user, navigate, dispatch]);

  // Show debug information if there's an issue
  if (!user) {
    return (
      <div className="flex flex-col min-h-screen bg-gray-800 text-gray-100 p-6">
        <div className="bg-gray-900 p-6 rounded-lg shadow-lg">
          <h2 className="text-xl font-bold text-white mb-3">Loading Admin Panel...</h2>
          <p className="text-gray-300 mb-2">Please wait while we check your credentials.</p>
          <pre className="bg-gray-800 p-3 rounded text-sm overflow-auto">
            {JSON.stringify({auth: {isAuthenticated, user}}, null, 2)}
          </pre>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-gray-800 text-gray-100">
      <AdminNavbar />
      
      <div className="flex flex-1">
        {/* Mobile sidebar */}
        {isSidebarOpen && (
          <div className="fixed inset-0 z-20 bg-black bg-opacity-50 lg:hidden">
            <div className="absolute top-0 left-0 bottom-0 w-64 z-30">
              <AdminSidebar />
            </div>
          </div>
        )}
        
        {/* Desktop sidebar */}
        <div className="hidden lg:block w-64 shrink-0 bg-gray-900 border-r border-gray-700">
          <AdminSidebar />
        </div>
        
        {/* Main content */}
        <div className="flex-1 py-6 px-4 sm:px-6 lg:px-8">
          {isLoading ? (
            <div className="flex items-center justify-center h-full">
              <Loader />
            </div>
          ) : (
            <div className="max-w-7xl mx-auto">
              <Outlet />
            </div>
          )}
        </div>
      </div>
      
      <Footer />
      
      {/* Modal */}
      {isModalOpen && <Modal content={modalContent} type={modalType} />}
    </div>
  );
};

export default AdminLayout;
