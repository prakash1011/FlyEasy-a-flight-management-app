const mongoose = require('mongoose');

const RouteSchema = new mongoose.Schema({
  origin: {
    code: {
      type: String,
      required: [true, 'Please provide an origin airport code'],
      trim: true,
      maxlength: [3, 'Airport code cannot exceed 3 characters']
    },
    city: {
      type: String,
      required: [true, 'Please provide an origin city'],
      trim: true
    },
    country: {
      type: String,
      required: [true, 'Please provide an origin country'],
      trim: true
    }
  },
  destination: {
    code: {
      type: String,
      required: [true, 'Please provide a destination airport code'],
      trim: true,
      maxlength: [3, 'Airport code cannot exceed 3 characters']
    },
    city: {
      type: String,
      required: [true, 'Please provide a destination city'],
      trim: true
    },
    country: {
      type: String,
      required: [true, 'Please provide a destination country'],
      trim: true
    }
  },
  distance: {
    type: Number,
    required: [true, 'Please provide the route distance in kilometers']
  },
  estimatedDuration: {
    type: Number,
    required: [true, 'Please provide estimated duration in minutes']
  },
  activeFlights: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Flight'
  }],
  isActive: {
    type: Boolean,
    default: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Create a compound index for unique routes
RouteSchema.index({ 'origin.code': 1, 'destination.code': 1 }, { unique: true });

// Virtual for getting the route display name
RouteSchema.virtual('routeDisplayName').get(function() {
  return `${this.origin.code} - ${this.destination.code}`;
});

// Virtual for getting the full route display name
RouteSchema.virtual('fullRouteDisplayName').get(function() {
  return `${this.origin.city}, ${this.origin.country} (${this.origin.code}) to ${this.destination.city}, ${this.destination.country} (${this.destination.code})`;
});

module.exports = mongoose.model('Route', RouteSchema);
