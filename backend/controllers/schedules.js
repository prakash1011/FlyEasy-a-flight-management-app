const Flight = require('../models/Flight');
const Route = require('../models/Route');

// @desc    Create a new flight schedule
// @route   POST /api/schedules
// @access  Private/Admin
exports.createSchedule = async (req, res) => {
  try {
    const {
      routeId,
      flightNumber,
      aircraft,
      departureTime,
      arrivalTime,
      price,
      seatsAvailable,
      recurringDays
    } = req.body;

    // Check if route exists
    const route = await Route.findById(routeId);
    if (!route) {
      return res.status(404).json({
        success: false,
        error: 'Route not found'
      });
    }

    // Check if flight number already exists
    const existingFlight = await Flight.findOne({ flightNumber });
    if (existingFlight) {
      return res.status(400).json({
        success: false,
        error: 'Flight number already exists'
      });
    }

    // Create the flight
    const flight = await Flight.create({
      route: routeId,
      flightNumber,
      aircraft,
      departureTime,
      arrivalTime,
      price,
      seatsAvailable,
      status: 'scheduled'
    });

    // Add flight to route's active flights
    route.activeFlights.push(flight._id);
    await route.save();

    // If recurring days are specified, create recurring flight schedules
    if (recurringDays && recurringDays.length > 0) {
      // Schedule flights for the next 3 months on specified days
      const startDate = new Date(departureTime);
      const endDate = new Date();
      endDate.setMonth(endDate.getMonth() + 3); // 3 months into the future
      
      const recurringFlights = [];
      
      // Loop through each day until we reach the end date
      const currentDate = new Date(startDate);
      currentDate.setDate(currentDate.getDate() + 7); // Start from next week
      
      while (currentDate < endDate) {
        const dayOfWeek = currentDate.getDay(); // 0 = Sunday, 1 = Monday, etc.
        
        if (recurringDays.includes(dayOfWeek)) {
          // Create a new departure and arrival time for this date
          const newDepartureTime = new Date(departureTime);
          newDepartureTime.setDate(currentDate.getDate());
          newDepartureTime.setMonth(currentDate.getMonth());
          newDepartureTime.setFullYear(currentDate.getFullYear());
          
          const newArrivalTime = new Date(arrivalTime);
          newArrivalTime.setDate(currentDate.getDate());
          newArrivalTime.setMonth(currentDate.getMonth());
          newArrivalTime.setFullYear(currentDate.getFullYear());
          
          // If arrival is on the next day, adjust it accordingly
          if (arrivalTime < departureTime) {
            newArrivalTime.setDate(newArrivalTime.getDate() + 1);
          }
          
          // Create a unique flight number for recurring flight
          const recurring_flightNumber = `${flightNumber}-${currentDate.toISOString().split('T')[0]}`;
          
          // Create recurring flight
          const recurringFlight = await Flight.create({
            route: routeId,
            flightNumber: recurring_flightNumber,
            aircraft,
            departureTime: newDepartureTime,
            arrivalTime: newArrivalTime,
            price,
            seatsAvailable,
            status: 'scheduled'
          });
          
          // Add recurring flight to route's active flights
          route.activeFlights.push(recurringFlight._id);
          
          recurringFlights.push(recurringFlight);
        }
        
        // Move to next day
        currentDate.setDate(currentDate.getDate() + 1);
      }
      
      await route.save();
      
      return res.status(201).json({
        success: true,
        data: {
          mainFlight: flight,
          recurringFlightsCount: recurringFlights.length,
          message: `Successfully scheduled ${recurringFlights.length} recurring flights`
        }
      });
    }

    res.status(201).json({
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

// @desc    Get all flight schedules with filtering
// @route   GET /api/schedules
// @access  Public
exports.getSchedules = async (req, res) => {
  try {
    let query = {};
    
    // Filter by route if provided
    if (req.query.route) {
      query.route = req.query.route;
    }
    
    // Filter by status if provided
    if (req.query.status) {
      query.status = req.query.status;
    }
    
    // Filter by date range if provided
    if (req.query.from && req.query.to) {
      query.departureTime = {
        $gte: new Date(req.query.from),
        $lte: new Date(req.query.to)
      };
    }
    
    // Filter by origin and destination
    const route = {};
    if (req.query.origin) {
      route['origin.code'] = req.query.origin;
    }
    if (req.query.destination) {
      route['destination.code'] = req.query.destination;
    }
    
    // If origin or destination filters are provided, first find routes
    if (Object.keys(route).length > 0) {
      const routes = await Route.find(route);
      if (routes.length === 0) {
        return res.status(200).json({
          success: true,
          count: 0,
          data: []
        });
      }
      query.route = { $in: routes.map(r => r._id) };
    }
    
    // Build query with pagination
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;
    
    // Count total documents for pagination
    const total = await Flight.countDocuments(query);
    
    // Get flight schedules
    const flights = await Flight.find(query)
      .sort({ departureTime: 1 })
      .populate({
        path: 'route',
        select: 'origin destination estimatedDuration'
      })
      .skip(startIndex)
      .limit(limit);
    
    // Pagination result
    const pagination = {};
    
    if (endIndex < total) {
      pagination.next = {
        page: page + 1,
        limit
      };
    }
    
    if (startIndex > 0) {
      pagination.prev = {
        page: page - 1,
        limit
      };
    }
    
    res.status(200).json({
      success: true,
      count: flights.length,
      pagination,
      totalPages: Math.ceil(total / limit),
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

// @desc    Get single schedule
// @route   GET /api/schedules/:id
// @access  Public
exports.getSchedule = async (req, res) => {
  try {
    const flight = await Flight.findById(req.params.id)
      .populate({
        path: 'route',
        select: 'origin destination estimatedDuration'
      });

    if (!flight) {
      return res.status(404).json({
        success: false,
        error: 'Flight schedule not found'
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
        error: 'Flight schedule not found'
      });
    }
    
    res.status(500).json({
      success: false,
      error: 'Server Error'
    });
  }
};

// @desc    Update flight schedule
// @route   PUT /api/schedules/:id
// @access  Private/Admin
exports.updateSchedule = async (req, res) => {
  try {
    // Check if flight exists
    let flight = await Flight.findById(req.params.id);

    if (!flight) {
      return res.status(404).json({
        success: false,
        error: 'Flight schedule not found'
      });
    }

    // If updating flight number, check if it already exists
    if (req.body.flightNumber && req.body.flightNumber !== flight.flightNumber) {
      const existingFlight = await Flight.findOne({ 
        flightNumber: req.body.flightNumber,
        _id: { $ne: req.params.id }
      });
      
      if (existingFlight) {
        return res.status(400).json({
          success: false,
          error: 'Flight number already exists'
        });
      }
    }

    // If changing route, update route references
    if (req.body.route && req.body.route !== flight.route.toString()) {
      // Remove flight from old route's activeFlights
      const oldRoute = await Route.findById(flight.route);
      if (oldRoute) {
        oldRoute.activeFlights = oldRoute.activeFlights.filter(
          flightId => flightId.toString() !== req.params.id
        );
        await oldRoute.save();
      }
      
      // Add flight to new route's activeFlights
      const newRoute = await Route.findById(req.body.route);
      if (!newRoute) {
        return res.status(404).json({
          success: false,
          error: 'New route not found'
        });
      }
      newRoute.activeFlights.push(req.params.id);
      await newRoute.save();
    }

    // Update flight
    flight = await Flight.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).populate({
      path: 'route',
      select: 'origin destination estimatedDuration'
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
        error: 'Flight schedule not found'
      });
    }
    
    res.status(500).json({
      success: false,
      error: 'Server Error'
    });
  }
};

// @desc    Delete flight schedule
// @route   DELETE /api/schedules/:id
// @access  Private/Admin
exports.deleteSchedule = async (req, res) => {
  try {
    const flight = await Flight.findById(req.params.id);

    if (!flight) {
      return res.status(404).json({
        success: false,
        error: 'Flight schedule not found'
      });
    }

    // Check if flight is already departed
    if (flight.status === 'in-air' || flight.status === 'landed') {
      return res.status(400).json({
        success: false,
        error: 'Cannot delete a flight that has already departed'
      });
    }

    // Remove flight from route's activeFlights
    const route = await Route.findById(flight.route);
    if (route) {
      route.activeFlights = route.activeFlights.filter(
        flightId => flightId.toString() !== req.params.id
      );
      await route.save();
    }

    // Delete flight
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
        error: 'Flight schedule not found'
      });
    }
    
    res.status(500).json({
      success: false,
      error: 'Server Error'
    });
  }
};
