import Queue from '../models/Queue.js';
import Token from '../models/Token.js';
import { asyncHandler } from '../utils/asyncHandler.js';

const mins = (ms) => Math.round((ms / 60000) * 10) / 10;

export const overview = asyncHandler(async (req, res) => {
  const m = req.user._id;
  const [totalQueues, byStatus, wait, recentServed, currentWaiting] = await Promise.all([
    Queue.countDocuments({ manager: m }),
    Token.aggregate([{ $match: { manager: m } }, { $group: { _id: '$status', n: { $sum: 1 } } }]),
    Token.aggregate([
      { $match: { manager: m, status: 'Served', servedAt: { $exists: true } } },
      { $group: { _id: null, avg: { $avg: { $subtract: ['$servedAt', '$createdAt'] } } } },
    ]),
    Token.find({ manager: m, status: 'Served' }).sort({ servedAt: -1 }).limit(5).populate('queue', 'name').lean(),
    Token.find({ manager: m, status: 'Waiting' }).sort({ createdAt: 1 }).limit(8).populate('queue', 'name').lean(),
  ]);
  const c = Object.fromEntries(byStatus.map((s) => [s._id, s.n]));
  res.json({
    success: true,
    data: {
      totalQueues,
      waiting: c.Waiting || 0,
      served: c.Served || 0,
      cancelled: c.Cancelled || 0,
      avgWaitMinutes: wait[0] ? mins(wait[0].avg) : 0,
      recentServed,
      currentWaiting,
    },
  });
});

export const queueStats = asyncHandler(async (req, res) => {
  const m = req.user._id;
  const queues = await Queue.find({ manager: m }).lean();
  const stats = await Token.aggregate([
    { $match: { manager: m } },
    { $group: {
        _id: { q: '$queue', s: '$status' }, n: { $sum: 1 },
        wait: { $avg: { $cond: [{ $eq: ['$status', 'Served'] }, { $subtract: ['$servedAt', '$createdAt'] }, null] } },
    } },
  ]);
  const data = queues.map((q) => {
    const row = { queueId: q._id, name: q.name, waiting: 0, served: 0, cancelled: 0, avgWaitMinutes: 0 };
    stats.filter((s) => String(s._id.q) === String(q._id)).forEach((s) => {
      if (s._id.s === 'Waiting') row.waiting = s.n;
      if (s._id.s === 'Served') { row.served = s.n; row.avgWaitMinutes = mins(s.wait || 0); }
      if (s._id.s === 'Cancelled') row.cancelled = s.n;
    });
    return row;
  });
  res.json({ success: true, data: { queues: data } });
});

export const trends = asyncHandler(async (req, res) => {
  const m = req.user._id;
  const days = Math.min(Number(req.query.days) || 7, 30);
  const start = new Date();
  start.setHours(0, 0, 0, 0);
  start.setDate(start.getDate() - (days - 1));
  const day = (field) => ({ $dateToString: { format: '%Y-%m-%d', date: field } });
  const [added, served, cancelled] = await Promise.all([
    Token.aggregate([{ $match: { manager: m, createdAt: { $gte: start } } }, { $group: { _id: day('$createdAt'), n: { $sum: 1 } } }]),
    Token.aggregate([{ $match: { manager: m, servedAt: { $gte: start } } }, { $group: { _id: day('$servedAt'), n: { $sum: 1 } } }]),
    Token.aggregate([{ $match: { manager: m, cancelledAt: { $gte: start } } }, { $group: { _id: day('$cancelledAt'), n: { $sum: 1 } } }]),
  ]);
  const get = (arr, k) => arr.find((x) => x._id === k)?.n || 0;
  const out = [];
  for (let i = 0; i < days; i++) {
    const d = new Date(start); d.setDate(start.getDate() + i);
    const key = d.toISOString().slice(0, 10);
    out.push({ date: key, label: d.toLocaleDateString('en-US', { weekday: 'short', day: 'numeric' }),
      arrivals: get(added, key), served: get(served, key), cancelled: get(cancelled, key) });
  }
  res.json({ success: true, data: { trends: out } });
});
