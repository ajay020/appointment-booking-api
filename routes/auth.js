import { Router } from 'express';
import { hash, compare } from 'bcryptjs';
import User from '../models/User.js';
import jwt from 'jsonwebtoken';
import {
  loginUserValidationRules,
  registerUserValidationRules
} from '../validators/authValidators.js';
import validate from '../validators/validate.js';
import AppError from '../utils/AppError.js';
import asyncHandler from '../utils/handleAsync.js';
import { generateAccessToken, generateRefreshToken } from '../utils/token.js';
import auth from '../middlewares/authMiddleware.js';

const router = Router();

// POST /api/auth/register
router.post('/register', registerUserValidationRules(), validate, asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;

  const existingUser = await User.findOne({ email });
  if (existingUser) {
    throw new AppError('User already exists', 400);
  }

  const hashedPassword = await hash(password, 10);

  const user = new User({ name, email, password: hashedPassword });
  await user.save();

  const accessToken = generateAccessToken(user);
  const refreshToken = generateRefreshToken(user);
  user.refreshToken = refreshToken; // Store refresh token in user document
  await user.save();

  res.status(201).json({
    accessToken,
    refreshToken,
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
    },
  });
}));


// POST /api/auth/login
router.post('/login', loginUserValidationRules(), validate, asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email });
  if (!user) throw new AppError('Invalid credentials', 400);

  const isMatch = await compare(password, user.password);
  if (!isMatch) throw new AppError('Invalid credentials', 400);

  const accessToken = generateAccessToken(user);
  const refreshToken = generateRefreshToken(user);

  user.refreshToken = refreshToken; // Store refresh token in user document
  await user.save();

  res.json({
    accessToken,
    refreshToken,
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
    },
  });
}));

// POST /api/auth/refresh-token
// This endpoint allows users to refresh their access token using a refresh token
router.post('/refresh-token', asyncHandler(async (req, res) => {
  const { refreshToken } = req.body;
  if (!refreshToken) throw new AppError('No refresh token provided', 400);

  // verify the refresh token
  let payload;
  try {
    payload = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);
  } catch (err) {
    throw new AppError('Invalid or expired refresh token', 401);
  }

  const user = await User.findById(payload.userId);
  if (!user || user.refreshToken !== refreshToken) {
    throw new AppError('Unauthorized', 403);
  }

  // Create new tokens
  const newAccessToken = generateAccessToken(user);

  const newRefreshToken = generateRefreshToken(user);

  // Update stored refresh token
  user.refreshToken = newRefreshToken;
  await user.save();

  res.json({
    accessToken: newAccessToken,
    refreshToken: newRefreshToken,
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role
    }
  });
}));

router.post('/logout', auth, asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.userId);
  user.refreshToken = null;
  await user.save();
  res.json({ msg: 'Logged out' });
}));


export default router;
