const Booking = require('../models/Booking');
const Flight = require('../models/Flight');
const User = require('../models/User');

// @desc    Create a new booking
// @route   POST /api/bookings
// @access  Private
exports.createBooking = async (req, res) => {
  try {
    const { flightId, passengers, contactDetails, paymentDetails } = req.body;
    
    // Check if the flight exists
    const flight = await Flight.findById(flightId);
    if (!flight) {
      return res.status(404).json({
        success: false,
        error: 'Flight not found'
      });
    }
    
    // Create booking object
    const newBooking = {
      user: req.user.id,
      flight: flightId,
      passengers,
      contactDetails,
      totalPrice: calculateTotalPrice(passengers, flight.price),
      paymentDetails: {
        method: paymentDetails.method,
        transactionId: paymentDetails.transactionId || `TXN-${Date.now()}`
      },
      status: 'confirmed'
    };
    
    // Save booking to database
    const booking = await Booking.create(newBooking);
    
    // Get detailed booking with flight info
    const populatedBooking = await Booking.findById(booking._id)
      .populate('flight')
      .populate('user', 'name email');
    
    res.status(201).json({
      success: true,
      data: populatedBooking
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      error: 'Server Error'
    });
  }
};

// @desc    Get all bookings for current user (or all if admin)
// @route   GET /api/bookings
// @access  Private
exports.getBookings = async (req, res) => {
  try {
    let query = {};
    
    // If not admin, only show user's own bookings
    if (req.user.role !== 'admin') {
      query.user = req.user.id;
    }
    
    // Get bookings with populated fields
    const bookings = await Booking.find(query)
      .populate({
        path: 'flight',
        select: 'flightNumber airline departureTime arrivalTime route status'
      })
      .populate('user', 'name email')
      .sort({ createdAt: -1 });
    
    res.status(200).json({
      success: true,
      count: bookings.length,
      data: bookings
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      error: 'Server Error'
    });
  }
};

// @desc    Get single booking
// @route   GET /api/bookings/:id
// @access  Private
exports.getBooking = async (req, res) => {
  try {
    // Find booking and populate with flight and user info
    const booking = await Booking.findById(req.params.id)
      .populate('flight')
      .populate('user', 'name email phone');
    
    if (!booking) {
      return res.status(404).json({
        success: false,
        error: 'Booking not found'
      });
    }
    
    // Make sure user owns the booking or is admin
    if (booking.user._id.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        error: 'Not authorized to access this booking'
      });
    }
    
    res.status(200).json({
      success: true,
      data: booking
    });
  } catch (error) {
    console.error(error);
    
    // Check if error is because of invalid ObjectId
    if (error.kind === 'ObjectId') {
      return res.status(404).json({
        success: false,
        error: 'Booking not found'
      });
    }
    
    res.status(500).json({
      success: false,
      error: 'Server Error'
    });
  }
};

// @desc    Cancel booking
// @route   PUT /api/bookings/:id/cancel
// @access  Private
exports.cancelBooking = async (req, res) => {
  try {
    // Find booking
    let booking = await Booking.findById(req.params.id);
    
    if (!booking) {
      return res.status(404).json({
        success: false,
        error: 'Booking not found'
      });
    }
    
    // Check if user owns the booking or is admin
    if (booking.user.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        error: 'Not authorized to cancel this booking'
      });
    }
    
    // Check if booking is already cancelled
    if (booking.status === 'cancelled') {
      return res.status(400).json({
        success: false,
        error: 'Booking is already cancelled'
      });
    }
    
    // Update booking status
    booking.status = 'cancelled';
    booking.cancelledAt = Date.now();
    await booking.save();
    
    // Get updated booking with populated fields
    booking = await Booking.findById(req.params.id)
      .populate('flight')
      .populate('user', 'name email');
    
    res.status(200).json({
      success: true,
      data: booking
    });
  } catch (error) {
    console.error(error);
    
    // Check if error is because of invalid ObjectId
    if (error.kind === 'ObjectId') {
      return res.status(404).json({
        success: false,
        error: 'Booking not found'
      });
    }
    
    res.status(500).json({
      success: false,
      error: 'Server Error'
    });
  }
};

// @desc    Reschedule booking to a different flight
// @route   PUT /api/bookings/:id/reschedule
// @access  Private
exports.rescheduleBooking = async (req, res) => {
  try {
    const { newFlightId } = req.body;
    
    // Check if new flight exists
    const flight = await Flight.findById(newFlightId);
    if (!flight) {
      return res.status(404).json({
        success: false,
        error: 'New flight not found'
      });
    }
    
    // Find booking
    let booking = await Booking.findById(req.params.id);
    
    if (!booking) {
      return res.status(404).json({
        success: false,
        error: 'Booking not found'
      });
    }
    
    // Check if user owns the booking or is admin
    if (booking.user.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        error: 'Not authorized to reschedule this booking'
      });
    }
    
    // Check if booking is cancelled
    if (booking.status === 'cancelled') {
      return res.status(400).json({
        success: false,
        error: 'Cannot reschedule a cancelled booking'
      });
    }
    
    // Update booking with new flight
    booking.flight = newFlightId;
    booking.updatedAt = Date.now();
    booking.rescheduleHistory = booking.rescheduleHistory || [];
    booking.rescheduleHistory.push({
      previousFlight: booking.flight,
      newFlight: newFlightId,
      timestamp: Date.now()
    });
    
    await booking.save();
    
    // Get updated booking with populated fields
    booking = await Booking.findById(req.params.id)
      .populate('flight')
      .populate('user', 'name email');
    
    res.status(200).json({
      success: true,
      data: booking
    });
  } catch (error) {
    console.error(error);
    
    // Check if error is because of invalid ObjectId
    if (error.kind === 'ObjectId') {
      return res.status(404).json({
        success: false,
        error: 'Booking not found'
      });
    }
    
    res.status(500).json({
      success: false,
      error: 'Server Error'
    });
  }
};

// @desc    Get current user's bookings
// @route   GET /api/bookings/my-bookings
// @access  Private
exports.getUserBookings = async (req, res) => {
  try {
    // Get current user's bookings with populated flight data
    const bookings = await Booking.find({ user: req.user.id })
      .populate({
        path: 'flight',
        select: 'flightNumber airline departureTime arrivalTime origin destination status price'
      })
      .sort({ createdAt: -1 });
    
    res.status(200).json({
      success: true,
      count: bookings.length,
      bookings: bookings
    });
  } catch (error) {
    console.error('Error fetching my bookings:', error);
    res.status(500).json({
      success: false,
      message: 'Server Error'
    });
  }
};

// Helper function to calculate total price
const calculateTotalPrice = (passengers, basePrice) => {
  // Calculate total price based on passenger types
  const adultCount = passengers.filter(p => p.type === 'adult').length;
  const childCount = passengers.filter(p => p.type === 'child').length;
  const infantCount = passengers.filter(p => p.type === 'infant').length;
  
  // Apply pricing rules: adults pay full price, children 75%, infants 10%
  const totalPrice = 
    (adultCount * basePrice) + 
    (childCount * basePrice * 0.75) + 
    (infantCount * basePrice * 0.1);
  
  return parseFloat(totalPrice.toFixed(2));
};
