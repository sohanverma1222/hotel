const Room = require('../models/Room');

// Get all rooms with filtering and pagination
exports.getAllRooms = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    // Build filter object
    let filter = {};
    
    if (req.query.roomType) {
      filter.roomType = req.query.roomType;
    }
    
    if (req.query.status) {
      filter.status = req.query.status;
    }
    
    if (req.query.floor) {
      filter.floor = parseInt(req.query.floor);
    }
    
    if (req.query.minPrice) {
      filter.basePrice = { ...filter.basePrice, $gte: parseFloat(req.query.minPrice) };
    }
    
    if (req.query.maxPrice) {
      filter.basePrice = { ...filter.basePrice, $lte: parseFloat(req.query.maxPrice) };
    }

    // Search in room number or description
    if (req.query.search) {
      filter.$or = [
        { roomNumber: new RegExp(req.query.search, 'i') },
        { description: new RegExp(req.query.search, 'i') }
      ];
    }

    const rooms = await Room.find(filter)
      .sort({ roomNumber: 1 })
      .limit(limit)
      .skip(skip)
      .populate('currentReservation', 'guestName checkIn checkOut');

    const total = await Room.countDocuments(filter);

    res.json({
      rooms,
      currentPage: page,
      totalPages: Math.ceil(total / limit),
      totalRooms: total,
      hasNextPage: page < Math.ceil(total / limit),
      hasPrevPage: page > 1
    });
  } catch (error) {
    console.error('Error fetching rooms:', error);
    res.status(500).json({ message: 'Server error while fetching rooms' });
  }
};

// Get single room by ID
exports.getRoomById = async (req, res) => {
  try {
    const room = await Room.findById(req.params.id)
      .populate('currentReservation', 'guestName checkIn checkOut status totalAmount')
      .populate('maintenanceHistory.reportedBy', 'name');
    
    if (!room) {
      return res.status(404).json({ message: 'Room not found' });
    }

    res.json(room);
  } catch (error) {
    console.error('Error fetching room:', error);
    if (error.name === 'CastError') {
      return res.status(400).json({ message: 'Invalid room ID format' });
    }
    res.status(500).json({ message: 'Server error while fetching room' });
  }
};

// Create new room
exports.createRoom = async (req, res) => {
  try {
    const {
      roomNumber,
      roomType,
      floor,
      basePrice,
      capacity,
      amenities,
      description,
      images
    } = req.body;

    // Check if room number already exists
    const existingRoom = await Room.findOne({ roomNumber });
    if (existingRoom) {
      return res.status(400).json({ message: 'Room number already exists' });
    }

    const room = new Room({
      roomNumber,
      roomType,
      floor,
      basePrice,
      capacity,
      amenities: amenities || [],
      description,
      images: images || []
    });

    const savedRoom = await room.save();
    res.status(201).json(savedRoom);
  } catch (error) {
    console.error('Error creating room:', error);
    if (error.name === 'ValidationError') {
      const validationErrors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({ 
        message: 'Validation failed', 
        errors: validationErrors 
      });
    }
    res.status(500).json({ message: 'Server error while creating room' });
  }
};

// Update room
exports.updateRoom = async (req, res) => {
  try {
    const updateData = { ...req.body };
    delete updateData.createdAt; // Prevent updating creation timestamp

    const room = await Room.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    );

    if (!room) {
      return res.status(404).json({ message: 'Room not found' });
    }

    res.json(room);
  } catch (error) {
    console.error('Error updating room:', error);
    if (error.name === 'ValidationError') {
      const validationErrors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({ 
        message: 'Validation failed', 
        errors: validationErrors 
      });
    }
    if (error.name === 'CastError') {
      return res.status(400).json({ message: 'Invalid room ID format' });
    }
    res.status(500).json({ message: 'Server error while updating room' });
  }
};

// Delete room
exports.deleteRoom = async (req, res) => {
  try {
    const room = await Room.findById(req.params.id);
    
    if (!room) {
      return res.status(404).json({ message: 'Room not found' });
    }

    // Check if room has active reservations
    if (room.status === 'occupied' || room.currentReservation) {
      return res.status(400).json({ 
        message: 'Cannot delete room with active reservations' 
      });
    }

    await Room.findByIdAndDelete(req.params.id);
    res.json({ message: 'Room deleted successfully' });
  } catch (error) {
    console.error('Error deleting room:', error);
    if (error.name === 'CastError') {
      return res.status(400).json({ message: 'Invalid room ID format' });
    }
    res.status(500).json({ message: 'Server error while deleting room' });
  }
};

// Update room status
exports.updateRoomStatus = async (req, res) => {
  try {
    const { status } = req.body;
    
    if (!['available', 'occupied', 'maintenance', 'cleaning'].includes(status)) {
      return res.status(400).json({ 
        message: 'Invalid status. Must be: available, occupied, maintenance, or cleaning' 
      });
    }

    const room = await Room.findByIdAndUpdate(
      req.params.id,
      { status, lastStatusUpdate: new Date() },
      { new: true, runValidators: true }
    );

    if (!room) {
      return res.status(404).json({ message: 'Room not found' });
    }

    res.json(room);
  } catch (error) {
    console.error('Error updating room status:', error);
    if (error.name === 'CastError') {
      return res.status(400).json({ message: 'Invalid room ID format' });
    }
    res.status(500).json({ message: 'Server error while updating room status' });
  }
};

// Add maintenance record
exports.addMaintenanceRecord = async (req, res) => {
  try {
    const { issue, reportedBy, priority = 'medium', notes } = req.body;

    const room = await Room.findById(req.params.id);
    if (!room) {
      return res.status(404).json({ message: 'Room not found' });
    }

    const maintenanceRecord = {
      issue,
      reportedBy,
      reportedAt: new Date(),
      priority,
      status: 'reported',
      notes
    };

    room.maintenanceHistory.push(maintenanceRecord);
    
    // Update room status if high priority issue
    if (priority === 'high') {
      room.status = 'maintenance';
      room.lastStatusUpdate = new Date();
    }

    await room.save();
    res.status(201).json({ message: 'Maintenance record added', room });
  } catch (error) {
    console.error('Error adding maintenance record:', error);
    if (error.name === 'CastError') {
      return res.status(400).json({ message: 'Invalid room ID format' });
    }
    res.status(500).json({ message: 'Server error while adding maintenance record' });
  }
};

// Get room statistics
exports.getRoomStats = async (req, res) => {
  try {
    const totalRooms = await Room.countDocuments();
    const availableRooms = await Room.countDocuments({ status: 'available' });
    const occupiedRooms = await Room.countDocuments({ status: 'occupied' });
    const maintenanceRooms = await Room.countDocuments({ status: 'maintenance' });
    const cleaningRooms = await Room.countDocuments({ status: 'cleaning' });

    // Room type distribution
    const roomTypes = await Room.aggregate([
      { $group: { _id: '$roomType', count: { $sum: 1 } } }
    ]);

    // Floor distribution
    const floorDistribution = await Room.aggregate([
      { $group: { _id: '$floor', count: { $sum: 1 } } },
      { $sort: { _id: 1 } }
    ]);

    // Average price by room type
    const avgPriceByType = await Room.aggregate([
      { 
        $group: { 
          _id: '$roomType', 
          averagePrice: { $avg: '$basePrice' },
          count: { $sum: 1 }
        } 
      }
    ]);

    const occupancyRate = totalRooms > 0 ? ((occupiedRooms / totalRooms) * 100).toFixed(2) : 0;

    res.json({
      totalRooms,
      availableRooms,
      occupiedRooms,
      maintenanceRooms,
      cleaningRooms,
      occupancyRate: parseFloat(occupancyRate),
      roomTypes,
      floorDistribution,
      avgPriceByType
    });
  } catch (error) {
    console.error('Error fetching room statistics:', error);
    res.status(500).json({ message: 'Server error while fetching room statistics' });
  }
};

// Get available rooms for date range
exports.getAvailableRooms = async (req, res) => {
  try {
    const { checkIn, checkOut, roomType, capacity } = req.query;

    if (!checkIn || !checkOut) {
      return res.status(400).json({ 
        message: 'Check-in and check-out dates are required' 
      });
    }

    const checkInDate = new Date(checkIn);
    const checkOutDate = new Date(checkOut);

    if (checkInDate >= checkOutDate) {
      return res.status(400).json({ 
        message: 'Check-out date must be after check-in date' 
      });
    }

    // Build filter
    let filter = { status: 'available' };
    
    if (roomType) {
      filter.roomType = roomType;
    }
    
    if (capacity) {
      filter.capacity = { $gte: parseInt(capacity) };
    }

    // Find rooms that are not occupied during the requested period
    // This would require integration with reservation system
    const availableRooms = await Room.find(filter).sort({ roomNumber: 1 });

    res.json({
      availableRooms,
      checkIn: checkInDate,
      checkOut: checkOutDate,
      totalAvailable: availableRooms.length
    });
  } catch (error) {
    console.error('Error fetching available rooms:', error);
    res.status(500).json({ message: 'Server error while fetching available rooms' });
  }
};