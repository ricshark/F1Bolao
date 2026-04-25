import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  isAdmin: { type: Boolean, default: false },
  points: { type: Number, default: 0 },
  alexaId: { type: String, default: null },
  photo: { type: String, default: null },
  resetToken: { type: String, default: null },
  resetTokenExpires: { type: Date, default: null },
  isBot: { type: Boolean, default: false },
}, { timestamps: true });

if (mongoose.models.User) {
  delete mongoose.models.User;
}
export default mongoose.model('User', UserSchema);