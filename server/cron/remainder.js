const cron = require('node-cron');
const Tasks = require('../models/Tasks');
const reminderJob = ()=>{

    cron.schedule("* * * * *",async()=>{
        try{
            const now = new Date();
            const fifteenMinLater = new Date(now.getTime()+13*60000);
            
            const upcomingTasks = await Tasks.find({
                startTime:{$gte:now,$lte:fifteenMinLater},
                status:"Pending"
            }).populate("userId");
            
            upcomingTasks.forEach(async task=>{
                if (!task.reminderSent) {
                    console.log(`remainder: ${task.taskName} for ${task.userId.username} starts soon!`);
                    task.reminderSent = true;
                    await task.save();
                }

            });
        }catch(err){
            console.error("Error checking reminders:", err);
        }
    })
};

module.exports = reminderJob;