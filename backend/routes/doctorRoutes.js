const express = require('express');
const { getDoctors, getDoctorById, updateDoctorProfile } = require('../controllers/doctorController');
const { protect, restrictTo } = require('../middlewares/authMiddleware');
const upload = require('../middlewares/uploadMiddleware');

const router = express.Router();

// Route: Get all doctors (supports query filters for searching/filtering)
router.get('/', getDoctors);

// Route: Get detailed doctor profile by ID
router.get('/:id', getDoctorById);

// Route: Update doctor profile (requires JWT authentication, restricted to Doctor, supports image upload)
router.put('/profile', protect, restrictTo('Doctor'), upload.single('image'), updateDoctorProfile);

module.exports = router;
