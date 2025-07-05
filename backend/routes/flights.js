const express = require('express');
const { 
  createFlight,
  getFlights,
  getFlight,
  updateFlight,
  deleteFlight,
  getFlightStatus,
  updateFlightStatus
} = require('../controllers/flights');
const { 
  flightValidationRules,
  handleValidationErrors 
} = require('../middleware/validator');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// Public routes
router.get('/', getFlights);

// Search endpoint - MUST be before the :id route to avoid being caught by it
router.get('/search', (req, res) => {
  // Extract search parameters from query
  const {
    tripType,
    departureCity,
    arrivalCity,
    departureDate,
    returnDate,
    passengers,
    flightClass
  } = req.query;
  
  try {
    // Load flights data from JSON file
    const flights = require('../data/flights.json');
    
    // Log received search parameters to help debug
    console.log('Search params received:', { departureCity, arrivalCity, departureDate });
    
    // Filter flights based on search criteria
    const filteredFlights = flights.filter(flight => {
      // Check for departure and arrival city matches - case insensitive for better matching
      // Strip any potential airport codes for comparison
      const originCity = flight.origin.split('(')[0].trim().toLowerCase();
      const destCity = flight.destination.split('(')[0].trim().toLowerCase();
      
      // Match if the city portion contains what the user searched for
      const originMatch = departureCity ? originCity.includes(departureCity.toLowerCase()) : true;
      const destinationMatch = arrivalCity ? destCity.includes(arrivalCity.toLowerCase()) : true;
      
      // For debugging
      if (departureCity && arrivalCity) {
        console.log(`Comparing: ${originCity} with ${departureCity.toLowerCase()} = ${originMatch}`);
        console.log(`Comparing: ${destCity} with ${arrivalCity.toLowerCase()} = ${destinationMatch}`);
      }
      
      // Check if departure date matches (only checking day, not time)
      const flightDepartDate = new Date(flight.departureTime).toISOString().split('T')[0];
      const searchDepartDate = departureDate ? new Date(departureDate).toISOString().split('T')[0] : null;
      const dateMatch = !searchDepartDate || flightDepartDate === searchDepartDate;
      
      return originMatch && destinationMatch && dateMatch;
    });
    
    // Log search results for debugging
    console.log(`Found ${filteredFlights.length} flights matching search criteria`);
    
    // Add _id field for frontend compatibility if needed
    const formattedFlights = filteredFlights.map(flight => ({
      ...flight,
      _id: flight.id // Ensure _id exists for MongoDB compatibility on frontend
    }));

    res.status(200).json({
      success: true,
      flights: formattedFlights
    });
  } catch (error) {
    console.error('Error searching flights:', error);
    res.status(500).json({
      success: false,
      message: 'Error searching flights'
    });
  }
});

// Status check endpoint - also needs to be before the :id route
router.get('/status/:code', getFlightStatus);

// Get flight by ID - must be last as it will match any other path
router.get('/:id', getFlight);

// Protected routes
router.use(protect);

// Admin only routes
router.post(
  '/',
  authorize('admin'),
  flightValidationRules,
  handleValidationErrors,
  createFlight
);

router.put(
  '/:id',
  authorize('admin'),
  flightValidationRules,
  handleValidationErrors,
  updateFlight
);

router.delete(
  '/:id',
  authorize('admin'),
  deleteFlight
);

router.put(
  '/:id/status',
  authorize('admin'),
  updateFlightStatus
);

module.exports = router;
