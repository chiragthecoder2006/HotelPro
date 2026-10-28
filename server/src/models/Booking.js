import mongoose from 'mongoose';

const bookingSchema = new mongoose.Schema(
  {
    bookingReference: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      index: true
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User reference is required'],
      index: true
    },
    hotel: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Hotel',
      required: [true, 'Hotel reference is required'],
      index: true
    },
    room: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Room',
      required: [true, 'Room reference is required'],
      index: true
    },
    checkIn: {
      type: Date,
      required: [true, 'Check-in date is required']
    },
    checkOut: {
      type: Date,
      required: [true, 'Check-out date is required']
    },
    nights: {
      type: Number,
      required: true,
      min: [1, 'Booking must be at least 1 night']
    },
    roomCount: {
      type: Number,
      required: true,
      default: 1,
      min: [1, 'Must book at least 1 room']
    },
    guestDetails: {
      primaryGuestName: { type: String, required: [true, 'Primary guest name is required'], trim: true },
      email: { type: String, required: [true, 'Guest email is required'], trim: true },
      phone: { type: String, required: [true, 'Guest phone is required'], trim: true },
      specialRequests: { type: String, default: '' },
      adults: { type: Number, default: 1, min: 1 },
      children: { type: Number, default: 0, min: 0 }
    },
    pricing: {
      pricePerNight: { type: Number, required: true },
      subtotal: { type: Number, required: true },
      taxAndFees: { type: Number, required: true },
      discount: { type: Number, default: 0 },
      totalAmount: { type: Number, required: true }
    },
    bookingStatus: {
      type: String,
      enum: ['confirmed', 'cancelled', 'completed'],
      default: 'confirmed',
      index: true
    },
    paymentStatus: {
      type: String,
      enum: ['pending', 'paid', 'demo_verified', 'refunded'],
      default: 'demo_verified'
    },
    paymentMethod: {
      type: String,
      default: 'demo_checkout'
    },
    paymentDetails: {
      razorpayOrderId: { type: String, default: '' },
      razorpayPaymentId: { type: String, default: '' },
      razorpaySignature: { type: String, default: '' }
    },
    cancellationReason: {
      type: String,
      default: ''
    },
    cancelledAt: {
      type: Date
    }
  },
  {
    timestamps: true
  }
);

bookingSchema.index({ room: 1, checkIn: 1, checkOut: 1, bookingStatus: 1 });
bookingSchema.index({ user: 1, createdAt: -1 });

const Booking = mongoose.model('Booking', bookingSchema);
export default Booking;

