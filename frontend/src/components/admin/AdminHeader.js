import React from 'react';
import { getCurrentUser } from '../../utils/auth';

const AdminHeader = () => {
  const user = getCurrentUser();
  
  return (
    <header className="bg-gray-800 text-white shadow-md">
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        <h1 className="text-xl font-semibold">Admin Dashboard</h1>
        <div className="flex items-center">
          <div className="mr-4 text-blue-400">
            <span className="font-medium">Welcome, </span>
            <span>{user?.name || 'Admin'}</span>
          </div>
          <div className="h-10 w-10 rounded-full bg-blue-600 flex items-center justify-center">
            <span className="uppercase font-bold">
              {user?.name?.charAt(0) || 'A'}
            </span>
          </div>
        </div>
      </div>
    </header>
  );
};

export default AdminHeader;
