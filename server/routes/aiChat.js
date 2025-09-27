const express = require('express');
const fetchuser = require('../middleware/fetchuser');
const router = express.Router();
const aiService = require('../services/aiService');
const Tasks = require('../models/Tasks');
const Progress = require('../models/Progress');
const UserData = require('../models/UserData');
const ChatHistory = require('../models/ChatHistory');

// AI Chat endpoint
router.post('/chat', fetchuser, async (req, res) => {
    try {
        const { message } = req.body;
        
        if (!message || message.trim().length === 0) {
            return res.status(400).json({ error: 'Message is required' });
        }
        
        // Get user context for AI
        const context = await getUserContext(req.user.id);
        
        // Generate AI response
        const aiResponse = await aiService.generateResponse(message, context);
        
        // Save chat history
        let chatHistory = await ChatHistory.findOne({ userId: req.user.id });
        if (!chatHistory) {
            chatHistory = new ChatHistory({ userId: req.user.id, messages: [] });
        }
        
        // Add user message and AI response
        chatHistory.messages.push(
            { message, sender: 'user', timestamp: new Date() },
            { message: aiResponse, sender: 'bot', timestamp: new Date() }
        );
        
        // Keep only last 50 messages
        if (chatHistory.messages.length > 50) {
            chatHistory.messages = chatHistory.messages.slice(-50);
        }
        
        await chatHistory.save();
        
        res.status(200).json({
            message: aiResponse,
            timestamp: new Date()
        });
        
    } catch (error) {
        console.error('AI Chat Error:', error);
        res.status(500).json({ error: 'Failed to process AI request' });
    }
});

// Get day insights
router.get('/insights', fetchuser, async (req, res) => {
    try {
        const context = await getUserContext(req.user.id);
        const insights = await aiService.handleDayInsights(context);
        
        res.status(200).json({
            insights,
            context: {
                todayTasksCount: context.todayTasks?.length || 0,
                completedToday: context.todayTasks?.filter(t => t.status === 'Completed').length || 0,
                pendingToday: context.todayTasks?.filter(t => t.status === 'Pending').length || 0
            }
        });
    } catch (error) {
        res.status(500).json({ error: 'Failed to get insights' });
    }
});

// AI-powered task scheduling
router.post('/schedule-task', fetchuser, async (req, res) => {
    try {
        const { taskName, category, priority, duration } = req.body;
        
        // Get user data and existing tasks
        const userData = await UserData.findOne({ userId: req.user.id });
        const existingTasks = await Tasks.find({ userId: req.user.id, status: 'Pending' });
        const userProgress = await Progress.find({ userId: req.user.id, status: 'Completed' }).limit(20);
        
        // Create temporary task object for AI analysis
        const tempTask = {
            taskName,
            category: category || 'Other',
            priority: priority || 'Medium',
            userId: req.user.id
        };
        
        // Get AI-suggested time slot
        const suggestedSlot = await aiService.getSmartRescheduleTime(
            tempTask, 
            userData, 
            existingTasks, 
            userProgress
        );
        
        if (suggestedSlot) {
            res.status(200).json({
                success: true,
                suggestedTime: suggestedSlot.startTime,
                suggestedEndTime: suggestedSlot.endTime,
                score: suggestedSlot.score,
                message: `AI suggests scheduling "${taskName}" at ${suggestedSlot.startTime.toLocaleString()} for optimal productivity.`
            });
        } else {
            res.status(200).json({
                success: false,
                message: "No optimal time slots found. Try scheduling manually or adjusting your existing tasks."
            });
        }
        
    } catch (error) {
        res.status(500).json({ error: 'Failed to get AI scheduling suggestion' });
    }
});

// Get productivity tips
router.get('/tips', fetchuser, async (req, res) => {
    try {
        const context = await getUserContext(req.user.id);
        const tip = await aiService.handleProductivityTips(context);
        
        res.status(200).json({
            tip,
            timestamp: new Date()
        });
    } catch (error) {
        res.status(500).json({ error: 'Failed to get productivity tip' });
    }
});

// Get chat history
router.get('/history', fetchuser, async (req, res) => {
    try {
        const chatHistory = await ChatHistory.findOne({ userId: req.user.id });
        res.status(200).json({
            messages: chatHistory?.messages || [],
            timestamp: new Date()
        });
    } catch (error) {
        res.status(500).json({ error: 'Failed to get chat history' });
    }
});

// Clear chat history
router.delete('/history', fetchuser, async (req, res) => {
    try {
        await ChatHistory.deleteOne({ userId: req.user.id });
        res.status(200).json({ message: 'Chat history cleared' });
    } catch (error) {
        res.status(500).json({ error: 'Failed to clear chat history' });
    }
});

// Helper function to get user context
async function getUserContext(userId) {
    try {
        // Get today's tasks
        const today = new Date();
        const startOfDay = new Date(today);
        startOfDay.setHours(0, 0, 0, 0);
        const endOfDay = new Date(today);
        endOfDay.setHours(23, 59, 59, 999);
        
        const todayTasks = await Tasks.find({
            userId: userId,
            date: { $gte: startOfDay, $lte: endOfDay }
        });
        
        // Get weekly stats
        const weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 7);
        
        const weeklyProgress = await Progress.find({
            userId: userId,
            completedAt: { $gte: weekAgo }
        });
        
        const pendingTasks = await Tasks.find({
            userId: userId,
            status: 'Pending',
            createdAt: { $gte: weekAgo }
        });
        
        const completed = weeklyProgress.filter(p => p.status === 'Completed').length;
        const missed = weeklyProgress.filter(p => p.status === 'Missed').length;
        const pending = pendingTasks.length;
        const totalTasks = completed + missed + pending;
        const completionRate = totalTasks > 0 ? (completed / totalTasks * 100).toFixed(1) : 0;
        
        // Get category stats
        const categories = ['Health', 'Academics', 'Fun', 'Chores', 'Other'];
        const categoryStats = {};
        
        categories.forEach(category => {
            const categoryProgress = weeklyProgress.filter(p => p.category === category);
            const categoryPending = pendingTasks.filter(t => t.category === category);
            const categoryCompleted = categoryProgress.filter(p => p.status === 'Completed').length;
            const categoryTotal = categoryProgress.length + categoryPending.length;
            
            categoryStats[category] = {
                total: categoryTotal,
                completed: categoryCompleted,
                completionRate: categoryTotal > 0 ? (categoryCompleted / categoryTotal * 100).toFixed(1) : 0
            };
        });
        
        return {
            todayTasks,
            weeklyStats: {
                totalTasks,
                completed,
                missed,
                pending,
                completionRate: parseFloat(completionRate)
            },
            categoryStats,
            currentTime: new Date()
        };
        
    } catch (error) {
        console.error('Error getting user context:', error);
        return {
            todayTasks: [],
            weeklyStats: { totalTasks: 0, completed: 0, missed: 0, pending: 0, completionRate: 0 },
            categoryStats: {},
            currentTime: new Date()
        };
    }
}

module.exports = router;