const chatbotHistorySchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  messages: [
    {
      message: { type: String, required: true },
      sender: { type: String, enum: ['user','bot'], required: true },
      timestamp: { type: Date, default: Date.now }
    }
  ]
}, { timestamps: true });

module.exports = mongoose.model('ChatbotHistory', chatbotHistorySchema);
