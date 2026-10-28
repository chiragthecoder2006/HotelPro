import mongoose from 'mongoose';

const roomSchema = new mongoose.Schema(
  {
    hotel: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Hotel',
      required: [true, 'Hotel reference is required'],
      index: true
    },
    roomType: {
      type: String,
      required: [true, 'Room type is required'],
      trim: true
    },
    roomNumber: {
      type: String,
      trim: true,
      default: ''
    },
    description: {
      type: String,
      trim: true,
      default: ''
    },
    images: {
      type: [String],
      default: [
        'https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=1000&q=80'
      ]
    },
    capacity: {
      maxGuests: { type: Number, required: true, default: 2 },
      adults: { type: Number, required: true, default: 2 },
      children: { type: Number, default: 1 }
    },
    bedConfiguration: {
      type: String,
      default: '1 King Bed'
    },
    sizeSqFt: {
      type: Number,
      default: 350
    },
    amenities: {
      type: [String],
      default: [
        'Air Conditioning',
        'Private Balcony',
        'Smart Flat-screen TV',
        'Complimentary Wi-Fi',
        'Mini-bar & Coffee Maker',
        'Ensuite Luxury Bathroom',
        'In-room Safe'
      ]
    },
    pricePerNight: {
      type: Number,
      required: [true, 'Price per night is required'],
      min: [0, 'Price must be positive']
    },
    totalInventory: {
      type: Number,
      required: true,
      default: 5,
      min: [1, 'Must have at least 1 room in inventory']
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

roomSchema.index({ hotel: 1, isActive: 1 });
roomSchema.index({ pricePerNight: 1 });

const Room = mongoose.model('Room', roomSchema);
export default Room;

