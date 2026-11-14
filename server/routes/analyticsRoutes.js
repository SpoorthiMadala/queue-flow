import { Router } from 'express';
import { overview, queueStats, trends } from '../controllers/analyticsController.js';
import { protect } from '../middleware/authMiddleware.js';

const r = Router();
r.use(protect);
r.get('/overview', overview);
r.get('/queues', queueStats);
r.get('/trends', trends);
export default r;
