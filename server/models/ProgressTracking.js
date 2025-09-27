const mongoose = require('mongoose');

const progressTrackingSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  weeklyTasksCompleted: { type: Number, default: 0 },
  weeklyTasksMissed: { type: Number, default: 0 },
  missedTaskTypes: {
    recurring: { type: Number, default: 0 },
    oneTime: { type: Number, default: 0 }
  },
  missedTaskPriority: {
    low: { type: Number, default: 0 },
    medium: { type: Number, default: 0 },
    high: { type: Number, default: 0 }
  },
  streak: { type: Number, default: 0 }
}, { timestamps: true });

module.exports = mongoose.model('ProgressTracking', progressTrackingSchema);
