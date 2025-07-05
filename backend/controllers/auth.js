const User = require('../models/User');

// @desc    Register user
// @route   POST /api/auth/register
// @access  Public
exports.register = async (req, res) => {
  try {
    console.log('Registration request body:', req.body);
    const { name, email, password, phone, role } = req.body;

    // Check if user already exists
    let user = await User.findOne({ email });

    if (user) {
      return res.status(400).json({
        success: false,
        error: 'User already exists'
      });
    }

    // Create user with dark theme preference by default
    try {
      user = await User.create({
        name,
        email,
        password,
        phone,
        role: role || 'passenger', // Use provided role or default to passenger
        preferences: {
          theme: 'dark' // Set dark theme by default
        }
      });

      sendTokenResponse(user, 201, res);
    } catch (modelError) {
      console.error('Error creating user:', modelError);
      // Return validation errors if any
      if (modelError.name === 'ValidationError') {
        const messages = Object.values(modelError.errors).map(val => val.message);
        return res.status(400).json({
          success: false,
          error: messages.join(', ')
        });
      }
      throw modelError; // Pass to global error handler
    }
  } catch (error) {
    console.error('Server error in register controller:', error);
    res.status(500).json({
      success: false,
      error: 'Server Error',
      details: error.message
    });
  }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check if email and password are provided
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        error: 'Please provide email and password'
      });
    }

    // Check if user exists
    const user = await User.findOne({ email }).select('+password');

    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'Invalid credentials'
      });
    }

    // Check if password matches
    const isMatch = await user.matchPassword(password);

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        error: 'Invalid credentials'
      });
    }

    sendTokenResponse(user, 200, res);
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      error: 'Server Error'
    });
  }
};

// @desc    Get current logged in user
// @route   GET /api/auth/me
// @access  Private
exports.getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    res.status(200).json({
      success: true,
      data: user
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      error: 'Server Error'
    });
  }
};

// @desc    Log user out 
// @route   POST /api/auth/logout
// @access  Private
exports.logout = async (req, res) => {
  res.status(200).json({
    success: true,
    data: {}
  });
};

// Helper function to get token from model, create cookie, and send response
const sendTokenResponse = (user, statusCode, res) => {
  try {
    // Create token
    const token = user.getSignedJwtToken();

    // Return only JSON response with token (no cookies)
    return res.status(statusCode).json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        preferences: user.preferences || { theme: 'dark' } // Ensure dark theme is returned
      }
    });
  } catch (error) {
    console.error('Error in sendTokenResponse:', error);
    return res.status(500).json({
      success: false,
      error: 'Authentication error',
      details: error.message
    });
  }
};
