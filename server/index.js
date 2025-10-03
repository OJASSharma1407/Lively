require('dotenv').config();
const express = require('express');
const cron = require('./cron/remainder');
const mongoose = require('mongoose');
const cors = require('cors');
const reminderJob = require('./cron/remainder');
const { missedTaskImmediateJob, missedTaskFinalJob } = require('./cron/missedNotification');
const generateRecurringTasks = require('./cron/recurringTasks');
const updateProgressTracking = require('./cron/progressTracking');
const port = process.env.PORT; 
const mongo_Url = process.env.MONGO_URL;
const app = express();
//Middle ware
console.log('Configuring CORS for origin:', "https://lively-nkre.vercel.app");
app.use(cors({
  origin: "https://lively-nkre.vercel.app",
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'auth-token', 'Authorization'],
  credentials: false
}));

// Handle preflight requests
app.options('*', cors());

// Request logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path} - Origin: ${req.headers.origin}`);
  next();
});

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

// Health check endpoint
app.get('/', (req, res) => {
  res.json({ message: 'Lively API is running!', timestamp: new Date().toISOString() });
});

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

