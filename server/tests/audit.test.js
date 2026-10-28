import test from 'node:test';
import assert from 'node:assert';
import request from 'supertest';
import app from '../src/app.js';
import { connectDB } from '../src/config/db.js';

test('HotelPro Security & Audit Verification Suite', async (t) => {
  await connectDB();

  let customerToken = '';
  let adminToken = '';

  await t.test('1. Setup: Authenticate Customer and Admin accounts', async () => {
    const custRes = await request(app)
      .post('/api/auth/login')
      .send({ email: 'jane@example.com', password: 'UserPassword123!' });
    assert.strictEqual(custRes.status, 200);
    customerToken = custRes.body.token;

    const adminRes = await request(app)
      .post('/api/auth/login')
      .send({ email: 'admin@hotelpro.com', password: 'AdminPassword123!' });
    assert.strictEqual(adminRes.status, 200);
    adminToken = adminRes.body.token;
  });

  await t.test('2. CORS: Untrusted origin is rejected or denied credentials', async () => {
    const res = await request(app)
      .get('/api/health')
      .set('Origin', 'http://untrusted-malicious-site.com');
    // Either CORS middleware rejects with 500 error or does NOT return Access-Control-Allow-Origin: untrusted
    const allowOrigin = res.headers['access-control-allow-origin'];
    assert.notStrictEqual(allowOrigin, 'http://untrusted-malicious-site.com');
  });

  await t.test('3. Profile: Customer can retrieve and update personal profile', async () => {
    // Get profile
    const getRes = await request(app)
      .get('/api/auth/me')
      .set('Authorization', `Bearer ${customerToken}`);
    assert.strictEqual(getRes.status, 200);
    assert.strictEqual(getRes.body.user.email, 'jane@example.com');

    // Update profile
    const updateRes = await request(app)
      .put('/api/auth/me')
      .set('Authorization', `Bearer ${customerToken}`)
      .send({ name: 'Jane Doe Updated', phone: '+91 98765 99999' });
    assert.strictEqual(updateRes.status, 200);
    assert.strictEqual(updateRes.body.user.name, 'Jane Doe Updated');
    assert.strictEqual(updateRes.body.user.phone, '+91 98765 99999');
  });

  await t.test('4. Booking Integrity: Completed or past stays cannot be cancelled by guest', async () => {
    // Jane has HP-PAST-1092 which is 'completed'
    const cancelRes = await request(app)
      .put('/api/bookings/HP-PAST-1092/cancel')
      .set('Authorization', `Bearer ${customerToken}`)
      .send({ reason: 'Attempting invalid cancellation' });

    assert.strictEqual(cancelRes.status, 400);
    assert.strictEqual(cancelRes.body.success, false);
    assert.ok(cancelRes.body.message.includes('cannot be cancelled'));
  });

  await t.test('5. Admin RBAC: Admin can list and manage user accounts', async () => {
    const usersRes = await request(app)
      .get('/api/admin/users')
      .set('Authorization', `Bearer ${adminToken}`);

    assert.strictEqual(usersRes.status, 200);
    assert.strictEqual(usersRes.body.success, true);
    assert.ok(usersRes.body.total >= 2);

    const customerUser = usersRes.body.users.find(u => u.email === 'jane@example.com');
    assert.ok(customerUser);

    // Customer should be 403 Forbidden on this route
    const forbiddenRes = await request(app)
      .get('/api/admin/users')
      .set('Authorization', `Bearer ${customerToken}`);
    assert.strictEqual(forbiddenRes.status, 403);
  });

  await t.test('6. Search ReDoS Protection: Unescaped regex characters do not crash the server', async () => {
    const res = await request(app)
      .get('/api/hotels?search=[unclosed-bracket');
    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.body.success, true);
  });

  await t.test('7. Payment Security: Unverified payment callbacks are rejected when secret configured', async () => {
    process.env.RAZORPAY_KEY_SECRET = 'sample_secret_key_12345';

    const tomorrow = new Date(Date.now() + 86400000 * 2).toISOString().split('T')[0];
    const outDate = new Date(Date.now() + 86400000 * 5).toISOString().split('T')[0];

    const hotelsRes = await request(app).get('/api/hotels');
    const hotel = hotelsRes.body.hotels[0];
    const hotelDetail = await request(app).get(`/api/hotels/${hotel.slug}`);
    const room = hotelDetail.body.rooms[0];

    const fakePaymentRes = await request(app)
      .post('/api/bookings')
      .set('Authorization', `Bearer ${customerToken}`)
      .send({
        hotelId: hotel._id || hotel.id,
        roomId: room._id || room.id,
        checkIn: tomorrow,
        checkOut: outDate,
        roomCount: 1,
        guestDetails: {
          primaryGuestName: 'Jane Doe',
          email: 'jane@example.com',
          phone: '+91 98765 00002'
        },
        paymentMethod: 'razorpay',
        paymentDetails: {
          razorpayPaymentId: 'pay_fake_9999',
          razorpayOrderId: 'order_fake_1111',
          razorpaySignature: 'invalid_forged_signature_hash'
        }
      });

    assert.strictEqual(fakePaymentRes.status, 400);
    assert.strictEqual(fakePaymentRes.body.success, false);
    assert.ok(fakePaymentRes.body.message.includes('signature'));

    delete process.env.RAZORPAY_KEY_SECRET;
  });
});

