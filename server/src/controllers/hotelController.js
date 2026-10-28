import Hotel from '../models/Hotel.js';
import Room from '../models/Room.js';
import { isDBConnected } from '../config/db.js';
import { memStore, mockId } from '../services/dbStore.js';

const slugify = (text) => {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w-]+/g, '')
    .replace(/--+/g, '-');
};

const escapeRegex = (string) => string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

/**
 * @desc    Get all active hotels with filtering, search & sorting
 * @route   GET /api/hotels
 * @access  Public
 */
export const getHotels = async (req, res, next) => {
  try {
    const {
      search,
      city,
      starRating,
      minPrice,
      maxPrice,
      sort,
      page = 1,
      limit = 12
    } = req.query;

    if (isDBConnected()) {
      const query = { isActive: true };

      if (search) {
        const searchRegex = new RegExp(escapeRegex(search.trim()), 'i');
        query.$or = [
          { name: searchRegex },
          { description: searchRegex },
          { 'address.city': searchRegex },
          { 'address.state': searchRegex }
        ];
      }

      if (city) {
        query['address.city'] = new RegExp(`^${escapeRegex(city.trim())}$`, 'i');
      }

      if (starRating) {
        query.starRating = { $gte: Number(starRating) };
      }

      let sortOption = { featured: -1, createdAt: -1 };
      if (sort === 'rating-desc') sortOption = { starRating: -1 };
      else if (sort === 'name-asc') sortOption = { name: 1 };

      const skip = (Number(page) - 1) * Number(limit);
      const hotels = await Hotel.find(query).sort(sortOption).skip(skip).limit(Number(limit)).lean();
      const total = await Hotel.countDocuments(query);

      const hotelIds = hotels.map(h => h._id);
      const rooms = await Room.find({ hotel: { $in: hotelIds }, isActive: true }).lean();

      let hotelsWithPricing = hotels.map(hotel => {
        const hotelRooms = rooms.filter(r => r.hotel.toString() === hotel._id.toString());
        const minRoomPrice = hotelRooms.length > 0 ? Math.min(...hotelRooms.map(r => r.pricePerNight)) : null;
        return {
          ...hotel,
          roomCount: hotelRooms.length,
          startingPrice: minRoomPrice
        };
      });

      if (minPrice || maxPrice) {
        const min = minPrice ? Number(minPrice) : 0;
        const max = maxPrice ? Number(maxPrice) : Infinity;
        hotelsWithPricing = hotelsWithPricing.filter(
          h => h.startingPrice !== null && h.startingPrice >= min && h.startingPrice <= max
        );
      }

      if (sort === 'price-asc') hotelsWithPricing.sort((a, b) => (a.startingPrice || 0) - (b.startingPrice || 0));
      else if (sort === 'price-desc') hotelsWithPricing.sort((a, b) => (b.startingPrice || 0) - (a.startingPrice || 0));

      return res.status(200).json({
        success: true,
        count: hotelsWithPricing.length,
        total,
        page: Number(page),
        pages: Math.ceil(total / Number(limit)),
        hotels: hotelsWithPricing
      });
    }

    // In-memory fallback
    let results = memStore.hotels.filter(h => h.isActive !== false);

    if (search) {
      const q = search.toLowerCase().trim();
      results = results.filter(
        h =>
          h.name.toLowerCase().includes(q) ||
          h.description.toLowerCase().includes(q) ||
          (h.address.city && h.address.city.toLowerCase().includes(q))
      );
    }

    if (city) {
      results = results.filter(h => h.address.city.toLowerCase() === city.toLowerCase().trim());
    }

    if (starRating) {
      results = results.filter(h => h.starRating >= Number(starRating));
    }

    let hotelsWithPricing = results.map(hotel => {
      const hotelId = (hotel._id || hotel.id).toString();
      const hotelRooms = memStore.rooms.filter(
        r => (r.hotel._id || r.hotel || r.hotelId).toString() === hotelId && r.isActive !== false
      );
      const minRoomPrice = hotelRooms.length > 0
        ? Math.min(...hotelRooms.map(r => r.pricePerNight))
        : 4500;

      return {
        ...hotel,
        roomCount: hotelRooms.length,
        startingPrice: minRoomPrice
      };
    });

    if (minPrice || maxPrice) {
      const min = minPrice ? Number(minPrice) : 0;
      const max = maxPrice ? Number(maxPrice) : Infinity;
      hotelsWithPricing = hotelsWithPricing.filter(
        h => h.startingPrice !== null && h.startingPrice >= min && h.startingPrice <= max
      );
    }

    if (sort === 'price-asc') {
      hotelsWithPricing.sort((a, b) => (a.startingPrice || 0) - (b.startingPrice || 0));
    } else if (sort === 'price-desc') {
      hotelsWithPricing.sort((a, b) => (b.startingPrice || 0) - (a.startingPrice || 0));
    } else if (sort === 'rating-desc') {
      hotelsWithPricing.sort((a, b) => b.starRating - a.starRating);
    } else if (sort === 'name-asc') {
      hotelsWithPricing.sort((a, b) => a.name.localeCompare(b.name));
    }

    res.status(200).json({
      success: true,
      count: hotelsWithPricing.length,
      total: hotelsWithPricing.length,
      page: 1,
      pages: 1,
      hotels: hotelsWithPricing
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get featured hotels for homepage
 * @route   GET /api/hotels/featured
 * @access  Public
 */
export const getFeaturedHotels = async (req, res, next) => {
  try {
    if (isDBConnected()) {
      const hotels = await Hotel.find({ isActive: true, featured: true }).limit(6).lean();
      const hotelIds = hotels.map(h => h._id);
      const rooms = await Room.find({ hotel: { $in: hotelIds }, isActive: true }).lean();

      const result = hotels.map(hotel => {
        const hotelRooms = rooms.filter(r => r.hotel.toString() === hotel._id.toString());
        const minPrice = hotelRooms.length > 0 ? Math.min(...hotelRooms.map(r => r.pricePerNight)) : 4500;
        return {
          ...hotel,
          startingPrice: minPrice,
          roomCount: hotelRooms.length
        };
      });

      return res.status(200).json({ success: true, hotels: result });
    }

    // In-memory fallback
    const featured = memStore.hotels.filter(h => h.isActive !== false && h.featured);
    const result = featured.map(hotel => {
      const hotelId = (hotel._id || hotel.id).toString();
      const hotelRooms = memStore.rooms.filter(
        r => (r.hotel._id || r.hotel || r.hotelId).toString() === hotelId && r.isActive !== false
      );
      const minPrice = hotelRooms.length > 0 ? Math.min(...hotelRooms.map(r => r.pricePerNight)) : 4500;
      return {
        ...hotel,
        startingPrice: minPrice,
        roomCount: hotelRooms.length
      };
    });

    res.status(200).json({ success: true, hotels: result });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get single hotel by ID or Slug with available rooms
 * @route   GET /api/hotels/:identifier
 * @access  Public
 */
export const getHotelByIdOrSlug = async (req, res, next) => {
  try {
    const { identifier } = req.params;

    if (isDBConnected()) {
      const isId = identifier.match(/^[0-9a-fA-F]{24}$/);
      const query = isId ? { _id: identifier } : { slug: identifier.toLowerCase() };

      const hotel = await Hotel.findOne(query);
      if (!hotel) {
        return res.status(404).json({ success: false, message: 'Hotel not found' });
      }

      const rooms = await Room.find({ hotel: hotel._id, isActive: true }).sort({ pricePerNight: 1 });
      return res.status(200).json({ success: true, hotel, rooms });
    }

    // In-memory fallback
    const hotel = memStore.hotels.find(
      h =>
        (h._id || h.id).toString() === identifier ||
        h.slug.toLowerCase() === identifier.toLowerCase()
    );

    if (!hotel) {
      return res.status(404).json({ success: false, message: 'Hotel not found' });
    }

    const hotelId = (hotel._id || hotel.id).toString();
    const rooms = memStore.rooms
      .filter(r => (r.hotel._id || r.hotel || r.hotelId).toString() === hotelId && r.isActive !== false)
      .sort((a, b) => a.pricePerNight - b.pricePerNight);

    res.status(200).json({ success: true, hotel, rooms });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Create new hotel
 * @route   POST /api/hotels
 * @access  Private (Admin)
 */
export const createHotel = async (req, res, next) => {
  try {
    const { name, tagline, description, address, starRating, images, amenities, contact, policies, featured } = req.body;

    let baseSlug = slugify(name);
    let slug = baseSlug;

    if (isDBConnected()) {
      let counter = 1;
      while (await Hotel.findOne({ slug })) {
        slug = `${baseSlug}-${counter++}`;
      }

      const hotel = await Hotel.create({
        name,
        slug,
        tagline: tagline || '',
        description,
        address,
        starRating: starRating || 4,
        images: images && images.length > 0 ? images : undefined,
        amenities: amenities && amenities.length > 0 ? amenities : undefined,
        contact,
        policies,
        featured: Boolean(featured),
        isActive: true
      });

      return res.status(201).json({ success: true, message: 'Hotel created successfully', hotel });
    }

    // In-memory
    let counter = 1;
    while (memStore.hotels.find(h => h.slug === slug)) {
      slug = `${baseSlug}-${counter++}`;
    }

    const newHotel = {
      _id: mockId(),
      id: mockId(),
      name,
      slug,
      tagline: tagline || '',
      description,
      address,
      starRating: Number(starRating) || 4,
      images: images && images.length > 0 ? images : ['https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1200&q=80'],
      amenities: amenities && amenities.length > 0 ? amenities : ['Free High-speed Wi-Fi', 'Swimming Pool', '24/7 Concierge'],
      contact: contact || { phone: '+91 98765 43210', email: 'info@hotelpro.com' },
      policies: policies || { checkInTime: '14:00', checkOutTime: '11:00' },
      featured: Boolean(featured),
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    memStore.hotels.unshift(newHotel);
    res.status(201).json({ success: true, message: 'Hotel created successfully', hotel: newHotel });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update hotel details
 * @route   PUT /api/hotels/:id
 * @access  Private (Admin)
 */
export const updateHotel = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (isDBConnected()) {
      const hotel = await Hotel.findById(id);
      if (!hotel) return res.status(404).json({ success: false, message: 'Hotel not found' });

      if (req.body.name && req.body.name !== hotel.name) {
        req.body.slug = slugify(req.body.name);
      }

      const updatedHotel = await Hotel.findByIdAndUpdate(id, { $set: req.body }, { new: true, runValidators: true });
      return res.status(200).json({ success: true, message: 'Hotel updated successfully', hotel: updatedHotel });
    }

    // In-memory
    const hotel = memStore.hotels.find(h => (h._id || h.id).toString() === id.toString());
    if (!hotel) return res.status(404).json({ success: false, message: 'Hotel not found' });

    Object.assign(hotel, req.body, { updatedAt: new Date() });
    res.status(200).json({ success: true, message: 'Hotel updated successfully', hotel });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Toggle hotel active status or delete
 * @route   DELETE /api/hotels/:id
 * @access  Private (Admin)
 */
export const deleteHotel = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (isDBConnected()) {
      const hotel = await Hotel.findById(id);
      if (!hotel) return res.status(404).json({ success: false, message: 'Hotel not found' });

      if (req.query.permanent === 'true') {
        await Hotel.findByIdAndDelete(id);
        await Room.deleteMany({ hotel: id });
        return res.status(200).json({ success: true, message: 'Hotel and rooms permanently deleted' });
      }

      hotel.isActive = !hotel.isActive;
      await hotel.save();
      return res.status(200).json({ success: true, message: `Hotel status changed to ${hotel.isActive ? 'active' : 'inactive'}`, hotel });
    }

    // In-memory
    const hotelIndex = memStore.hotels.findIndex(h => (h._id || h.id).toString() === id.toString());
    if (hotelIndex === -1) return res.status(404).json({ success: false, message: 'Hotel not found' });

    if (req.query.permanent === 'true') {
      memStore.hotels.splice(hotelIndex, 1);
      memStore.rooms = memStore.rooms.filter(r => (r.hotel._id || r.hotel || r.hotelId).toString() !== id.toString());
      return res.status(200).json({ success: true, message: 'Hotel permanently deleted' });
    }

    memStore.hotels[hotelIndex].isActive = !memStore.hotels[hotelIndex].isActive;
    res.status(200).json({
      success: true,
      message: `Hotel status changed to ${memStore.hotels[hotelIndex].isActive ? 'active' : 'inactive'}`,
      hotel: memStore.hotels[hotelIndex]
    });
  } catch (error) {
    next(error);
  }
};
