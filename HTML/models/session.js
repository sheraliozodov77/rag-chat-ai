const sessionSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    startTimestamp: { type: Date, default: Date.now },
    endTimestamp: Date
  });
  
  const Session = mongoose.model('Session', sessionSchema);  