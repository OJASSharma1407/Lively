const Tasks = require('../models/Tasks');
const UserData = require('../models/UserData');

async function findAvailableSlots(userId, targetDate, taskDuration) {
  const startOfDay = new Date(targetDate);
  startOfDay.setHours(6, 0, 0, 0);
  
  const endOfDay = new Date(targetDate);
  endOfDay.setHours(23, 0, 0, 0);
  
  const userData = await UserData.findOne({ userId });
  const sleepStart = userData?.sleepStart || "23:00";
  const sleepEnd = userData?.sleepEnd || "07:00";
  
  const existingTasks = await Tasks.find({
    userId,
    date: {
      $gte: startOfDay,
      $lt: new Date(startOfDay.getTime() + 24 * 60 * 60 * 1000)
    },
    status: { $in: ['Pending', 'Completed'] }
  }).sort({ startTime: 1 });
  
  const availableSlots = [];
  const slotDuration = 30 * 60 * 1000;
  
  for (let time = startOfDay.getTime(); time < endOfDay.getTime(); time += slotDuration) {
    const slotStart = new Date(time);
    const slotEnd = new Date(time + taskDuration);
    
    const hasConflict = existingTasks.some(task => {
      return (slotStart < task.endTime && slotEnd > task.startTime);
    });
    
    const slotHour = slotStart.getHours();
    const sleepStartHour = parseInt(sleepStart.split(':')[0]);
    const sleepEndHour = parseInt(sleepEnd.split(':')[0]);
    
    const inSleepTime = (sleepStartHour > sleepEndHour) 
      ? (slotHour >= sleepStartHour || slotHour < sleepEndHour)
      : (slotHour >= sleepStartHour && slotHour < sleepEndHour);
    
    if (!hasConflict && !inSleepTime) {
      availableSlots.push({
        startTime: slotStart,
        endTime: slotEnd,
        score: 0
      });
    }
  }
  
  return availableSlots;
}

function scoreSlots(availableSlots, existingTasks, task) {
  return availableSlots.map(slot => {
    let score = 50;
    
    const priorityBonus = { 'High': 20, 'Medium': 10, 'Low': 5 };
    score += priorityBonus[task.priority] || 10;
    
    const categoryTimePrefs = {
      'Health': { morning: 15, afternoon: 5, evening: 10 },
      'Academics': { morning: 20, afternoon: 15, evening: 5 },
      'Fun': { morning: 5, afternoon: 10, evening: 15 },
      'Chores': { morning: 10, afternoon: 15, evening: 10 },
      'Other': { morning: 10, afternoon: 10, evening: 10 }
    };
    
    const hour = slot.startTime.getHours();
    const timeOfDay = hour < 12 ? 'morning' : hour < 17 ? 'afternoon' : 'evening';
    score += categoryTimePrefs[task.category]?.[timeOfDay] || 5;
    
    existingTasks.forEach(existingTask => {
      const timeDiff = Math.abs(slot.startTime - existingTask.startTime) / (60 * 60 * 1000);
      
      if (existingTask.category === task.category && timeDiff <= 2) {
        score += 10;
      }
      
      if (timeDiff < 0.5) {
        score -= 15;
      }
    });
    
    if (hour >= 12 && hour <= 13) {
      score -= 10;
    }
    
    if (hour >= 8 && hour <= 10) {
      score += 8;
    }
    
    return { ...slot, score };
  }).sort((a, b) => b.score - a.score);
}

async function rescheduleTask(task) {
  try {
    const taskDuration = task.endTime - task.startTime;
    const today = new Date();
    const maxDaysAhead = 7;
    
    for (let dayOffset = 0; dayOffset < maxDaysAhead; dayOffset++) {
      const targetDate = new Date(today);
      targetDate.setDate(today.getDate() + dayOffset);
      
      const availableSlots = await findAvailableSlots(task.userId, targetDate, taskDuration);
      
      if (availableSlots.length === 0) continue;
      
      const dayStart = new Date(targetDate);
      dayStart.setHours(0, 0, 0, 0);
      const dayEnd = new Date(targetDate);
      dayEnd.setHours(23, 59, 59, 999);
      
      const existingTasks = await Tasks.find({
        userId: task.userId,
        date: {
          $gte: dayStart,
          $lt: dayEnd
        },
        status: { $in: ['Pending', 'Completed'] }
      });
      
      const scoredSlots = scoreSlots(availableSlots, existingTasks, task);
      
      if (scoredSlots.length > 0 && scoredSlots[0].score > 30) {
        const bestSlot = scoredSlots[0];
        
        await Tasks.findByIdAndUpdate(task._id, {
          date: targetDate,
          startTime: bestSlot.startTime,
          endTime: bestSlot.endTime,
          status: 'Pending',
          reminderSent: false,
          immediateMissedNotified: false
        });
        
        // Create reschedule notification
        const Notifications = require('../models/Notifications');
        const rescheduleNotification = new Notifications({
          notification: `🔄 Task "${task.taskName}" rescheduled to ${bestSlot.startTime.toLocaleString()}`,
          taskId: task._id,
          time: new Date()
        });
        await rescheduleNotification.save();
        
        return {
          success: true,
          newTime: bestSlot.startTime,
          score: bestSlot.score,
          message: `Task rescheduled to ${bestSlot.startTime.toLocaleString()}`
        };
      }
    }
    
    return {
      success: false,
      message: 'No suitable time slot found within the next 7 days'
    };
    
  } catch (error) {
    console.error('Rescheduling error:', error);
    return {
      success: false,
      message: 'Error during rescheduling: ' + error.message
    };
  }
}

module.exports = { findAvailableSlots, rescheduleTask };
