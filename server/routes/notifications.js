const express = require('express');
const fetchuser = require('../middleware/fetchuser');
const router = express.Router();
const Notifications = require('../models/Notifications');

// Get all notifications
router.get('/all', fetchuser, async (req, res) => {
  try {
    const notifications = await Notifications.find().sort({ time: -1 }).limit(50);
    res.status(200).json(notifications);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Get recent notifications
router.get('/recent', fetchuser, async (req, res) => {
  try {
    const last24Hours = new Date();
    last24Hours.setHours(last24Hours.getHours() - 24);
    
    // Clean up notifications for deleted tasks
    const notificationsWithTasks = await Notifications.find({
      time: { $gte: last24Hours },
      taskId: { $exists: true }
    }).populate('taskId');
    
    // Remove notifications where task no longer exists
    const validNotifications = [];
    const invalidNotificationIds = [];
    
    for (const notification of notificationsWithTasks) {
      if (notification.taskId) {
        validNotifications.push(notification);
      } else {
        invalidNotificationIds.push(notification._id);
      }
    }
    
    // Delete invalid notifications
    if (invalidNotificationIds.length > 0) {
      await Notifications.deleteMany({ _id: { $in: invalidNotificationIds } });
    }
    
    // Get notifications without taskId (general notifications)
    const generalNotifications = await Notifications.find({
      time: { $gte: last24Hours },
      taskId: { $exists: false }
    });
    
    const allNotifications = [...validNotifications, ...generalNotifications]
      .sort((a, b) => new Date(b.time) - new Date(a.time));
    
    res.status(200).json(allNotifications);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Clear all notifications
router.delete('/clear', fetchuser, async (req, res) => {
  try {
    const result = await Notifications.deleteMany({});
    res.status(200).json({ 
      message: `${result.deletedCount} notifications cleared successfully` 
    });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

module.exports = router;