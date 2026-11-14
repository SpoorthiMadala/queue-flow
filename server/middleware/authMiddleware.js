import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { asyncHandler, ApiError } from '../utils/asyncHandler.js';

export const protect = asyncHandler(async (req, res, next) => {
  const header = req.headers.authorization || '';
  if (!header.startsWith('Bearer ')) throw new ApiError(401, 'Not authenticated');
  let payload;
  try {
    payload = jwt.verify(header.slice(7), process.env.JWT_SECRET);
  } catch {
    throw new ApiError(401, 'Session expired. Please log in again.');
  }
  const user = await User.findById(payload.id);
  if (!user) throw new ApiError(401, 'Account no longer exists');
  req.user = user;
  next();
});
