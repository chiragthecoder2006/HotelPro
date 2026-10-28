import express from 'express';
import {
  getDashboardStats,
  getUsers,
  updateUserStatus
} from '../controllers/adminController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

// All admin routes require login + admin role
router.use(protect);
router.use(authorize('admin'));

router.get('/dashboard-stats', getDashboardStats);
router.get('/users', getUsers);
router.put('/users/:id/status', updateUserStatus);

export default router;

