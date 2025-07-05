const Booking = require('../models/Booking');

// @desc    Create checkout session for booking payment
// @route   POST /api/payments/checkout/:bookingId
// @access  Private
exports.createCheckoutSession = async (req, res) => {
  try {
    // Get booking by ID
    const booking = await Booking.findById(req.params.bookingId)
      .populate({
        path: 'flight',
        select: 'flightNumber departureTime arrivalTime',
        populate: {
          path: 'route',
          select: 'origin.code origin.city destination.code destination.city'
        }
      });

    // Check if booking exists
    if (!booking) {
      return res.status(404).json({
        success: false,
        error: 'Booking not found'
      });
    }

    // Check if user is authorized to pay for this booking
    if (booking.user.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        error: 'Not authorized to pay for this booking'
      });
    }

    // Check if booking is already paid
    if (booking.paymentStatus === 'paid') {
      return res.status(400).json({
        success: false,
        error: 'Booking is already paid'
      });
    }

    // Check if booking is cancelled
    if (booking.status === 'cancelled') {
      return res.status(400).json({
        success: false,
        error: 'Cannot pay for a cancelled booking'
      });
    }

    // * In a real application, you would create a Stripe checkout session here *
    // For this mock implementation, we'll simulate the payment process
    
    // Mock payment details for response
    const paymentDetails = {
      bookingId: booking._id,
      amount: booking.totalPrice,
      currency: 'USD',
      paymentMethod: 'credit_card',
      flight: {
        flightNumber: booking.flight.flightNumber,
        origin: `${booking.flight.route.origin.city} (${booking.flight.route.origin.code})`,
        destination: `${booking.flight.route.destination.city} (${booking.flight.route.destination.code})`,
        departureTime: booking.flight.departureTime,
        arrivalTime: booking.flight.arrivalTime
      },
      passengers: booking.passengers.length,
      successUrl: `${req.protocol}://${req.get('host')}/api/payments/success?bookingId=${booking._id}`,
      cancelUrl: `${req.protocol}://${req.get('host')}/api/payments/cancel`
    };

    res.status(200).json({
      success: true,
      data: paymentDetails
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      error: 'Server Error'
    });
  }
};

// @desc    Process successful payment
// @route   GET /api/payments/success
// @access  Public
exports.handlePaymentSuccess = async (req, res) => {
  try {
    const { bookingId } = req.query;

    if (!bookingId) {
      return res.status(400).json({
        success: false,
        error: 'Booking ID is required'
      });
    }

    const booking = await Booking.findById(bookingId);

    if (!booking) {
      return res.status(404).json({
        success: false,
        error: 'Booking not found'
      });
    }

    // Update booking payment status
    booking.paymentStatus = 'paid';
    booking.status = 'confirmed';
    await booking.save();

    // In a real application, you would redirect to a success page
    // For this API, we'll just return a success response
    res.status(200).json({
      success: true,
      message: 'Payment processed successfully',
      data: {
        bookingId: booking._id,
        bookingReference: booking.bookingReference,
        status: booking.status,
        paymentStatus: booking.paymentStatus
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      error: 'Server Error'
    });
  }
};

// @desc    Handle cancelled payment
// @route   GET /api/payments/cancel
// @access  Public
exports.handlePaymentCancel = async (req, res) => {
  try {
    // In a real application, you might want to update the booking status
    // For this mock implementation, we'll just return a message
    res.status(200).json({
      success: true,
      message: 'Payment was cancelled',
      data: null
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      error: 'Server Error'
    });
  }
};

// @desc    Process payment webhook (for real payment services like Stripe)
// @route   POST /api/payments/webhook
// @access  Public
exports.handleWebhook = async (req, res) => {
  try {
    // * In a real application, this would verify and process webhook events from Stripe *
    // For this mock implementation, we'll just return a success message
    
    // Extract webhook event type and data from request body
    const { type, data } = req.body;
    
    // Handle different event types
    switch (type) {
      case 'payment_intent.succeeded':
        // Update booking payment status
        if (data && data.bookingId) {
          const booking = await Booking.findById(data.bookingId);
          if (booking) {
            booking.paymentStatus = 'paid';
            booking.status = 'confirmed';
            await booking.save();
          }
        }
        break;
      case 'payment_intent.payment_failed':
        // Handle failed payment
        if (data && data.bookingId) {
          const booking = await Booking.findById(data.bookingId);
          if (booking) {
            booking.paymentStatus = 'failed';
            await booking.save();
          }
        }
        break;
      // Add more event types as needed
    }

    // Return a success response
    res.status(200).json({
      received: true
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      error: 'Server Error'
    });
  }
};
