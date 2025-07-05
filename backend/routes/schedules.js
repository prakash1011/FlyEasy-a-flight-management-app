const express = require('express');
const {
  createSchedule,
  getSchedules,
  getSchedule,
  updateSchedule,
  deleteSchedule
} = require('../controllers/schedules');
const {
  scheduleValidationRules,
  handleValidationErrors
} = require('../middleware/validator');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// Public routes
router.get('/', getSchedules);
router.get('/:id', getSchedule);

// Protected routes
router.use(protect);

// Admin only routes
router.post(
  '/',
  authorize('admin'),
  scheduleValidationRules,
  handleValidationErrors,
  createSchedule
);

router.put(
  '/:id',
  authorize('admin'),
  scheduleValidationRules,
  handleValidationErrors,
  updateSchedule
);

router.delete(
  '/:id',
  authorize('admin'),
  deleteSchedule
);

module.exports = router;
