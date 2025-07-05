import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { 
  FaPlaneDeparture, 
  FaUser, 
  FaSignOutAlt, 
  FaBars, 
  FaUserShield
} from 'react-icons/fa';
import { logoutUser } from '../../store/slices/authSlice';
import { toggleSidebar } from '../../store/slices/uiSlice';

const AdminNavbar = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const { user } = useSelector((state) => state.auth);

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
    <nav className="bg-gray-800 border-b border-gray-700 sticky top-0 z-10 shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo and hamburger */}
          <div className="flex items-center">
            <button 
              className="mr-2 p-2 rounded-md text-gray-400 lg:hidden hover:text-white hover:bg-gray-700 focus:outline-none"
              onClick={openMobileSidebar}
            >
              <FaBars className="h-5 w-5" />
            </button>
            
            <Link to="/admin/dashboard" className="flex items-center">
              <FaPlaneDeparture className="h-8 w-8 text-blue-500" />
              <div className="ml-2">
                <span className="text-xl font-bold text-white">FlyEasy</span>
                <span className="ml-2 text-xs bg-blue-600 text-white px-2 py-0.5 rounded">Admin</span>
              </div>
            </Link>
          </div>
          
          {/* Status indicator */}
          <div className="hidden lg:block">
            <div className="flex items-center bg-dark-800 px-3 py-1 rounded-full">
              <div className="h-2 w-2 rounded-full bg-green-500 mr-2"></div>
              <span className="text-xs text-gray-300">System Online</span>
            </div>
          </div>
          
          {/* Right side dropdown */}
          <div className="flex items-center">
            
            {/* User dropdown menu */}
            <div className="relative ml-3">
              <div>
                <button
                  className="flex items-center max-w-xs p-2 text-sm bg-dark-700 rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-dark-800 focus:ring-primary-500"
                  onClick={toggleDropdown}
                >
                  <span className="sr-only">Open user menu</span>
                  <div className="h-8 w-8 rounded-full flex items-center justify-center bg-primary-600 text-white">
                    <FaUserShield />
                  </div>
                  <span className="ml-2 text-gray-300 hidden sm:block">
                    {user?.name || 'Admin'}
                  </span>
                </button>
              </div>
              
              {isDropdownOpen && (
                <div className="origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-lg py-1 bg-dark-700 ring-1 ring-black ring-opacity-5 focus:outline-none">
                  <div className="px-4 py-2 text-xs text-gray-400">Admin Options</div>
                  

                  
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
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default AdminNavbar;
