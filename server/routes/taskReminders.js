const express = require('express');
const fetchuser = require('../middleware/fetchuser');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const TaskReminder = require('../models/TasksReminder');

// Add Task Reminder
router.post('/add', [
  body('taskName').notEmpty(),
  body('deadline').isISO8601().toDate(),
  body('priority').optional().isIn(['Low', 'Medium', 'High'])
], fetchuser, async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const { taskName, description, deadline, priority } = req.body;
    
    const reminder = new TaskReminder({
      userId: req.user.id,
      taskName,
      description,
      deadline,
      priority
    });

    await reminder.save();
    res.status(200).json(reminder);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Get All Reminders
router.get('/all', fetchuser, async (req, res) => {
  try {
    const reminders = await TaskReminder.find({ userId: req.user.id }).sort({ deadline: 1 });
    res.status(200).json(reminders);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Get Reminder by ID
router.get('/:id', fetchuser, async (req, res) => {
  try {
    const reminder = await TaskReminder.findById(req.params.id);
    
    if (!reminder) {
      return res.status(404).json({ error: "Reminder not found" });
    }
    
    if (reminder.userId.toString() !== req.user.id) {
      return res.status(403).json({ error: "Unauthorized" });
    }
    
    res.status(200).json(reminder);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Update Reminder
router.put('/:id', fetchuser, async (req, res) => {
  try {
    const reminder = await TaskReminder.findById(req.params.id);
    
    if (!reminder) {
      return res.status(404).json({ error: "Reminder not found" });
    }
    
    if (reminder.userId.toString() !== req.user.id) {
      return res.status(403).json({ error: "Unauthorized" });
    }
    
    const updatedReminder = await TaskReminder.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true, runValidators: true }
    );
    
    res.status(200).json(updatedReminder);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Delete Reminder
router.delete('/:id', fetchuser, async (req, res) => {
  try {
    const reminder = await TaskReminder.findById(req.params.id);
    
    if (!reminder) {
      return res.status(404).json({ error: "Reminder not found" });
    }
    
    if (reminder.userId.toString() !== req.user.id) {
      return res.status(403).json({ error: "Unauthorized" });
    }
    
    await TaskReminder.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: "Reminder deleted successfully" });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Get upcoming reminders (next 7 days)
router.get('/upcoming', fetchuser, async (req, res) => {
  try {
    const now = new Date();
    const nextWeek = new Date(now);
    nextWeek.setDate(now.getDate() + 7);
    
    const reminders = await TaskReminder.find({
      userId: req.user.id,
      deadline: { $gte: now, $lte: nextWeek }
    }).sort({ deadline: 1 });
    
    res.status(200).json(reminders);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

module.exports = router;