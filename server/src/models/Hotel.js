import mongoose from 'mongoose';

const hotelSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Hotel name is required'],
      trim: true,
      maxlength: [120, 'Hotel name cannot exceed 120 characters']
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true
    },
    tagline: {
      type: String,
      trim: true,
      default: ''
    },
    description: {
      type: String,
      required: [true, 'Hotel description is required'],
      trim: true
    },
    address: {
      street: { type: String, default: '' },
      city: { type: String, required: [true, 'City is required'], trim: true },
      state: { type: String, default: '' },
      country: { type: String, default: 'India' },
      zipCode: { type: String, default: '' }
    },
    starRating: {
      type: Number,
      min: 1,
      max: 5,
      default: 4
    },
    images: {
      type: [String],
      default: [
        'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1200&q=80'
      ]
    },
    amenities: {
      type: [String],
      default: [
        'Free High-speed Wi-Fi',
        'Swimming Pool',
        'Spa & Wellness',
        'Fine Dining Restaurant',
        'Fitness Center',
        '24/7 Concierge',
        'Valet Parking'
      ]
    },
    contact: {
      phone: { type: String, default: '+91 98765 43210' },
      email: { type: String, default: 'reservations@hotelpro.com' },
      website: { type: String, default: '' }
    },
    policies: {
      checkInTime: { type: String, default: '14:00' },
      checkOutTime: { type: String, default: '11:00' },
      cancellationPolicy: {
        type: String,
        default: 'Free cancellation up to 48 hours prior to arrival.'
      }
    },
    featured: {
      type: Boolean,
      default: false
    },
    isActive: {
      type: Boolean,
      default: true
    }
  },
  {
    timestamps: true
  }
);

hotelSchema.index({ name: 'text', description: 'text', 'address.city': 'text' });
hotelSchema.index({ 'address.city': 1, isActive: 1 });

const Hotel = mongoose.model('Hotel', hotelSchema);
export default Hotel;

