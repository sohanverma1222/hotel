const express = require('express');
const router = express.Router();
const roomController = require('../controllers/roomController');

// GET /api/rooms - Get all rooms with filtering and pagination
router.get('/', roomController.getAllRooms);

// GET /api/rooms/stats - Get room statistics
router.get('/stats', roomController.getRoomStats);

// GET /api/rooms/available - Get available rooms for date range
router.get('/available', roomController.getAvailableRooms);

// GET /api/rooms/:id - Get single room by ID
router.get('/:id', roomController.getRoomById);

// POST /api/rooms - Create new room
router.post('/', roomController.createRoom);

// PUT /api/rooms/:id - Update room
router.put('/:id', roomController.updateRoom);

// DELETE /api/rooms/:id - Delete room
router.delete('/:id', roomController.deleteRoom);

// PATCH /api/rooms/:id/status - Update room status
router.patch('/:id/status', roomController.updateRoomStatus);

// POST /api/rooms/:id/maintenance - Add maintenance record
router.post('/:id/maintenance', roomController.addMaintenanceRecord);

module.exports = router;