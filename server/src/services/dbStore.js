import bcrypt from 'bcryptjs';
import { isDBConnected } from '../config/db.js';
import User from '../models/User.js';
import Hotel from '../models/Hotel.js';
import Room from '../models/Room.js';
import Booking from '../models/Booking.js';

// In-memory mock storage for zero-dependency standalone demo execution
export const memStore = {
  users: [],
  hotels: [],
  rooms: [],
  bookings: [],
  initialized: false
};

// Generate realistic ObjectId string
export const mockId = () => {
  return '507f1f77bcf86cd7994390' + Math.floor(10 + Math.random() * 89);
};

// Initialize in-memory data with the exact seed dataset
export const initMemoryStore = async () => {
  if (memStore.initialized) return;

  const adminPassword = await bcrypt.hash('AdminPassword123!', 10);
  const demoPassword = await bcrypt.hash('UserPassword123!', 10);

  const adminId = '65432177bcf86cd799439001';
  const demoId = '65432177bcf86cd799439002';

  memStore.users = [
    {
      _id: adminId,
      id: adminId,
      name: 'System Administrator',
      email: 'admin@hotelpro.com',
      password: adminPassword,
      role: 'admin',
      phone: '+91 98765 00001',
      accountStatus: 'active',
      createdAt: new Date(),
      updatedAt: new Date(),
      comparePassword: async function (candidate) {
        return bcrypt.compare(candidate, this.password);
      }
    },
    {
      _id: demoId,
      id: demoId,
      name: 'Jane Doe',
      email: 'jane@example.com',
      password: demoPassword,
      role: 'customer',
      phone: '+91 98765 00002',
      accountStatus: 'active',
      createdAt: new Date(),
      updatedAt: new Date(),
      comparePassword: async function (candidate) {
        return bcrypt.compare(candidate, this.password);
      }
    }
  ];

  const hotel1Id = '65432177bcf86cd799439011';
  const hotel2Id = '65432177bcf86cd799439012';
  const hotel3Id = '65432177bcf86cd799439013';
  const hotel4Id = '65432177bcf86cd799439014';
  const hotel5Id = '65432177bcf86cd799439015';

  memStore.hotels = [
    {
      _id: hotel1Id,
      id: hotel1Id,
      name: 'The Grand Palace Marine Drive',
      slug: 'the-grand-palace-marine-drive',
      tagline: 'Timeless Victorian Luxury Overlooking the Arabian Sea',
      description: 'An iconic 5-star oceanfront sanctuary on Mumbai’s famed Marine Drive. Offering sweeping Arabian Sea views, bespoke butler service, Michelin-starred culinary dining, and opulent Art Deco interiors.',
      address: {
        street: '124 Marine Drive, Nariman Point',
        city: 'Mumbai',
        state: 'Maharashtra',
        country: 'India',
        zipCode: '400021'
      },
      starRating: 5,
      featured: true,
      isActive: true,
      images: [
        'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1200&q=80',
        'https://images.unsplash.com/photo-1582719508461-905c673771fd?auto=format&fit=crop&w=1200&q=80'
      ],
      amenities: ['Free High-speed Wi-Fi', 'Arabian Sea Facing Pool', 'Luxury Ayurvedic Spa', 'Fine Dining Rooftop Lounge', '24/7 Concierge & Butler', 'Valet Parking', 'Gym'],
      contact: { phone: '+91 22 6600 1122', email: 'grandpalace@hotelpro.com', website: '' },
      policies: { checkInTime: '14:00', checkOutTime: '11:00', cancellationPolicy: 'Free cancellation up to 48 hours before check-in.' },
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      _id: hotel2Id,
      id: hotel2Id,
      name: 'Azure Bay Sands Resort & Spa',
      slug: 'azure-bay-sands-resort-spa',
      tagline: 'Boutique Tropical Paradise on Golden Shorelines',
      description: 'Nestled directly on pristine white sands of North Goa, Azure Bay offers private beach access, infinity lagoons, sunset cabanas, and world-class seafood dining.',
      address: {
        street: 'Calangute Beach Road',
        city: 'Goa',
        state: 'Goa',
        country: 'India',
        zipCode: '403516'
      },
      starRating: 5,
      featured: true,
      isActive: true,
      images: [
        'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?auto=format&fit=crop&w=1200&q=80',
        'https://images.unsplash.com/photo-1571896349842-33c89424de2d?auto=format&fit=crop&w=1200&q=80'
      ],
      amenities: ['Free High-speed Wi-Fi', 'Private Beach Front', 'Infinity Lagoon Pool', 'Sunset Cocktail Bar', 'Wellness Spa', 'Complimentary Breakfast Buffet'],
      contact: { phone: '+91 832 245 9900', email: 'azurebay@hotelpro.com', website: '' },
      policies: { checkInTime: '15:00', checkOutTime: '12:00', cancellationPolicy: 'Free cancellation up to 72 hours before check-in.' },
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      _id: hotel3Id,
      id: hotel3Id,
      name: 'Royal Haveli Heritage Palace',
      slug: 'royal-haveli-heritage-palace',
      tagline: 'Step Into the Splendor of Royal Rajasthan',
      description: 'A restored 18th-century Rajput palace boasting hand-painted frescos, sprawling courtyard fountains, traditional folk performances, and regal accommodations.',
      address: {
        street: 'Amber Fort Road, Civil Lines',
        city: 'Jaipur',
        state: 'Rajasthan',
        country: 'India',
        zipCode: '302006'
      },
      starRating: 5,
      featured: true,
      isActive: true,
      images: [
        'https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=1200&q=80',
        'https://images.unsplash.com/photo-1578683010236-d716f9a3f461?auto=format&fit=crop&w=1200&q=80'
      ],
      amenities: ['Free High-speed Wi-Fi', 'Marble Courtyard Pool', 'Heritage Royal Dining', 'Cultural Folk Dance', 'Ayurvedic Massage Pavilion'],
      contact: { phone: '+91 141 234 5678', email: 'royalhaveli@hotelpro.com', website: '' },
      policies: { checkInTime: '14:00', checkOutTime: '11:00', cancellationPolicy: 'Free cancellation up to 48 hours before check-in.' },
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      _id: hotel4Id,
      id: hotel4Id,
      name: 'Lakeview Serenades Palace',
      slug: 'lakeview-serenades-palace',
      tagline: 'Floating Glamour on Lake Pichola',
      description: 'Surrounded by the shimmering waters of Lake Pichola and the Aravalli hills, this magical island sanctuary features private boat arrivals and candlelit dinners.',
      address: {
        street: 'Pichola Island Promenade',
        city: 'Udaipur',
        state: 'Rajasthan',
        country: 'India',
        zipCode: '313001'
      },
      starRating: 5,
      featured: false,
      isActive: true,
      images: [
        'https://images.unsplash.com/photo-1566665797739-1674de7a421a?auto=format&fit=crop&w=1200&q=80'
      ],
      amenities: ['Free High-speed Wi-Fi', 'Lake Pichola Private Boat Ride', 'Heated Infinity Pool', 'Royal Spa Treatments', 'Floating Dining'],
      contact: { phone: '+91 294 242 8800', email: 'lakeview@hotelpro.com', website: '' },
      policies: { checkInTime: '14:00', checkOutTime: '11:00', cancellationPolicy: 'Free cancellation up to 48 hours before check-in.' },
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      _id: hotel5Id,
      id: hotel5Id,
      name: 'Whispering Pines Highland Resort',
      slug: 'whispering-pines-highland-resort',
      tagline: 'Misty Tea Gardens & Mountain Elegance',
      description: 'Immerse yourself in lush rolling tea plantations and cool mountain breezes in the high ranges of Munnar. Enjoy private fireplaces and organic cuisine.',
      address: {
        street: 'Devikulam Hills Road',
        city: 'Munnar',
        state: 'Kerala',
        country: 'India',
        zipCode: '685613'
      },
      starRating: 4,
      featured: false,
      isActive: true,
      images: [
        'https://images.unsplash.com/photo-1587985064135-0366536eab42?auto=format&fit=crop&w=1200&q=80'
      ],
      amenities: ['Free High-speed Wi-Fi', 'Organic Garden Restaurant', 'Tea Plantation Tours', 'Fireplace in Every Suite', 'Indoor Jacuzzi'],
      contact: { phone: '+91 4865 230 400', email: 'whisperingpines@hotelpro.com', website: '' },
      policies: { checkInTime: '13:00', checkOutTime: '10:30', cancellationPolicy: 'Free cancellation up to 24 hours before check-in.' },
      createdAt: new Date(),
      updatedAt: new Date()
    }
  ];

  // Seed Rooms
  const roomTypes = [
    {
      type: 'Deluxe King Suite',
      price: 7500,
      cap: { maxGuests: 3, adults: 2, children: 1 },
      bed: '1 King Bed',
      sqft: 450,
      img: 'https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=1000&q=80',
      inv: 8
    },
    {
      type: 'Executive View Suite with Balcony',
      price: 12000,
      cap: { maxGuests: 4, adults: 3, children: 1 },
      bed: '1 King Bed + 1 Daybed',
      sqft: 620,
      img: 'https://images.unsplash.com/photo-1618773928121-c32242e63f39?auto=format&fit=crop&w=1000&q=80',
      inv: 5
    },
    {
      type: 'Superior Twin Room',
      price: 4800,
      cap: { maxGuests: 2, adults: 2, children: 0 },
      bed: '2 Single Twin Beds',
      sqft: 380,
      img: 'https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?auto=format&fit=crop&w=1000&q=80',
      inv: 6
    }
  ];

  let roomCounter = 100;
  memStore.rooms = [];
  memStore.hotels.forEach(hotel => {
    roomTypes.forEach(rt => {
      const rId = '65432177bcf86cd7994390' + (roomCounter++);
      memStore.rooms.push({
        _id: rId,
        id: rId,
        hotel: hotel._id,
        roomType: rt.type,
        roomNumber: 'R-' + (roomCounter),
        description: `Luxurious ${rt.type} at ${hotel.name} featuring premium furnishings and bespoke amenities.`,
        images: [rt.img],
        capacity: rt.cap,
        bedConfiguration: rt.bed,
        sizeSqFt: rt.sqft,
        amenities: ['Air Conditioning', 'High-Speed Wi-Fi', 'Smart TV', 'Coffee Station', 'Luxury Toiletries', 'In-room Safe'],
        pricePerNight: hotel.starRating === 5 ? rt.price : Math.round(rt.price * 0.7),
        totalInventory: rt.inv,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      });
    });
  });

  // Seed sample initial bookings
  const sampleRoom = memStore.rooms[0];
  const sampleHotel = memStore.hotels[0];

  const futureCheckIn = new Date();
  futureCheckIn.setDate(futureCheckIn.getDate() + 7);
  const futureCheckOut = new Date();
  futureCheckOut.setDate(futureCheckOut.getDate() + 10);

  const pastCheckIn = new Date();
  pastCheckIn.setDate(pastCheckIn.getDate() - 15);
  const pastCheckOut = new Date();
  pastCheckOut.setDate(pastCheckOut.getDate() - 12);

  memStore.bookings = [
    {
      _id: '65432177bcf86cd799439091',
      id: '65432177bcf86cd799439091',
      bookingReference: 'HP-DEMO-7721',
      user: demoId,
      hotel: sampleHotel._id,
      room: sampleRoom._id,
      checkIn: futureCheckIn,
      checkOut: futureCheckOut,
      nights: 3,
      roomCount: 1,
      guestDetails: {
        primaryGuestName: 'Jane Doe',
        email: 'jane@example.com',
        phone: '+91 98765 00002',
        specialRequests: 'High floor preferred, ocean view.',
        adults: 2,
        children: 0
      },
      pricing: {
        pricePerNight: sampleRoom.pricePerNight,
        subtotal: sampleRoom.pricePerNight * 3,
        taxAndFees: Math.round(sampleRoom.pricePerNight * 3 * 0.12),
        discount: 0,
        totalAmount: Math.round(sampleRoom.pricePerNight * 3 * 1.12)
      },
      bookingStatus: 'confirmed',
      paymentStatus: 'demo_verified',
      paymentMethod: 'demo_checkout',
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      _id: '65432177bcf86cd799439092',
      id: '65432177bcf86cd799439092',
      bookingReference: 'HP-PAST-1092',
      user: demoId,
      hotel: memStore.hotels[1]._id,
      room: memStore.rooms[3]._id,
      checkIn: pastCheckIn,
      checkOut: pastCheckOut,
      nights: 3,
      roomCount: 1,
      guestDetails: {
        primaryGuestName: 'Jane Doe',
        email: 'jane@example.com',
        phone: '+91 98765 00002',
        specialRequests: '',
        adults: 2,
        children: 1
      },
      pricing: {
        pricePerNight: 7500,
        subtotal: 22500,
        taxAndFees: 2700,
        discount: 0,
        totalAmount: 25200
      },
      bookingStatus: 'completed',
      paymentStatus: 'demo_verified',
      paymentMethod: 'demo_checkout',
      createdAt: new Date(Date.now() - 20 * 86400000),
      updatedAt: new Date(Date.now() - 12 * 86400000)
    }
  ];

  memStore.initialized = true;
  console.log('⚡ [HotelPro] In-Memory persistence engine initialized with complete seed data.');
};

