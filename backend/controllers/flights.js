const Flight = require('../models/Flight');
const Route = require('../models/Route');

// @desc    Create a new flight
// @route   POST /api/flights
// @access  Private/Admin
exports.createFlight = async (req, res) => {
  try {
    // Check if route exists
    const route = await Route.findById(req.body.route);
    if (!route) {
      return res.status(404).json({
        success: false,
        error: 'Route not found'
      });
    }

    // Create flight
    const flight = await Flight.create(req.body);
    
    // Add flight to route's active flights
    route.activeFlights.push(flight._id);
    await route.save();

    res.status(201).json({
      success: true,
      data: flight
    });
  } catch (error) {
    console.error(error);
    
    // Duplicate key error (flight number already exists)
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        error: 'Flight number already exists'
      });
    }
    
    res.status(500).json({
      success: false,
      error: 'Server Error'
    });
  }
};

// @desc    Get all flights with optional filtering
// @route   GET /api/flights
// @access  Public
exports.getFlights = async (req, res) => {
  try {
    let query = {};
    
    // Filter by status if provided
    if (req.query.status) {
      query.status = req.query.status;
    }
    
    // Filter by route if provided
    if (req.query.route) {
      query.route = req.query.route;
    }
    
    // Filter by date range if provided
    if (req.query.from && req.query.to) {
      query.departureTime = {
        $gte: new Date(req.query.from),
        $lte: new Date(req.query.to)
      };
    }
    
    // Build query
    const flights = await Flight.find(query)
      .populate({
        path: 'route',
        select: 'origin destination distance'
      })
      .sort({ departureTime: 1 });
    
    res.status(200).json({
      success: true,
      count: flights.length,
      data: flights
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      error: 'Server Error'
    });
  }
};

// @desc    Get single flight
// @route   GET /api/flights/:id
// @access  Public
exports.getFlight = async (req, res) => {
  try {
    const flight = await Flight.findById(req.params.id)
      .populate({
        path: 'route',
        select: 'origin destination distance estimatedDuration'
      });

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
    
    // Check if error is because of invalid ObjectId
    if (error.kind === 'ObjectId') {
      return res.status(404).json({
        success: false,
        error: 'Flight not found'
      });
    }
    
    res.status(500).json({
      success: false,
      error: 'Server Error'
    });
  }
};

// @desc    Update flight
// @route   PUT /api/flights/:id
// @access  Private/Admin
exports.updateFlight = async (req, res) => {
  try {
    let flight = await Flight.findById(req.params.id);

    if (!flight) {
      return res.status(404).json({
        success: false,
        error: 'Flight not found'
      });
    }

    // If changing route, check if new route exists
    if (req.body.route && req.body.route !== flight.route.toString()) {
      const newRoute = await Route.findById(req.body.route);
      if (!newRoute) {
        return res.status(404).json({
          success: false,
          error: 'Route not found'
        });
      }
      
      // Update route references
      const oldRoute = await Route.findById(flight.route);
      if (oldRoute) {
        oldRoute.activeFlights = oldRoute.activeFlights.filter(
          flightId => flightId.toString() !== flight._id.toString()
        );
        await oldRoute.save();
      }
      
      newRoute.activeFlights.push(flight._id);
      await newRoute.save();
    }

    // Update flight
    flight = await Flight.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).populate({
      path: 'route',
      select: 'origin destination distance estimatedDuration'
    });

    res.status(200).json({
      success: true,
      data: flight
    });
  } catch (error) {
    console.error(error);
    
    // Check if error is because of invalid ObjectId
    if (error.kind === 'ObjectId') {
      return res.status(404).json({
        success: false,
        error: 'Flight not found'
      });
    }
    
    res.status(500).json({
      success: false,
      error: 'Server Error'
    });
  }
};

// @desc    Delete flight
// @route   DELETE /api/flights/:id
// @access  Private/Admin
exports.deleteFlight = async (req, res) => {
  try {
    const flight = await Flight.findById(req.params.id);

    if (!flight) {
      return res.status(404).json({
        success: false,
        error: 'Flight not found'
      });
    }

    // Remove flight from route's active flights
    const route = await Route.findById(flight.route);
    if (route) {
      route.activeFlights = route.activeFlights.filter(
        flightId => flightId.toString() !== flight._id.toString()
      );
      await route.save();
    }

    await flight.deleteOne();

    res.status(200).json({
      success: true,
      data: {}
    });
  } catch (error) {
    console.error(error);
    
    // Check if error is because of invalid ObjectId
    if (error.kind === 'ObjectId') {
      return res.status(404).json({
        success: false,
        error: 'Flight not found'
      });
    }
    
    res.status(500).json({
      success: false,
      error: 'Server Error'
    });
  }
};

// @desc    Get flight status by flight code
// @route   GET /api/flights/status/:code
// @access  Public
exports.getFlightStatus = async (req, res) => {
  try {
    const flight = await Flight.findOne({ flightNumber: req.params.code })
      .populate({
        path: 'route',
        select: 'origin destination'
      });

    if (!flight) {
      return res.status(404).json({
        success: false,
        error: 'Flight not found'
      });
    }

    // Return flight status information
    res.status(200).json({
      success: true,
      data: {
        flightNumber: flight.flightNumber,
        status: flight.status,
        departureTime: flight.departureTime,
        arrivalTime: flight.arrivalTime,
        route: flight.route 
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      error: 'Server Error'
    });
  }
};

// @desc    Update flight status
// @route   PUT /api/flights/:id/status
// @access  Private/Admin
exports.updateFlightStatus = async (req, res) => {
  try {
    const { status } = req.body;
    
    if (!status) {
      return res.status(400).json({
        success: false,
        error: 'Status is required'
      });
    }
    
    // Valid status values
    const validStatus = ['scheduled', 'delayed', 'departed', 'arrived', 'cancelled'];
    if (!validStatus.includes(status)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid status value'
      });
    }
    
    const flight = await Flight.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );

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
    
    // Check if error is because of invalid ObjectId
    if (error.kind === 'ObjectId') {
      return res.status(404).json({
        success: false,
        error: 'Flight not found'
      });
    }
    
    res.status(500).json({
      success: false,
      error: 'Server Error'
    });
  }
};
