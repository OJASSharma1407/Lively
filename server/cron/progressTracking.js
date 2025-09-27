const cron = require('node-cron');
const Tasks = require('../models/Tasks');
const ProgressTracking = require('../models/ProgressTracking');

const updateProgressTracking = () => {
  cron.schedule('0 23 * * *', async () => { // Run daily at 11 PM
    try {
      const users = await Tasks.distinct('userId');
      
      for (let userId of users) {
        const weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 7);
        
        const weeklyTasks = await Tasks.find({
          userId,
          createdAt: { $gte: weekAgo }
        });
        
        const completed = weeklyTasks.filter(task => task.status === 'Completed').length;
        const missed = weeklyTasks.filter(task => task.status === 'Missed').length;
        
        const missedByType = {
          recurring: weeklyTasks.filter(task => task.status === 'Missed' && task.type === 'Recurring').length,
          oneTime: weeklyTasks.filter(task => task.status === 'Missed' && task.type === 'One-time').length
        };
        
        const missedByPriority = {
          low: weeklyTasks.filter(task => task.status === 'Missed' && task.priority === 'Low').length,
          medium: weeklyTasks.filter(task => task.status === 'Missed' && task.priority === 'Medium').length,
          high: weeklyTasks.filter(task => task.status === 'Missed' && task.priority === 'High').length
        };
        
        let progress = await ProgressTracking.findOne({ userId });
        if (!progress) {
          progress = new ProgressTracking({ userId });
        }
        
        progress.weeklyTasksCompleted = completed;
        progress.weeklyTasksMissed = missed;
        progress.missedTaskTypes = missedByType;
        progress.missedTaskPriority = missedByPriority;
        
        await progress.save();
      }
      
      console.log('Progress tracking updated for all users');
    } catch (err) {
      console.error('Error updating progress tracking:', err);
    }
  });
};

module.exports = updateProgressTracking;