const express = require('express');
const fetchuser = require('../middleware/fetchuser');
const router = express.Router();
const Tasks = require('../models/Tasks');
const ProgressTracking = require('../models/ProgressTracking');
const Progress = require('../models/Progress');

// Get user progress
router.get('/stats', fetchuser, async (req, res) => {
  try {
    let progress = await ProgressTracking.findOne({ userId: req.user.id });
    if (!progress) {
      progress = new ProgressTracking({ userId: req.user.id });
      await progress.save();
    }
    res.status(200).json(progress);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Calculate weekly progress
router.get('/weekly', fetchuser, async (req, res) => {
  try {
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    
    // Get completed/missed from Progress model (persistent)
    const weeklyProgress = await Progress.find({
      userId: req.user.id,
      completedAt: { $gte: weekAgo }
    });
    
    // Get pending from Tasks model
    const pendingTasks = await Tasks.find({
      userId: req.user.id,
      status: 'Pending',
      createdAt: { $gte: weekAgo }
    });
    
    const completed = weeklyProgress.filter(p => p.status === 'Completed').length;
    const missed = weeklyProgress.filter(p => p.status === 'Missed').length;
    const pending = pendingTasks.length;
    
    const totalTasks = completed + missed + pending;
    const completionRate = totalTasks > 0 ? (completed / totalTasks * 100).toFixed(1) : 0;
    
    res.status(200).json({
      totalTasks,
      completed,
      missed,
      pending,
      completionRate: parseFloat(completionRate)
    });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Update streak
router.post('/update-streak', fetchuser, async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const todayTasks = await Tasks.find({
      userId: req.user.id,
      date: {
        $gte: today,
        $lt: new Date(today.getTime() + 24 * 60 * 60 * 1000)
      }
    });
    
    const allCompleted = todayTasks.length > 0 && todayTasks.every(task => task.status === 'Completed');
    
    let progress = await ProgressTracking.findOne({ userId: req.user.id });
    if (!progress) {
      progress = new ProgressTracking({ userId: req.user.id });
    }
    
    if (allCompleted) {
      progress.streak += 1;
    } else if (todayTasks.some(task => task.status === 'Missed')) {
      progress.streak = 0;
    }
    
    await progress.save();
    res.status(200).json({ streak: progress.streak });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Monthly Progress
router.get('/monthly', fetchuser, async (req, res) => {
  try {
    const monthAgo = new Date();
    monthAgo.setMonth(monthAgo.getMonth() - 1);
    
    const monthlyTasks = await Tasks.find({
      userId: req.user.id,
      createdAt: { $gte: monthAgo }
    });
    
    const completed = monthlyTasks.filter(task => task.status === 'Completed').length;
    const missed = monthlyTasks.filter(task => task.status === 'Missed').length;
    const pending = monthlyTasks.filter(task => task.status === 'Pending').length;
    
    const completionRate = monthlyTasks.length > 0 ? (completed / monthlyTasks.length * 100).toFixed(1) : 0;
    
    res.status(200).json({
      totalTasks: monthlyTasks.length,
      completed,
      missed,
      pending,
      completionRate: parseFloat(completionRate)
    });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Category-wise Analytics
router.get('/category-analytics', fetchuser, async (req, res) => {
  try {
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    
    const tasks = await Tasks.find({
      userId: req.user.id,
      createdAt: { $gte: weekAgo }
    });
    
    const categoryStats = {};
    const categories = ['Health', 'Academics', 'Fun', 'Chores', 'Other'];
    
    categories.forEach(category => {
      const categoryTasks = tasks.filter(task => task.category === category);
      const completed = categoryTasks.filter(task => task.status === 'Completed').length;
      const total = categoryTasks.length;
      
      categoryStats[category] = {
        total,
        completed,
        completionRate: total > 0 ? (completed / total * 100).toFixed(1) : 0
      };
    });
    
    res.status(200).json(categoryStats);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Productivity Insights
router.get('/productivity-insights', fetchuser, async (req, res) => {
  try {
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    
    const completedTasks = await Tasks.find({
      userId: req.user.id,
      status: 'Completed',
      createdAt: { $gte: weekAgo }
    });
    
    const hourlyStats = {};
    for(let i = 0; i < 24; i++) {
      hourlyStats[i] = 0;
    }
    
    completedTasks.forEach(task => {
      if(task.startTime) {
        const hour = task.startTime.getHours();
        hourlyStats[hour]++;
      }
    });
    
    const bestHour = Object.keys(hourlyStats).reduce((a, b) => 
      hourlyStats[a] > hourlyStats[b] ? a : b
    );
    
    res.status(200).json({
      hourlyProductivity: hourlyStats,
      bestProductiveHour: parseInt(bestHour),
      totalCompletedTasks: completedTasks.length
    });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

module.exports = router;