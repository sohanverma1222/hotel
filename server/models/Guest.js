const mongoose = require('mongoose');

const guestSchema = new mongoose.Schema({
  firstName: {
    type: String,
    required: [true, 'First name is required'],
    trim: true,
    maxlength: [50, 'First name cannot exceed 50 characters']
  },
  lastName: {
    type: String,
    required: [true, 'Last name is required'],
    trim: true,
    maxlength: [50, 'Last name cannot exceed 50 characters']
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    trim: true,
    lowercase: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
  },
  phone: {
    type: String,
    required: [true, 'Phone number is required'],
    trim: true,
    maxlength: [20, 'Phone number cannot exceed 20 characters']
  },
  address: {
    street: String,
    city: String,
    state: String,
    country: String,
    zipCode: String
  },
  dateOfBirth: {
    type: Date
  },
  nationality: {
    type: String,
    trim: true
  },
  idNumber: {
    type: String,
    trim: true
  },
  preferences: {
    roomType: String,
    bedType: String,
    smokingPreference: {
      type: String,
      enum: ['smoking', 'non-smoking'],
      default: 'non-smoking'
    },
    specialRequests: String
  },
  loyaltyPoints: {
    type: Number,
    default: 0
  },
  membershipLevel: {
    type: String,
    enum: ['bronze', 'silver', 'gold', 'platinum'],
    default: 'bronze'
  },
  totalStays: {
    type: Number,
    default: 0
  },
  totalSpent: {
    type: Number,
    default: 0
  },
  isVip: {
    type: Boolean,
    default: false
  },
  isBlacklisted: {
    type: Boolean,
    default: false
  },
  emergencyContact: {
    name: String,
    relationship: String,
    phone: String
  },
  notes: String
}, {
  timestamps: true
});

// Indexes for better query performance
guestSchema.index({ email: 1 });
guestSchema.index({ firstName: 1, lastName: 1 });
guestSchema.index({ phone: 1 });

// Virtual for full name
guestSchema.virtual('fullName').get(function() {
  return `${this.firstName} ${this.lastName}`;
});

// Method to calculate loyalty level
guestSchema.methods.updateLoyaltyLevel = function() {
  if (this.totalSpent >= 10000) {
    this.membershipLevel = 'platinum';
  } else if (this.totalSpent >= 5000) {
    this.membershipLevel = 'gold';
  } else if (this.totalSpent >= 2000) {
    this.membershipLevel = 'silver';
  } else {
    this.membershipLevel = 'bronze';
  }
};

module.exports = mongoose.model('Guest', guestSchema);