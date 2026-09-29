import jwt from 'jsonwebtoken';
import User from '../models/User.js';

export async function requireAuth(request, response, next) {
  try {
    const token = request.cookies.token;
    if (!token) return response.status(401).json({ message: 'Authentication required' });

    const payload = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(payload.userId).select('-password');
    if (!user) return response.status(401).json({ message: 'User account not found' });

    request.user = user;
    next();
  } catch {
    response.status(401).json({ message: 'Invalid or expired session' });
  }
}

export function requireRole(...roles) {
  return (request, response, next) => {
    if (!request.user || !roles.includes(request.user.role)) {
      return response.status(403).json({ message: 'You are not authorized for this action' });
    }
    next();
  };
}
