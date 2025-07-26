const mongoose = require('mongoose');

const reservationSchema = new mongoose.Schema({
  confirmationNumber: {
    type: String,
    required: true,
    unique: true,
    uppercase: true
  },
  guest: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Guest',
    required: [true, 'Guest information is required']
  },
  room: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Room',
    required: [true, 'Room information is required']
  },
  dates: {
    checkIn: {
      type: Date,
      required: [true, 'Check-in date is required']
    },
    checkOut: {
      type: Date,
      required: [true, 'Check-out date is required'],
      validate: {
        validator: function(value) {
          return value > this.dates.checkIn;
        },
        message: 'Check-out date must be after check-in date'
      }
    },
    actualCheckIn: Date,
    actualCheckOut: Date
  },
  guests: {
    adults: {
      type: Number,
      required: true,
      min: [1, 'At least 1 adult required']
    },
    children: {
      type: Number,
      default: 0,
      min: 0
    }
  },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'checked-in', 'checked-out', 'cancelled', 'no-show'],
    default: 'pending'
  },
  pricing: {
    roomRate: {
      type: Number,
      required: true,
      min: 0
    },
    nights: {
      type: Number,
      required: true,
      min: 1
    },
    subtotal: {
      type: Number,
      required: true,
      min: 0
    },
    taxes: {
      type: Number,
      default: 0,
      min: 0
    },
    fees: [{
      name: String,
      amount: Number,
      description: String
    }],
    discounts: [{
      name: String,
      amount: Number,
      type: {
        type: String,
        enum: ['percentage', 'fixed']
      }
    }],
    totalAmount: {
      type: Number,
      required: true,
      min: 0
    }
  },
  payment: {
    method: {
      type: String,
      enum: ['cash', 'credit-card', 'debit-card', 'bank-transfer', 'online'],
      required: true
    },
    status: {
      type: String,
      enum: ['pending', 'partial', 'paid', 'refunded'],
      default: 'pending'
    },
    paidAmount: {
      type: Number,
      default: 0,
      min: 0
    },
    transactions: [{
      amount: Number,
      method: String,
      transactionId: String,
      date: {
        type: Date,
        default: Date.now
      },
      status: {
        type: String,
        enum: ['success', 'failed', 'pending']
      }
    }]
  },
  bookingSource: {
    type: String,
    enum: ['direct', 'phone', 'email', 'walk-in', 'online', 'agent', 'booking.com', 'expedia'],
    default: 'direct'
  },
  specialRequests: String,
  notes: String,
  preferences: {
    bedType: String,
    smokingPreference: String,
    floorPreference: String,
    quietRoom: Boolean,
    lateCheckout: Boolean,
    earlyCheckin: Boolean
  },
  cancellation: {
    cancelledAt: Date,
    cancelledBy: String,
    reason: String,
    refundAmount: {
      type: Number,
      default: 0
    }
  },
  ratings: {
    cleanliness: {
      type: Number,
      min: 1,
      max: 5
    },
    service: {
      type: Number,
      min: 1,
      max: 5
    },
    amenities: {
      type: Number,
      min: 1,
      max: 5
    },
    location: {
      type: Number,
      min: 1,
      max: 5
    },
    overall: {
      type: Number,
      min: 1,
      max: 5
    },
    review: String,
    reviewDate: Date
  }
}, {
  timestamps: true
});

// Indexes
reservationSchema.index({ confirmationNumber: 1 });
reservationSchema.index({ guest: 1 });
reservationSchema.index({ room: 1 });
reservationSchema.index({ 'dates.checkIn': 1, 'dates.checkOut': 1 });
reservationSchema.index({ status: 1 });

// Pre-save middleware to generate confirmation number
reservationSchema.pre('save', function(next) {
  if (this.isNew && !this.confirmationNumber) {
    const prefix = 'HTL';
    const timestamp = Date.now().toString(36).toUpperCase();
    const random = Math.random().toString(36).substring(2, 5).toUpperCase();
    this.confirmationNumber = `${prefix}${timestamp}${random}`;
  }
  next();
});

// Virtual for duration in nights
reservationSchema.virtual('duration').get(function() {
  if (this.dates.checkIn && this.dates.checkOut) {
    const timeDiff = this.dates.checkOut - this.dates.checkIn;
    return Math.ceil(timeDiff / (1000 * 60 * 60 * 24));
  }
  return 0;
});

// Virtual for remaining balance
reservationSchema.virtual('remainingBalance').get(function() {
  return this.pricing.totalAmount - this.payment.paidAmount;
});

// Method to check if reservation is active
reservationSchema.methods.isActive = function() {
  return ['confirmed', 'checked-in'].includes(this.status);
};

// Method to calculate total guests
reservationSchema.methods.getTotalGuests = function() {
  return this.guests.adults + this.guests.children;
};

module.exports = mongoose.model('Reservation', reservationSchema);