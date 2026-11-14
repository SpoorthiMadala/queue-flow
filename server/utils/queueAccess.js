import mongoose from 'mongoose';
import Queue from '../models/Queue.js';
import { ApiError } from './asyncHandler.js';

// Returns the queue only if it belongs to the manager; otherwise 404 (no info leak).
export async function getOwnedQueue(queueId, managerId) {
  if (!mongoose.isValidObjectId(queueId)) throw new ApiError(400, 'Invalid queue ID');
  const queue = await Queue.findOne({ _id: queueId, manager: managerId });
  if (!queue) throw new ApiError(404, 'Queue not found');
  return queue;
}
