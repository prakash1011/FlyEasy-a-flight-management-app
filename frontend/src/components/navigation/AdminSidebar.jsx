import { useDispatch, useSelector } from 'react-redux';
import { NavLink, useLocation } from 'react-router-dom';
import { 
  FaTachometerAlt, 
  FaPlane, 
  FaUsers, 
  FaTicketAlt,
  FaTimes,
  FaShieldAlt
} from 'react-icons/fa';
import { closeSidebar } from '../../store/slices/uiSlice';

const AdminSidebar = () => {
  const dispatch = useDispatch();
  const location = useLocation();
  const { user } = useSelector((state) => state.auth);
  const { role } = user || {};
  const isAdmin = role === 'admin';
  
  // Format date as dd/mm/yyyy
  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    const date = new Date(dateStr || Date.now());
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0'); // Month is 0-indexed
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };

  const handleCloseSidebar = () => {
    dispatch(closeSidebar());
  };
  
  // Active style for NavLink
  const activeStyle = "flex items-center px-4 py-3 text-blue-400 bg-gray-700 border-l-4 border-blue-500";
  const inactiveStyle = "flex items-center px-4 py-3 text-gray-300 hover:bg-gray-700 hover:text-blue-400 transition-colors duration-200";
  
  return (
    <div className="h-full bg-gray-900 border-r border-gray-700 shadow-lg overflow-y-auto">
      {/* Mobile close button */}
      <div className="lg:hidden flex justify-end p-4">
        <button 
          className="text-gray-400 hover:text-white focus:outline-none"
          onClick={handleCloseSidebar}
        >
          <FaTimes className="h-6 w-6" />
        </button>
      </div>
      
      <div className="px-4 py-6">
        <div className="flex items-center">
          <div className="h-10 w-10 rounded-full bg-blue-600 flex items-center justify-center text-white text-xl font-bold">
            <FaShieldAlt />
          </div>
          <div className="ml-3">
            <p className="text-sm font-medium text-white">{user?.name || 'Admin'}</p>
            <p className="text-xs text-gray-400">Administrator</p>
          </div>
        </div>
      </div>
      
      <div className="mt-4">
        <h3 className="px-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">
          Dashboard
        </h3>
        
        <nav className="mt-2 space-y-1">
          <NavLink 
            to="/admin/dashboard"
            className={({ isActive }) => isActive ? activeStyle : inactiveStyle}
            onClick={handleCloseSidebar}
          >
            <FaTachometerAlt className="mr-3 h-5 w-5" />
            Overview
          </NavLink>
        </nav>
        
        <h3 className="px-4 mt-8 text-xs font-semibold text-gray-400 uppercase tracking-wider">
          Management
        </h3>
        
        <nav className="mt-2 space-y-1">
          <NavLink 
            to="/admin/flights"
            className={({ isActive }) => isActive ? activeStyle : inactiveStyle}
            onClick={handleCloseSidebar}
          >
            <FaPlane className="mr-3 h-5 w-5" />
            Flights
          </NavLink>
          
          <NavLink 
            to="/admin/users"
            className={({ isActive }) => isActive ? activeStyle : inactiveStyle}
            onClick={handleCloseSidebar}
          >
            <FaUsers className="mr-3 h-5 w-5" />
            Users
          </NavLink>
          
          <NavLink 
            to="/admin/bookings"
            className={({ isActive }) => isActive ? activeStyle : inactiveStyle}
            onClick={handleCloseSidebar}
          >
            <FaTicketAlt className="mr-3 h-5 w-5" />
            Bookings
          </NavLink>
        </nav>
        

      </div>
      
      <div className="p-4 mt-8">
        <div className="bg-gradient-to-r from-dark-700 to-dark-600 rounded-lg p-4 border border-dark-500">
          <div className="flex items-center justify-between">
            <span className="flex items-center">
              <span className="h-3 w-3 bg-green-500 rounded-full mr-2"></span>
              <span className="text-xs text-gray-300">System Status</span>
            </span>
            <span className="text-xs text-green-400">Online</span>
          </div>
          <div className="mt-3 text-xs text-gray-400">
            Last backup: {formatDate(new Date())}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminSidebar;
