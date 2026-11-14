import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { asyncHandler, ApiError } from '../utils/asyncHandler.js';

const sign = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN || '7d' });
const publicUser = (u) => ({ id: u._id, name: u.name, email: u.email, createdAt: u.createdAt });
const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const register = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;
  if (!name?.trim()) throw new ApiError(400, 'Name is required');
  if (!emailRe.test(email || '')) throw new ApiError(400, 'A valid email is required');
  if (!password || password.length < 6) throw new ApiError(400, 'Password must be at least 6 characters');
  if (await User.findOne({ email: email.toLowerCase() })) throw new ApiError(409, 'Email already registered');
  const user = await User.create({ name, email, password: await bcrypt.hash(password, 10) });
  res.status(201).json({ success: true, data: { user: publicUser(user), token: sign(user._id) } });
});

export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) throw new ApiError(400, 'Email and password are required');
  const user = await User.findOne({ email: email.toLowerCase() }).select('+password');
  if (!user || !(await bcrypt.compare(password, user.password))) throw new ApiError(401, 'Invalid email or password');
  res.json({ success: true, data: { user: publicUser(user), token: sign(user._id) } });
});

export const me = asyncHandler(async (req, res) => {
  res.json({ success: true, data: { user: publicUser(req.user) } });
});
