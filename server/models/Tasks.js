const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  taskName: { type: String, required: true },
  description: { type: String },
  
  // Core scheduling
  date: { type: Date }, // the day task is assigned (optional for recurring)
  startTime: { type: Date },
  endTime: { type: Date },
  
  // Classification
  type: { type: String, enum: ['Recurring', 'One-time'], required: true },
  recurrenceRule: [{ type: Number }], // e.g., [1,3,5] = Mon, Wed, Fri
  
  // Timetable support
  isRecurring: { type: Boolean, default: false },
  recurrencePattern: {
    type: { type: String, enum: ['daily', 'weekly', 'monthly'], default: 'weekly' },
    daysOfWeek: [String],
    endDate: Date
  },
  source: { type: String, enum: ['manual', 'timetable_upload', 'ai_generated'], default: 'manual' },
  originalText: String,
  
  // Status
  status: { type: String, enum: ['Pending', 'Completed', 'Missed'], default: 'Pending' },
  category: { type: String, enum: ['Health','Academics','Fun','Chores','Other'] },
  priority: { type: String, enum: ['Low','Medium','High'], default: 'Medium' },

  reminderSent: { type: Boolean, default: false },
  immediateMissedNotified: {type: Boolean, default: false},
  isNotified: { type: Boolean, default: false }

}, { timestamps: true });

// Index for better query performance
taskSchema.index({ userId: 1, startTime: 1 });
taskSchema.index({ userId: 1, status: 1 });
taskSchema.index({ userId: 1, isRecurring: 1 });


module.exports = mongoose.model("Tasks",taskSchema);