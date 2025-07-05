import React, { useState, useEffect } from 'react';
import { FaTicketAlt, FaEye, FaFilePdf, FaTimes, FaCheck, FaSync } from 'react-icons/fa';
import { toast } from 'react-toastify';
import { bookingAPI } from '../../services/api';

const AdminBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [flights, setFlights] = useState([]);

  // Fetch flight data from flights.json
  useEffect(() => {
    fetch('/flights.json')
      .then(response => response.json())
      .then(data => {
        setFlights(data);
      })
      .catch(err => {
        console.error('Error loading flight data:', err);
        toast.error('Could not load flight data');
      });
  }, []);

  // Fetch all bookings from API
  useEffect(() => {
    const fetchBookings = async () => {
      try {
        setLoading(true);
        const response = await bookingAPI.getAllBookings();
        setBookings(response.data.data || []);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching bookings:', err);
        setError('Failed to load bookings. Please try again.');
        setLoading(false);
        toast.error('Failed to load booking data');
      }
    };

    fetchBookings();
  }, []);

  // Get flight details by ID
  const getFlightDetails = (flightId) => {
    const flight = flights.find(f => f.id === flightId);
    return flight ? `${flight.origin} → ${flight.destination}` : 'Flight details unavailable';
  };
  
  // Old sample data for reference
  /*
  const [bookingsOld] = useState([
    {
      id: 'B10045',
      user: 'John Doe',
      flightId: 'FL1001',
      flightDetails: 'Delhi (DEL) → Mumbai (BOM)',
      passengers: 2,
      bookingDate: '2025-06-15T10:30:00Z',
      departureDate: '2025-06-21T08:00:00Z',
      totalAmount: 9600,
      status: 'confirmed'
    },
    {
      id: 'B10046',
      user: 'Jane Smith',
      flightId: 'FL1002',
      flightDetails: 'Mumbai (BOM) → Bengaluru (BLR)',
      passengers: 1,
      bookingDate: '2025-06-16T14:45:00Z',
      departureDate: '2025-06-22T14:00:00Z',
      totalAmount: 5300,
      status: 'pending'
    },
    {
      id: 'B10047',
      user: 'Rahul Sharma',
      flightId: 'FL1003',
      flightDetails: 'Chennai (MAA) → Delhi (DEL)',
      passengers: 3,
      bookingDate: '2025-06-10T09:15:00Z',
      departureDate: '2025-06-23T07:30:00Z',
      totalAmount: 17700,
      status: 'confirmed'
    },
    {
      id: 'B10048',
      user: 'Priya Patel',
      flightId: 'FL1004',
      flightDetails: 'Bengaluru (BLR) → Kolkata (CCU)',
      passengers: 1,
      bookingDate: '2025-06-17T11:30:00Z',
      departureDate: '2025-06-25T10:15:00Z',
      totalAmount: 6200,
      status: 'cancelled'
    }
  ]);
  */

  // Format date as dd/mm/yyyy
  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0'); // Month is 0-indexed
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };
  
  // Format time
  const formatTime = (dateStr) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Get status badge class
  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'confirmed':
        return 'bg-green-900 text-green-300';
      case 'pending':
        return 'bg-yellow-900 text-yellow-300';
      case 'cancelled':
        return 'bg-red-900 text-red-300';
      default:
        return 'bg-gray-700 text-gray-300';
    }
  };

  // Get status icon
  const getStatusIcon = (status) => {
    switch (status) {
      case 'confirmed':
        return <FaCheck className="text-green-400" />;
      case 'pending':
        return <FaTicketAlt className="text-yellow-400" />;
      case 'cancelled':
        return <FaTimes className="text-red-400" />;
      default:
        return <FaTicketAlt className="text-gray-400" />;
    }
  };

  return (
    <div className="py-6">
      <div className="mb-6 flex justify-between items-center">
        <h1 className="text-2xl font-bold text-white">Manage Bookings</h1>
        {loading && (
          <div className="flex items-center text-blue-400">
            <FaSync className="animate-spin mr-2" />
            <span>Loading...</span>
          </div>
        )}
      </div>
      
      {error && (
        <div className="mb-4 p-3 bg-red-900 text-red-300 rounded-lg">
          {error}
        </div>
      )}
      
      <div className="bg-gray-900 rounded-lg shadow-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-gray-800">
                <th className="py-3 px-4 text-left text-sm font-medium text-gray-300 uppercase tracking-wider">Booking ID</th>
                <th className="py-3 px-4 text-left text-sm font-medium text-gray-300 uppercase tracking-wider">User</th>
                <th className="py-3 px-4 text-left text-sm font-medium text-gray-300 uppercase tracking-wider">Flight Details</th>
                <th className="py-3 px-4 text-left text-sm font-medium text-gray-300 uppercase tracking-wider">Passengers</th>
                <th className="py-3 px-4 text-left text-sm font-medium text-gray-300 uppercase tracking-wider">Booking Date</th>
                <th className="py-3 px-4 text-left text-sm font-medium text-gray-300 uppercase tracking-wider">Departure</th>
                <th className="py-3 px-4 text-left text-sm font-medium text-gray-300 uppercase tracking-wider">Amount (₹)</th>
                <th className="py-3 px-4 text-left text-sm font-medium text-gray-300 uppercase tracking-wider">Status</th>
                <th className="py-3 px-4 text-left text-sm font-medium text-gray-300 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700">
              {loading ? (
                <tr>
                  <td colSpan="9" className="py-8 text-center text-gray-400">
                    <div className="flex flex-col items-center justify-center">
                      <FaSync className="animate-spin text-blue-500 text-2xl mb-2" />
                      <span>Loading booking data...</span>
                    </div>
                  </td>
                </tr>
              ) : bookings.length === 0 ? (
                <tr>
                  <td colSpan="9" className="py-8 text-center text-gray-400">
                    No bookings found.
                  </td>
                </tr>
              ) : (
                bookings.map((booking) => (
                <tr key={booking.id} className="hover:bg-gray-800">
                  <td className="py-3 px-4 text-blue-400 font-medium">
                    <div className="flex items-center space-x-2">
                      {getStatusIcon(booking.status)}
                      <span>{booking.id}</span>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-gray-300">{booking.user}</td>
                  <td className="py-3 px-4">
                    <div>
                      <div className="text-gray-300">{getFlightDetails(booking.flightId)}</div>
                      <div className="text-xs text-gray-400">Flight #{booking.flightId}</div>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-center text-gray-300">{booking.passengers}</td>
                  <td className="py-3 px-4 text-gray-400 text-sm">
                    {formatDate(booking.bookingDate)}
                  </td>
                  <td className="py-3 px-4">
                    <div className="text-gray-300">{formatDate(booking.departureDate)}</div>
                    <div className="text-xs text-gray-400">{formatTime(booking.departureDate)}</div>
                  </td>
                  <td className="py-3 px-4 text-gray-300 font-medium">
                    {booking.totalAmount.toLocaleString()}
                  </td>
                  <td className="py-3 px-4">
                    <span className={`px-2 py-1 rounded-full text-xs ${getStatusBadgeClass(booking.status)}`}>
                      {booking.status}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex space-x-2">
                      <button className="p-1 text-blue-400 hover:text-blue-300" title="View Details">
                        <FaEye />
                      </button>
                      <button 
                        className="p-1 text-green-400 hover:text-green-300" 
                        title="Download Ticket"
                        disabled={booking.status === 'cancelled'}
                      >
                        <FaFilePdf />
                      </button>
                    </div>
                  </td>
                </tr>
              )))
            }</tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminBookings;
