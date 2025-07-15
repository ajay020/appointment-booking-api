import { IUser } from '@/models/User';
import jwt from 'jsonwebtoken';

export function generateAccessToken(user: IUser) {

    if (!process.env.JWT_SECRET) throw new Error('JWT_SECRET not set');
    return jwt.sign(
        { userId: user._id.toString(), role: user.role },
        process.env.JWT_SECRET,
        { expiresIn: '1d' }
    );
}

export function generateRefreshToken(user: IUser): string {
    if (!process.env.REFRESH_TOKEN_SECRET) throw new Error('REFRESH_TOKEN_SECRET not set');
    return jwt.sign(
        { userId: user._id.toString() },
        process.env.REFRESH_TOKEN_SECRET,
        { expiresIn: '7d' }
    );
}
