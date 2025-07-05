const express = require('express');
const {
  createBooking,
  getBookings,
  getBooking,
  cancelBooking,
  rescheduleBooking,
  getUserBookings
} = require('../controllers/bookings');
const {
  bookingValidationRules,
  rescheduleValidationRules,
  handleValidationErrors
} = require('../middleware/validator');
const { protect } = require('../middleware/auth');

const router = express.Router();

// All booking routes require authentication
router.use(protect);

// Booking routes
router.post('/', bookingValidationRules, handleValidationErrors, createBooking);
router.get('/', getBookings);

// Add dedicated route for user bookings - MUST come before /:id route
router.get('/my-bookings', getUserBookings);

// Get booking by ID - must come after specific routes
router.get('/:id', getBooking);
router.put('/:id/cancel', cancelBooking);
router.put(
  '/:id/reschedule',
  rescheduleValidationRules,
  handleValidationErrors,
  rescheduleBooking
);

module.exports = router;
