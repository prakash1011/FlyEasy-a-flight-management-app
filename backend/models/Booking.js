const mongoose = require('mongoose');

const BookingSchema = new mongoose.Schema({
  bookingReference: {
    type: String,
    unique: true,
    required: true
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Please provide a user ID']
  },
  flight: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Flight',
    required: [true, 'Please provide a flight ID']
  },
  seatClass: {
    type: String,
    enum: ['economy', 'business', 'firstClass'],
    default: 'economy',
    required: [true, 'Please provide a seat class']
  },
  passengers: [{
    name: {
      type: String,
      required: [true, 'Please provide passenger name'],
      trim: true
    },
    age: {
      type: Number,
      required: [true, 'Please provide passenger age']
    },
    passportNumber: {
      type: String,
      required: [true, 'Please provide passport number'],
      trim: true
    }
  }],
  contactEmail: {
    type: String,
    required: [true, 'Please provide a contact email'],
    match: [
      /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
      'Please provide a valid email'
    ]
  },
  contactPhone: {
    type: String,
    required: [true, 'Please provide a contact phone number'],
    trim: true
  },
  bookingDate: {
    type: Date,
    default: Date.now
  },
  flightDate: {
    type: Date,
    required: [true, 'Please provide the flight date']
  },
  totalPrice: {
    type: Number,
    required: [true, 'Please provide the total price']
  },
  originalPrice: {
    type: Number,
    required: [true, 'Please provide the original price before discount']
  },
  discountApplied: {
    type: Boolean,
    default: false
  },
  discountReason: {
    type: String,
    default: ''
  },
  discountAmount: {
    type: Number,
    default: 0
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'completed', 'refunded', 'failed'],
    default: 'pending'
  },
  status: {
    type: String,
    enum: ['confirmed', 'cancelled', 'rescheduled', 'checked-in', 'completed'],
    default: 'confirmed'
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Generate booking reference before saving
BookingSchema.pre('save', async function(next) {
  if (!this.bookingReference) {
    // Generate a random 6-character alphanumeric booking reference
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let reference = '';
    for (let i = 0; i < 6; i++) {
      reference += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    
    // Check if the reference already exists
    const existingBooking = await this.constructor.findOne({ bookingReference: reference });
    if (existingBooking) {
      // Try generating again with recursion (rare case)
      return this.pre('save', next);
    }
    
    this.bookingReference = reference;
  }
  
  next();
});

// Apply discount logic
BookingSchema.pre('save', async function(next) {
  if (this.isNew) {
    const User = mongoose.model('User');
    const user = await User.findById(this.user);
    
    // Check if user is eligible for discount
    const isEligible = await user.isEligibleForDiscount();
    
    if (isEligible) {
      const discountRate = 0.20; // 20% discount
      this.originalPrice = this.totalPrice;
      this.discountAmount = this.originalPrice * discountRate;
      this.totalPrice = this.originalPrice - this.discountAmount;
      this.discountApplied = true;
      this.discountReason = 'Recent flight in the past 20 days';
    }
  }
  
  next();
});

// Virtual for checking if booking is refundable (e.g., if more than 24 hours before flight)
BookingSchema.virtual('isRefundable').get(function() {
  // Get current time
  const now = new Date();
  
  // Calculate the difference in hours
  const hoursDifference = (this.flightDate.getTime() - now.getTime()) / (1000 * 60 * 60);
  
  return hoursDifference > 24;
});

module.exports = mongoose.model('Booking', BookingSchema);
