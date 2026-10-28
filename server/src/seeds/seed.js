import dotenv from 'dotenv';
dotenv.config();

import mongoose from 'mongoose';
import User from '../models/User.js';
import Hotel from '../models/Hotel.js';
import Room from '../models/Room.js';
import Booking from '../models/Booking.js';
import { connectDB } from '../config/db.js';

export const runSeed = async () => {
  console.log('🌱 Starting HotelPro Safe Seed...');

  const conn = await connectDB();
  if (!conn) {
    console.error('Cannot run seed without a database connection.');
    return;
  }

  try {
    // 1. Clear existing seed data safely
    await Booking.deleteMany({});
    await Room.deleteMany({});
    await Hotel.deleteMany({});
    await User.deleteMany({});

    console.log('🧹 Cleaned existing development collections.');

    // 2. Seed Users
    const adminEmail = (process.env.ADMIN_EMAIL || 'admin@hotelpro.com').toLowerCase();
    const adminPassword = process.env.ADMIN_PASSWORD || 'AdminPassword123!';
    const demoEmail = (process.env.DEMO_USER_EMAIL || 'jane@example.com').toLowerCase();
    const demoPassword = process.env.DEMO_USER_PASSWORD || 'UserPassword123!';

    const adminUser = await User.create({
      name: process.env.ADMIN_NAME || 'System Administrator',
      email: adminEmail,
      password: adminPassword,
      role: 'admin',
      phone: '+91 98765 00001',
      accountStatus: 'active'
    });

    const demoUser = await User.create({
      name: process.env.DEMO_USER_NAME || 'Jane Doe',
      email: demoEmail,
      password: demoPassword,
      role: 'customer',
      phone: '+91 98765 00002',
      accountStatus: 'active'
    });

    console.log(`👤 Created Admin (${adminEmail}) and Demo User (${demoEmail})`);

    // 3. Seed Hotels
    const hotelsData = [
      {
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
        images: [
          'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1200&q=80',
          'https://images.unsplash.com/photo-1582719508461-905c673771fd?auto=format&fit=crop&w=1200&q=80',
          'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=1200&q=80'
        ],
        amenities: [
          'Free High-speed Wi-Fi',
          'Arabian Sea Facing Pool',
          'Luxury Ayurvedic Spa',
          'Fine Dining Rooftop Lounge',
          '24/7 Concierge & Butler',
          'Valet Parking',
          'State-of-the-art Gym',
          'Airport Limousine Transfer'
        ],
        contact: {
          phone: '+91 22 6600 1122',
          email: 'grandpalace@hotelpro.com',
          website: 'https://hotelpro.com/hotels/grand-palace'
        },
        policies: {
          checkInTime: '14:00',
          checkOutTime: '11:00',
          cancellationPolicy: 'Free cancellation up to 48 hours before check-in.'
        }
      },
      {
        name: 'Azure Bay Sands Resort & Spa',
        slug: 'azure-bay-sands-resort-spa',
        tagline: 'Boutique Tropical Paradise on Golden Shorelines',
        description: 'Nestled directly on pristine white sands of North Goa, Azure Bay offers private beach access, infinity lagoons, sunset cabanas, and world-class seafood dining under swaying palm fronds.',
        address: {
          street: 'Calangute Beach Road',
          city: 'Goa',
          state: 'Goa',
          country: 'India',
          zipCode: '403516'
        },
        starRating: 5,
        featured: true,
        images: [
          'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?auto=format&fit=crop&w=1200&q=80',
          'https://images.unsplash.com/photo-1571896349842-33c89424de2d?auto=format&fit=crop&w=1200&q=80',
          'https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=1200&q=80'
        ],
        amenities: [
          'Free High-speed Wi-Fi',
          'Private Beach Front',
          'Infinity Lagoon Pool',
          'Sunset Cocktail Bar',
          'Full-Service Wellness Spa',
          'Water Sports Activity Desk',
          'Complimentary Breakfast Buffet'
        ],
        contact: {
          phone: '+91 832 245 9900',
          email: 'azurebay@hotelpro.com',
          website: 'https://hotelpro.com/hotels/azure-bay'
        },
        policies: {
          checkInTime: '15:00',
          checkOutTime: '12:00',
          cancellationPolicy: 'Free cancellation up to 72 hours before check-in.'
        }
      },
      {
        name: 'Royal Haveli Heritage Palace',
        slug: 'royal-haveli-heritage-palace',
        tagline: 'Step Into the Splendor of Royal Rajasthan',
        description: 'A restored 18th-century Rajput palace boasting hand-painted frescos, sprawling courtyard fountains, traditional folk performances, and regal accommodations fit for royalty.',
        address: {
          street: 'Amber Fort Road, Civil Lines',
          city: 'Jaipur',
          state: 'Rajasthan',
          country: 'India',
          zipCode: '302006'
        },
        starRating: 5,
        featured: true,
        images: [
          'https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=1200&q=80',
          'https://images.unsplash.com/photo-1578683010236-d716f9a3f461?auto=format&fit=crop&w=1200&q=80'
        ],
        amenities: [
          'Free High-speed Wi-Fi',
          'Marble Courtyard Pool',
          'Heritage Royal Dining',
          'Cultural Folk Dance Nights',
          'Camel Safari Booking',
          'Ayurvedic Massage Pavilion',
          'Complimentary High Tea'
        ],
        contact: {
          phone: '+91 141 234 5678',
          email: 'royalhaveli@hotelpro.com',
          website: 'https://hotelpro.com/hotels/royal-haveli'
        },
        policies: {
          checkInTime: '14:00',
          checkOutTime: '11:00',
          cancellationPolicy: 'Free cancellation up to 48 hours before check-in.'
        }
      },
      {
        name: 'Lakeview Serenades Palace',
        slug: 'lakeview-serenades-palace',
        tagline: 'Floating Glamour on Lake Pichola',
        description: 'Surrounded by the shimmering waters of Lake Pichola and the Aravalli hills, this magical island sanctuary features private boat arrivals, candlelit dinners, and serene marble terraces.',
        address: {
          street: 'Pichola Island Promenade',
          city: 'Udaipur',
          state: 'Rajasthan',
          country: 'India',
          zipCode: '313001'
        },
        starRating: 5,
        featured: false,
        images: [
          'https://images.unsplash.com/photo-1566665797739-1674de7a421a?auto=format&fit=crop&w=1200&q=80',
          'https://images.unsplash.com/photo-1618773928121-c32242e63f39?auto=format&fit=crop&w=1200&q=80'
        ],
        amenities: [
          'Free High-speed Wi-Fi',
          'Lake Pichola Private Boat Ride',
          'Heated Infinity Pool',
          'Royal Spa Treatments',
          'Floating Candlelit Dining',
          '24/7 Personal Butler'
        ],
        contact: {
          phone: '+91 294 242 8800',
          email: 'lakeview@hotelpro.com',
          website: 'https://hotelpro.com/hotels/lakeview-serenades'
        },
        policies: {
          checkInTime: '14:00',
          checkOutTime: '11:00',
          cancellationPolicy: 'Free cancellation up to 48 hours before check-in.'
        }
      },
      {
        name: 'Whispering Pines Highland Resort',
        slug: 'whispering-pines-highland-resort',
        tagline: 'Misty Tea Gardens & Mountain Elegance',
        description: 'Immerse yourself in lush rolling tea plantations and cool mountain breezes in the high ranges of Munnar. Enjoy private fireplaces, organic farm cuisine, and guided nature walks.',
        address: {
          street: 'Devikulam Hills Road',
          city: 'Munnar',
          state: 'Kerala',
          country: 'India',
          zipCode: '685613'
        },
        starRating: 4,
        featured: false,
        images: [
          'https://images.unsplash.com/photo-1587985064135-0366536eab42?auto=format&fit=crop&w=1200&q=80',
          'https://images.unsplash.com/photo-1611892440504-42a792e24d32?auto=format&fit=crop&w=1200&q=80'
        ],
        amenities: [
          'Free High-speed Wi-Fi',
          'Organic Garden Restaurant',
          'Tea Tasting & Plantation Tours',
          'Cozy Fireplace in Every Suite',
          'Mountain Trekking Guides',
          'Heated Indoor Jacuzzi'
        ],
        contact: {
          phone: '+91 4865 230 400',
          email: 'whisperingpines@hotelpro.com',
          website: 'https://hotelpro.com/hotels/whispering-pines'
        },
        policies: {
          checkInTime: '13:00',
          checkOutTime: '10:30',
          cancellationPolicy: 'Free cancellation up to 24 hours before check-in.'
        }
      }
    ];

    const createdHotels = await Hotel.insertMany(hotelsData);
    console.log(`🏨 Seeded ${createdHotels.length} Luxury Hotels.`);

    // 4. Seed Rooms for each hotel
    const roomsToInsert = [];

    createdHotels.forEach((hotel) => {
      // Room 1: Deluxe Suite
      roomsToInsert.push({
        hotel: hotel._id,
        roomType: 'Deluxe King Suite',
        roomNumber: '101',
        description: 'Spacious signature suite featuring a king-size plush bed, marble bathroom with rain shower, and floor-to-ceiling panoramic views.',
        images: [
          'https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=1000&q=80',
          'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=1000&q=80'
        ],
        capacity: { maxGuests: 3, adults: 2, children: 1 },
        bedConfiguration: '1 King Bed',
        sizeSqFt: 450,
        amenities: ['Air Conditioning', 'Ensuite Rain Shower', 'Smart 55" 4K TV', 'Nespresso Coffee Machine', 'High-Speed Wi-Fi', 'Safe Deposit Box'],
        pricePerNight: hotel.starRating === 5 ? 7500 : 4200,
        totalInventory: 8,
        isActive: true
      });

      // Room 2: Executive Ocean / View Suite
      roomsToInsert.push({
        hotel: hotel._id,
        roomType: 'Executive View Suite with Balcony',
        roomNumber: '201',
        description: 'Elevated luxury with an expansive private balcony, walk-in dressing wardrobe, freestanding soaking tub, and lounge sitting area.',
        images: [
          'https://images.unsplash.com/photo-1618773928121-c32242e63f39?auto=format&fit=crop&w=1000&q=80',
          'https://images.unsplash.com/photo-1566665797739-1674de7a421a?auto=format&fit=crop&w=1000&q=80'
        ],
        capacity: { maxGuests: 4, adults: 3, children: 1 },
        bedConfiguration: '1 King Bed + 1 Daybed',
        sizeSqFt: 620,
        amenities: ['Private Balcony', 'Deep Soaking Tub', 'Complimentary Minibar', 'Pillow Menu', 'Executive Lounge Access', '24/7 In-Room Dining'],
        pricePerNight: hotel.starRating === 5 ? 12000 : 6800,
        totalInventory: 5,
        isActive: true
      });

      // Room 3: Superior Twin Room
      roomsToInsert.push({
        hotel: hotel._id,
        roomType: 'Superior Twin Room',
        roomNumber: '301',
        description: 'Ideal for friends or business colleagues, featuring two twin posturepedic beds, ergonomic work desk, and bright contemporary decor.',
        images: [
          'https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?auto=format&fit=crop&w=1000&q=80'
        ],
        capacity: { maxGuests: 2, adults: 2, children: 0 },
        bedConfiguration: '2 Single Twin Beds',
        sizeSqFt: 380,
        amenities: ['Ergonomic Work Desk', 'High-speed Wi-Fi', 'Coffee/Tea Station', 'Air Conditioning', 'Electronic Safe'],
        pricePerNight: hotel.starRating === 5 ? 5800 : 3500,
        totalInventory: 6,
        isActive: true
      });
    });

    const createdRooms = await Room.insertMany(roomsToInsert);
    console.log(`🛏️ Seeded ${createdRooms.length} Hotel Rooms across all properties.`);

    // 5. Seed 2 initial demonstration bookings for Demo User Jane Doe
    const sampleHotel = createdHotels[0];
    const sampleRoom = createdRooms[0];

    // Upcoming booking for next month
    const checkInDate = new Date();
    checkInDate.setDate(checkInDate.getDate() + 7);
    const checkOutDate = new Date();
    checkOutDate.setDate(checkOutDate.getDate() + 10); // 3 nights

    await Booking.create({
      bookingReference: 'HP-DEMO-7721',
      user: demoUser._id,
      hotel: sampleHotel._id,
      room: sampleRoom._id,
      checkIn: checkInDate,
      checkOut: checkOutDate,
      nights: 3,
      roomCount: 1,
      guestDetails: {
        primaryGuestName: 'Jane Doe',
        email: demoEmail,
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
      paymentMethod: 'demo_checkout'
    });

    // Past completed booking
    const pastCheckIn = new Date();
    pastCheckIn.setDate(pastCheckIn.getDate() - 20);
    const pastCheckOut = new Date();
    pastCheckOut.setDate(pastCheckOut.getDate() - 17);

    await Booking.create({
      bookingReference: 'HP-PAST-1092',
      user: demoUser._id,
      hotel: createdHotels[1]._id,
      room: createdRooms[3]._id,
      checkIn: pastCheckIn,
      checkOut: pastCheckOut,
      nights: 3,
      roomCount: 1,
      guestDetails: {
        primaryGuestName: 'Jane Doe',
        email: demoEmail,
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
      paymentMethod: 'demo_checkout'
    });

    console.log('📑 Seeded 2 demo customer bookings (1 upcoming confirmed, 1 past completed).');
    console.log('✅ Seed complete successfully!');
  } catch (err) {
    console.error('❌ Error during database seed:', err);
  } finally {
    if (mongoose.connection.readyState !== 0) {
      await mongoose.disconnect();
    }
  }
};

// Run directly if invoked from CLI
if (process.argv[1] && process.argv[1].endsWith('seed.js')) {
  runSeed().then(() => process.exit(0)).catch((err) => {
    console.error(err);
    process.exit(1);
  });
}

