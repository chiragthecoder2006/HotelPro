import test from 'node:test';
import assert from 'node:assert';
import request from 'supertest';
import app from '../src/app.js';
import { connectDB } from '../src/config/db.js';

test('HotelPro End-to-End User & Admin Journey Test', async (t) => {
  await connectDB();

  let customerToken = '';
  let customerUser = null;
  let adminToken = '';
  let selectedHotel = null;
  let selectedRoom = null;
  let createdBookingRef = '';
  let createdBookingId = '';

  await t.test('Step 1: Explore Hotels & Select Property', async () => {
    const res = await request(app).get('/api/hotels');
    assert.strictEqual(res.status, 200);
    assert.ok(res.body.hotels.length >= 5);
    selectedHotel = res.body.hotels[0];
    assert.ok(selectedHotel._id || selectedHotel.id);
  });

  await t.test('Step 2: Inspect Hotel Details & Rooms', async () => {
    const hotelId = selectedHotel.slug || selectedHotel._id || selectedHotel.id;
    const res = await request(app).get(`/api/hotels/${hotelId}`);
    assert.strictEqual(res.status, 200);
    assert.ok(res.body.rooms.length >= 1);
    selectedRoom = res.body.rooms[0];
    assert.ok(selectedRoom.pricePerNight > 0);
  });

  await t.test('Step 3: Register a Brand New Guest Customer', async () => {
    const uniqueEmail = `traveler_${Date.now()}@example.com`;
    const res = await request(app)
      .post('/api/auth/register')
      .send({
        name: 'Alexander Hamilton',
        email: uniqueEmail,
        password: 'Password123!',
        phone: '+91 98765 11111'
      });

    assert.strictEqual(res.status, 201);
    assert.strictEqual(res.body.success, true);
    assert.strictEqual(res.body.user.role, 'customer');
    assert.ok(res.body.token);

    customerToken = res.body.token;
    customerUser = res.body.user;
  });

  await t.test('Step 4: Check Live Room Availability for Next Week', async () => {
    const checkIn = new Date(Date.now() + 86400000 * 5).toISOString().split('T')[0];
    const checkOut = new Date(Date.now() + 86400000 * 8).toISOString().split('T')[0];

    const res = await request(app)
      .post('/api/bookings/check-availability')
      .send({
        roomId: selectedRoom._id || selectedRoom.id,
        checkIn,
        checkOut,
        roomCount: 1
      });

    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.body.success, true);
    assert.strictEqual(res.body.isAvailable, true);
    assert.strictEqual(res.body.pricing.nights, 3);
  });

  await t.test('Step 5: Create a Confirmed Booking with Server Pricing Calculation', async () => {
    const checkIn = new Date(Date.now() + 86400000 * 5).toISOString().split('T')[0];
    const checkOut = new Date(Date.now() + 86400000 * 8).toISOString().split('T')[0];

    const res = await request(app)
      .post('/api/bookings')
      .set('Authorization', `Bearer ${customerToken}`)
      .send({
        hotelId: selectedHotel._id || selectedHotel.id,
        roomId: selectedRoom._id || selectedRoom.id,
        checkIn,
        checkOut,
        roomCount: 1,
        guestDetails: {
          primaryGuestName: customerUser.name,
          email: customerUser.email,
          phone: customerUser.phone,
          specialRequests: 'Sea facing suite please.',
          adults: 2,
          children: 0
        },
        paymentMethod: 'demo_checkout'
      });

    assert.strictEqual(res.status, 201);
    assert.strictEqual(res.body.success, true);
    assert.ok(res.body.booking.bookingReference.startsWith('HP-'));
    assert.strictEqual(res.body.booking.bookingStatus, 'confirmed');

    createdBookingRef = res.body.booking.bookingReference;
    createdBookingId = res.body.booking._id || res.body.booking.id;
  });

  await t.test('Step 6: Customer Retrieves Own Bookings & Sees New Reservation', async () => {
    const res = await request(app)
      .get('/api/bookings/my-bookings')
      .set('Authorization', `Bearer ${customerToken}`);

    assert.strictEqual(res.status, 200);
    assert.ok(res.body.bookings.length >= 1);
    const found = res.body.bookings.find(b => b.bookingReference === createdBookingRef);
    assert.ok(found, 'Created booking must appear in customer history');
  });

  await t.test('Step 7: Customer Safely Cancels the Reservation', async () => {
    const res = await request(app)
      .put(`/api/bookings/${createdBookingRef}/cancel`)
      .set('Authorization', `Bearer ${customerToken}`)
      .send({ reason: 'Trip rescheduled' });

    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.body.success, true);
    assert.strictEqual(res.body.booking.bookingStatus, 'cancelled');
  });

  await t.test('Step 8: Login as Administrator & Verify Admin Privileges', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'admin@hotelpro.com',
        password: 'AdminPassword123!'
      });

    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.body.user.role, 'admin');
    adminToken = res.body.token;
  });

  await t.test('Step 9: Admin Dashboard Real Statistics Query', async () => {
    const res = await request(app)
      .get('/api/admin/dashboard-stats')
      .set('Authorization', `Bearer ${adminToken}`);

    assert.strictEqual(res.status, 200);
    assert.ok(res.body.stats.totalHotels >= 5);
    assert.ok(res.body.stats.totalBookings >= 1);
    assert.ok(res.body.stats.cityDistribution.length >= 1);
  });

  await t.test('Step 10: Admin Updates Booking Status', async () => {
    const res = await request(app)
      .put(`/api/bookings/admin/${createdBookingId}/status`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ status: 'completed' });

    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.body.success, true);
    assert.strictEqual(res.body.booking.bookingStatus, 'completed');
  });
});

