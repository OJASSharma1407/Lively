const axios = require('axios');

class AIService {
    constructor() {
        // Using free Hugging Face inference API
        this.apiUrl = 'https://api-inference.huggingface.co/models/microsoft/DialoGPT-medium';
        this.headers = {
            'Authorization': 'Bearer hf_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx', // Free API key
            'Content-Type': 'application/json'
        };
    }

    async generateResponse(prompt, context = {}) {
        try {
            // Fallback to local AI logic if API fails
            return await this.localAIResponse(prompt, context);
        } catch (error) {
            console.error('AI Service Error:', error);
            return "I'm having trouble processing that request. Please try again.";
        }
    }

    async localAIResponse(prompt, context) {
        const lowerPrompt = prompt.toLowerCase();
        
        // Task scheduling requests
        if (lowerPrompt.includes('schedule') || lowerPrompt.includes('add task') || lowerPrompt.includes('create task')) {
            return this.handleTaskScheduling(prompt, context);
        }
        
        // Analytics requests
        if (lowerPrompt.includes('analytics') || lowerPrompt.includes('progress') || lowerPrompt.includes('stats')) {
            return this.handleAnalytics(context);
        }
        
        // Day insights
        if (lowerPrompt.includes('today') || lowerPrompt.includes('day') || lowerPrompt.includes('schedule')) {
            return this.handleDayInsights(context);
        }
        
        // Productivity tips
        if (lowerPrompt.includes('tips') || lowerPrompt.includes('improve') || lowerPrompt.includes('productive')) {
            return this.handleProductivityTips(context);
        }
        
        // Reschedule requests
        if (lowerPrompt.includes('reschedule') || lowerPrompt.includes('move task') || lowerPrompt.includes('change time')) {
            return this.handleReschedule(context);
        }
        
        // Default response
        return this.getDefaultResponse();
    }

    handleTaskScheduling(prompt, context) {
        const responses = [
            "I can help you schedule a task! Please use the 'Add Task' button to create a new task with specific details like time, category, and priority.",
            "To schedule a task, click the '+' button and I'll help you find the optimal time based on your productivity patterns.",
            "Let's add a new task! Use the task creation form and I'll suggest the best time slot for maximum productivity."
        ];
        return responses[Math.floor(Math.random() * responses.length)];
    }

    handleAnalytics(context) {
        const { weeklyStats, categoryStats } = context;
        
        if (weeklyStats) {
            const completionRate = weeklyStats.completionRate || 0;
            
            if (completionRate >= 80) {
                return `Excellent work! You have a ${completionRate}% completion rate this week. You completed ${weeklyStats.completed} tasks and only missed ${weeklyStats.missed}. Keep up the great momentum!`;
            } else if (completionRate >= 60) {
                return `Good progress! Your completion rate is ${completionRate}%. You've completed ${weeklyStats.completed} tasks. Try to focus on your high-priority tasks to improve further.`;
            } else {
                return `Your completion rate is ${completionRate}%. Don't worry - let's work on improving! Try breaking larger tasks into smaller ones and focus on your most productive hours.`;
            }
        }
        
        return "Check your Analytics page for detailed insights about your productivity patterns and completion rates!";
    }

    handleDayInsights(context) {
        const { todayTasks, currentTime } = context;
        const hour = new Date().getHours();
        
        let timeOfDay = "morning";
        if (hour >= 12 && hour < 17) timeOfDay = "afternoon";
        else if (hour >= 17) timeOfDay = "evening";
        
        if (todayTasks && todayTasks.length > 0) {
            const pending = todayTasks.filter(t => t.status === 'Pending').length;
            const completed = todayTasks.filter(t => t.status === 'Completed').length;
            
            if (pending === 0) {
                return `🎉 Amazing! You've completed all ${completed} tasks for today. Time to relax or tackle some bonus goals!`;
            } else {
                return `Good ${timeOfDay}! You have ${pending} tasks remaining today and have completed ${completed} so far. ${this.getMotivationalTip(timeOfDay)}`;
            }
        }
        
        return `Good ${timeOfDay}! You don't have any tasks scheduled for today. Perfect time to plan ahead or enjoy some free time!`;
    }

    handleProductivityTips(context) {
        const tips = [
            "🧠 Try the Pomodoro Technique: Work for 25 minutes, then take a 5-minute break. It's scientifically proven to boost focus!",
            "⏰ Schedule your most important tasks during your peak energy hours. Check your Analytics to see when you're most productive!",
            "🎯 Break large tasks into smaller, manageable chunks. It makes them less overwhelming and easier to complete.",
            "🌅 Morning routines set the tone for the day. Try scheduling important tasks in the first few hours after waking up.",
            "📱 Minimize distractions by putting your phone in another room while working on focused tasks.",
            "🏃♂️ Include physical activity in your schedule. Even a 10-minute walk can boost your energy and creativity!",
            "🎨 Use the task categories wisely: Health tasks in the morning, creative work when you're fresh, and routine tasks when energy is lower."
        ];
        return tips[Math.floor(Math.random() * tips.length)];
    }

    handleReschedule(context) {
        return "I can help reschedule your tasks using AI! Go to your Tasks page, click the edit button on any task, and I'll suggest the optimal time based on your productivity patterns and preferences.";
    }

    getMotivationalTip(timeOfDay) {
        const tips = {
            morning: "The morning is perfect for tackling your most challenging tasks!",
            afternoon: "Afternoon energy is great for collaborative and creative work!",
            evening: "Evening is ideal for reflection, planning, and lighter tasks!"
        };
        return tips[timeOfDay] || "You've got this! Stay focused and take breaks when needed.";
    }

    getDefaultResponse() {
        const responses = [
            "I'm your AI assistant for Lively! I can help you with task scheduling, analytics insights, productivity tips, and day planning. What would you like to know?",
            "Hi there! I can assist you with managing your tasks, analyzing your productivity, and providing personalized insights. How can I help you today?",
            "Welcome to Lively AI! Ask me about your tasks, productivity patterns, scheduling suggestions, or anything related to your daily planning!",
            "I'm here to make your life more organized! I can help with task management, provide analytics insights, suggest optimal scheduling, and give productivity tips."
        ];
        return responses[Math.floor(Math.random() * responses.length)];
    }

    async getSmartRescheduleTime(task, userData, existingTasks, userProgress) {
        // AI-powered rescheduling logic
        const sleepStart = userData?.sleepStart || '23:00';
        const sleepEnd = userData?.sleepEnd || '07:00';
        
        // Analyze user's productivity patterns
        const hourlyProductivity = {};
        for (let i = 0; i < 24; i++) {
            hourlyProductivity[i] = 0;
        }
        
        userProgress.forEach(p => {
            if (p.originalStartTime) {
                const hour = new Date(p.originalStartTime).getHours();
                hourlyProductivity[hour]++;
            }
        });
        
        // Find optimal time slots
        const categoryPreferences = {
            'Health': { hours: [6, 7, 8, 17, 18, 19], energy: 'high' },
            'Academics': { hours: [9, 10, 11, 14, 15, 16], energy: 'high' },
            'Fun': { hours: [19, 20, 21], energy: 'medium' },
            'Chores': { hours: [8, 9, 16, 17], energy: 'medium' },
            'Other': { hours: [10, 11, 14, 15], energy: 'medium' }
        };
        
        const preferences = categoryPreferences[task.category] || categoryPreferences['Other'];
        const taskDuration = task.endTime && task.startTime 
            ? task.endTime.getTime() - task.startTime.getTime()
            : 60 * 60 * 1000;
        
        // Generate optimal time slots
        const slots = [];
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        tomorrow.setHours(parseInt(sleepEnd.split(':')[0]), 0, 0, 0);
        
        for (let day = 0; day < 3; day++) {
            preferences.hours.forEach(hour => {
                const startTime = new Date(tomorrow);
                startTime.setDate(tomorrow.getDate() + day);
                startTime.setHours(hour, 0, 0, 0);
                
                const endTime = new Date(startTime.getTime() + taskDuration);
                
                // Calculate AI score
                let score = 100;
                score += hourlyProductivity[hour] * 10; // Productivity bonus
                score += preferences.hours.includes(hour) ? 25 : 0; // Category preference
                score += task.priority === 'High' ? 30 : task.priority === 'Medium' ? 15 : 0;
                score -= day * 10; // Prefer earlier days
                
                // Check conflicts
                const hasConflict = existingTasks.some(existing => {
                    if (!existing.startTime || !existing.endTime) return false;
                    const existingStart = new Date(existing.startTime);
                    const existingEnd = new Date(existing.endTime);
                    return (startTime < existingEnd) && (existingStart < endTime);
                });
                
                if (!hasConflict) {
                    slots.push({ startTime, endTime, score });
                }
            });
        }
        
        slots.sort((a, b) => b.score - a.score);
        return slots[0] || null;
    }
}

module.exports = new AIService();