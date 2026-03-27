import mongoose from 'mongoose';

const SystemConfigSchema = new mongoose.Schema({
  visits: { type: Number, default: 0 },
  betLockHours: { type: Number, default: 1 },
});

export default mongoose.models.SystemConfig || mongoose.model('SystemConfig', SystemConfigSchema);
