const express = require('express');
const { getNotifications, markAllAsRead, markAsRead } = require('../controllers/notificationController');
const { protect } = require('../middlewares/authMiddleware');

const router = express.Router();

// Route: Get user's notifications (newest first)
router.get('/', protect, getNotifications);

// Route: Mark all notifications as read
router.put('/read-all', protect, markAllAsRead);

// Route: Mark a specific notification as read by ID
router.put('/:id/read', protect, markAsRead);

module.exports = router;
