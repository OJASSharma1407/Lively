const mongoose = require('mongoose');

const userDataSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  goals: [
    { date: Date, tasksCompleted: Boolean }
  ],
  energyPatterns: { date: Date, energyLevel: Number, mood: String }
  ,
  sleepStart: { type: String, default: "23:00" }, // store as "HH:mm"
  sleepEnd: { type: String, default: "07:00" },
  theme: { type: String, enum: ['light', 'dark'], default: 'light' },
}, { timestamps: true });

module.exports = mongoose.model('UserData', userDataSchema);
