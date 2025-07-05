const fs = require('fs');
const path = require('path');

// Get path to data file
const dataPath = path.join(__dirname, '../data/flights.json');

// Helper function to read the flights data
const getFlightData = () => {
  try {
    const jsonData = fs.readFileSync(dataPath, 'utf8');
    return JSON.parse(jsonData);
  } catch (error) {
    console.error('Error reading flight data:', error);
    return [];
  }
};

// @desc    Get all flights from static JSON
// @route   GET /api/static-flights
// @access  Public
exports.getAllFlights = (req, res) => {
  try {
    const flights = getFlightData();
    
    // Apply filtering if query parameters exist
    let filteredFlights = [...flights];
    
    if (req.query.origin) {
      filteredFlights = filteredFlights.filter(flight => 
        flight.origin.toLowerCase().includes(req.query.origin.toLowerCase())
      );
    }
    
    if (req.query.destination) {
      filteredFlights = filteredFlights.filter(flight => 
        flight.destination.toLowerCase().includes(req.query.destination.toLowerCase())
      );
    }
    
    if (req.query.minPrice) {
      filteredFlights = filteredFlights.filter(flight => 
        flight.price >= parseInt(req.query.minPrice)
      );
    }
    
    if (req.query.maxPrice) {
      filteredFlights = filteredFlights.filter(flight => 
        flight.price <= parseInt(req.query.maxPrice)
      );
    }
    
    if (req.query.airline) {
      filteredFlights = filteredFlights.filter(flight => 
        flight.airline.toLowerCase().includes(req.query.airline.toLowerCase())
      );
    }
    
    if (req.query.date) {
      const queryDate = new Date(req.query.date).toISOString().split('T')[0];
      filteredFlights = filteredFlights.filter(flight => {
        const flightDate = new Date(flight.departureTime).toISOString().split('T')[0];
        return flightDate === queryDate;
      });
    }
    
    res.status(200).json({
      success: true,
      count: filteredFlights.length,
      data: filteredFlights
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      error: 'Server Error'
    });
  }
};

// @desc    Get single flight from static JSON by ID
// @route   GET /api/static-flights/:id
// @access  Public
exports.getFlightById = (req, res) => {
  try {
    const flights = getFlightData();
    const flight = flights.find(flight => flight.id === req.params.id);
    
    if (!flight) {
      return res.status(404).json({
        success: false,
        error: 'Flight not found'
      });
    }
    
    res.status(200).json({
      success: true,
      data: flight
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      error: 'Server Error'
    });
  }
};
