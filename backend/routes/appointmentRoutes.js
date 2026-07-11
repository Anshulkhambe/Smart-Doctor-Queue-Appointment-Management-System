const express = require('express');
const { bookAppointment, getAppointments, updateAppointment, cancelAppointment } = require('../controllers/appointmentController');
const { protect, restrictTo } = require('../middlewares/authMiddleware');

const router = express.Router();

// Route: Book a new appointment (Patient only)
router.post('/', protect, restrictTo('Patient'), bookAppointment);

// Route: Get appointments (filters automatically based on patient, doctor, or admin roles)
router.get('/', protect, getAppointments);

// Route: Update an appointment status or detail
router.put('/:id', protect, updateAppointment);

// Route: Cancel an appointment (soft-delete status change)
router.delete('/:id', protect, cancelAppointment);

module.exports = router;
