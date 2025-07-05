import React, { useState, useEffect } from 'react';
import { FaUser, FaEdit, FaTrash, FaUserPlus, FaCheck, FaTimes, FaSpinner } from 'react-icons/fa';
import { toast } from 'react-toastify';
import userAPI from '../../services/userAPI';

const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    role: 'passenger'
  });
  const [deleteConfirmation, setDeleteConfirmation] = useState(null);
  const [processingDelete, setProcessingDelete] = useState(false);
  const [processingUpdate, setProcessingUpdate] = useState(false);
  
  // Fetch all users
  useEffect(() => {
    fetchUsers();
  }, []);
  
  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await userAPI.getAllUsers();
      
      if (response.data && response.data.success) {
        setUsers(response.data.data);
      } else {
        throw new Error('Failed to fetch users');
      }
    } catch (err) {
      console.error('Error fetching users:', err);
      setError('Failed to load users');
      toast.error('Error loading users');
    } finally {
      setLoading(false);
    }
  };
  
  // Handle edit user
  const handleEditClick = (user) => {
    setCurrentUser(user);
    setFormData({
      name: user.name,
      email: user.email,
      role: user.role
    });
    setEditMode(true);
  };
  
  // Handle form input changes
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };
  
  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!currentUser) return;
    
    try {
      setProcessingUpdate(true);
      
      const response = await userAPI.updateUser(currentUser._id, formData);
      
      if (response.data && response.data.success) {
        // Update local users array
        setUsers(users.map(user => 
          user._id === currentUser._id ? response.data.data : user
        ));
        
        toast.success('User updated successfully');
        setEditMode(false);
        setCurrentUser(null);
      } else {
        throw new Error('Failed to update user');
      }
    } catch (err) {
      console.error('Error updating user:', err);
      toast.error('Error updating user');
    } finally {
      setProcessingUpdate(false);
    }
  };
  
  // Handle cancel edit
  const handleCancelEdit = () => {
    setEditMode(false);
    setCurrentUser(null);
  };
  
  // Handle delete confirmation
  const handleDeleteClick = (userId) => {
    setDeleteConfirmation(userId);
  };
  
  // Handle confirm delete
  const handleConfirmDelete = async (userId) => {
    try {
      setProcessingDelete(true);
      
      const response = await userAPI.deleteUser(userId);
      
      if (response.data && response.data.success) {
        // Remove user from local array
        setUsers(users.filter(user => user._id !== userId));
        
        toast.success('User deleted successfully');
      } else {
        throw new Error('Failed to delete user');
      }
    } catch (err) {
      console.error('Error deleting user:', err);
      toast.error('Error deleting user');
    } finally {
      setDeleteConfirmation(null);
      setProcessingDelete(false);
    }
  };
  
  // Handle cancel delete
  const handleCancelDelete = () => {
    setDeleteConfirmation(null);
  };

  // Format date as dd/mm/yyyy
  const formatDate = (dateStr) => {
    if (!dateStr) return 'N/A';
    const date = new Date(dateStr);
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0'); // Month is 0-indexed
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };

  // Get CSS class for role badge
  const getRoleBadgeClass = (role) => {
    switch (role.toLowerCase()) {
      case 'admin':
        return 'bg-purple-900 text-purple-100';
      case 'passenger':
      default:
        return 'bg-blue-900 text-blue-100';
    }
  };

  // Loading spinner component
  const LoadingSpinner = () => (
    <div className="flex justify-center items-center h-64">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
    </div>
  );

  // Error message component
  const ErrorMessage = () => (
    <div className="bg-red-900 bg-opacity-20 text-red-200 p-4 rounded-lg mb-6">
      <p>{error}</p>
      <button 
        onClick={fetchUsers} 
        className="mt-2 px-4 py-2 bg-red-700 hover:bg-red-800 rounded-md text-white"
      >
        Retry
      </button>
    </div>
  );
  
  // User edit form
  const EditForm = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-gray-900 rounded-lg shadow-xl p-6 max-w-md w-full">
        <h2 className="text-xl font-semibold text-white mb-4">Edit User</h2>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-gray-300 mb-2">Name</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="w-full p-2 rounded bg-gray-800 border border-gray-700 text-white"
              required
            />
          </div>
          
          <div className="mb-4">
            <label className="block text-gray-300 mb-2">Email</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="w-full p-2 rounded bg-gray-800 border border-gray-700 text-white"
              required
            />
          </div>
          
          <div className="mb-6">
            <label className="block text-gray-300 mb-2">Role</label>
            <select
              name="role"
              value={formData.role}
              onChange={handleChange}
              className="w-full p-2 rounded bg-gray-800 border border-gray-700 text-white"
            >
              <option value="passenger">Passenger</option>
              <option value="admin">Admin</option>
            </select>
          </div>
          
          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={handleCancelEdit}
              className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-md"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md"
              disabled={processingUpdate}
            >
              {processingUpdate ? (
                <>
                  <FaSpinner className="animate-spin mr-2" />
                  Saving...
                </>
              ) : (
                <>Save Changes</>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
  
  return (
    <div className="py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-white">Manage Users</h1>
      </div>
      
      {error && <ErrorMessage />}
      
      {editMode && <EditForm />}
      
      {loading ? (
        <LoadingSpinner />
      ) : (
        <div className="bg-gray-900 rounded-lg shadow-lg overflow-hidden">
          {users.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-gray-800">
                    <th className="py-3 px-4 text-left text-sm font-medium text-gray-300 uppercase tracking-wider">User</th>
                    <th className="py-3 px-4 text-left text-sm font-medium text-gray-300 uppercase tracking-wider">Email</th>
                    <th className="py-3 px-4 text-left text-sm font-medium text-gray-300 uppercase tracking-wider">Role</th>
                    <th className="py-3 px-4 text-left text-sm font-medium text-gray-300 uppercase tracking-wider">Registered On</th>
                    <th className="py-3 px-4 text-left text-sm font-medium text-gray-300 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-700">
                  {users.map((user) => (
                    <tr key={user._id} className="hover:bg-gray-800">
                      <td className="py-3 px-4 text-gray-300">
                        <div className="flex items-center">
                          <div className="bg-gray-800 p-2 rounded-full mr-3">
                            <FaUser className="text-blue-400" />
                          </div>
                          <span>{user.name}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-gray-300">{user.email}</td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-1 rounded-full text-xs ${getRoleBadgeClass(user.role)}`}>
                          {user.role}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-gray-400">{formatDate(user.createdAt)}</td>
                      <td className="py-3 px-4">
                        {deleteConfirmation === user._id ? (
                          <div className="flex space-x-2">
                            <button 
                              onClick={() => handleConfirmDelete(user._id)}
                              className="p-1 text-green-400 hover:text-green-300"
                              disabled={processingDelete}
                            >
                              {processingDelete ? <FaSpinner className="animate-spin" /> : <FaCheck />}
                            </button>
                            <button 
                              onClick={handleCancelDelete}
                              className="p-1 text-red-400 hover:text-red-300"
                              disabled={processingDelete}
                            >
                              <FaTimes />
                            </button>
                          </div>
                        ) : (
                          <div className="flex space-x-2">
                            <button 
                              onClick={() => handleEditClick(user)} 
                              className="p-1 text-blue-400 hover:text-blue-300"
                            >
                              <FaEdit />
                            </button>
                            <button 
                              onClick={() => handleDeleteClick(user._id)} 
                              className="p-1 text-red-400 hover:text-red-300"
                            >
                              <FaTrash />
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center p-8 text-gray-400">
              No users found.
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AdminUsers;
