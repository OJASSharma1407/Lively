const cron = require('node-cron');
const Tasks = require('../models/Tasks');
const Notifications = require('../models/Notifications');

const reminderJob = () => {
    // Check every 5 minutes instead of every minute
    cron.schedule("*/5 * * * *", async () => {
        try {
            const now = new Date();
            const tenMinutesLater = new Date(now.getTime() + 10 * 60000);
            
            // Find tasks that need reminders
            const upcomingTasks = await Tasks.find({
                startTime: { $gte: now, $lte: tenMinutesLater },
                status: "Pending",
                isNotified: false // Only tasks that haven't been notified
            });
            
            console.log(`Found ${upcomingTasks.length} tasks needing reminders`);
            
            for (const task of upcomingTasks) {
                // Create notification
                const notification = new Notifications({
                    notification: `⏰ Reminder: "${task.taskName}" starts in 10 minutes!`,
                    taskId: task._id,
                    time: new Date()
                });
                await notification.save();
                
                // Mark task as notified (permanent)
                task.isNotified = true;
                await task.save();
                
                console.log(`Reminder sent for task: ${task.taskName}`);
            }
        } catch (err) {
            console.error("Error in reminder job:", err);
        }
    });
};

module.exports = reminderJob;