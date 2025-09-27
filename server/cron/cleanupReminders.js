const cron = require('node-cron');
const Tasks = require('../models/Tasks');

const cleanupReminders = () => {
    // Run every hour to reset reminderSent for completed/missed tasks
    cron.schedule("0 * * * *", async () => {
        try {
            // Reset reminderSent for completed or missed tasks
            await Tasks.updateMany(
                { 
                    reminderSent: true,
                    status: { $in: ['Completed', 'Missed'] }
                },
                { 
                    $set: { reminderSent: false } 
                }
            );
            
            console.log('Cleaned up reminder flags for completed/missed tasks');
        } catch (err) {
            console.error("Error cleaning up reminders:", err);
        }
    });
};

module.exports = cleanupReminders;