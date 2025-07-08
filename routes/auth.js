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

  const token = jwt.sign(
    { userId: user._id, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: '1d' }
  );

  res.status(201).json({ token });
}));


// POST /api/auth/login
router.post('/login', loginUserValidationRules(), validate, asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email });
  if (!user) throw new AppError('Invalid credentials', 400);

  const isMatch = await compare(password, user.password);
  if (!isMatch) throw new AppError('Invalid credentials', 400);

  const token = jwt.sign(
    { userId: user._id, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: '1d' }
  );

  res.json({ token });
}));


export default router;
