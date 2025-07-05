import React from 'react';
import { NavLink } from 'react-router-dom';
import { logout } from '../../utils/auth';

// Import icons (assuming you're using react-icons)
import { 
  MdDashboard, 
  MdFlight, 
  MdPeople, 
  MdBookmarks, 
  MdLogout 
} from 'react-icons/md';

const Sidebar = () => {
  const menuItems = [
    { path: '/admin/dashboard', name: 'Dashboard', icon: <MdDashboard size={20} /> },
    { path: '/admin/flights', name: 'Flights', icon: <MdFlight size={20} /> },
    { path: '/admin/users', name: 'Users', icon: <MdPeople size={20} /> },
    { path: '/admin/bookings', name: 'Bookings', icon: <MdBookmarks size={20} /> },
  ];

  return (
    <div className="h-screen w-64 bg-gray-900 text-white flex flex-col transition-all duration-300 ease-in-out">
      {/* Company Logo/Name */}
      <div className="p-5 border-b border-blue-800">
        <h1 className="text-2xl font-bold text-blue-400">FlyEasy Admin</h1>
      </div>
      
      {/* Navigation Links */}
      <div className="flex-1 overflow-y-auto py-4">
        <nav className="px-2">
          <ul className="space-y-2">
            {menuItems.map((item) => (
              <li key={item.name}>
                <NavLink
                  to={item.path}
                  className={({ isActive }) => 
                    `flex items-center px-4 py-3 rounded-lg transition-colors ${
                      isActive 
                        ? 'bg-blue-800 text-white' 
                        : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                    }`
                  }
                >
                  <span className="mr-3">{item.icon}</span>
                  <span>{item.name}</span>
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>
      </div>
      
      {/* Logout Button */}
      <div className="p-4 border-t border-blue-800">
        <button
          onClick={logout}
          className="flex items-center w-full px-4 py-3 rounded-lg text-gray-300 hover:bg-gray-800 hover:text-white transition-colors"
        >
          <span className="mr-3"><MdLogout size={20} /></span>
          <span>Logout</span>
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
