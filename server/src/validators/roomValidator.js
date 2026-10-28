import { body } from 'express-validator';
import { validate } from '../middleware/validate.js';

export const validateRoom = [
  body('hotel')
    .notEmpty()
    .withMessage('Hotel reference is required')
    .isMongoId()
    .withMessage('Invalid hotel ID'),
  body('roomType')
    .trim()
    .notEmpty()
    .withMessage('Room type is required'),
  body('pricePerNight')
    .isFloat({ min: 1 })
    .withMessage('Price per night must be at least 1'),
  body('totalInventory')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Inventory must be at least 1'),
  body('capacity.maxGuests')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Max guests must be at least 1'),
  validate
];

