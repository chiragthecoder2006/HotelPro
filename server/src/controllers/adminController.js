import Booking from '../models/Booking.js';
import Hotel from '../models/Hotel.js';
import Room from '../models/Room.js';
import User from '../models/User.js';
import { isDBConnected } from '../config/db.js';
import { memStore } from '../services/dbStore.js';

export const getDashboardStats = async (req, res, next) => {
  try {
    if (isDBConnected()) {
      const totalHotels = await Hotel.countDocuments();
      const activeHotels = await Hotel.countDocuments({ isActive: true });

      const totalRooms = await Room.countDocuments();
      const activeRooms = await Room.countDocuments({ isActive: true });

      const totalUsers = await User.countDocuments();
      const totalCustomers = await User.countDocuments({ role: 'customer' });

      const totalBookings = await Booking.countDocuments();
      const confirmedBookings = await Booking.countDocuments({ bookingStatus: 'confirmed' });
      const completedBookings = await Booking.countDocuments({ bookingStatus: 'completed' });
      const cancelledBookings = await Booking.countDocuments({ bookingStatus: 'cancelled' });

      const revenueAggregation = await Booking.aggregate([
        { $match: { bookingStatus: { $ne: 'cancelled' } } },
        { $group: { _id: null, totalRevenue: { $sum: '$pricing.totalAmount' } } }
      ]);
      const totalRevenue = revenueAggregation.length > 0 ? revenueAggregation[0].totalRevenue : 0;

      const recentBookings = await Booking.find()
        .populate('hotel', 'name')
        .populate('room', 'roomType')
        .populate('user', 'name email')
        .sort({ createdAt: -1 })
        .limit(5);

      const cityDistribution = await Hotel.aggregate([
        { $match: { isActive: true } },
        { $group: { _id: '$address.city', count: { $sum: 1 } } },
        { $sort: { count: -1 } }
      ]);

      return res.status(200).json({
        success: true,
        stats: {
          totalRevenue,
          totalBookings,
          confirmedBookings,
          completedBookings,
          cancelledBookings,
          totalHotels,
          activeHotels,
          totalRooms,
          activeRooms,
          totalUsers,
          totalCustomers,
          recentBookings,
          cityDistribution
        }
      });
    }

    // In-memory stats
    const totalHotels = memStore.hotels.length;
    const activeHotels = memStore.hotels.filter(h => h.isActive !== false).length;

    const totalRooms = memStore.rooms.length;
    const activeRooms = memStore.rooms.filter(r => r.isActive !== false).length;

    const totalUsers = memStore.users.length;
    const totalCustomers = memStore.users.filter(u => u.role === 'customer').length;

    const totalBookings = memStore.bookings.length;
    const confirmedBookings = memStore.bookings.filter(b => b.bookingStatus === 'confirmed').length;
    const completedBookings = memStore.bookings.filter(b => b.bookingStatus === 'completed').length;
    const cancelledBookings = memStore.bookings.filter(b => b.bookingStatus === 'cancelled').length;

    const totalRevenue = memStore.bookings
      .filter(b => b.bookingStatus !== 'cancelled')
      .reduce((sum, b) => sum + (b.pricing ? b.pricing.totalAmount : 0), 0);

    const recentBookings = memStore.bookings
      .slice(0, 5)
      .map(b => {
        let hotel = b.hotel;
        let room = b.room;
        let user = b.user;
        if (typeof hotel === 'string') hotel = memStore.hotels.find(h => (h._id || h.id).toString() === hotel.toString());
        if (typeof room === 'string') room = memStore.rooms.find(r => (r._id || r.id).toString() === room.toString());
        if (typeof user === 'string') user = memStore.users.find(u => (u._id || u.id).toString() === user.toString());
        return {
          _id: b._id || b.id,
          bookingReference: b.bookingReference,
          hotel: hotel ? { name: hotel.name } : { name: 'Hotel' },
          room: room ? { roomType: room.roomType } : { roomType: 'Room' },
          user: user ? { name: user.name, email: user.email } : { name: 'Guest', email: '' },
          pricing: b.pricing,
          bookingStatus: b.bookingStatus,
          createdAt: b.createdAt
        };
      });

    const cityMap = {};
    memStore.hotels.forEach(h => {
      const city = (h.address && h.address.city) || 'Other';
      cityMap[city] = (cityMap[city] || 0) + 1;
    });
    const cityDistribution = Object.keys(cityMap).map(city => ({
      _id: city,
      count: cityMap[city]
    }));

    res.status(200).json({
      success: true,
      stats: {
        totalRevenue,
        totalBookings,
        confirmedBookings,
        completedBookings,
        cancelledBookings,
        totalHotels,
        activeHotels,
        totalRooms,
        activeRooms,
        totalUsers,
        totalCustomers,
        recentBookings,
        cityDistribution
      }
    });
  } catch (error) {
    next(error);
  }
};

export const getUsers = async (req, res, next) => {
  try {
    const { role, status, search, page = 1, limit = 20 } = req.query;

    if (isDBConnected()) {
      const query = {};
      if (role && role !== 'all') query.role = role;
      if (status && status !== 'all') query.accountStatus = status;
      if (search) {
        const regex = new RegExp(search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&').trim(), 'i');
        query.$or = [{ name: regex }, { email: regex }, { phone: regex }];
      }

      const skip = (Number(page) - 1) * Number(limit);
      const users = await User.find(query)
        .select('-password')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Number(limit));
      const total = await User.countDocuments(query);

      return res.status(200).json({
        success: true,
        count: users.length,
        total,
        page: Number(page),
        pages: Math.ceil(total / Number(limit)),
        users
      });
    }

    // In-memory
    let list = memStore.users.map(u => ({
      _id: u._id || u.id,
      id: u._id || u.id,
      name: u.name,
      email: u.email,
      role: u.role,
      phone: u.phone || '',
      accountStatus: u.accountStatus || 'active',
      createdAt: u.createdAt
    }));

    if (role && role !== 'all') list = list.filter(u => u.role === role);
    if (status && status !== 'all') list = list.filter(u => u.accountStatus === status);
    if (search) {
      const q = search.toLowerCase().trim();
      list = list.filter(u => u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q));
    }

    res.status(200).json({
      success: true,
      count: list.length,
      total: list.length,
      page: 1,
      pages: 1,
      users: list
    });
  } catch (error) {
    next(error);
  }
};

export const updateUserStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { accountStatus, role } = req.body;

    if (isDBConnected()) {
      const user = await User.findById(id);
      if (!user) return res.status(404).json({ success: false, message: 'User not found' });

      if (accountStatus) user.accountStatus = accountStatus;
      if (role) user.role = role;
      await user.save();

      return res.status(200).json({
        success: true,
        message: 'User account updated successfully',
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          accountStatus: user.accountStatus
        }
      });
    }

    // In-memory
    const user = memStore.users.find(u => (u._id || u.id).toString() === id.toString());
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    if (accountStatus) user.accountStatus = accountStatus;
    if (role) user.role = role;
    user.updatedAt = new Date();

    res.status(200).json({
      success: true,
      message: 'User account updated successfully',
      user: {
        id: user._id || user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        accountStatus: user.accountStatus
      }
    });
  } catch (error) {
    next(error);
  }
};
