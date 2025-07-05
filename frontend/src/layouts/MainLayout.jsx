import { useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';

import Navbar from '../components/navigation/Navbar';
import Sidebar from '../components/navigation/Sidebar';
import Footer from '../components/navigation/Footer';
import Loader from '../components/ui/Loader';
import Modal from '../components/ui/Modal';
import { setDarkTheme } from '../store/slices/uiSlice';

const MainLayout = () => {
  const dispatch = useDispatch();
  const { isLoading, isModalOpen, modalContent, modalType, isSidebarOpen } = useSelector(
    (state) => state.ui
  );
  
  useEffect(() => {
    // Apply dark theme on load (based on user preference in memory)
    dispatch(setDarkTheme());
  }, [dispatch]);

  return (
    <div className="flex flex-col min-h-screen bg-dark-800 text-gray-100">
      <Navbar />
      
      <div className="flex flex-1">
        {/* Mobile sidebar */}
        {isSidebarOpen && (
          <div className="fixed inset-0 z-20 bg-black bg-opacity-50 lg:hidden">
            <div className="absolute top-0 left-0 bottom-0 w-64 z-30">
              <Sidebar />
            </div>
          </div>
        )}
        
        {/* Desktop sidebar */}
        <div className="hidden lg:block w-64 shrink-0">
          <Sidebar />
        </div>
        
        {/* Main content */}
        <div className="flex-1 py-6 px-4 sm:px-6 lg:px-8">
          {isLoading ? (
            <div className="flex items-center justify-center h-full">
              <Loader />
            </div>
          ) : (
            <Outlet />
          )}
        </div>
      </div>
      
      <Footer />
      
      {/* Modal */}
      {isModalOpen && <Modal content={modalContent} type={modalType} />}
    </div>
  );
};

export default MainLayout;
