import jwt from 'jsonwebtoken';
import AuthError from '../utils/AuthError.js';

function authMiddleware(req, res, next) {
  const token = req.header('Authorization')?.split(' ')[1];

  if (!token) {
    throw new AuthError('No token provided');
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // { userId, role }
    next();
  } catch (err) {
    throw new AuthError('Invalid or expired token');
  }
}

export default authMiddleware;
