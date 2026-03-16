import mongoose from 'mongoose';

const ResultSchema = new mongoose.Schema({
  race: { type: mongoose.Schema.Types.ObjectId, ref: 'Race', required: true },
  results: [{
    position: { type: Number, required: true },
    driver: { type: String, required: true },
    points: { type: Number, required: true },
  }],
}, { timestamps: true });

export default mongoose.models.Result || mongoose.model('Result', ResultSchema);