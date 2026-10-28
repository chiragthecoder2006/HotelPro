import { body } from 'express-validator';
import { validate } from '../middleware/validate.js';

export const validateBookingCreate = [
  body('hotelId')
    .notEmpty()
    .withMessage('Hotel ID is required'),
  body('roomId')
    .notEmpty()
    .withMessage('Room ID is required'),
  body('checkIn')
    .notEmpty()
    .withMessage('Check-in date is required')
    .isISO8601()
    .withMessage('Check-in date must be a valid ISO date')
    .custom((value) => {
      const checkInDate = new Date(value);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (checkInDate < today) {
        throw new Error('Check-in date cannot be in the past');
      }
      return true;
    }),
  body('checkOut')
    .notEmpty()
    .withMessage('Check-out date is required')
    .isISO8601()
    .withMessage('Check-out date must be a valid ISO date')
    .custom((value, { req }) => {
      const checkInDate = new Date(req.body.checkIn);
      const checkOutDate = new Date(value);
      if (checkOutDate <= checkInDate) {
        throw new Error('Check-out date must be after check-in date');
      }
      return true;
    }),
  body('roomCount')
    .optional()
    .isInt({ min: 1, max: 10 })
    .withMessage('Room count must be between 1 and 10'),
  body('guestDetails.primaryGuestName')
    .trim()
    .notEmpty()
    .withMessage('Guest full name is required'),
  body('guestDetails.email')
    .trim()
    .notEmpty()
    .withMessage('Guest email is required')
    .isEmail()
    .withMessage('Invalid guest email address'),
  body('guestDetails.phone')
    .trim()
    .notEmpty()
    .withMessage('Guest contact phone number is required'),
  validate
];

export const validateAvailabilityCheck = [
  body('roomId')
    .notEmpty()
    .withMessage('Room ID is required'),
  body('checkIn')
    .notEmpty()
    .withMessage('Check-in date is required')
    .isISO8601(),
  body('checkOut')
    .notEmpty()
    .withMessage('Check-out date is required')
    .isISO8601()
    .custom((value, { req }) => {
      const checkInDate = new Date(req.body.checkIn);
      const checkOutDate = new Date(value);
      if (checkOutDate <= checkInDate) {
        throw new Error('Check-out date must be after check-in date');
      }
      return true;
    }),
  validate
];

