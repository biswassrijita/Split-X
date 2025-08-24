import mongoose from 'mongoose';

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    trustScore: { type: Number, default: 100 },
    badges: { type: [String], default: ['New Member'] }
  },
  { timestamps: true }
);

export default mongoose.model('User', userSchema);