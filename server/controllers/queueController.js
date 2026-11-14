import Queue from '../models/Queue.js';
import Token from '../models/Token.js';
import { asyncHandler, ApiError } from '../utils/asyncHandler.js';
import { getOwnedQueue } from '../utils/queueAccess.js';

const validName = (name) => {
  if (!name || !name.trim()) throw new ApiError(400, 'Queue name is required');
  if (name.trim().length > 60) throw new ApiError(400, 'Queue name must be 60 characters or fewer');
};

export const createQueue = asyncHandler(async (req, res) => {
  validName(req.body.name);
  const queue = await Queue.create({ name: req.body.name, manager: req.user._id });
  res.status(201).json({ success: true, data: { queue: { ...queue.toObject(), waitingCount: 0 } } });
});

export const listQueues = asyncHandler(async (req, res) => {
  const queues = await Queue.find({ manager: req.user._id }).sort({ createdAt: -1 }).lean();
  const counts = await Token.aggregate([
    { $match: { manager: req.user._id, status: 'Waiting' } },
    { $group: { _id: '$queue', n: { $sum: 1 } } },
  ]);
  const map = new Map(counts.map((c) => [String(c._id), c.n]));
  res.json({ success: true, data: { queues: queues.map((q) => ({ ...q, waitingCount: map.get(String(q._id)) || 0 })) } });
});

export const getQueue = asyncHandler(async (req, res) => {
  const queue = await getOwnedQueue(req.params.id, req.user._id);
  const waitingCount = await Token.countDocuments({ queue: queue._id, status: 'Waiting' });
  res.json({ success: true, data: { queue: { ...queue.toObject(), waitingCount } } });
});

export const updateQueue = asyncHandler(async (req, res) => {
  validName(req.body.name);
  const queue = await getOwnedQueue(req.params.id, req.user._id);
  queue.name = req.body.name;
  await queue.save();
  res.json({ success: true, data: { queue } });
});

export const deleteQueue = asyncHandler(async (req, res) => {
  const queue = await getOwnedQueue(req.params.id, req.user._id);
  await Token.deleteMany({ queue: queue._id });
  await queue.deleteOne();
  res.json({ success: true, message: 'Queue deleted' });
});
