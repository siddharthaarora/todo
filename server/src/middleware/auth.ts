import { Request, Response, NextFunction } from 'express';
import { verifyToken } from '../services/authService';
import { User, IUser } from '../models/User';

// Extend the Request interface to include user
declare module 'express-serve-static-core' {
  interface Request {
    user?: IUser;
  }
}

export const authenticateToken = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
      return res.status(401).json({ message: 'Access token required' });
    }

    const decoded = verifyToken(token) as any;
    if (!decoded) {
      return res.status(403).json({ message: 'Invalid or expired token' });
    }

    // Fetch user from database to ensure they still exist
    const user = await User.findById(decoded.id);
    if (!user) {
      return res.status(403).json({ message: 'User not found' });
    }

    // Attach user to request object
    req.user = user;
    next();
  } catch (error) {
    console.error('Authentication error:', error);
    return res.status(403).json({ message: 'Authentication failed' });
  }
};

export const optionalAuth = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1];

    if (token) {
      const decoded = verifyToken(token) as any;
      if (decoded) {
        const user = await User.findById(decoded.id);
        if (user) {
          req.user = user;
        }
      }
    }
    next();
  } catch (error) {
    // Continue without authentication for optional routes
    next();
  }
}; 