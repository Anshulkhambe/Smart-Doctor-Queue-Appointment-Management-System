const Notification = require('../models/Notification');

/**
 * Retrieves all notifications for the authenticated user, sorted newest first.
 * Returns up to 50 items.
 */
const getNotifications = async (req, res, next) => {
  try {
    const notifications = await Notification.findAll({
      where: { userId: req.user.id },
      order: [['createdAt', 'DESC']],
      limit: 50
    });

    res.status(200).json({
      success: true,
      count: notifications.length,
      notifications
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Marks all notifications for the authenticated user as read.
 */
const markAllAsRead = async (req, res, next) => {
  try {
    await Notification.update(
      { read: true },
      { where: { userId: req.user.id, read: false } }
    );

    res.status(200).json({
      success: true,
      message: 'All notifications marked as read successfully'
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Marks a single notification as read by its ID.
 */
const markAsRead = async (req, res, next) => {
  try {
    const notification = await Notification.findOne({
      where: { id: req.params.id, userId: req.user.id }
    });

    if (!notification) {
      res.status(404);
      return next(new Error('Notification not found or access denied'));
    }

    notification.read = true;
    await notification.save();

    res.status(200).json({
      success: true,
      notification
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getNotifications,
  markAllAsRead,
  markAsRead
};
