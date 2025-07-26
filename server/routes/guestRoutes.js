const express = require('express');
const router = express.Router();
const guestController = require('../controllers/guestController');

// GET /api/guests - Get all guests with pagination and search
router.get('/', guestController.getAllGuests);

// GET /api/guests/stats - Get guest statistics
router.get('/stats', guestController.getGuestStats);

// GET /api/guests/:id - Get single guest by ID
router.get('/:id', guestController.getGuest);

// POST /api/guests - Create new guest
router.post('/', guestController.createGuest);

// PUT /api/guests/:id - Update guest
router.put('/:id', guestController.updateGuest);

// DELETE /api/guests/:id - Delete guest
router.delete('/:id', guestController.deleteGuest);

module.exports = router;