import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { NavLink } from 'react-router-dom';
import { 
  FaTachometerAlt, 
  FaSearch, 
  FaTicketAlt, 
  FaCalendarAlt,
  FaUserCircle,
  FaCreditCard,
  FaTimes,
  FaHeadset,
  FaQuestionCircle,
  FaSignInAlt,
  FaUserPlus
} from 'react-icons/fa';
import { closeSidebar } from '../../store/slices/uiSlice';

const Sidebar = () => {
  const dispatch = useDispatch();
  const { isAuthenticated, user } = useSelector((state) => state.auth);
  
  // We don't need to log user data on every state change
  // This was causing console spam when interacting with other components
  
  const handleCloseSidebar = () => {
    dispatch(closeSidebar());
  };
  
  // Active style for NavLink
  const activeStyle = "flex items-center px-4 py-3 text-primary-400 bg-dark-700 border-l-4 border-primary-500";
  const inactiveStyle = "flex items-center px-4 py-3 text-gray-300 hover:bg-dark-700 hover:text-primary-400 transition-colors duration-200";
  
  return (
    <div className="h-full bg-dark-800 border-r border-dark-600 flex flex-col">
      {/* Mobile close button */}
      <div className="lg:hidden flex justify-end p-4">
        <button 
          className="text-gray-400 hover:text-white focus:outline-none"
          onClick={handleCloseSidebar}
        >
          <FaTimes className="h-6 w-6" />
        </button>
      </div>
      
      {/* User profile section - only shown when authenticated */}
      {isAuthenticated && (
        <div className="px-4 py-6 lg:hidden">
          <div className="flex items-center">
            <div className="h-10 w-10 rounded-full bg-primary-600 flex items-center justify-center text-white text-xl font-bold">
              {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-white">{user?.name || 'User'}</p>
              <p className="text-xs text-gray-400">{user?.email || 'user@example.com'}</p>
            </div>
          </div>
        </div>
      )}
      
      <div className="mt-4 flex-grow">
        <h3 className="px-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">
          Main Menu
        </h3>
        
        <nav className="mt-2 space-y-1">
          {/* Always visible links */}
          <NavLink 
            to="/search"
            className={({ isActive }) => isActive ? activeStyle : inactiveStyle}
            onClick={handleCloseSidebar}
          >
            <FaSearch className="mr-3 h-5 w-5" />
            Search Flights
          </NavLink>
          
          {/* Authentication required links */}
          {isAuthenticated ? (
            <>
              <NavLink 
                to="/dashboard"
                className={({ isActive }) => isActive ? activeStyle : inactiveStyle}
                onClick={handleCloseSidebar}
              >
                <FaTachometerAlt className="mr-3 h-5 w-5" />
                Dashboard
              </NavLink>
              
              <NavLink 
                to="/my-bookings"
                className={({ isActive }) => isActive ? activeStyle : inactiveStyle}
                onClick={handleCloseSidebar}
              >
                <FaTicketAlt className="mr-3 h-5 w-5" />
                My Bookings
              </NavLink>
              
              <h3 className="px-4 mt-8 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                Account
              </h3>
              
              <NavLink 
                to="/profile"
                className={({ isActive }) => isActive ? activeStyle : inactiveStyle}
                onClick={handleCloseSidebar}
              >
                <FaUserCircle className="mr-3 h-5 w-5" />
                Profile
              </NavLink>
              
              <NavLink 
                to="/payment-methods"
                className={({ isActive }) => isActive ? activeStyle : inactiveStyle}
                onClick={handleCloseSidebar}
              >
                <FaCreditCard className="mr-3 h-5 w-5" />
                Payment Methods
              </NavLink>
              
              <NavLink 
                to="/travel-history"
                className={({ isActive }) => isActive ? activeStyle : inactiveStyle}
                onClick={handleCloseSidebar}
              >
                <FaCalendarAlt className="mr-3 h-5 w-5" />
                Travel History
              </NavLink>
            </>
          ) : (
            /* Links for unauthenticated users */
            <>
              <NavLink 
                to="/login"
                className={({ isActive }) => isActive ? activeStyle : inactiveStyle}
                onClick={handleCloseSidebar}
              >
                <FaSignInAlt className="mr-3 h-5 w-5" />
                Login
              </NavLink>
              
              <NavLink 
                to="/register"
                className={({ isActive }) => isActive ? activeStyle : inactiveStyle}
                onClick={handleCloseSidebar}
              >
                <FaUserPlus className="mr-3 h-5 w-5" />
                Sign Up
              </NavLink>
            </>
          )}
        </nav>
      </div>
      
      {/* End of navigation */}
    </div>
  );
};

export default Sidebar;
