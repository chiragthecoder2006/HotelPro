import { body } from 'express-validator';
import { validate } from '../middleware/validate.js';

export const validateHotel = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Hotel name is required')
    .isLength({ max: 120 })
    .withMessage('Hotel name cannot exceed 120 characters'),
  body('description')
    .trim()
    .notEmpty()
    .withMessage('Description is required'),
  body('address.city')
    .trim()
    .notEmpty()
    .withMessage('City is required'),
  body('starRating')
    .optional()
    .isFloat({ min: 1, max: 5 })
    .withMessage('Star rating must be between 1 and 5'),
  body('images')
    .optional()
    .isArray()
    .withMessage('Images must be an array of URLs'),
  body('amenities')
    .optional()
    .isArray()
    .withMessage('Amenities must be an array of strings'),
  validate
];

