import mongoose from 'mongoose';

const tokenSchema = new mongoose.Schema({
  queue: { type: mongoose.Schema.Types.ObjectId, ref: 'Queue', required: true },
  manager: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  tokenNumber: { type: Number, required: true },
  personName: { type: String, required: true, trim: true, maxlength: 80 },
  // Sort key for ordering waiting tokens. Starts equal to tokenNumber; move swaps keys.
  position: { type: Number, required: true },
  status: { type: String, enum: ['Waiting', 'Serving', 'Served', 'Cancelled'], default: 'Waiting' },
  createdAt: { type: Date, default: Date.now },
  servedAt: Date,
  cancelledAt: Date,
});

tokenSchema.index({ queue: 1, tokenNumber: 1 }, { unique: true });
tokenSchema.index({ queue: 1, status: 1, position: 1 });

export default mongoose.model('Token', tokenSchema);
