const express = require('express');
const { 
  getUsers, 
  getUser, 
  updateUser, 
  deleteUser 
} = require('../controllers/users');
const { 
  userUpdateValidationRules, 
  handleValidationErrors 
} = require('../middleware/validator');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// Apply protection to all routes
router.use(protect);

// User routes
router.route('/')
  .get(authorize('admin'), getUsers);

router.route('/:id')
  .get(getUser)
  .put(userUpdateValidationRules, handleValidationErrors, updateUser)
  .delete(authorize('admin'), deleteUser);

module.exports = router;
