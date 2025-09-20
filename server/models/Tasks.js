const taskSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  taskName: { type: String, required: true },
  description: { type: String },
  startTime: { type: Date },
  endTime: { type: Date },
  type: { type: String, enum: ['Recurring', 'One-time'], required: true },
  recurrenceRule: [{ type: Number }], // e.g., [1,3,5] = Mon, Wed, Fri
  status: { type: String, enum: ['Pending', 'Completed', 'Missed'], default: 'Pending' },
  category: { type: String, enum: ['Health','Academics','Fun','Chores','Other'] },
  priority: { type: String, enum: ['Low','Medium','High'], default: 'Medium' }
}, { timestamps: true });

module.exports = mongoose.model('Task', taskSchema);
