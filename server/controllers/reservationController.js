const Reservation = require('../models/Reservation');
const Room = require('../models/Room');
const Guest = require('../models/Guest');

// Get all reservations with filtering and pagination
exports.getAllReservations = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    // Build filter object
    let filter = {};
    
    if (req.query.status) {
      filter.status = req.query.status;
    }
    
    if (req.query.guestName) {
      filter.guestName = new RegExp(req.query.guestName, 'i');
    }
    
    if (req.query.roomNumber) {
      filter.roomNumber = req.query.roomNumber;
    }

    // Date range filtering
    if (req.query.checkInStart && req.query.checkInEnd) {
      filter.checkIn = {
        $gte: new Date(req.query.checkInStart),
        $lte: new Date(req.query.checkInEnd)
      };
    } else if (req.query.checkInStart) {
      filter.checkIn = { $gte: new Date(req.query.checkInStart) };
    }

    if (req.query.checkOutStart && req.query.checkOutEnd) {
      filter.checkOut = {
        $gte: new Date(req.query.checkOutStart),
        $lte: new Date(req.query.checkOutEnd)
      };
    }

    const reservations = await Reservation.find(filter)
      .sort({ checkIn: -1 })
      .limit(limit)
      .skip(skip)
      .populate('guestId', 'name email phone')
      .populate('roomId', 'roomNumber roomType basePrice');

    const total = await Reservation.countDocuments(filter);

    res.json({
      reservations,
      currentPage: page,
      totalPages: Math.ceil(total / limit),
      totalReservations: total,
      hasNextPage: page < Math.ceil(total / limit),
      hasPrevPage: page > 1
    });
  } catch (error) {
    console.error('Error fetching reservations:', error);
    res.status(500).json({ message: 'Server error while fetching reservations' });
  }
};

// Get single reservation by ID
exports.getReservationById = async (req, res) => {
  try {
    const reservation = await Reservation.findById(req.params.id)
      .populate('guestId', 'name email phone address nationality')
      .populate('roomId', 'roomNumber roomType basePrice amenities');
    
    if (!reservation) {
      return res.status(404).json({ message: 'Reservation not found' });
    }

    res.json(reservation);
  } catch (error) {
    console.error('Error fetching reservation:', error);
    if (error.name === 'CastError') {
      return res.status(400).json({ message: 'Invalid reservation ID format' });
    }
    res.status(500).json({ message: 'Server error while fetching reservation' });
  }
};

// Create new reservation
exports.createReservation = async (req, res) => {
  try {
    const {
      guestId,
      roomId,
      guestName,
      guestEmail,
      guestPhone,
      roomNumber,
      checkIn,
      checkOut,
      adults,
      children,
      totalAmount,
      advancePayment,
      specialRequests,
      source
    } = req.body;

    // Validate dates
    const checkInDate = new Date(checkIn);
    const checkOutDate = new Date(checkOut);

    if (checkInDate >= checkOutDate) {
      return res.status(400).json({ 
        message: 'Check-out date must be after check-in date' 
      });
    }

    if (checkInDate < new Date()) {
      return res.status(400).json({ 
        message: 'Check-in date cannot be in the past' 
      });
    }

    // Check room availability
    const room = await Room.findById(roomId);
    if (!room) {
      return res.status(404).json({ message: 'Room not found' });
    }

    // Check for overlapping reservations
    const overlappingReservation = await Reservation.findOne({
      roomId,
      status: { $in: ['confirmed', 'checked-in'] },
      $or: [
        { checkIn: { $lt: checkOutDate, $gte: checkInDate } },
        { checkOut: { $gt: checkInDate, $lte: checkOutDate } },
        { checkIn: { $lte: checkInDate }, checkOut: { $gte: checkOutDate } }
      ]
    });

    if (overlappingReservation) {
      return res.status(400).json({ 
        message: 'Room is not available for the selected dates' 
      });
    }

    // Calculate nights and validate total amount
    const nights = Math.ceil((checkOutDate - checkInDate) / (1000 * 60 * 60 * 24));
    const calculatedAmount = nights * room.basePrice;

    const reservation = new Reservation({
      guestId,
      roomId,
      guestName,
      guestEmail,
      guestPhone,
      roomNumber,
      checkIn: checkInDate,
      checkOut: checkOutDate,
      nights,
      adults: adults || 1,
      children: children || 0,
      totalAmount: totalAmount || calculatedAmount,
      advancePayment: advancePayment || 0,
      specialRequests,
      source: source || 'direct',
      paymentStatus: advancePayment >= totalAmount ? 'paid' : 'partial'
    });

    const savedReservation = await reservation.save();

    // Update room status if check-in is today
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const checkInDay = new Date(checkInDate);
    checkInDay.setHours(0, 0, 0, 0);

    if (checkInDay.getTime() === today.getTime()) {
      await Room.findByIdAndUpdate(roomId, { 
        status: 'occupied',
        currentReservation: savedReservation._id 
      });
    }

    const populatedReservation = await Reservation.findById(savedReservation._id)
      .populate('guestId', 'name email phone')
      .populate('roomId', 'roomNumber roomType basePrice');

    res.status(201).json(populatedReservation);
  } catch (error) {
    console.error('Error creating reservation:', error);
    if (error.name === 'ValidationError') {
      const validationErrors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({ 
        message: 'Validation failed', 
        errors: validationErrors 
      });
    }
    res.status(500).json({ message: 'Server error while creating reservation' });
  }
};

// Update reservation
exports.updateReservation = async (req, res) => {
  try {
    const updateData = { ...req.body };
    delete updateData.createdAt; // Prevent updating creation timestamp

    // If updating dates, validate them
    if (updateData.checkIn && updateData.checkOut) {
      const checkInDate = new Date(updateData.checkIn);
      const checkOutDate = new Date(updateData.checkOut);

      if (checkInDate >= checkOutDate) {
        return res.status(400).json({ 
          message: 'Check-out date must be after check-in date' 
        });
      }

      // Recalculate nights
      updateData.nights = Math.ceil((checkOutDate - checkInDate) / (1000 * 60 * 60 * 24));
    }

    const reservation = await Reservation.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    ).populate('guestId', 'name email phone')
     .populate('roomId', 'roomNumber roomType basePrice');

    if (!reservation) {
      return res.status(404).json({ message: 'Reservation not found' });
    }

    res.json(reservation);
  } catch (error) {
    console.error('Error updating reservation:', error);
    if (error.name === 'ValidationError') {
      const validationErrors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({ 
        message: 'Validation failed', 
        errors: validationErrors 
      });
    }
    if (error.name === 'CastError') {
      return res.status(400).json({ message: 'Invalid reservation ID format' });
    }
    res.status(500).json({ message: 'Server error while updating reservation' });
  }
};

// Cancel reservation
exports.cancelReservation = async (req, res) => {
  try {
    const reservation = await Reservation.findById(req.params.id);
    
    if (!reservation) {
      return res.status(404).json({ message: 'Reservation not found' });
    }

    if (reservation.status === 'cancelled') {
      return res.status(400).json({ message: 'Reservation is already cancelled' });
    }

    if (reservation.status === 'checked-out') {
      return res.status(400).json({ message: 'Cannot cancel completed reservation' });
    }

    reservation.status = 'cancelled';
    reservation.cancelledAt = new Date();
    
    await reservation.save();

    // Update room status if it was occupied by this reservation
    await Room.updateOne(
      { currentReservation: reservation._id },
      { 
        $unset: { currentReservation: 1 },
        status: 'available'
      }
    );

    res.json({ message: 'Reservation cancelled successfully', reservation });
  } catch (error) {
    console.error('Error cancelling reservation:', error);
    if (error.name === 'CastError') {
      return res.status(400).json({ message: 'Invalid reservation ID format' });
    }
    res.status(500).json({ message: 'Server error while cancelling reservation' });
  }
};

// Check-in guest
exports.checkIn = async (req, res) => {
  try {
    const reservation = await Reservation.findById(req.params.id);
    
    if (!reservation) {
      return res.status(404).json({ message: 'Reservation not found' });
    }

    if (reservation.status !== 'confirmed') {
      return res.status(400).json({ 
        message: 'Only confirmed reservations can be checked in' 
      });
    }

    const today = new Date();
    const checkInDate = new Date(reservation.checkIn);
    
    // Allow early check-in within 1 day
    if (checkInDate.getTime() - today.getTime() > 24 * 60 * 60 * 1000) {
      return res.status(400).json({ 
        message: 'Check-in date is too far in the future' 
      });
    }

    reservation.status = 'checked-in';
    reservation.actualCheckIn = today;
    
    await reservation.save();

    // Update room status
    await Room.findByIdAndUpdate(reservation.roomId, {
      status: 'occupied',
      currentReservation: reservation._id
    });

    const updatedReservation = await Reservation.findById(reservation._id)
      .populate('guestId', 'name email phone')
      .populate('roomId', 'roomNumber roomType');

    res.json({ 
      message: 'Guest checked in successfully', 
      reservation: updatedReservation 
    });
  } catch (error) {
    console.error('Error during check-in:', error);
    if (error.name === 'CastError') {
      return res.status(400).json({ message: 'Invalid reservation ID format' });
    }
    res.status(500).json({ message: 'Server error during check-in' });
  }
};

// Check-out guest
exports.checkOut = async (req, res) => {
  try {
    const { finalAmount, additionalCharges } = req.body;
    const reservation = await Reservation.findById(req.params.id);
    
    if (!reservation) {
      return res.status(404).json({ message: 'Reservation not found' });
    }

    if (reservation.status !== 'checked-in') {
      return res.status(400).json({ 
        message: 'Only checked-in guests can be checked out' 
      });
    }

    const today = new Date();
    
    reservation.status = 'checked-out';
    reservation.actualCheckOut = today;
    
    if (finalAmount) {
      reservation.totalAmount = finalAmount;
    }
    
    if (additionalCharges) {
      reservation.additionalCharges = additionalCharges;
    }

    reservation.paymentStatus = 'paid';
    
    await reservation.save();

    // Update room status
    await Room.findByIdAndUpdate(reservation.roomId, {
      status: 'cleaning',
      $unset: { currentReservation: 1 }
    });

    const updatedReservation = await Reservation.findById(reservation._id)
      .populate('guestId', 'name email phone')
      .populate('roomId', 'roomNumber roomType');

    res.json({ 
      message: 'Guest checked out successfully', 
      reservation: updatedReservation 
    });
  } catch (error) {
    console.error('Error during check-out:', error);
    if (error.name === 'CastError') {
      return res.status(400).json({ message: 'Invalid reservation ID format' });
    }
    res.status(500).json({ message: 'Server error during check-out' });
  }
};

// Add payment to reservation
exports.addPayment = async (req, res) => {
  try {
    const { amount, method, notes } = req.body;
    
    if (!amount || amount <= 0) {
      return res.status(400).json({ message: 'Valid payment amount is required' });
    }

    const reservation = await Reservation.findById(req.params.id);
    
    if (!reservation) {
      return res.status(404).json({ message: 'Reservation not found' });
    }

    const payment = {
      amount: parseFloat(amount),
      method: method || 'cash',
      paidAt: new Date(),
      notes
    };

    reservation.payments.push(payment);
    
    // Update payment status
    const totalPaid = reservation.payments.reduce((sum, p) => sum + p.amount, 0);
    const totalAmount = reservation.totalAmount + (reservation.additionalCharges || 0);
    
    if (totalPaid >= totalAmount) {
      reservation.paymentStatus = 'paid';
    } else if (totalPaid > 0) {
      reservation.paymentStatus = 'partial';
    }

    await reservation.save();

    res.json({ 
      message: 'Payment added successfully', 
      reservation,
      totalPaid,
      remainingAmount: Math.max(0, totalAmount - totalPaid)
    });
  } catch (error) {
    console.error('Error adding payment:', error);
    if (error.name === 'CastError') {
      return res.status(400).json({ message: 'Invalid reservation ID format' });
    }
    res.status(500).json({ message: 'Server error while adding payment' });
  }
};

// Get reservation statistics
exports.getReservationStats = async (req, res) => {
  try {
    const today = new Date();
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);

    const totalReservations = await Reservation.countDocuments();
    const confirmedReservations = await Reservation.countDocuments({ status: 'confirmed' });
    const checkedInReservations = await Reservation.countDocuments({ status: 'checked-in' });
    const cancelledReservations = await Reservation.countDocuments({ status: 'cancelled' });

    // Monthly stats
    const monthlyReservations = await Reservation.countDocuments({
      createdAt: { $gte: startOfMonth, $lte: endOfMonth }
    });

    const monthlyRevenue = await Reservation.aggregate([
      {
        $match: {
          createdAt: { $gte: startOfMonth, $lte: endOfMonth },
          paymentStatus: 'paid'
        }
      },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: '$totalAmount' },
          totalAdditionalCharges: { $sum: '$additionalCharges' }
        }
      }
    ]);

    // Check-ins today
    const todayStart = new Date(today);
    todayStart.setHours(0, 0, 0, 0);
    const todayEnd = new Date(today);
    todayEnd.setHours(23, 59, 59, 999);

    const checkInsToday = await Reservation.countDocuments({
      checkIn: { $gte: todayStart, $lte: todayEnd },
      status: { $in: ['confirmed', 'checked-in'] }
    });

    const checkOutsToday = await Reservation.countDocuments({
      checkOut: { $gte: todayStart, $lte: todayEnd },
      status: 'checked-in'
    });

    // Average stay duration
    const avgStayDuration = await Reservation.aggregate([
      { $match: { status: 'checked-out' } },
      { $group: { _id: null, avgNights: { $avg: '$nights' } } }
    ]);

    // Revenue by source
    const revenueBySource = await Reservation.aggregate([
      { $match: { paymentStatus: 'paid' } },
      { 
        $group: { 
          _id: '$source', 
          totalRevenue: { $sum: '$totalAmount' },
          count: { $sum: 1 }
        } 
      }
    ]);

    const revenue = monthlyRevenue[0] || { totalRevenue: 0, totalAdditionalCharges: 0 };

    res.json({
      totalReservations,
      confirmedReservations,
      checkedInReservations,
      cancelledReservations,
      monthlyReservations,
      monthlyRevenue: revenue.totalRevenue + revenue.totalAdditionalCharges,
      checkInsToday,
      checkOutsToday,
      averageStayDuration: avgStayDuration[0]?.avgNights || 0,
      revenueBySource
    });
  } catch (error) {
    console.error('Error fetching reservation statistics:', error);
    res.status(500).json({ message: 'Server error while fetching reservation statistics' });
  }
};