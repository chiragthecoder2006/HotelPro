import crypto from 'crypto';
import Booking from '../models/Booking.js';
import Room from '../models/Room.js';
import Hotel from '../models/Hotel.js';
import { isDBConnected } from '../config/db.js';
import { memStore, mockId } from '../services/dbStore.js';
import {
  checkRoomAvailability,
  calculateBookingPrice,
  generateBookingReference
} from '../services/bookingService.js';

const escapeRegex = (string) => string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

export const checkAvailability = async (req, res, next) => {
  try {
    const { roomId, checkIn, checkOut, roomCount = 1 } = req.body;

    const availability = await checkRoomAvailability(
      roomId,
      checkIn,
      checkOut,
      Number(roomCount)
    );

    const pricing = calculateBookingPrice(
      availability.pricePerNight,
      checkIn,
      checkOut,
      Number(roomCount)
    );

    res.status(200).json({
      success: true,
      isAvailable: availability.isAvailable,
      availableRooms: availability.availableRooms,
      totalInventory: availability.totalInventory,
      pricing
    });
  } catch (error) {
    next(error);
  }
};

export const createBooking = async (req, res, next) => {
  try {
    const {
      hotelId,
      roomId,
      checkIn,
      checkOut,
      roomCount = 1,
      guestDetails,
      paymentMethod = 'demo_checkout',
      paymentDetails = {}
    } = req.body;

    const userId = (req.user._id || req.user.id).toString();

    // 1. Fetch room & hotel
    let room = null;
    let hotel = null;

    if (isDBConnected()) {
      room = await Room.findById(roomId);
      hotel = await Hotel.findById(hotelId);
    } else {
      room = memStore.rooms.find(r => (r._id || r.id).toString() === roomId.toString());
      hotel = memStore.hotels.find(h => (h._id || h.id).toString() === hotelId.toString());
    }

    if (!room || !room.isActive) {
      return res.status(404).json({
        success: false,
        message: 'Selected room is unavailable or does not exist.'
      });
    }

    if (!hotel || !hotel.isActive) {
      return res.status(404).json({
        success: false,
        message: 'Selected hotel is unavailable or does not exist.'
      });
    }

    // 2. Validate guest capacity
    const totalGuests = (Number(guestDetails.adults) || 1) + (Number(guestDetails.children) || 0);
    const maxAllowedGuests = room.capacity.maxGuests * Number(roomCount);
    if (totalGuests > maxAllowedGuests) {
      return res.status(400).json({
        success: false,
        message: `Maximum capacity exceeded. ${roomCount} room(s) can accommodate at most ${maxAllowedGuests} guests.`
      });
    }

    // 3. Live availability check
    const availability = await checkRoomAvailability(
      roomId,
      checkIn,
      checkOut,
      Number(roomCount)
    );

    if (!availability.isAvailable) {
      return res.status(409).json({
        success: false,
        message: `Sorry, there are only ${availability.availableRooms} room(s) available for the selected dates.`
      });
    }

    // 4. Server-side price calculation
    const pricing = calculateBookingPrice(
      room.pricePerNight,
      checkIn,
      checkOut,
      Number(roomCount)
    );

    // 5. Unique booking reference
    const bookingReference = await generateBookingReference();

    // 6. Payment status logic
    let paymentStatus = 'demo_verified';
    if (paymentMethod === 'pay_at_hotel') {
      paymentStatus = 'pending';
    } else if (process.env.RAZORPAY_KEY_SECRET && paymentDetails.razorpayPaymentId) {
      if (paymentDetails.razorpayOrderId && paymentDetails.razorpaySignature) {
        const expectedSignature = crypto
          .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
          .update(`${paymentDetails.razorpayOrderId}|${paymentDetails.razorpayPaymentId}`)
          .digest('hex');

        if (expectedSignature === paymentDetails.razorpaySignature) {
          paymentStatus = 'paid';
        } else {
          return res.status(400).json({
            success: false,
            message: 'Payment verification failed: invalid signature.'
          });
        }
      } else {
        return res.status(400).json({
          success: false,
          message: 'Payment details incomplete. Razorpay order ID and signature are required.'
        });
      }
    } else {
      paymentStatus = 'demo_verified';
    }

    if (isDBConnected()) {
      const booking = await Booking.create({
        bookingReference,
        user: userId,
        hotel: hotelId,
        room: roomId,
        checkIn: new Date(checkIn),
        checkOut: new Date(checkOut),
        nights: pricing.nights,
        roomCount: Number(roomCount),
        guestDetails: {
          primaryGuestName: guestDetails.primaryGuestName,
          email: guestDetails.email,
          phone: guestDetails.phone,
          specialRequests: guestDetails.specialRequests || '',
          adults: Number(guestDetails.adults) || 1,
          children: Number(guestDetails.children) || 0
        },
        pricing: {
          pricePerNight: pricing.pricePerNight,
          subtotal: pricing.subtotal,
          taxAndFees: pricing.taxAndFees,
          discount: 0,
          totalAmount: pricing.totalAmount
        },
        bookingStatus: 'confirmed',
        paymentStatus,
        paymentMethod,
        paymentDetails
      });

      const populatedBooking = await Booking.findById(booking._id)
        .populate('hotel', 'name slug address starRating images contact policies')
        .populate('room', 'roomType images bedConfiguration sizeSqFt');

      return res.status(201).json({
        success: true,
        message: 'Booking confirmed successfully!',
        booking: populatedBooking
      });
    }

    // In-memory mode
    const newBooking = {
      _id: mockId(),
      id: mockId(),
      bookingReference,
      user: userId,
      hotel: {
        _id: hotel._id || hotel.id,
        name: hotel.name,
        slug: hotel.slug,
        address: hotel.address,
        starRating: hotel.starRating,
        images: hotel.images,
        contact: hotel.contact,
        policies: hotel.policies
      },
      room: {
        _id: room._id || room.id,
        roomType: room.roomType,
        images: room.images,
        bedConfiguration: room.bedConfiguration,
        sizeSqFt: room.sizeSqFt
      },
      checkIn: new Date(checkIn),
      checkOut: new Date(checkOut),
      nights: pricing.nights,
      roomCount: Number(roomCount),
      guestDetails: {
        primaryGuestName: guestDetails.primaryGuestName,
        email: guestDetails.email,
        phone: guestDetails.phone,
        specialRequests: guestDetails.specialRequests || '',
        adults: Number(guestDetails.adults) || 1,
        children: Number(guestDetails.children) || 0
      },
      pricing: {
        pricePerNight: pricing.pricePerNight,
        subtotal: pricing.subtotal,
        taxAndFees: pricing.taxAndFees,
        discount: 0,
        totalAmount: pricing.totalAmount
      },
      bookingStatus: 'confirmed',
      paymentStatus,
      paymentMethod,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    memStore.bookings.unshift(newBooking);

    res.status(201).json({
      success: true,
      message: 'Booking confirmed successfully!',
      booking: newBooking
    });
  } catch (error) {
    next(error);
  }
};

export const getMyBookings = async (req, res, next) => {
  try {
    const userId = (req.user._id || req.user.id).toString();

    if (isDBConnected()) {
      const bookings = await Booking.find({ user: userId })
        .populate('hotel', 'name slug address starRating images contact')
        .populate('room', 'roomType images bedConfiguration')
        .sort({ createdAt: -1 });

      return res.status(200).json({ success: true, count: bookings.length, bookings });
    }

    // In-memory
    const bookings = memStore.bookings
      .filter(b => (b.user._id || b.user || b.userId).toString() === userId)
      .map(b => {
        let hotel = b.hotel;
        let room = b.room;
        if (typeof hotel === 'string') {
          hotel = memStore.hotels.find(h => (h._id || h.id).toString() === hotel.toString());
        }
        if (typeof room === 'string') {
          room = memStore.rooms.find(r => (r._id || r.id).toString() === room.toString());
        }
        return { ...b, hotel, room };
      })
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    res.status(200).json({ success: true, count: bookings.length, bookings });
  } catch (error) {
    next(error);
  }
};

export const getBookingByReference = async (req, res, next) => {
  try {
    const { reference } = req.params;
    const userId = (req.user._id || req.user.id).toString();

    if (isDBConnected()) {
      const booking = await Booking.findOne({ bookingReference: reference.toUpperCase() })
        .populate('hotel', 'name slug address starRating images contact policies')
        .populate('room', 'roomType images bedConfiguration amenities pricePerNight')
        .populate('user', 'name email phone');

      if (!booking) return res.status(404).json({ success: false, message: 'Booking reference not found.' });

      if (booking.user._id.toString() !== userId && req.user.role !== 'admin') {
        return res.status(403).json({ success: false, message: 'Unauthorized. You do not have permission to view this booking.' });
      }

      return res.status(200).json({ success: true, booking });
    }

    // In-memory
    const booking = memStore.bookings.find(b => b.bookingReference.toUpperCase() === reference.toUpperCase());
    if (!booking) return res.status(404).json({ success: false, message: 'Booking reference not found.' });

    const bookingUserId = (booking.user._id || booking.user || booking.userId).toString();
    if (bookingUserId !== userId && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Unauthorized. You do not have permission to view this booking.' });
    }

    let hotel = booking.hotel;
    let room = booking.room;
    if (typeof hotel === 'string') hotel = memStore.hotels.find(h => (h._id || h.id).toString() === hotel.toString());
    if (typeof room === 'string') room = memStore.rooms.find(r => (r._id || r.id).toString() === room.toString());

    res.status(200).json({ success: true, booking: { ...booking, hotel, room } });
  } catch (error) {
    next(error);
  }
};

export const cancelBooking = async (req, res, next) => {
  try {
    const { reference } = req.params;
    const { reason } = req.body;
    const userId = (req.user._id || req.user.id).toString();

    if (isDBConnected()) {
      const booking = await Booking.findOne({ bookingReference: reference.toUpperCase() });
      if (!booking) return res.status(404).json({ success: false, message: 'Booking not found.' });

      if (booking.user.toString() !== userId && req.user.role !== 'admin') {
        return res.status(403).json({ success: false, message: 'Unauthorized to cancel this reservation.' });
      }

      if (booking.bookingStatus === 'cancelled') {
        return res.status(400).json({ success: false, message: 'This booking is already cancelled.' });
      }

      if (booking.bookingStatus === 'completed') {
        return res.status(400).json({ success: false, message: 'Completed stays cannot be cancelled.' });
      }

      const checkInTime = new Date(booking.checkIn).getTime();
      if (checkInTime < Date.now() && req.user.role !== 'admin') {
        return res.status(400).json({
          success: false,
          message: 'Cannot cancel a reservation on or after the scheduled arrival date.'
        });
      }

      booking.bookingStatus = 'cancelled';
      booking.cancellationReason = reason || 'Cancelled by guest';
      booking.cancelledAt = new Date();
      if (booking.paymentStatus === 'paid') booking.paymentStatus = 'refunded';

      await booking.save();
      return res.status(200).json({ success: true, message: 'Booking cancelled successfully. Inventory released.', booking });
    }

    // In-memory
    const booking = memStore.bookings.find(b => b.bookingReference.toUpperCase() === reference.toUpperCase());
    if (!booking) return res.status(404).json({ success: false, message: 'Booking not found.' });

    const bookingUserId = (booking.user._id || booking.user || booking.userId).toString();
    if (bookingUserId !== userId && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Unauthorized to cancel this reservation.' });
    }

    if (booking.bookingStatus === 'cancelled') {
      return res.status(400).json({ success: false, message: 'This booking is already cancelled.' });
    }

    if (booking.bookingStatus === 'completed') {
      return res.status(400).json({ success: false, message: 'Completed stays cannot be cancelled.' });
    }

    const memCheckInTime = new Date(booking.checkIn).getTime();
    if (memCheckInTime < Date.now() && req.user.role !== 'admin') {
      return res.status(400).json({
        success: false,
        message: 'Cannot cancel a reservation on or after the scheduled arrival date.'
      });
    }

    booking.bookingStatus = 'cancelled';
    booking.cancellationReason = reason || 'Cancelled by guest';
    booking.cancelledAt = new Date();
    if (booking.paymentStatus === 'paid') booking.paymentStatus = 'refunded';

    res.status(200).json({ success: true, message: 'Booking cancelled successfully. Inventory released.', booking });
  } catch (error) {
    next(error);
  }
};

export const getAllBookings = async (req, res, next) => {
  try {
    const { status, search, page = 1, limit = 20 } = req.query;

    if (isDBConnected()) {
      const query = {};
      if (status && status !== 'all') query.bookingStatus = status;
      if (search) {
        const searchRegex = new RegExp(escapeRegex(search.trim()), 'i');
        query.$or = [
          { bookingReference: searchRegex },
          { 'guestDetails.primaryGuestName': searchRegex },
          { 'guestDetails.email': searchRegex }
        ];
      }

      const skip = (Number(page) - 1) * Number(limit);
      const bookings = await Booking.find(query)
        .populate('hotel', 'name address')
        .populate('room', 'roomType pricePerNight')
        .populate('user', 'name email')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Number(limit));

      const total = await Booking.countDocuments(query);

      return res.status(200).json({
        success: true,
        count: bookings.length,
        total,
        page: Number(page),
        pages: Math.ceil(total / Number(limit)),
        bookings
      });
    }

    // In-memory
    let list = memStore.bookings.map(b => {
      let hotel = b.hotel;
      let room = b.room;
      let user = b.user;
      if (typeof hotel === 'string') hotel = memStore.hotels.find(h => (h._id || h.id).toString() === hotel.toString());
      if (typeof room === 'string') room = memStore.rooms.find(r => (r._id || r.id).toString() === room.toString());
      if (typeof user === 'string') user = memStore.users.find(u => (u._id || u.id).toString() === user.toString());
      return { ...b, hotel, room, user };
    });

    if (status && status !== 'all') {
      list = list.filter(b => b.bookingStatus === status);
    }

    if (search) {
      const q = search.toLowerCase().trim();
      list = list.filter(
        b =>
          b.bookingReference.toLowerCase().includes(q) ||
          b.guestDetails.primaryGuestName.toLowerCase().includes(q) ||
          b.guestDetails.email.toLowerCase().includes(q)
      );
    }

    res.status(200).json({
      success: true,
      count: list.length,
      total: list.length,
      page: 1,
      pages: 1,
      bookings: list
    });
  } catch (error) {
    next(error);
  }
};

export const updateBookingStatus = async (req, res, next) => {
  try {
    const { status, paymentStatus } = req.body;
    const { id } = req.params;

    if (isDBConnected()) {
      const booking = await Booking.findById(id);
      if (!booking) return res.status(404).json({ success: false, message: 'Booking not found' });

      if (status) booking.bookingStatus = status;
      if (paymentStatus) booking.paymentStatus = paymentStatus;
      if (status === 'cancelled' && !booking.cancelledAt) {
        booking.cancelledAt = new Date();
        booking.cancellationReason = 'Cancelled by Administrator';
      }

      await booking.save();
      return res.status(200).json({ success: true, message: 'Booking updated successfully', booking });
    }

    // In-memory
    const booking = memStore.bookings.find(b => (b._id || b.id).toString() === id.toString() || b.bookingReference === id);
    if (!booking) return res.status(404).json({ success: false, message: 'Booking not found' });

    if (status) booking.bookingStatus = status;
    if (paymentStatus) booking.paymentStatus = paymentStatus;
    if (status === 'cancelled' && !booking.cancelledAt) {
      booking.cancelledAt = new Date();
      booking.cancellationReason = 'Cancelled by Administrator';
    }

    res.status(200).json({ success: true, message: 'Booking updated successfully', booking });
  } catch (error) {
    next(error);
  }
};
