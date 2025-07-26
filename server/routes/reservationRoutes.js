const express = require('express');
const router = express.Router();
const reservationController = require('../controllers/reservationController');

// GET /api/reservations - Get all reservations with filtering and pagination
router.get('/', reservationController.getAllReservations);

// GET /api/reservations/stats - Get reservation statistics
router.get('/stats', reservationController.getReservationStats);

// GET /api/reservations/:id - Get single reservation by ID
router.get('/:id', reservationController.getReservationById);

// POST /api/reservations - Create new reservation
router.post('/', reservationController.createReservation);

// PUT /api/reservations/:id - Update reservation
router.put('/:id', reservationController.updateReservation);

// PATCH /api/reservations/:id/cancel - Cancel reservation
router.patch('/:id/cancel', reservationController.cancelReservation);

// PATCH /api/reservations/:id/checkin - Check-in guest
router.patch('/:id/checkin', reservationController.checkIn);

// PATCH /api/reservations/:id/checkout - Check-out guest
router.patch('/:id/checkout', reservationController.checkOut);

// POST /api/reservations/:id/payments - Add payment to reservation
router.post('/:id/payments', reservationController.addPayment);

module.exports = router;