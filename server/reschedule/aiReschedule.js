const aiService = require('../services/aiService');
const Tasks = require('../models/Tasks');
const UserData = require('../models/UserData');
const Progress = require('../models/Progress');

const aiReschedule = async (task) => {
    try {
        // Get user data and context
        const userData = await UserData.findOne({ userId: task.userId });
        const existingTasks = await Tasks.find({
            userId: task.userId,
            status: 'Pending',
            _id: { $ne: task._id }
        });
        const userProgress = await Progress.find({
            userId: task.userId,
            status: 'Completed'
        }).sort({ completedAt: -1 }).limit(20);
        
        // Use AI service for smart rescheduling
        const suggestedSlot = await aiService.getSmartRescheduleTime(
            task,
            userData,
            existingTasks,
            userProgress
        );
        
        if (suggestedSlot) {
            return {
                success: true,
                newTime: suggestedSlot.startTime,
                endTime: suggestedSlot.endTime,
                score: suggestedSlot.score,
                reason: `AI optimized based on your productivity patterns and ${task.category} preferences`,
                message: `AI rescheduled "${task.taskName}" to ${suggestedSlot.startTime.toLocaleString()} (Score: ${suggestedSlot.score})`
            };
        }
        
        return {
            success: false,
            message: "No optimal time slots found in the next 3 days"
        };
        
    } catch (error) {
        console.error('AI Reschedule error:', error);
        return {
            success: false,
            message: "Error in AI rescheduling: " + error.message
        };
    }
};

module.exports = { aiReschedule };