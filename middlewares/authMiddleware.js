import jwt from 'jsonwebtoken';

function authMiddleware(req, res, next) {
  const token = req.header('Authorization')?.split(' ')[1];

  if (!token) return res.status(401).json({ msg: 'No token. Authorization denied.' });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // { userId, role }
    next();
  } catch (err) {
    res.status(401).json({ msg: 'Invalid token' });
  }
}

export default authMiddleware;
