import { hash, compare } from 'bcryptjs';
import { Request, Response } from 'express';
import jwt, { JwtPayload } from 'jsonwebtoken';
import User from '@/models/User';
import AppError from '@/utils/errors/AppError';
import { generateAccessToken, generateRefreshToken } from '@/utils/token';
import AuthError from '@/utils/errors/AuthError';


export const register = async (req: Request, res: Response) => {
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
}

export const login = async (req: Request, res: Response) => {
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
}


export const refreshToken = async (req: Request, res: Response) => {
    const { refreshToken } = req.body;
    if (!refreshToken) throw new AppError('No refresh token provided', 400);

    // verify the refresh token
    let payload;
    const refreshTokenSecret = process.env.REFRESH_TOKEN_SECRET;
    if (!refreshTokenSecret) {
        throw new AppError('Refresh token secret is not configured', 500);
    }

    try {
        payload = jwt.verify(refreshToken, refreshTokenSecret) as JwtPayload & { userId: string; role: string };;
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
}

export const logout = async (req: Request, res: Response): Promise<void> => {
    const userId = req.user?.userId;

    if (!userId) throw new AuthError('Unauthorized: No user found in request');

    const user = await User.findById(userId);

    if (!user) {
        throw new AppError('User not found', 404);
    }

    user.refreshToken = undefined; // or null, depending on your schema
    await user.save();

    res.status(200).json({ msg: 'Logged out successfully' });
}