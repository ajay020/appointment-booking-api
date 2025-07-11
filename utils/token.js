import jwt from 'jsonwebtoken';

export function generateAccessToken(user) {
    return jwt.sign(
        { userId: user._id, role: user.role },
        process.env.JWT_SECRET,
        { expiresIn: '15m' }
    );
}

export function generateRefreshToken(user) {
    return jwt.sign(
        { userId: user._id },
        process.env.REFRESH_TOKEN_SECRET,
        { expiresIn: '7d' }
    );
}
