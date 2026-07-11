const express = require('express');
const { getPatientProfile, updatePatientProfile } = require('../controllers/patientController');
const { protect, restrictTo } = require('../middlewares/authMiddleware');

const router = express.Router();

// Route: Get authenticated patient's profile details
router.get('/profile', protect, restrictTo('Patient'), getPatientProfile);

// Route: Update authenticated patient's profile details
router.put('/profile', protect, restrictTo('Patient'), updatePatientProfile);

module.exports = router;
