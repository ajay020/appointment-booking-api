import { Request, Response } from 'express';
import User from '@/models/User';
import AppError from '@/utils/errors/AppError';
import AuthError from '@/utils/errors/AuthError';
import NotFoundError from '@/utils/errors/NotFoundError';

export const getUser = async (req: Request, res: Response): Promise<void> => {
    const userId = req.user?.userId;

    if (!userId) {
        throw new AuthError('Unauthorized: User ID missing from token');
    }
    const user = await User
        .findById(userId)
        .select('-password -refreshToken')

    if (!user) throw new AppError('User not found', 404);

    res.json({
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt
    });
}

export const updateUser = async (req: Request, res: Response) => {
    const { name, email } = req.body;

    if (!name || !email) {
        throw new AppError('Name and email are required');
    }

    const userId = req.user?.userId;

    if (!userId) {
        throw new AuthError('Unauthorized: User ID missing from token');
    }

    // Check if email is already taken by another user
    const user = await User.findByIdAndUpdate(
        userId,
        { name, email },
        { new: true, runValidators: true }
    ).select('-password -refreshToken');

    if (!user) throw new NotFoundError('User not found');

    res.json({
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt
    });
}