const express = require('express');
const { 
  register,
  login,
  getMe,
  logout
} = require('../controllers/auth');
const { 
  registerValidationRules,
  loginValidationRules,
  handleValidationErrors 
} = require('../middleware/validator');
const { protect } = require('../middleware/auth');

const router = express.Router();

// Authentication routes
router.post('/register', registerValidationRules, handleValidationErrors, register);
router.post('/login', loginValidationRules, handleValidationErrors, login);
router.get('/me', protect, getMe);
router.post('/logout', protect, logout);

module.exports = router;
