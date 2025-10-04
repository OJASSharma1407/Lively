require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

// Cron jobs
const reminderJob = require('./cron/remainder');
const { missedTaskImmediateJob, missedTaskFinalJob } = require('./cron/missedNotification');
const generateRecurringTasks = require('./cron/recurringTasks');
const updateProgressTracking = require('./cron/progressTracking');

const app = express();
const port = process.env.PORT || 5000;
const mongo_Url = process.env.MONGO_URL;

// ---------------- CORS FIX ---------------- //
const allowedOrigins = [
  "http://localhost:3000",             // local dev
  "https://lively-swart.vercel.app"     // Vercel frontend
];

app.use(cors({
  origin: function (origin, callback) {
    if (!origin) return callback(null, true); // allow Postman or curl
    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    } else {
      return callback(new Error("CORS blocked: " + origin), false);
    }
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'auth-token', 'Authorization'],
  credentials: true
}));


// ---------------- Middleware ---------------- //
app.use(express.json());

// Request logger (helps debugging on Render logs)
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path} - Origin: ${req.headers.origin}`);
  next();
});

// ---------------- Database ---------------- //
mongoose.connect(mongo_Url)
  .then(() => console.log("✅ Database connected successfully"))
  .catch(err => console.error("❌ Database connection error:", err));

// ---------------- Cron Jobs ---------------- //
reminderJob();
missedTaskImmediateJob();
missedTaskFinalJob();
generateRecurringTasks();
updateProgressTracking();

// ---------------- Routes ---------------- //
app.get('/', (req, res) => {
  res.json({ message: 'Lively API is running!', timestamp: new Date().toISOString() });
});

app.use('/user', require('./routes/userAuth'));
app.use('/user', require('./routes/userData'));
app.use('/tasks', require('./routes/tasks'));
app.use('/reminders', require('./routes/taskReminders'));
app.use('/progress', require('./routes/progress'));
app.use('/notifications', require('./routes/notifications'));
app.use('/ai', require('./routes/aiChat'));
app.use('/timetable', require('./routes/timetable'));

// ---------------- Start Server ---------------- //
app.listen(port, () => {
  console.log(`🚀 Server running on port ${port}`);
});
