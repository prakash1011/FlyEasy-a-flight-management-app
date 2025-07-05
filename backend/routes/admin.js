const express = require('express');
const { getDashboardStats, getRecentBookings } = require('../controllers/admin');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// Protect and authorize all admin routes
router.use(protect);
router.use(authorize('admin'));

// Admin dashboard routes
router.get('/dashboard-stats', getDashboardStats);
router.get('/recent-bookings', getRecentBookings);

module.exports = router;
