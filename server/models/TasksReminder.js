const taskReminderSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  taskName: { type: String, required: true },
  description: { type: String },
  deadline: { type: Date, required: true },
  priority: { type: String, enum: ['Low','Medium','High'], default: 'Medium' }
}, { timestamps: true });

module.exports = mongoose.model('TaskReminder', taskReminderSchema);
