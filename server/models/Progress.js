const mongoose = require('mongoose');

const progressSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  taskId: { type: mongoose.Schema.Types.ObjectId, ref: 'Tasks', required: true },
  taskName: { type: String, required: true },
  category: { type: String, required: true },
  priority: { type: String, required: true },
  status: { type: String, enum: ['Completed', 'Missed'], required: true },
  completedAt: { type: Date, required: true },
  originalStartTime: { type: Date },
  originalEndTime: { type: Date }
}, { timestamps: true });

module.exports = mongoose.model("Progress", progressSchema);