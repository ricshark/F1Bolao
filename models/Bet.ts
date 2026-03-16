import mongoose from 'mongoose';

const BetSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  race: { type: mongoose.Schema.Types.ObjectId, ref: 'Race', required: true },
  prediction: {
    first: { type: String, required: true },
    second: { type: String },
    third: { type: String },
  },
  points: { type: Number, default: 0 },
}, { timestamps: true });

export default mongoose.models.Bet || mongoose.model('Bet', BetSchema);