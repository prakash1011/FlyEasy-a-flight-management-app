const express = require('express');
const { getAllFlights, getFlightById } = require('../controllers/staticFlights');

const router = express.Router();

// Get all flights
router.get('/', getAllFlights);

// Get single flight by ID
router.get('/:id', getFlightById);

module.exports = router;
