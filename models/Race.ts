import mongoose from 'mongoose';

const RaceSchema = new mongoose.Schema({
  round: { type: Number, required: true },
  name: { type: String, required: true },
  date: { type: Date, required: true },
  time: { type: String },
  circuit: { type: String, required: true },
  season: { type: Number, required: true },
}, { timestamps: true });

export default mongoose.models.Race || mongoose.model('Race', RaceSchema);