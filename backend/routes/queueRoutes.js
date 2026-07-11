const express = require('express');
const { getQueueStatus, updateQueue } = require('../controllers/queueController');
const { protect, restrictTo } = require('../middlewares/authMiddleware');

const router = express.Router();

// Route: Get queue details (public, so patients/guests can check live status)
router.get('/:doctorId', getQueueStatus);

// Route: Update doctor queue (restricted to Doctor or Admin roles)
router.put('/update', protect, restrictTo('Doctor', 'Admin'), updateQueue);

module.exports = router;
