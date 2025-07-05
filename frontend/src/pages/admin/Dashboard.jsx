import React, { useState, useEffect } from 'react';
import { FaUsers, FaPlane, FaTicketAlt, FaChartLine } from 'react-icons/fa';
import { toast } from 'react-toastify';
import { format, formatDistanceToNow } from 'date-fns';
import adminAPI from '../../services/adminAPI';
import { bookingAPI } from '../../services/api';

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    totalUsers: 0,
    activeFlights: 0,
    bookingsToday: 0,
    totalRevenue: 0
  });
  
  const [recentActivity, setRecentActivity] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [flights, setFlights] = useState([]);
  const [bookings, setBookings] = useState([]);

  // Fetch flight data from flights.json
  useEffect(() => {
    fetch('/flights.json')
      .then(response => response.json())
      .then(data => {
        setFlights(data);
        
        // Update stats with real flight data
        setStats(prevStats => ({
          ...prevStats,
          activeFlights: data.filter(flight => flight.status === 'on-time').length
        }));
      })
      .catch(err => {
        console.error('Error loading flight data:', err);
        toast.error('Could not load flight data');
      });
  }, []);

  // Fetch booking data
  useEffect(() => {
    const fetchBookings = async () => {
      try {
        const response = await bookingAPI.getAllBookings();
        const bookingData = response.data.data || [];
        setBookings(bookingData);
        
        // Update stats with real booking data
        const today = new Date();
        const todayStr = today.toISOString().split('T')[0];
        
        const bookingsToday = bookingData.filter(booking => 
          booking.bookingDate && booking.bookingDate.startsWith(todayStr)
        ).length;
        
        const totalRevenue = bookingData.reduce((sum, booking) => 
          sum + (booking.totalAmount || 0), 0
        );
        
        setStats(prevStats => ({
          ...prevStats,
          bookingsToday,
          totalRevenue
        }));
      } catch (err) {
        console.error('Error fetching bookings:', err);
      }
    };
    
    fetchBookings();
  }, []);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const response = await adminAPI.getDashboardStats();
        
        console.log('Dashboard data response:', response.data);
        
        if (response.data && response.data.success) {
          const { totalUsers, recentActivity } = response.data.data;
          
          // Only update totalUsers from API, other stats we calculate from real data
          setStats(prevStats => ({
            ...prevStats,
            totalUsers
          }));
          
          setRecentActivity(recentActivity || []);
        } else {
          throw new Error('Invalid response format');
        }
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
        setError('Failed to load dashboard data. Please try again.');
        toast.error('Error loading dashboard data');
      } finally {
        setLoading(false);
      }
    };
    
    fetchDashboardData();
  }, []);

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
        onClick={() => window.location.reload()} 
        className="mt-2 px-4 py-2 bg-red-700 hover:bg-red-800 rounded-md text-white"
      >
        Retry
      </button>
    </div>
  );

  return (
    <div className="py-6">
      <h1 className="text-2xl font-bold text-white mb-6">Admin Dashboard</h1>
      
      {error && <ErrorMessage />}
      
      {loading ? (
        <LoadingSpinner />
      ) : (
        <>
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-gray-900 rounded-lg shadow-lg p-6 border-l-4 border-blue-500">
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-gray-400 text-sm">Total Users</p>
                  <h3 className="text-2xl font-bold text-white mt-1">{stats.totalUsers}</h3>
                </div>
                <div className="bg-blue-500 bg-opacity-20 p-3 rounded-full">
                  <FaUsers className="text-blue-400 text-xl" />
                </div>
              </div>
            </div>
            
            <div className="bg-gray-900 rounded-lg shadow-lg p-6 border-l-4 border-green-500">
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-gray-400 text-sm">Active Flights</p>
                  <h3 className="text-2xl font-bold text-white mt-1">{stats.activeFlights}</h3>
                </div>
                <div className="bg-green-500 bg-opacity-20 p-3 rounded-full">
                  <FaPlane className="text-green-400 text-xl" />
                </div>
              </div>
            </div>
            
            <div className="bg-gray-900 rounded-lg shadow-lg p-6 border-l-4 border-purple-500">
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-gray-400 text-sm">Today's Bookings</p>
                  <h3 className="text-2xl font-bold text-white mt-1">{stats.bookingsToday}</h3>
                </div>
                <div className="bg-purple-500 bg-opacity-20 p-3 rounded-full">
                  <FaTicketAlt className="text-purple-400 text-xl" />
                </div>
              </div>
            </div>
            
            <div className="bg-gray-900 rounded-lg shadow-lg p-6 border-l-4 border-yellow-500">
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-gray-400 text-sm">Revenue (₹)</p>
                  <h3 className="text-2xl font-bold text-white mt-1">{stats.totalRevenue?.toLocaleString() || '0'}</h3>
                </div>
                <div className="bg-yellow-500 bg-opacity-20 p-3 rounded-full">
                  <FaChartLine className="text-yellow-400 text-xl" />
                </div>
              </div>
            </div>
          </div>
          
          {/* Recent Activity */}
          <div className="bg-gray-900 rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-semibold text-white mb-4">Recent Activity</h2>
            <div className="overflow-x-auto">
              {recentActivity.length > 0 ? (
                <table className="w-full">
                  <thead>
                    <tr className="text-left border-b border-gray-700">
                      <th className="pb-3 text-gray-400 font-medium">User</th>
                      <th className="pb-3 text-gray-400 font-medium">Action</th>
                      <th className="pb-3 text-gray-400 font-medium">Time</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentActivity.map((activity, index) => (
                      <tr key={index} className={index < recentActivity.length - 1 ? "border-b border-gray-800" : ""}>                          
                        <td className="py-3 text-gray-300">{activity.user}</td>
                        <td className="py-3 text-gray-300">{activity.action}</td>
                        <td className="py-3 text-gray-400">
                          {formatDistanceToNow(new Date(activity.time), { addSuffix: true })}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <div className="text-center py-4 text-gray-400">
                  No recent activity found
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default AdminDashboard;
