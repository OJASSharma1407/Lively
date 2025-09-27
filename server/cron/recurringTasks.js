const cron = require('node-cron');
const Tasks = require('../models/Tasks');

const generateRecurringTasks = () => {
  cron.schedule('0 0 * * *', async () => { // Run daily at midnight
    try {
      const today = new Date();
      const dayOfWeek = today.getDay(); // 0 = Sunday, 1 = Monday, etc.
      
      // Find all recurring tasks that should run today
      const recurringTasks = await Tasks.find({
        type: 'Recurring',
        recurrenceRule: dayOfWeek,
        status: { $ne: 'Missed' } // Don't generate for permanently missed recurring tasks
      });
      
      for (let template of recurringTasks) {
        // Check if today's instance already exists
        const todayStart = new Date(today);
        todayStart.setHours(0, 0, 0, 0);
        const todayEnd = new Date(today);
        todayEnd.setHours(23, 59, 59, 999);
        
        const existingInstance = await Tasks.findOne({
          userId: template.userId,
          taskName: template.taskName,
          date: { $gte: todayStart, $lte: todayEnd },
          type: 'One-time' // Generated instances are marked as one-time
        });
        
        if (!existingInstance) {
          // Create today's instance
          const taskStart = new Date(template.startTime);
          const taskEnd = new Date(template.endTime);
          
          // Set to today's date but keep the time
          taskStart.setFullYear(today.getFullYear(), today.getMonth(), today.getDate());
          taskEnd.setFullYear(today.getFullYear(), today.getMonth(), today.getDate());
          
          const newInstance = new Tasks({
            userId: template.userId,
            taskName: template.taskName,
            description: template.description,
            date: today,
            startTime: taskStart,
            endTime: taskEnd,
            type: 'One-time', // Generated instances are one-time
            status: 'Pending',
            category: template.category,
            priority: template.priority,
            reminderSent: false,
            immediateMissedNotified: false
          });
          
          await newInstance.save();
          console.log(`Generated recurring task: ${template.taskName} for ${today.toDateString()}`);
        }
      }
    } catch (err) {
      console.error('Error generating recurring tasks:', err);
    }
  });
};

module.exports = generateRecurringTasks;