import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import User from '../models/User.js';
import { isDBConnected } from '../config/db.js';
import { memStore, mockId } from '../services/dbStore.js';

// Helper to send token response and set HttpOnly cookie
const sendTokenResponse = (user, statusCode, res, message = 'Success') => {
  const userId = user._id ? user._id.toString() : user.id;

  const token = jwt.sign(
    { id: userId, role: user.role },
    process.env.JWT_SECRET || 'hotelpro_dev_secret_key_987654321',
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );

  const cookieOptions = {
    expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production'
  };

  res
    .status(statusCode)
    .cookie('token', token, cookieOptions)
    .json({
      success: true,
      message,
      token,
      user: {
        id: userId,
        _id: userId,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone || '',
        accountStatus: user.accountStatus
      }
    });
};

/**
 * @desc    Register a new customer account
 * @route   POST /api/auth/register
 * @access  Public
 */
export const register = async (req, res, next) => {
  try {
    const { name, email, password, phone } = req.body;
    const normalizedEmail = email.toLowerCase().trim();

    if (isDBConnected()) {
      const existingUser = await User.findOne({ email: normalizedEmail });
      if (existingUser) {
        return res.status(409).json({
          success: false,
          message: 'An account with this email address already exists.'
        });
      }

      const user = await User.create({
        name,
        email: normalizedEmail,
        password,
        phone: phone || '',
        role: 'customer'
      });

      return sendTokenResponse(user, 201, res, 'Registration successful. Welcome to HotelPro!');
    }

    // In-memory fallback
    const existing = memStore.users.find(u => u.email === normalizedEmail);
    if (existing) {
      return res.status(409).json({
        success: false,
        message: 'An account with this email address already exists.'
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newId = mockId();
    const newUser = {
      _id: newId,
      id: newId,
      name,
      email: normalizedEmail,
      password: hashedPassword,
      role: 'customer',
      phone: phone || '',
      accountStatus: 'active',
      createdAt: new Date(),
      updatedAt: new Date(),
      comparePassword: async function (candidate) {
        return bcrypt.compare(candidate, this.password);
      }
    };
    memStore.users.push(newUser);

    sendTokenResponse(newUser, 201, res, 'Registration successful. Welcome to HotelPro!');
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Authenticate user & get token
 * @route   POST /api/auth/login
 * @access  Public
 */
export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const normalizedEmail = email.toLowerCase().trim();

    let user = null;
    let isMatch = false;

    if (isDBConnected()) {
      user = await User.findOne({ email: normalizedEmail });
      if (!user) {
        return res.status(401).json({
          success: false,
          message: 'Invalid email or password.'
        });
      }
      isMatch = await user.comparePassword(password);
    } else {
      user = memStore.users.find(u => u.email === normalizedEmail);
      if (!user) {
        return res.status(401).json({
          success: false,
          message: 'Invalid email or password.'
        });
      }
      isMatch = await user.comparePassword(password);
    }

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.'
      });
    }

    if (user.accountStatus !== 'active') {
      return res.status(403).json({
        success: false,
        message: 'Your account is deactivated. Please contact support.'
      });
    }

    sendTokenResponse(user, 200, res, 'Login successful.');
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Log out current user / clear cookie
 * @route   POST /api/auth/logout
 * @access  Public
 */
export const logout = (req, res) => {
  res.clearCookie('token', {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production'
  });

  res.status(200).json({
    success: true,
    message: 'Logged out successfully.'
  });
};

/**
 * @desc    Get currently logged in user profile
 * @route   GET /api/auth/me
 * @access  Private
 */
export const getMe = async (req, res, next) => {
  try {
    const userId = req.user._id ? req.user._id.toString() : req.user.id;
    let user = req.user;

    if (isDBConnected()) {
      user = await User.findById(userId);
    }

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.status(200).json({
      success: true,
      user: {
        id: userId,
        _id: userId,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone || '',
        accountStatus: user.accountStatus
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update current user profile
 * @route   PUT /api/auth/me
 * @access  Private
 */
export const updateProfile = async (req, res, next) => {
  try {
    const { name, phone } = req.body;
    const userId = req.user._id ? req.user._id.toString() : req.user.id;

    let updatedUser = null;
    if (isDBConnected()) {
      const user = await User.findById(userId);
      if (name) user.name = name;
      if (phone !== undefined) user.phone = phone;
      await user.save();
      updatedUser = user;
    } else {
      const user = memStore.users.find(u => (u._id || u.id) === userId);
      if (user) {
        if (name) user.name = name;
        if (phone !== undefined) user.phone = phone;
        user.updatedAt = new Date();
        updatedUser = user;
      }
    }

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      user: {
        id: userId,
        _id: userId,
        name: updatedUser.name,
        email: updatedUser.email,
        role: updatedUser.role,
        phone: updatedUser.phone || '',
        accountStatus: updatedUser.accountStatus
      }
    });
  } catch (error) {
    next(error);
  }
};
