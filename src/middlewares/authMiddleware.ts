import { Request, Response, NextFunction } from 'express';
import jwt, { JwtPayload } from 'jsonwebtoken';
import AppError from '../utils/errors/AppError';
import AuthError from '@/utils/errors/AuthError';

export function authMiddleware(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.header('Authorization');
  const token = authHeader?.split(' ')[1];

  if (!token) {
    throw new AuthError('No token provided');
  }

  if (!process.env.JWT_SECRET) {
    throw new AppError('JWT secret key not configured');
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET) as JwtPayload & { userId: string; role: string };
    req.user = decoded;

    next();
  } catch {
    throw new AuthError('Invalid or expired token');
  }
}

export default authMiddleware;
