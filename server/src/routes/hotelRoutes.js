import express from 'express';
import {
  getHotels,
  getFeaturedHotels,
  getHotelByIdOrSlug,
  createHotel,
  updateHotel,
  deleteHotel
} from '../controllers/hotelController.js';
import { protect, authorize } from '../middleware/auth.js';
import { validateHotel } from '../validators/hotelValidator.js';

const router = express.Router();

router.get('/', getHotels);
router.get('/featured', getFeaturedHotels);
router.get('/:identifier', getHotelByIdOrSlug);

// Admin protected endpoints
router.post('/', protect, authorize('admin'), validateHotel, createHotel);
router.put('/:id', protect, authorize('admin'), updateHotel);
router.delete('/:id', protect, authorize('admin'), deleteHotel);

export default router;

