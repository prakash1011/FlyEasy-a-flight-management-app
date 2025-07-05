const User = require('../models/User');
const Booking = require('../models/Booking');
const Flight = require('../models/Flight');
const mongoose = require('mongoose');

// @desc    Get admin dashboard statistics
// @route   GET /api/admin/dashboard-stats
// @access  Private/Admin
exports.getDashboardStats = async (req, res) => {
  try {
    // Get total users count
    const totalUsers = await User.countDocuments();
    
    // Get active flights count (flights that haven't departed yet)
    const currentDate = new Date();
    const activeFlights = await Flight.countDocuments({ 
      departureTime: { $gt: currentDate },
      status: { $ne: 'cancelled' }
    });
    
    // Get today's bookings
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);
    
    const endOfToday = new Date();
    endOfToday.setHours(23, 59, 59, 999);
    
    const bookingsToday = await Booking.countDocuments({
      createdAt: { 
        $gte: startOfToday,
        $lte: endOfToday
      }
    });
    
    // Calculate total revenue
    const bookings = await Booking.find({ 
      status: { $ne: 'cancelled' }
    });
    
    const totalRevenue = bookings.reduce((sum, booking) => sum + booking.totalPrice, 0);
    
    // Get recent activity
    const recentActivity = await Booking.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .populate('user', 'name')
      .populate('flight', 'origin destination flightNumber');
    
    // Format recent activity
    const formattedActivity = recentActivity.map(booking => {
      let action;
      
      if (booking.status === 'cancelled') {
        action = `Cancelled booking #${booking.bookingReference}`;
      } else if (booking.rescheduleHistory && booking.rescheduleHistory.length > 0) {
        action = `Rescheduled flight ${booking.flight.flightNumber}`;
      } else {
        action = `Booked flight to ${booking.flight.destination}`;
      }
      
      return {
        user: booking.user?.name || 'Anonymous User',
        action,
        time: booking.updatedAt || booking.createdAt,
        bookingReference: booking.bookingReference
      };
    });
    
    res.status(200).json({
      success: true,
      data: {
        totalUsers,
        activeFlights,
        bookingsToday,
        totalRevenue,
        recentActivity: formattedActivity
      }
    });
  } catch (error) {
    console.error('Admin dashboard stats error:', error);
    res.status(500).json({
      success: false,
      error: 'Server Error'
    });
  }
};

// @desc    Get recent bookings
// @route   GET /api/admin/recent-bookings
// @access  Private/Admin
exports.getRecentBookings = async (req, res) => {
  try {
    const recentBookings = await Booking.find()
      .sort({ createdAt: -1 })
      .limit(10)
      .populate('user', 'name email')
      .populate('flight', 'flightNumber airline departureTime arrivalTime origin destination');
      
    res.status(200).json({
      success: true,
      count: recentBookings.length,
      data: recentBookings
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      error: 'Server Error'
    });
  }
};
