const express = require('express');
const fetchuser = require('../middleware/fetchuser');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const UserData = require('../models/UserData');

// Get user data
router.get('/profile', fetchuser, async (req, res) => {
  try {
    let userData = await UserData.findOne({ userId: req.user.id });
    if (!userData) {
      userData = new UserData({ userId: req.user.id });
      await userData.save();
    }
    res.status(200).json(userData);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Update sleep schedule
router.put('/sleep-schedule', [
  body('sleepStart').matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/),
  body('sleepEnd').matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)
], fetchuser, async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const { sleepStart, sleepEnd } = req.body;
    let userData = await UserData.findOne({ userId: req.user.id });
    
    if (!userData) {
      userData = new UserData({ userId: req.user.id, sleepStart, sleepEnd });
    } else {
      userData.sleepStart = sleepStart;
      userData.sleepEnd = sleepEnd;
    }
    
    await userData.save();
    res.status(200).json(userData);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Add energy/mood data
router.post('/energy-mood', [
  body('energyLevel').isInt({ min: 1, max: 10 }),
  body('mood').isString().notEmpty()
], fetchuser, async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const { energyLevel, mood } = req.body;
    let userData = await UserData.findOne({ userId: req.user.id });
    
    if (!userData) {
      userData = new UserData({ userId: req.user.id });
    }
    
    userData.energyPatterns = { date: new Date(), energyLevel, mood };
    await userData.save();
    res.status(200).json(userData);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Update theme
router.put('/theme', [
  body('theme').isIn(['light', 'dark'])
], fetchuser, async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const { theme } = req.body;
    let userData = await UserData.findOne({ userId: req.user.id });
    
    if (!userData) {
      userData = new UserData({ userId: req.user.id, theme });
    } else {
      userData.theme = theme;
    }
    
    await userData.save();
    res.status(200).json(userData);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

module.exports = router;