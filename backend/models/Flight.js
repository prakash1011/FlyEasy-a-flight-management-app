const mongoose = require('mongoose');

const FlightSchema = new mongoose.Schema({
  flightNumber: {
    type: String,
    required: [true, 'Please provide a flight number'],
    unique: true,
    trim: true,
    maxlength: [10, 'Flight number cannot exceed 10 characters']
  },
  route: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Route',
    required: [true, 'Please provide a flight route']
  },
  aircraft: {
    type: String,
    required: [true, 'Please provide an aircraft type'],
    trim: true
  },
  departureTime: {
    type: Date,
    required: [true, 'Please provide a departure time']
  },
  arrivalTime: {
    type: Date,
    required: [true, 'Please provide an arrival time']
  },
  duration: {
    type: Number,
    required: [true, 'Please provide flight duration in minutes']
  },
  price: {
    economy: {
      type: Number,
      required: [true, 'Please provide economy class price']
    },
    business: {
      type: Number,
      required: [true, 'Please provide business class price']
    },
    firstClass: {
      type: Number,
      default: 0
    }
  },
  seatsAvailable: {
    economy: {
      type: Number,
      required: [true, 'Please provide available economy seats']
    },
    business: {
      type: Number,
      required: [true, 'Please provide available business seats']
    },
    firstClass: {
      type: Number,
      default: 0
    }
  },
  status: {
    type: String,
    enum: ['scheduled', 'delayed', 'departed', 'arrived', 'cancelled'],
    default: 'scheduled'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Virtual for checking if flight is full
FlightSchema.virtual('isFull').get(function() {
  return (
    this.seatsAvailable.economy === 0 &&
    this.seatsAvailable.business === 0 &&
    this.seatsAvailable.firstClass === 0
  );
});

// Method to check if seats are available in specific class
FlightSchema.methods.hasAvailableSeats = function(seatClass) {
  return this.seatsAvailable[seatClass] > 0;
};

// Method to decrease available seats after booking
FlightSchema.methods.bookSeat = function(seatClass) {
  if (this.seatsAvailable[seatClass] > 0) {
    this.seatsAvailable[seatClass] -= 1;
    return true;
  }
  return false;
};

// Method to increase available seats after cancellation
FlightSchema.methods.cancelSeat = function(seatClass) {
  this.seatsAvailable[seatClass] += 1;
  return true;
};

module.exports = mongoose.model('Flight', FlightSchema);
