const Guest = require('../models/Guest');
const { validationResult } = require('express-validator');

// @desc    Get all guests
// @route   GET /api/guests
// @access  Public
const getAllGuests = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      search = '',
      sortBy = 'createdAt',
      sortOrder = 'desc',
      membershipLevel = '',
      isVip = ''
    } = req.query;

    // Build search query
    let query = {};
    
    if (search) {
      query.$or = [
        { firstName: { $regex: search, $options: 'i' } },
        { lastName: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } }
      ];
    }

    if (membershipLevel) {
      query.membershipLevel = membershipLevel;
    }

    if (isVip !== '') {
      query.isVip = isVip === 'true';
    }

    // Build sort object
    const sort = {};
    sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

    // Execute query with pagination
    const guests = await Guest.find(query)
      .sort(sort)
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .select('-__v');

    const total = await Guest.countDocuments(query);
    const totalPages = Math.ceil(total / limit);

    // Calculate statistics
    const stats = await Guest.aggregate([
      {
        $group: {
          _id: null,
          totalGuests: { $sum: 1 },
          totalSpent: { $sum: '$totalSpent' },
          averageSpent: { $avg: '$totalSpent' },
          vipGuests: { $sum: { $cond: ['$isVip', 1, 0] } },
          membershipDistribution: {
            $push: '$membershipLevel'
          }
        }
      }
    ]);

    res.status(200).json({
      success: true,
      count: guests.length,
      pagination: {
        currentPage: parseInt(page),
        totalPages,
        totalRecords: total,
        hasNext: page < totalPages,
        hasPrev: page > 1
      },
      statistics: stats[0] || {},
      data: guests
    });

  } catch (error) {
    console.error('Error fetching guests:', error);
    res.status(500).json({
      success: false,
      message: 'Server Error: Unable to fetch guests',
      error: error.message
    });
  }
};

// @desc    Get single guest
// @route   GET /api/guests/:id
// @access  Public
const getGuest = async (req, res) => {
  try {
    const guest = await Guest.findById(req.params.id).select('-__v');

    if (!guest) {
      return res.status(404).json({
        success: false,
        message: 'Guest not found'
      });
    }

    res.status(200).json({
      success: true,
      data: guest
    });

  } catch (error) {
    console.error('Error fetching guest:', error);
    
    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        message: 'Invalid guest ID format'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Server Error: Unable to fetch guest',
      error: error.message
    });
  }
};

// @desc    Create new guest
// @route   POST /api/guests
// @access  Public
const createGuest = async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation Error',
        errors: errors.array()
      });
    }

    // Check if email already exists
    const existingGuest = await Guest.findOne({ email: req.body.email });
    if (existingGuest) {
      return res.status(400).json({
        success: false,
        message: 'Guest with this email already exists'
      });
    }

    // Create new guest
    const guest = new Guest({
      firstName: req.body.firstName,
      lastName: req.body.lastName,
      email: req.body.email,
      phone: req.body.phone,
      address: req.body.address || {},
      dateOfBirth: req.body.dateOfBirth,
      nationality: req.body.nationality,
      idNumber: req.body.idNumber,
      preferences: req.body.preferences || {},
      emergencyContact: req.body.emergencyContact || {},
      notes: req.body.notes
    });

    const savedGuest = await guest.save();

    res.status(201).json({
      success: true,
      message: 'Guest created successfully',
      data: savedGuest
    });

  } catch (error) {
    console.error('Error creating guest:', error);

    // Handle duplicate key error
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'Guest with this email already exists'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Server Error: Unable to create guest',
      error: error.message
    });
  }
};

// @desc    Update guest
// @route   PUT /api/guests/:id
// @access  Public
const updateGuest = async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation Error',
        errors: errors.array()
      });
    }

    // Check if guest exists
    let guest = await Guest.findById(req.params.id);
    if (!guest) {
      return res.status(404).json({
        success: false,
        message: 'Guest not found'
      });
    }

    // Check if email is being changed and if new email already exists
    if (req.body.email && req.body.email !== guest.email) {
      const existingGuest = await Guest.findOne({ email: req.body.email });
      if (existingGuest) {
        return res.status(400).json({
          success: false,
          message: 'Guest with this email already exists'
        });
      }
    }

    // Update guest
    guest = await Guest.findByIdAndUpdate(
      req.params.id,
      {
        $set: {
          firstName: req.body.firstName,
          lastName: req.body.lastName,
          email: req.body.email,
          phone: req.body.phone,
          address: req.body.address,
          dateOfBirth: req.body.dateOfBirth,
          nationality: req.body.nationality,
          idNumber: req.body.idNumber,
          preferences: req.body.preferences,
          emergencyContact: req.body.emergencyContact,
          notes: req.body.notes,
          isVip: req.body.isVip,
          isBlacklisted: req.body.isBlacklisted
        }
      },
      {
        new: true,
        runValidators: true
      }
    );

    res.status(200).json({
      success: true,
      message: 'Guest updated successfully',
      data: guest
    });

  } catch (error) {
    console.error('Error updating guest:', error);

    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        message: 'Invalid guest ID format'
      });
    }

    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'Guest with this email already exists'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Server Error: Unable to update guest',
      error: error.message
    });
  }
};

// @desc    Delete guest
// @route   DELETE /api/guests/:id
// @access  Public
const deleteGuest = async (req, res) => {
  try {
    const guest = await Guest.findById(req.params.id);

    if (!guest) {
      return res.status(404).json({
        success: false,
        message: 'Guest not found'
      });
    }

    await Guest.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: 'Guest deleted successfully',
      data: {}
    });

  } catch (error) {
    console.error('Error deleting guest:', error);

    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        message: 'Invalid guest ID format'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Server Error: Unable to delete guest',
      error: error.message
    });
  }
};

// @desc    Get guest statistics
// @route   GET /api/guests/stats
// @access  Public
const getGuestStats = async (req, res) => {
  try {
    const stats = await Guest.aggregate([
      {
        $group: {
          _id: null,
          totalGuests: { $sum: 1 },
          totalSpent: { $sum: '$totalSpent' },
          averageSpent: { $avg: '$totalSpent' },
          vipGuests: { $sum: { $cond: ['$isVip', 1, 0] } },
          totalStays: { $sum: '$totalStays' },
          averageStays: { $avg: '$totalStays' }
        }
      }
    ]);

    const membershipStats = await Guest.aggregate([
      {
        $group: {
          _id: '$membershipLevel',
          count: { $sum: 1 }
        }
      }
    ]);

    res.status(200).json({
      success: true,
      data: {
        overview: stats[0] || {},
        membership: membershipStats
      }
    });

  } catch (error) {
    console.error('Error fetching guest statistics:', error);
    res.status(500).json({
      success: false,
      message: 'Server Error: Unable to fetch statistics',
      error: error.message
    });
  }
};

module.exports = {
  getAllGuests,
  getGuest,
  createGuest,
  updateGuest,
  deleteGuest,
  getGuestStats
};