const Route = require('../models/Route');

// @desc    Create a new route
// @route   POST /api/routes
// @access  Private/Admin
exports.createRoute = async (req, res) => {
  try {
    // Check if route already exists
    const existingRoute = await Route.findOne({
      'origin.code': req.body.origin.code,
      'destination.code': req.body.destination.code
    });

    if (existingRoute) {
      return res.status(400).json({
        success: false,
        error: 'Route already exists'
      });
    }

    // Create route
    const route = await Route.create(req.body);

    res.status(201).json({
      success: true,
      data: route
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      error: 'Server Error'
    });
  }
};

// @desc    Get all routes with optional filtering
// @route   GET /api/routes
// @access  Public
exports.getRoutes = async (req, res) => {
  try {
    let query = {};
    
    // Filter by origin if provided
    if (req.query.origin) {
      query['origin.code'] = req.query.origin;
    }
    
    // Filter by destination if provided
    if (req.query.destination) {
      query['destination.code'] = req.query.destination;
    }
    
    // Only active routes if specified
    if (req.query.active === 'true') {
      query.isActive = true;
    }
    
    // Build query
    const routes = await Route.find(query)
      .populate({
        path: 'activeFlights',
        select: 'flightNumber departureTime arrivalTime status'
      })
      .sort({ 'origin.code': 1, 'destination.code': 1 });
    
    res.status(200).json({
      success: true,
      count: routes.length,
      data: routes
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      error: 'Server Error'
    });
  }
};

// @desc    Get single route
// @route   GET /api/routes/:id
// @access  Public
exports.getRoute = async (req, res) => {
  try {
    const route = await Route.findById(req.params.id)
      .populate({
        path: 'activeFlights',
        select: 'flightNumber departureTime arrivalTime status'
      });

    if (!route) {
      return res.status(404).json({
        success: false,
        error: 'Route not found'
      });
    }

    res.status(200).json({
      success: true,
      data: route
    });
  } catch (error) {
    console.error(error);
    
    // Check if error is because of invalid ObjectId
    if (error.kind === 'ObjectId') {
      return res.status(404).json({
        success: false,
        error: 'Route not found'
      });
    }
    
    res.status(500).json({
      success: false,
      error: 'Server Error'
    });
  }
};

// @desc    Update route
// @route   PUT /api/routes/:id
// @access  Private/Admin
exports.updateRoute = async (req, res) => {
  try {
    // Check if route exists
    let route = await Route.findById(req.params.id);

    if (!route) {
      return res.status(404).json({
        success: false,
        error: 'Route not found'
      });
    }

    // Check if updating codes and if the new route already exists
    if (
      (req.body.origin && req.body.origin.code && req.body.origin.code !== route.origin.code) ||
      (req.body.destination && req.body.destination.code && req.body.destination.code !== route.destination.code)
    ) {
      const originCode = req.body.origin ? req.body.origin.code : route.origin.code;
      const destinationCode = req.body.destination ? req.body.destination.code : route.destination.code;
      
      const existingRoute = await Route.findOne({
        'origin.code': originCode,
        'destination.code': destinationCode,
        _id: { $ne: req.params.id } // Exclude current route from check
      });

      if (existingRoute) {
        return res.status(400).json({
          success: false,
          error: 'Route with these origin and destination already exists'
        });
      }
    }

    // Update route
    route = await Route.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    res.status(200).json({
      success: true,
      data: route
    });
  } catch (error) {
    console.error(error);
    
    // Check if error is because of invalid ObjectId
    if (error.kind === 'ObjectId') {
      return res.status(404).json({
        success: false,
        error: 'Route not found'
      });
    }
    
    res.status(500).json({
      success: false,
      error: 'Server Error'
    });
  }
};

// @desc    Delete route
// @route   DELETE /api/routes/:id
// @access  Private/Admin
exports.deleteRoute = async (req, res) => {
  try {
    const route = await Route.findById(req.params.id);

    if (!route) {
      return res.status(404).json({
        success: false,
        error: 'Route not found'
      });
    }

    // Check if route has active flights
    if (route.activeFlights.length > 0) {
      return res.status(400).json({
        success: false,
        error: 'Cannot delete route with active flights'
      });
    }

    await route.deleteOne();

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
        error: 'Route not found'
      });
    }
    
    res.status(500).json({
      success: false,
      error: 'Server Error'
    });
  }
};
