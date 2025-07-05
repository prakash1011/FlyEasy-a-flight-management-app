import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { 
  FaPlaneDeparture, 
  FaUser, 
  FaSignOutAlt, 
  FaSearch,
  FaTicketAlt,
  FaBars,
  FaQuestionCircle,
  FaHeadset,
  FaSignInAlt,
  FaUserPlus
} from 'react-icons/fa';
import { logoutUser } from '../../store/slices/authSlice';
import { toggleSidebar } from '../../store/slices/uiSlice';

const Navbar = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const { user, isAuthenticated } = useSelector((state) => state.auth);
  const { isSidebarOpen } = useSelector((state) => state.ui);

  const handleLogout = () => {
    dispatch(logoutUser());
    navigate('/login');
  };
  
  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };
  
  const openMobileSidebar = () => {
    dispatch(toggleSidebar());
  };

  return (
    <nav className="bg-dark-800 border-b border-dark-600 sticky top-0 z-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo and hamburger */}
          <div className="flex items-center">
            <button 
              className="p-2 rounded-md text-gray-300 lg:hidden hover:text-white hover:bg-primary-600 focus:outline-none transition-colors duration-200"
              onClick={openMobileSidebar}
              aria-label="Toggle navigation menu"
            >
              <FaBars className="h-6 w-6" />
              <span className="sr-only">Open menu</span>
            </button>
            
            <Link to="/" className="flex items-center ml-2 lg:ml-0">
              <FaPlaneDeparture className="h-8 w-8 text-primary-500" />
              <span className="ml-2 text-xl font-bold text-white">FlyEasy</span>
            </Link>
          </div>
          
          {/* Navigation links - visible on desktop */}
          <div className="hidden lg:block">
            <div className="flex items-center space-x-4">
              <Link 
                to="/search" 
                className="px-3 py-2 rounded-md text-sm font-medium text-gray-300 hover:bg-dark-700 hover:text-white transition-colors duration-200"
              >
                <span className="flex items-center">
                  <FaSearch className="mr-1" />
                  Search Flights
                </span>
              </Link>
              
              {isAuthenticated && (
                <>
                  <Link 
                    to="/dashboard" 
                    className="px-3 py-2 rounded-md text-sm font-medium text-gray-300 hover:bg-dark-700 hover:text-white transition-colors duration-200"
                  >
                    Dashboard
                  </Link>
                  <Link 
                    to="/my-bookings" 
                    className="px-3 py-2 rounded-md text-sm font-medium text-gray-300 hover:bg-dark-700 hover:text-white transition-colors duration-200"
                  >
                    <span className="flex items-center">
                      <FaTicketAlt className="mr-1" />
                      My Bookings
                    </span>
                  </Link>
                </>
              )}
              
              {/* Navigation items end */}
            </div>
          </div>
          
          {/* User menu - different options based on authentication status */}
          <div className="flex items-center">
            <div className="relative ml-3">
              {/* If authenticated, show user profile dropdown */}
              {isAuthenticated ? (
                <>
                  <button
                    className="flex items-center max-w-xs p-2 text-sm bg-dark-700 rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-dark-800 focus:ring-primary-500"
                    onClick={toggleDropdown}
                  >
                    <span className="sr-only">Open user menu</span>
                    <div className="h-8 w-8 rounded-full flex items-center justify-center bg-primary-600 text-white">
                      {user?.name ? user.name.charAt(0).toUpperCase() : <FaUser />}
                    </div>
                    <span className="ml-2 text-gray-300 hidden sm:block">
                      {user?.name || 'User'}
                    </span>
                  </button>
                  
                  {isDropdownOpen && (
                    <div className="origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-lg py-1 bg-dark-700 ring-1 ring-black ring-opacity-5 focus:outline-none">
                      <div className="px-4 py-2 text-xs text-gray-400">Account Options</div>
                      
                      <button
                        onClick={() => {
                          setIsDropdownOpen(false);
                          handleLogout();
                        }}
                        className="w-full text-left block px-4 py-2 text-sm text-gray-300 hover:bg-dark-600 hover:text-white"
                      >
                        <div className="flex items-center">
                          <FaSignOutAlt className="mr-2" />
                          Sign out
                        </div>
                      </button>
                    </div>
                  )}
                </>
              ) : (
                /* If not authenticated, show login/signup buttons */
                <div className="flex space-x-2">
                  <Link 
                    to="/login" 
                    className="px-3 py-2 rounded-md text-sm font-medium text-gray-300 hover:bg-primary-600 hover:text-white transition-colors duration-200 flex items-center"
                  >
                    <FaSignInAlt className="mr-1" />
                    <span>Login</span>
                  </Link>
                  <Link 
                    to="/register" 
                    className="px-3 py-2 rounded-md text-sm font-medium bg-primary-600 text-white hover:bg-primary-700 transition-colors duration-200 flex items-center"
                  >
                    <FaUserPlus className="mr-1" />
                    <span>Sign Up</span>
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Help Button - Only visible on mobile when sidebar is closed */}
      <div className="lg:hidden px-4 pb-2 flex">
        {!isSidebarOpen && (
          <button 
            onClick={openMobileSidebar} 
            className="flex items-center justify-center bg-dark-700 text-gray-300 rounded-md py-2 px-4 w-full hover:bg-dark-600 transition-colors duration-200"
          >
            <FaHeadset className="mr-2" />
            <span>Need Help?</span>
          </button>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
