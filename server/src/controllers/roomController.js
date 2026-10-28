import Room from '../models/Room.js';
import Hotel from '../models/Hotel.js';
import { isDBConnected } from '../config/db.js';
import { memStore, mockId } from '../services/dbStore.js';
import { checkRoomAvailability } from '../services/bookingService.js';

/**
 * @desc    Get all active rooms for a specific hotel, with optional date availability checking
 * @route   GET /api/rooms/hotel/:hotelId
 * @access  Public
 */
export const getRoomsByHotel = async (req, res, next) => {
  try {
    const { hotelId } = req.params;
    const { checkIn, checkOut, guests } = req.query;

    if (isDBConnected()) {
      const query = { hotel: hotelId, isActive: true };
      if (guests) query['capacity.maxGuests'] = { $gte: Number(guests) };

      const rooms = await Room.find(query).sort({ pricePerNight: 1 }).lean();

      let roomsWithAvailability = rooms;
      if (checkIn && checkOut) {
        roomsWithAvailability = await Promise.all(
          rooms.map(async (room) => {
            try {
              const avail = await checkRoomAvailability(room._id, checkIn, checkOut, 1);
              return { ...room, availableRooms: avail.availableRooms, isAvailable: avail.isAvailable };
            } catch (e) {
              return { ...room, availableRooms: room.totalInventory, isAvailable: true };
            }
          })
        );
      }

      return res.status(200).json({
        success: true,
        count: roomsWithAvailability.length,
        rooms: roomsWithAvailability
      });
    }

    // In-memory
    let rooms = memStore.rooms.filter(
      r => (r.hotel._id || r.hotel || r.hotelId).toString() === hotelId.toString() && r.isActive !== false
    );

    if (guests) {
      rooms = rooms.filter(r => r.capacity.maxGuests >= Number(guests));
    }

    let roomsWithAvailability = rooms;
    if (checkIn && checkOut) {
      roomsWithAvailability = await Promise.all(
        rooms.map(async (room) => {
          try {
            const avail = await checkRoomAvailability(room._id || room.id, checkIn, checkOut, 1);
            return { ...room, availableRooms: avail.availableRooms, isAvailable: avail.isAvailable };
          } catch (e) {
            return { ...room, availableRooms: room.totalInventory, isAvailable: true };
          }
        })
      );
    }

    res.status(200).json({
      success: true,
      count: roomsWithAvailability.length,
      rooms: roomsWithAvailability
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get single room by ID
 * @route   GET /api/rooms/:id
 * @access  Public
 */
export const getRoomById = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (isDBConnected()) {
      const room = await Room.findById(id).populate('hotel', 'name slug address starRating');
      if (!room) return res.status(404).json({ success: false, message: 'Room not found' });
      return res.status(200).json({ success: true, room });
    }

    // In-memory
    const room = memStore.rooms.find(r => (r._id || r.id).toString() === id.toString());
    if (!room) return res.status(404).json({ success: false, message: 'Room not found' });

    const hotel = memStore.hotels.find(
      h => (h._id || h.id).toString() === (room.hotel._id || room.hotel || room.hotelId).toString()
    );

    res.status(200).json({
      success: true,
      room: { ...room, hotel: hotel ? { name: hotel.name, slug: hotel.slug, address: hotel.address, starRating: hotel.starRating } : null }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Create a new room for a hotel
 * @route   POST /api/rooms
 * @access  Private (Admin)
 */
export const createRoom = async (req, res, next) => {
  try {
    const { hotel, roomType, description, images, capacity, bedConfiguration, sizeSqFt, amenities, pricePerNight, totalInventory } = req.body;

    if (isDBConnected()) {
      const existingHotel = await Hotel.findById(hotel);
      if (!existingHotel) return res.status(404).json({ success: false, message: 'Associated hotel does not exist' });

      const room = await Room.create({
        hotel,
        roomType,
        description,
        images: images && images.length > 0 ? images : undefined,
        capacity,
        bedConfiguration,
        sizeSqFt,
        amenities,
        pricePerNight,
        totalInventory: totalInventory || 5,
        isActive: true
      });

      return res.status(201).json({ success: true, message: 'Room created successfully', room });
    }

    // In-memory
    const existingHotel = memStore.hotels.find(h => (h._id || h.id).toString() === hotel.toString());
    if (!existingHotel) return res.status(404).json({ success: false, message: 'Associated hotel does not exist' });

    const newRoom = {
      _id: mockId(),
      id: mockId(),
      hotel,
      roomType,
      description: description || '',
      images: images && images.length > 0 ? images : ['https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=1000&q=80'],
      capacity: capacity || { maxGuests: 2, adults: 2, children: 1 },
      bedConfiguration: bedConfiguration || '1 King Bed',
      sizeSqFt: Number(sizeSqFt) || 400,
      amenities: amenities || ['Air Conditioning', 'Free Wi-Fi', 'Smart TV'],
      pricePerNight: Number(pricePerNight) || 5000,
      totalInventory: Number(totalInventory) || 5,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    memStore.rooms.push(newRoom);
    res.status(201).json({ success: true, message: 'Room created successfully', room: newRoom });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update a room
 * @route   PUT /api/rooms/:id
 * @access  Private (Admin)
 */
export const updateRoom = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (isDBConnected()) {
      const room = await Room.findById(id);
      if (!room) return res.status(404).json({ success: false, message: 'Room not found' });

      const updatedRoom = await Room.findByIdAndUpdate(id, { $set: req.body }, { new: true, runValidators: true });
      return res.status(200).json({ success: true, message: 'Room updated successfully', room: updatedRoom });
    }

    // In-memory
    const room = memStore.rooms.find(r => (r._id || r.id).toString() === id.toString());
    if (!room) return res.status(404).json({ success: false, message: 'Room not found' });

    Object.assign(room, req.body, { updatedAt: new Date() });
    res.status(200).json({ success: true, message: 'Room updated successfully', room });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete or toggle room active status
 * @route   DELETE /api/rooms/:id
 * @access  Private (Admin)
 */
export const deleteRoom = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (isDBConnected()) {
      const room = await Room.findById(id);
      if (!room) return res.status(404).json({ success: false, message: 'Room not found' });

      if (req.query.permanent === 'true') {
        await Room.findByIdAndDelete(id);
        return res.status(200).json({ success: true, message: 'Room permanently deleted' });
      }

      room.isActive = !room.isActive;
      await room.save();
      return res.status(200).json({ success: true, message: `Room status changed to ${room.isActive ? 'active' : 'inactive'}`, room });
    }

    // In-memory
    const roomIndex = memStore.rooms.findIndex(r => (r._id || r.id).toString() === id.toString());
    if (roomIndex === -1) return res.status(404).json({ success: false, message: 'Room not found' });

    if (req.query.permanent === 'true') {
      memStore.rooms.splice(roomIndex, 1);
      return res.status(200).json({ success: true, message: 'Room permanently deleted' });
    }

    memStore.rooms[roomIndex].isActive = !memStore.rooms[roomIndex].isActive;
    res.status(200).json({
      success: true,
      message: `Room status changed to ${memStore.rooms[roomIndex].isActive ? 'active' : 'inactive'}`,
      room: memStore.rooms[roomIndex]
    });
  } catch (error) {
    next(error);
  }
};
