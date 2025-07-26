const mongoose = require('mongoose');

const roomSchema = new mongoose.Schema({
  roomNumber: {
    type: String,
    required: [true, 'Room number is required'],
    unique: true,
    trim: true
  },
  type: {
    type: String,
    required: [true, 'Room type is required'],
    enum: ['Standard', 'Deluxe', 'Suite', 'Presidential'],
    default: 'Standard'
  },
  category: {
    type: String,
    enum: ['Economy', 'Business', 'Luxury'],
    default: 'Economy'
  },
  floor: {
    type: Number,
    required: [true, 'Floor number is required'],
    min: [1, 'Floor must be at least 1']
  },
  capacity: {
    adults: {
      type: Number,
      required: true,
      min: [1, 'Adult capacity must be at least 1']
    },
    children: {
      type: Number,
      default: 0,
      min: 0
    }
  },
  bedConfiguration: {
    type: String,
    enum: ['Single', 'Double', 'Twin', 'Queen', 'King', 'Sofa Bed'],
    required: true
  },
  size: {
    type: Number, // in square feet
    required: [true, 'Room size is required']
  },
  amenities: [{
    type: String,
    enum: [
      'Air Conditioning', 'WiFi', 'TV', 'Mini Bar', 'Safe', 'Balcony', 
      'Sea View', 'City View', 'Garden View', 'Jacuzzi', 'Kitchen', 
      'Work Desk', 'Coffee Maker', 'Hair Dryer', 'Iron', 'Telephone',
      'Room Service', 'Daily Housekeeping'
    ]
  }],
  pricing: {
    basePrice: {
      type: Number,
      required: [true, 'Base price is required'],
      min: [0, 'Price cannot be negative']
    },
    weekendPrice: {
      type: Number,
      min: [0, 'Weekend price cannot be negative']
    },
    holidayPrice: {
      type: Number,
      min: [0, 'Holiday price cannot be negative']
    },
    currency: {
      type: String,
      default: 'USD'
    }
  },
  status: {
    type: String,
    enum: ['available', 'occupied', 'maintenance', 'cleaning', 'out-of-order'],
    default: 'available'
  },
  availability: {
    isActive: {
      type: Boolean,
      default: true
    },
    maintenanceSchedule: [{
      startDate: Date,
      endDate: Date,
      reason: String,
      priority: {
        type: String,
        enum: ['low', 'medium', 'high', 'urgent'],
        default: 'medium'
      }
    }]
  },
  housekeeping: {
    lastCleaned: Date,
    cleaningStatus: {
      type: String,
      enum: ['clean', 'dirty', 'cleaning', 'inspected'],
      default: 'clean'
    },
    cleaningNotes: String
  },
  features: {
    smokingAllowed: {
      type: Boolean,
      default: false
    },
    petFriendly: {
      type: Boolean,
      default: false
    },
    accessibilityFeatures: [{
      type: String,
      enum: ['Wheelchair Accessible', 'Visual Aids', 'Hearing Aids', 'Grab Bars']
    }]
  },
  images: [{
    url: String,
    alt: String,
    isPrimary: {
      type: Boolean,
      default: false
    }
  }],
  notes: String,
  lastOccupied: Date,
  totalBookings: {
    type: Number,
    default: 0
  },
  revenue: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

// Indexes
roomSchema.index({ roomNumber: 1 });
roomSchema.index({ type: 1, status: 1 });
roomSchema.index({ floor: 1 });
roomSchema.index({ status: 1 });

// Virtual for room display name
roomSchema.virtual('displayName').get(function() {
  return `Room ${this.roomNumber} (${this.type})`;
});

// Method to check availability
roomSchema.methods.isAvailableOnDate = function(checkDate) {
  if (!this.availability.isActive || this.status === 'out-of-order') {
    return false;
  }
  
  // Check maintenance schedule
  const maintenanceConflict = this.availability.maintenanceSchedule.some(schedule => {
    const start = new Date(schedule.startDate);
    const end = new Date(schedule.endDate);
    return checkDate >= start && checkDate <= end;
  });
  
  return !maintenanceConflict;
};

// Method to calculate current price
roomSchema.methods.getCurrentPrice = function(date = new Date()) {
  const dayOfWeek = date.getDay();
  const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
  
  if (isWeekend && this.pricing.weekendPrice) {
    return this.pricing.weekendPrice;
  }
  
  return this.pricing.basePrice;
};

module.exports = mongoose.model('Room', roomSchema);