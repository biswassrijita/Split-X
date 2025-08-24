import mongoose from 'mongoose';

const groupSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    memberNames: { type: [String], default: [] },
  },
  { timestamps: true }
);

export default mongoose.model('Group', groupSchema);