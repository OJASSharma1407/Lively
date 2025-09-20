const userDataSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  goals: [
    { date: Date, tasksCompleted: Boolean }
  ],
  energyPatterns: [
    { date: Date, energyLevel: Number, mood: String }
  ],
}, { timestamps: true });

module.exports = mongoose.model('UserData', userDataSchema);
