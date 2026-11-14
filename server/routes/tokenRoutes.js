import { Router } from 'express';
import { addToken, listTokens, moveToken, serveNext, cancelToken } from '../controllers/tokenController.js';

// Mounted at /api/queues/:id — auth is applied by queueRoutes.
const r = Router({ mergeParams: true });
r.route('/tokens').post(addToken).get(listTokens);
r.patch('/tokens/:tokenId/move', moveToken);
r.patch('/tokens/:tokenId/cancel', cancelToken);
r.patch('/serve', serveNext);
export default r;
