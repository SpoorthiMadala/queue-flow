import mongoose from 'mongoose';

const queueSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 60 },
    manager: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    nextTokenNumber: { type: Number, default: 1 },
  },
  { timestamps: true }
);

export default mongoose.model('Queue', queueSchema);
