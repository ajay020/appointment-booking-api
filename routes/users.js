import { Router } from 'express';
import User from '../models/User.js';

import authenticateUser from '../middlewares/authMiddleware.js';
import AppError from '../utils/AppError.js';

const router = Router();

router.get('/me', authenticateUser, async (req, res) => {
    const user = await User
        .findById(req.user.userId)
        .select('-password -refreshToken')

    if (!user) return new AppError('User not found', 404);
    res.json({
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt
    });
});

router.put('/me', authenticateUser, async (req, res) => {
    const { name, email } = req.body;
    // Validate input
    if (!name || !email) {
        return res.status(400).json({ message: 'Name and email are required' });
    }

    // Check if email is already taken by another user
    const user = await User.findByIdAndUpdate(
        req.user.userId,
        { name, email },
        { new: true, runValidators: true }
    ).select('-password');

    if (!user) throw new AppError('User not found', 404);

    res.json({
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt
    });
});

export default router;