const express = require('express');
const { 
  createRoute,
  getRoutes,
  getRoute,
  updateRoute,
  deleteRoute
} = require('../controllers/routes');
const { 
  routeValidationRules,
  handleValidationErrors 
} = require('../middleware/validator');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// Public routes
router.get('/', getRoutes);
router.get('/:id', getRoute);

// Protected routes
router.use(protect);

// Admin only routes
router.post(
  '/',
  authorize('admin'),
  routeValidationRules,
  handleValidationErrors,
  createRoute
);

router.put(
  '/:id',
  authorize('admin'),
  routeValidationRules,
  handleValidationErrors,
  updateRoute
);

router.delete(
  '/:id',
  authorize('admin'),
  deleteRoute
);

module.exports = router;
