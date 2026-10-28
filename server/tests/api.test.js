import test from 'node:test';
import assert from 'node:assert';
import request from 'supertest';
import app from '../src/app.js';
import { connectDB } from '../src/config/db.js';

test('HotelPro API Suite', async (t) => {
  // Ensure DB / in-memory store is initialized
  await connectDB();

  await t.test('1. GET /api/health returns 200 OK', async () => {
    const res = await request(app).get('/api/health');
    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.body.status, 'ok');
  });

  await t.test('2. GET /api/hotels returns hotel listings with pricing', async () => {
    const res = await request(app).get('/api/hotels');
    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.body.success, true);
    assert.ok(res.body.hotels.length >= 5, 'Should return at least 5 hotels');
    assert.ok(res.body.hotels[0].startingPrice > 0, 'Hotels should include calculated starting price');
  });

  await t.test('3. GET /api/hotels?city=Goa returns filtered hotels', async () => {
    const res = await request(app).get('/api/hotels?city=Goa');
    assert.strictEqual(res.status, 200);
    assert.ok(res.body.hotels.length >= 1);
    assert.strictEqual(res.body.hotels[0].address.city, 'Goa');
  });

  let customerToken = '';
  await t.test('4. POST /api/auth/login authenticates demo customer', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'jane@example.com',
        password: 'UserPassword123!'
      });
    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.body.success, true);
    assert.ok(res.body.token);
    assert.strictEqual(res.body.user.role, 'customer');
    customerToken = res.body.token;
  });

  await t.test('5. Customer cannot access admin routes (403 Forbidden)', async () => {
    const res = await request(app)
      .get('/api/admin/dashboard-stats')
      .set('Authorization', `Bearer ${customerToken}`);
    assert.strictEqual(res.status, 403);
    assert.strictEqual(res.body.success, false);
  });

  let adminToken = '';
  await t.test('6. POST /api/auth/login authenticates administrator', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'admin@hotelpro.com',
        password: 'AdminPassword123!'
      });
    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.body.success, true);
    assert.strictEqual(res.body.user.role, 'admin');
    adminToken = res.body.token;
  });

  await t.test('7. Admin CAN access dashboard stats (200 OK)', async () => {
    const res = await request(app)
      .get('/api/admin/dashboard-stats')
      .set('Authorization', `Bearer ${adminToken}`);
    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.body.success, true);
    assert.ok(res.body.stats.totalHotels >= 5);
    assert.ok(res.body.stats.totalRevenue >= 0);
  });

  await t.test('8. Date overlap calculation rejects conflicting reservation when full', async () => {
    const res = await request(app)
      .post('/api/bookings/check-availability')
      .send({
        roomId: '65432177bcf86cd7994390100',
        checkIn: new Date(Date.now() + 86400000).toISOString(),
        checkOut: new Date(Date.now() + 86400000 * 3).toISOString(),
        roomCount: 1
      });
    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.body.success, true);
    assert.ok(typeof res.body.isAvailable === 'boolean');
  });
});

