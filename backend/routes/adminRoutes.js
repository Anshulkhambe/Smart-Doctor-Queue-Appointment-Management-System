const express = require('express');
const { getAdminDashboardStats, getAllPatients, deleteDoctor, deletePatient, deleteUser, toggleDoctorAvailability } = require('../controllers/adminController');
const { protect, restrictTo } = require('../middlewares/authMiddleware');

const router = express.Router();

// All routes here are restricted to Admin role
router.use(protect, restrictTo('Admin'));

// Route: Get dashboard metrics & trends analytics
router.get('/dashboard', getAdminDashboardStats);

// Route: Get list of all patients
router.get('/patients', getAllPatients);

// Route: Delete doctor profile & account (by Doctor ID)
router.delete('/doctors/:id', deleteDoctor);

// Route: Delete patient profile & account (by Patient ID)
router.delete('/patients/:id', deletePatient);

// Route: Delete user and associated doctor/patient profile (by User ID)
router.delete('/users/:id', deleteUser);

// Route: Toggle doctor availability (by Doctor ID)
router.put('/doctors/:id/availability', toggleDoctorAvailability);

module.exports = router;
