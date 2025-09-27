const cron = require("node-cron");
const Tasks = require("../models/Tasks");
const Notifications = require("../models/Notifications");
const { rescheduleTask } = require("../reschedule/reschedule");

// 🕐 Immediate "missed" notification
const missedTaskImmediateJob = () => {
  cron.schedule("* * * * *", async () => {
    try {
      const now = new Date();

      const justMissedTasks = await Tasks.find({
        endTime: { $lte: now },
        status: "Pending",
        immediateMissedNotified: { $ne: true }, // flag so we don't spam
      }).populate("userId");

      for (let task of justMissedTasks) {
        const notify = `⏰ Task just ended: ${task.taskName}. Did you finish it?`;
        await new Notifications({ notification: notify }).save();

        task.immediateMissedNotified = true;
        await task.save();
      }
    } catch (err) {
      console.error("Error in immediate missed job:", err);
    }
  });
};

// 🕒 15-min grace → mark missed + reschedule
const missedTaskFinalJob = () => {
  cron.schedule("*/5 * * * *", async () => { // check every 5 mins
    try {
      const now = new Date();
      const buffer = 15 * 60 * 1000; // 15 min

      const overdueTasks = await Tasks.find({
        endTime: { $lte: new Date(now.getTime() - buffer) },
        status: "Pending",
      }).populate("userId");

      for (let task of overdueTasks) {
        // Update status → Missed
        task.status = "Missed";
        await task.save();

        // Reschedule the task
        const rescheduleResult = await rescheduleTask(task);
        
        // Notify based on reschedule result
        let notify;
        if (rescheduleResult.success) {
          notify = `❌ Task missed: ${task.taskName}. Rescheduled to ${rescheduleResult.newTime.toLocaleString()}`;
        } else {
          notify = `❌ Task missed: ${task.taskName}. ${rescheduleResult.message}`;
        }
        await new Notifications({ notification: notify }).save();
      }
    } catch (err) {
      console.error("Error in final missed job:", err);
    }
  });
};

module.exports = { missedTaskImmediateJob, missedTaskFinalJob };