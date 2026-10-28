import express from 'express';
import {
  getRoomsByHotel,
  getRoomById,
  createRoom,
  updateRoom,
  deleteRoom
} from '../controllers/roomController.js';
import { protect, authorize } from '../middleware/auth.js';
import { validateRoom } from '../validators/roomValidator.js';

const router = express.Router();

router.get('/hotel/:hotelId', getRoomsByHotel);
router.get('/:id', getRoomById);

// Admin protected endpoints
router.post('/', protect, authorize('admin'), validateRoom, createRoom);
router.put('/:id', protect, authorize('admin'), updateRoom);
router.delete('/:id', protect, authorize('admin'), deleteRoom);

export default router;

