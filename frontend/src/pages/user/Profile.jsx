import { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { FiUser, FiMail, FiPhone, FiEdit2 } from 'react-icons/fi';
import { toast } from 'react-toastify';

import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Loader from '../../components/ui/Loader';
import { checkAuthStatus } from '../../store/slices/authSlice';

const Profile = () => {
  const dispatch = useDispatch();
  const { user, loading } = useSelector((state) => state.auth);
  const [userData, setUserData] = useState(null);
  const [localLoading, setLocalLoading] = useState(true);
  
  // Format date as dd/mm/yyyy
  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0'); // Month is 0-indexed
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };
  
  // First useEffect - fetch user data directly from API
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        setLocalLoading(true);
        // Get token from localStorage
        const token = localStorage.getItem('token');
        
        if (!token) {
          toast.error('You need to log in to view your profile.');
          return;
        }
        
        // Set auth header manually for this request
        const headers = {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        };
        
        // Fetch directly from API for guaranteed fresh data
        const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/auth/me`, {
          method: 'GET',
          headers
        });
        
        if (!response.ok) {
          throw new Error(`Error ${response.status}: ${response.statusText}`);
        }
        
        const responseData = await response.json();
        console.log('Direct API fetch raw response:', responseData);
        
        // Handle different possible response formats
        let extractedUserData;
        if (responseData.data) {
          // Format: { success: true, data: { user object } }
          extractedUserData = responseData.data;
        } else if (responseData.user) {
          // Format: { success: true, user: { user object } }
          extractedUserData = responseData.user;
        } else if (responseData.name && responseData.email) {
          // Format: { user object properties directly }
          extractedUserData = responseData;
        } else {
          throw new Error('Could not find user data in API response');
        }
        
        console.log('Extracted user data:', extractedUserData);
        
        // Update local state with the fresh data
        setUserData(extractedUserData);
        
        // Also dispatch to Redux store to keep it in sync
        dispatch(checkAuthStatus());
      } catch (error) {
        console.error('Failed to fetch profile data:', error);
        toast.error('Could not load profile data. Please try again.');
      } finally {
        setLocalLoading(false);
      }
    };
    
    fetchUserData();
  }, [dispatch]);

  // Use data from either direct API call or Redux
  const displayUser = userData || user;
  
  // Debug logging
  useEffect(() => {
    console.log('Current displayUser:', displayUser || 'No user data');
  }, [displayUser]);

  // Conditional rendering after all hooks are called
  if (loading || localLoading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <Loader text="Loading your profile..." />
      </div>
    );
  }
  
  // If no user data is available, show a message prompting login
  if (!displayUser) {
    return (
      <div className="py-6">
        <Card>
          <div className="flex flex-col items-center justify-center py-10">
            <div className="h-24 w-24 rounded-full bg-dark-700 flex items-center justify-center mb-4">
              <FiUser className="h-12 w-12 text-gray-400" />
            </div>
            <h2 className="text-xl font-semibold text-white mb-2">Profile Not Available</h2>
            <p className="text-gray-400 text-center mb-6">Please log in to view your profile information.</p>
          </div>
        </Card>
      </div>
    );
  }
  
  return (
    <div className="py-6">
      <h1 className="text-2xl font-bold text-white mb-6">My Profile</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Overview Card */}
        <div className="lg:col-span-2">
          <Card>
            <div className="flex flex-col md:flex-row md:items-center">
              <div className="h-24 w-24 md:h-28 md:w-28 rounded-full bg-gradient-to-r from-primary-500 to-blue-400 flex items-center justify-center text-white text-3xl font-bold mb-4 md:mb-0 md:mr-6">
                {displayUser.name ? displayUser.name.charAt(0).toUpperCase() : '?'}
              </div>
              
              <div>
                <h2 className="text-xl font-semibold text-white">{displayUser.name}</h2>
                <p className="text-gray-400 flex items-center mt-1">
                  <FiMail className="mr-2" /> {displayUser.email}
                </p>
                <p className="text-gray-400 flex items-center mt-1">
                  <FiPhone className="mr-2" /> {displayUser.phone || 'No phone number provided'}
                </p>
                <p className="text-primary-400 mt-3">Member since {formatDate(displayUser.createdAt || Date.now())}</p>
              </div>
            </div>

            <div className="border-t border-dark-700 mt-6 pt-6">
              <h3 className="text-lg font-semibold text-white mb-4">Contact Information</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">Full Name</label>
                  <div className="p-3 bg-dark-800 rounded-md flex items-center border border-dark-700">
                    <FiUser className="text-gray-400 mr-2" />
                    <span className="text-white">{displayUser.name}</span>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">Email Address</label>
                  <div className="p-3 bg-dark-800 rounded-md flex items-center border border-dark-700">
                    <FiMail className="text-gray-400 mr-2" />
                    <span className="text-white">{displayUser.email}</span>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">Phone Number</label>
                  <div className="p-3 bg-dark-800 rounded-md flex items-center border border-dark-700">
                    <FiPhone className="text-gray-400 mr-2" />
                    <span className="text-white">{displayUser.phone || 'No phone number provided'}</span>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* Stats Card */}
        <div>
          <Card>
            <h3 className="text-lg font-semibold text-white mb-4">Account Summary</h3>
            
            <div className="space-y-4">
              <div className="bg-dark-800 p-4 rounded-md border border-dark-700">
                <p className="text-gray-400 text-sm">Account Status</p>
                <p className="text-white text-lg font-medium mt-1">
                  <span className="inline-block h-2 w-2 rounded-full bg-green-500 mr-2"></span>
                  Active
                </p>
              </div>
              
              <div className="bg-dark-800 p-4 rounded-md border border-dark-700">
                <p className="text-gray-400 text-sm">Account Type</p>
                <p className="text-white text-lg font-medium mt-1">
                  {displayUser.role === 'admin' ? 'Administrator' : 'Standard'}
                </p>
              </div>
              
              <div className="bg-dark-800 p-4 rounded-md border border-dark-700">
                <p className="text-gray-400 text-sm">Registered On</p>
                <p className="text-white text-lg font-medium mt-1">
                  {formatDate(displayUser.createdAt || Date.now())}
                </p>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Profile;
