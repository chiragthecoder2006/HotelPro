import Booking from '../models/Booking.js';
import Room from '../models/Room.js';
import { isDBConnected } from '../config/db.js';
import { memStore } from './dbStore.js';

/**
 * Checks room availability for a given date range using half-open intervals:
 * existing.checkIn < requested.checkOut && existing.checkOut > requested.checkIn
 *
 * @param {string} roomId
 * @param {Date|string} checkInDate
 * @param {Date|string} checkOutDate
 * @param {number} requestedRoomCount
 * @param {string} [excludeBookingId]
 */
export const checkRoomAvailability = async (
  roomId,
  checkInDate,
  checkOutDate,
  requestedRoomCount = 1,
  excludeBookingId = null
) => {
  const checkIn = new Date(checkInDate);
  const checkOut = new Date(checkOutDate);

  if (isNaN(checkIn.getTime()) || isNaN(checkOut.getTime())) {
    throw new Error('Invalid check-in or check-out date format');
  }

  if (checkOut <= checkIn) {
    throw new Error('Check-out date must be after check-in date');
  }

  let room = null;
  let overlappingBookings = [];

  if (isDBConnected()) {
    room = await Room.findById(roomId);
    if (!room || !room.isActive) {
      throw new Error('Room not found or currently unavailable');
    }

    const query = {
      room: roomId,
      bookingStatus: { $ne: 'cancelled' },
      checkIn: { $lt: checkOut },
      checkOut: { $gt: checkIn }
    };

    if (excludeBookingId) {
      query._id = { $ne: excludeBookingId };
    }

    overlappingBookings = await Booking.find(query).select('roomCount');
  } else {
    // In-Memory Mode
    room = memStore.rooms.find(r => (r._id || r.id).toString() === roomId.toString());
    if (!room || !room.isActive) {
      throw new Error('Room not found or currently unavailable');
    }

    overlappingBookings = memStore.bookings.filter(b => {
      if ((b.room._id || b.room || b.roomId).toString() !== roomId.toString()) return false;
      if (b.bookingStatus === 'cancelled') return false;
      if (excludeBookingId && (b._id || b.id).toString() === excludeBookingId.toString()) return false;

      const bIn = new Date(b.checkIn);
      const bOut = new Date(b.checkOut);
      // Half-open interval overlap: existing.checkIn < requested.checkOut && existing.checkOut > requested.checkIn
      return bIn < checkOut && bOut > checkIn;
    });
  }

  const currentlyBooked = overlappingBookings.reduce(
    (total, b) => total + (b.roomCount || 1),
    0
  );

  const availableRooms = Math.max(0, room.totalInventory - currentlyBooked);
  const isAvailable = availableRooms >= requestedRoomCount;

  return {
    isAvailable,
    availableRooms,
    totalInventory: room.totalInventory,
    pricePerNight: room.pricePerNight,
    room
  };
};

/**
 * Calculate pricing on server side based on trusted room price and stay duration
 */
export const calculateBookingPrice = (pricePerNight, checkInDate, checkOutDate, roomCount = 1) => {
  const checkIn = new Date(checkInDate);
  const checkOut = new Date(checkOutDate);

  const msPerDay = 1000 * 60 * 60 * 24;
  const nights = Math.max(1, Math.round((checkOut.getTime() - checkIn.getTime()) / msPerDay));

  const subtotal = pricePerNight * nights * roomCount;
  const taxAndFees = Math.round(subtotal * 0.12); // 12% standard hospitality tax
  const totalAmount = subtotal + taxAndFees;

  return {
    nights,
    pricePerNight,
    roomCount,
    subtotal,
    taxAndFees,
    discount: 0,
    totalAmount
  };
};

/**
 * Generates a unique, human-friendly booking reference
 */
export const generateBookingReference = async () => {
  let isUnique = false;
  let reference = '';

  while (!isUnique) {
    const timestamp = Date.now().toString().slice(-5);
    const random = Math.floor(1000 + Math.random() * 9000);
    reference = `HP-${timestamp}-${random}`;

    if (isDBConnected()) {
      const existing = await Booking.findOne({ bookingReference: reference });
      if (!existing) isUnique = true;
    } else {
      const existing = memStore.bookings.find(b => b.bookingReference === reference);
      if (!existing) isUnique = true;
    }
  }

  return reference;
};
