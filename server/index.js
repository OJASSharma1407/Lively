require('dotenv').config();
const express = require('express');
const cron = require('./cron/remainder');
const mongoose = require('mongoose');
const cors = require('cors');
const reminderJob = require('./cron/remainder');
const { missedTaskImmediateJob, missedTaskFinalJob } = require('./cron/missedNotification');
const generateRecurringTasks = require('./cron/recurringTasks');
const updateProgressTracking = require('./cron/progressTracking');
const port = process.env. PORT; 
const mongo_Url = process.env.MONGO_URL;
const app = express();
//Middle ware
app.use(cors({
  origin: "https://lively-nkre.vercel.app", // your Vercel frontend URL
  credentials: true
}));

app.use(express.json());
//DataBase
mongoose.connect(mongo_Url).then(()=>{
    console.log("DataBase connected sucessfully");
}).catch(err=>{
    console.log(err);
})

// Start all cron jobs
reminderJob();
missedTaskImmediateJob();
missedTaskFinalJob();
generateRecurringTasks();
updateProgressTracking();

//Routes
app.use('/user',require('./routes/userAuth'));
app.use('/user',require('./routes/userData'));
app.use('/tasks',require('./routes/tasks'));
app.use('/reminders',require('./routes/taskReminders'));
app.use('/progress',require('./routes/progress'));
app.use('/notifications',require('./routes/notifications'));
app.use('/ai',require('./routes/aiChat'));
app.use('/timetable',require('./routes/timetable'));

app.listen(port,()=>{
    console.log(`server running on port ${port}`);
})

