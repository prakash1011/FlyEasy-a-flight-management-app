const express = require('express');
const {
  createCheckoutSession,
  handlePaymentSuccess,
  handlePaymentCancel,
  handleWebhook
} = require('../controllers/payments');
const { protect } = require('../middleware/auth');

const router = express.Router();

// Protected routes
router.post('/checkout/:bookingId', protect, createCheckoutSession);

// Public routes for payment callbacks
router.get('/success', handlePaymentSuccess);
router.get('/cancel', handlePaymentCancel);
router.post('/webhook', handleWebhook);

module.exports = router;
