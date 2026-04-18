import mongoose from 'mongoose';

const SystemConfigSchema = new mongoose.Schema({
  visits: { type: Number, default: 0 },
  betLockHours: { type: Number, default: 1 },
  notif1Hours: { type: Number, default: 24 }, // First notification, 24h before race
  notif2Hours: { type: Number, default: 12 }, // Second notification, 12h before race
  notif3Hours: { type: Number, default: 2 },  // Third notification, 2h before race
  lastNotifProcess: { type: Date, default: null }, // Last time the cron job ran
});

export default mongoose.models.SystemConfig || mongoose.model('SystemConfig', SystemConfigSchema);
