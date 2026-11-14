import Queue from '../models/Queue.js';
import Token from '../models/Token.js';
import { asyncHandler, ApiError } from '../utils/asyncHandler.js';
import { getOwnedQueue } from '../utils/queueAccess.js';

async function waitingList(queueId) {
  const list = await Token.find({ queue: queueId, status: 'Waiting' }).sort({ position: 1 }).lean();
  return list.map((t, i) => ({ ...t, queuePosition: i + 1 }));
}

async function findWaitingToken(queueId, tokenId) {
  const token = await Token.findOne({ _id: tokenId, queue: queueId });
  if (!token) throw new ApiError(404, 'Token not found');
  if (token.status !== 'Waiting') throw new ApiError(400, 'Only waiting tokens can be changed');
  return token;
}

export const addToken = asyncHandler(async (req, res) => {
  const name = (req.body.personName || '').trim();
  if (!name) throw new ApiError(400, "Person's name is required");
  if (name.length > 80) throw new ApiError(400, 'Name must be 80 characters or fewer');
  const queue = await getOwnedQueue(req.params.id, req.user._id);
  // Atomic increment: concurrent requests always receive distinct, never-reused numbers.
  const updated = await Queue.findOneAndUpdate({ _id: queue._id }, { $inc: { nextTokenNumber: 1 } }, { new: false });
  const number = updated.nextTokenNumber;
  const token = await Token.create({
    queue: queue._id, manager: req.user._id, tokenNumber: number, personName: name, position: number,
  });
  const list = await waitingList(queue._id);
  const queuePosition = list.findIndex((t) => String(t._id) === String(token._id)) + 1;
  res.status(201).json({ success: true, data: { token: { ...token.toObject(), queuePosition } } });
});

export const listTokens = asyncHandler(async (req, res) => {
  const queue = await getOwnedQueue(req.params.id, req.user._id);
  const waiting = await waitingList(queue._id);
  const recent = await Token.find({ queue: queue._id, status: { $in: ['Served', 'Cancelled'] } })
    .sort({ servedAt: -1, cancelledAt: -1, createdAt: -1 }).limit(20).lean();
  res.json({ success: true, data: { waiting, history: recent } });
});

export const moveToken = asyncHandler(async (req, res) => {
  const { direction } = req.body;
  if (!['up', 'down'].includes(direction)) throw new ApiError(400, "Direction must be 'up' or 'down'");
  const queue = await getOwnedQueue(req.params.id, req.user._id);
  const token = await findWaitingToken(queue._id, req.params.tokenId);
  const neighbor = await Token.findOne({
    queue: queue._id, status: 'Waiting',
    position: direction === 'up' ? { $lt: token.position } : { $gt: token.position },
  }).sort({ position: direction === 'up' ? -1 : 1 });
  if (!neighbor) throw new ApiError(400, direction === 'up' ? 'Already at the front' : 'Already at the back');
  await Token.bulkWrite([
    { updateOne: { filter: { _id: token._id }, update: { position: neighbor.position } } },
    { updateOne: { filter: { _id: neighbor._id }, update: { position: token.position } } },
  ]);
  res.json({ success: true, data: { waiting: await waitingList(queue._id) } });
});

export const serveNext = asyncHandler(async (req, res) => {
  const queue = await getOwnedQueue(req.params.id, req.user._id);
  // Atomic: two simultaneous requests can never serve the same token.
  const token = await Token.findOneAndUpdate(
    { queue: queue._id, status: 'Waiting' },
    { status: 'Served', servedAt: new Date() },
    { sort: { position: 1 }, new: true }
  );
  if (!token) throw new ApiError(400, 'No one is waiting in this queue');
  res.json({ success: true, data: { token, waiting: await waitingList(queue._id) } });
});

export const cancelToken = asyncHandler(async (req, res) => {
  const queue = await getOwnedQueue(req.params.id, req.user._id);
  const token = await Token.findOneAndUpdate(
    { _id: req.params.tokenId, queue: queue._id, status: 'Waiting' },
    { status: 'Cancelled', cancelledAt: new Date() },
    { new: true }
  );
  if (!token) throw new ApiError(400, 'Only waiting tokens can be cancelled');
  res.json({ success: true, data: { token, waiting: await waitingList(queue._id) } });
});
