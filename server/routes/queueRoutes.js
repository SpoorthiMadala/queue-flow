import { Router } from 'express';
import { createQueue, listQueues, getQueue, updateQueue, deleteQueue } from '../controllers/queueController.js';
import tokenRoutes from './tokenRoutes.js';
import { protect } from '../middleware/authMiddleware.js';

const r = Router();
r.use(protect);
r.route('/').post(createQueue).get(listQueues);
r.route('/:id').get(getQueue).put(updateQueue).delete(deleteQueue);
r.use('/:id', tokenRoutes);
export default r;
