const { body, validationResult } = require('express-validator');

// Handle validation errors
exports.handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      errors: errors.array()
    });
  }
  next();
};

// User registration validation rules
exports.registerValidationRules = [
  body('name')
    .notEmpty()
    .withMessage('Name is required')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Name must be between 2 and 50 characters'),
  
  body('email')
    .notEmpty()
    .withMessage('Email is required')
    .isEmail()
    .withMessage('Please include a valid email')
    .normalizeEmail(),
  
  body('password')
    .notEmpty()
    .withMessage('Password is required')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long'),
    
  body('role')
    .optional()
    .isIn(['passenger', 'admin'])
    .withMessage('Role must be either passenger or admin')
];

// Login validation rules
exports.loginValidationRules = [
  body('email')
    .notEmpty()
    .withMessage('Email is required')
    .isEmail()
    .withMessage('Please include a valid email'),
  
  body('password')
    .notEmpty()
    .withMessage('Password is required')
];

// User update validation rules
exports.userUpdateValidationRules = [
  body('name')
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Name must be between 2 and 50 characters'),
  
  body('email')
    .optional()
    .isEmail()
    .withMessage('Please include a valid email')
    .normalizeEmail(),
  
  body('password')
    .optional()
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long')
];

// Flight creation validation rules
exports.flightValidationRules = [
  body('flightNumber')
    .notEmpty()
    .withMessage('Flight number is required')
    .trim()
    .isLength({ max: 10 })
    .withMessage('Flight number cannot exceed 10 characters'),
  
  body('route')
    .notEmpty()
    .withMessage('Route ID is required'),
  
  body('aircraft')
    .notEmpty()
    .withMessage('Aircraft is required')
    .trim(),
  
  body('departureTime')
    .notEmpty()
    .withMessage('Departure time is required')
    .isISO8601()
    .withMessage('Departure time must be a valid date'),
  
  body('arrivalTime')
    .notEmpty()
    .withMessage('Arrival time is required')
    .isISO8601()
    .withMessage('Arrival time must be a valid date'),
  
  body('duration')
    .notEmpty()
    .withMessage('Duration is required')
    .isNumeric()
    .withMessage('Duration must be a number'),
  
  body('price.economy')
    .notEmpty()
    .withMessage('Economy class price is required')
    .isNumeric()
    .withMessage('Price must be a number'),
  
  body('price.business')
    .notEmpty()
    .withMessage('Business class price is required')
    .isNumeric()
    .withMessage('Price must be a number'),
  
  body('seatsAvailable.economy')
    .notEmpty()
    .withMessage('Available economy seats are required')
    .isNumeric()
    .withMessage('Seats must be a number'),
  
  body('seatsAvailable.business')
    .notEmpty()
    .withMessage('Available business seats are required')
    .isNumeric()
    .withMessage('Seats must be a number')
];

// Route creation validation rules
exports.routeValidationRules = [
  body('origin.code')
    .notEmpty()
    .withMessage('Origin airport code is required')
    .isLength({ min: 3, max: 3 })
    .withMessage('Airport code must be exactly 3 characters')
    .isUppercase()
    .withMessage('Airport code must be uppercase'),
  
  body('origin.city')
    .notEmpty()
    .withMessage('Origin city is required')
    .trim(),
  
  body('origin.country')
    .notEmpty()
    .withMessage('Origin country is required')
    .trim(),
  
  body('destination.code')
    .notEmpty()
    .withMessage('Destination airport code is required')
    .isLength({ min: 3, max: 3 })
    .withMessage('Airport code must be exactly 3 characters')
    .isUppercase()
    .withMessage('Airport code must be uppercase'),
  
  body('destination.city')
    .notEmpty()
    .withMessage('Destination city is required')
    .trim(),
  
  body('destination.country')
    .notEmpty()
    .withMessage('Destination country is required')
    .trim(),
  
  body('distance')
    .notEmpty()
    .withMessage('Route distance is required')
    .isNumeric()
    .withMessage('Distance must be a number'),
  
  body('estimatedDuration')
    .notEmpty()
    .withMessage('Estimated duration is required')
    .isNumeric()
    .withMessage('Duration must be a number')
];

// Booking validation rules
exports.bookingValidationRules = [
  body('flight')
    .notEmpty()
    .withMessage('Flight ID is required'),
  
  body('seatClass')
    .notEmpty()
    .withMessage('Seat class is required')
    .isIn(['economy', 'business', 'firstClass'])
    .withMessage('Seat class must be economy, business, or firstClass'),
  
  body('passengers')
    .isArray({ min: 1 })
    .withMessage('At least one passenger is required'),
  
  body('passengers.*.name')
    .notEmpty()
    .withMessage('Passenger name is required')
    .trim(),
  
  body('passengers.*.age')
    .notEmpty()
    .withMessage('Passenger age is required')
    .isNumeric()
    .withMessage('Age must be a number'),
  
  body('passengers.*.passportNumber')
    .notEmpty()
    .withMessage('Passport number is required')
    .trim(),
  
  body('contactEmail')
    .notEmpty()
    .withMessage('Contact email is required')
    .isEmail()
    .withMessage('Please include a valid email'),
  
  body('contactPhone')
    .notEmpty()
    .withMessage('Contact phone is required')
    .trim(),
  
  body('flightDate')
    .notEmpty()
    .withMessage('Flight date is required')
    .isISO8601()
    .withMessage('Flight date must be a valid date'),
  
  body('totalPrice')
    .notEmpty()
    .withMessage('Total price is required')
    .isNumeric()
    .withMessage('Price must be a number'),
  
  body('originalPrice')
    .notEmpty()
    .withMessage('Original price is required')
    .isNumeric()
    .withMessage('Price must be a number')
];

// Schedule validation rules
exports.scheduleValidationRules = [
  body('routeId')
    .notEmpty()
    .withMessage('Route ID is required'),
  
  body('flightNumber')
    .notEmpty()
    .withMessage('Flight number is required')
    .trim()
    .isLength({ max: 10 })
    .withMessage('Flight number cannot exceed 10 characters'),
  
  body('aircraft')
    .notEmpty()
    .withMessage('Aircraft is required')
    .trim(),
  
  body('departureTime')
    .notEmpty()
    .withMessage('Departure time is required')
    .isISO8601()
    .withMessage('Departure time must be a valid date'),
  
  body('arrivalTime')
    .notEmpty()
    .withMessage('Arrival time is required')
    .isISO8601()
    .withMessage('Arrival time must be a valid date'),
  
  body('price.economy')
    .notEmpty()
    .withMessage('Economy class price is required')
    .isNumeric()
    .withMessage('Price must be a number'),
  
  body('price.business')
    .notEmpty()
    .withMessage('Business class price is required')
    .isNumeric()
    .withMessage('Price must be a number'),
  
  body('seatsAvailable.economy')
    .notEmpty()
    .withMessage('Available economy seats are required')
    .isNumeric()
    .withMessage('Seats must be a number'),
  
  body('seatsAvailable.business')
    .notEmpty()
    .withMessage('Available business seats are required')
    .isNumeric()
    .withMessage('Seats must be a number'),
  
  body('recurringDays')
    .optional()
    .isArray()
    .withMessage('Recurring days must be an array of day numbers (0-6)')
    .custom(days => {
      if (!days) return true;
      return days.every(day => day >= 0 && day <= 6);
    })
    .withMessage('Recurring days must contain valid day numbers (0-6, where 0 is Sunday)')
];

// Reschedule booking validation rules
exports.rescheduleValidationRules = [
  body('newFlightId')
    .notEmpty()
    .withMessage('New flight ID is required'),
  
  body('flightDate')
    .notEmpty()
    .withMessage('Flight date is required')
    .isISO8601()
    .withMessage('Flight date must be a valid date')
];
