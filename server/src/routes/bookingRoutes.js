import express from 'express';
import {
  checkAvailability,
  createBooking,
  getMyBookings,
  getBookingByReference,
  cancelBooking,
  getAllBookings,
  updateBookingStatus
} from '../controllers/bookingController.js';
import { protect, authorize } from '../middleware/auth.js';
import {
  validateBookingCreate,
  validateAvailabilityCheck
} from '../validators/bookingValidator.js';

const router = express.Router();

// Public check
router.post('/check-availability', validateAvailabilityCheck, checkAvailability);

// Customer protected
router.post('/', protect, validateBookingCreate, createBooking);
router.get('/my-bookings', protect, getMyBookings);
router.get('/:reference', protect, getBookingByReference);
router.put('/:reference/cancel', protect, cancelBooking);

// Admin protected
router.get('/admin/all', protect, authorize('admin'), getAllBookings);
router.put('/admin/:id/status', protect, authorize('admin'), updateBookingStatus);

export default router;

