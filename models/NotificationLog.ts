import mongoose from 'mongoose';

const NotificationLogSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  race: { type: mongoose.Schema.Types.ObjectId, ref: 'Race', required: true },
  attemptNumber: { type: Number, required: true }, // 1, 2, or 3
  sentAt: { type: Date, default: Date.now },
});

export default mongoose.models.NotificationLog || mongoose.model('NotificationLog', NotificationLogSchema);
