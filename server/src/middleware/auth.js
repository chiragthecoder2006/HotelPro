import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { isDBConnected } from '../config/db.js';
import { memStore } from '../services/dbStore.js';

/**
 * Middleware to authenticate requests via JWT stored in HttpOnly cookie or Authorization header
 */
export const protect = async (req, res, next) => {
  try {
    let token = null;

    // 1. Check for token in HttpOnly cookie
    if (req.cookies && req.cookies.token) {
      token = req.cookies.token;
    }
    // 2. Check for token in Authorization Bearer header
    else if (
      req.headers.authorization &&
      req.headers.authorization.startsWith('Bearer ')
    ) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required. Please log in to proceed.'
      });
    }

    // Verify token
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || 'hotelpro_dev_secret_key_987654321'
    );

    // Find active user (Mongoose or in-memory)
    let user = null;
    if (isDBConnected()) {
      user = await User.findById(decoded.id).select('-password');
    } else {
      user = memStore.users.find(u => u._id === decoded.id || u.id === decoded.id);
    }

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'User belonging to this token no longer exists.'
      });
    }

    if (user.accountStatus !== 'active') {
      return res.status(403).json({
        success: false,
        message: 'Your account is currently inactive or suspended.'
      });
    }

    req.user = user;
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        message: 'Invalid session token. Please log in again.'
      });
    }
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Session has expired. Please log in again.'
      });
    }
    return res.status(500).json({
      success: false,
      message: 'Authentication check failed.'
    });
  }
};

/**
 * Role-based authorization middleware
 * @param  {...string} roles Allowed roles ('customer', 'admin')
 */
export const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized.'
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Role (${req.user.role}) is not authorized to access this resource.`
      });
    }
    next();
  };
};
