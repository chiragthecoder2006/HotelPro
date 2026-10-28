# HotelPro REST API Documentation

Base URL: `http://localhost:5000/api` (or proxied via Vite dev server `/api`)

All responses return standard JSON. Errors return `{ "success": false, "message": "...", "errors": [...] }`.

---

## 1. Health Endpoint

### `GET /health`
- **Access:** Public
- **Description:** Verifies service uptime and database connectivity state.
- **Response:**
```json
{
  "status": "ok",
  "service": "HotelPro API",
  "timestamp": "2026-10-28T19:40:00.000Z",
  "uptime": 142,
  "database": "connected"
}
```

---

## 2. Authentication (`/auth`)

### `POST /auth/register`
- **Access:** Public
- **Description:** Registers a new customer account. Role is strictly assigned as `customer` on the server.
- **Request Body:**
```json
{
  "name": "Jane Doe",
  "email": "jane@example.com",
  "password": "UserPassword123!",
  "phone": "+91 98765 00002"
}
```
- **Response (201 Created):** Sets HttpOnly `token` cookie and returns `{ success: true, token, user }`.

### `POST /auth/login`
- **Access:** Public
- **Description:** Authenticates user via email and bcrypt password verification.
- **Request Body:**
```json
{
  "email": "jane@example.com",
  "password": "UserPassword123!"
}
```
- **Response (200 OK):** Sets HttpOnly `token` cookie and returns `{ success: true, token, user }`.

### `POST /auth/logout`
- **Access:** Public
- **Description:** Clears the HttpOnly authentication cookie.

### `GET /auth/me`
- **Access:** Private (Customer / Admin)
- **Header:** `Authorization: Bearer <token>` or HttpOnly cookie.
- **Response (200 OK):** Returns current authenticated user profile without password hash.

### `PUT /auth/me`
- **Access:** Private (Customer / Admin)
- **Request Body:** `{ "name": "Jane Smith", "phone": "+91 98765 00003" }`

---

## 3. Hotels (`/hotels`)

### `GET /hotels`
- **Access:** Public
- **Query Parameters:**
  - `search`: Keyword for name, description, city
  - `city`: Filter by city (e.g. `Mumbai`, `Goa`, `Jaipur`, `Udaipur`, `Munnar`)
  - `starRating`: Minimum star rating (e.g. `4`, `5`)
  - `minPrice`, `maxPrice`: Price range
  - `sort`: `price-asc`, `price-desc`, `rating-desc`, `name-asc`
  - `page`, `limit`: Pagination
- **Response (200 OK):**
```json
{
  "success": true,
  "count": 5,
  "total": 5,
  "hotels": [
    {
      "_id": "65432177bcf86cd799439011",
      "name": "The Grand Palace Marine Drive",
      "slug": "the-grand-palace-marine-drive",
      "address": { "city": "Mumbai", "street": "124 Marine Drive" },
      "starRating": 5,
      "startingPrice": 4800,
      "roomCount": 3,
      "images": [...]
    }
  ]
}
```

### `GET /hotels/featured`
- **Access:** Public
- **Description:** Retrieves top featured luxury hotels for the homepage.

### `GET /hotels/:identifier`
- **Access:** Public
- **Param:** `:identifier` (MongoDB ObjectId or unique slug string).
- **Response (200 OK):** Returns hotel document and array of active rooms for that property.

### `POST /hotels`
- **Access:** Private (Admin only)
- **Request Body:**
```json
{
  "name": "The Grand Palace Marine Drive",
  "tagline": "Timeless Victorian Luxury",
  "description": "Oceanfront sanctuary...",
  "address": { "city": "Mumbai", "street": "124 Marine Drive" },
  "starRating": 5,
  "featured": true
}
```

### `PUT /hotels/:id`
- **Access:** Private (Admin only)
- **Description:** Updates hotel details.

### `DELETE /hotels/:id`
- **Access:** Private (Admin only)
- **Description:** Toggles active/inactive status (or permanently deletes if `?permanent=true`).

---

## 4. Rooms (`/rooms`)

### `GET /rooms/hotel/:hotelId`
- **Access:** Public
- **Query Parameters:** `checkIn`, `checkOut`, `guests`
- **Description:** Returns active rooms for a hotel. When `checkIn` and `checkOut` are provided, evaluates live overlapping bookings and returns `availableRooms` and `isAvailable`.

### `GET /rooms/:id`
- **Access:** Public
- **Description:** Retrieves room details and populated parent hotel.

### `POST /rooms`
- **Access:** Private (Admin only)
- **Request Body:**
```json
{
  "hotel": "65432177bcf86cd799439011",
  "roomType": "Deluxe King Suite",
  "pricePerNight": 7500,
  "totalInventory": 8,
  "capacity": { "maxGuests": 3, "adults": 2, "children": 1 },
  "bedConfiguration": "1 King Bed"
}
```

### `PUT /rooms/:id`
- **Access:** Private (Admin only)
- **Description:** Updates room pricing, inventory, or configuration.

### `DELETE /rooms/:id`
- **Access:** Private (Admin only)
- **Description:** Toggles room active status.

---

## 5. Bookings (`/bookings`)

### `POST /bookings/check-availability`
- **Access:** Public
- **Description:** Evaluates date range using half-open intervals (`existing.checkIn < checkOut && existing.checkOut > checkIn`). Calculates nights and pricing on the server.
- **Request Body:**
```json
{
  "roomId": "65432177bcf86cd7994390100",
  "checkIn": "2026-11-05",
  "checkOut": "2026-11-08",
  "roomCount": 1
}
```

### `POST /bookings`
- **Access:** Private (Customer / Admin)
- **Description:** Atomically verifies inventory, calculates server-side pricing, generates unique booking reference (`HP-XXXXX-XXXX`), and persists reservation.
- **Request Body:**
```json
{
  "hotelId": "65432177bcf86cd799439011",
  "roomId": "65432177bcf86cd7994390100",
  "checkIn": "2026-11-05",
  "checkOut": "2026-11-08",
  "roomCount": 1,
  "guestDetails": {
    "primaryGuestName": "Jane Doe",
    "email": "jane@example.com",
    "phone": "+91 98765 00002",
    "specialRequests": "Ocean view preferred"
  },
  "paymentMethod": "demo_checkout"
}
```
- **Response (201 Created):** Returns populated booking confirmation.

### `GET /bookings/my-bookings`
- **Access:** Private (Customer / Admin)
- **Description:** Returns all bookings belonging strictly to the logged-in user.

### `GET /bookings/:reference`
- **Access:** Private (Owner or Admin only)
- **Description:** Retrieves booking voucher details. Rejects unauthorized access with 403 Forbidden.

### `PUT /bookings/:reference/cancel`
- **Access:** Private (Owner or Admin only)
- **Description:** Safely marks booking as `cancelled`, records timestamp and reason, and restores room inventory immediately.

### `GET /bookings/admin/all`
- **Access:** Private (Admin only)
- **Description:** Returns all platform reservations with status and search filters.

### `PUT /bookings/admin/:id/status`
- **Access:** Private (Admin only)
- **Request Body:** `{ "status": "completed" }` (or `confirmed`, `cancelled`).

---

## 6. Admin (`/admin`)

### `GET /admin/dashboard-stats`
- **Access:** Private (Admin only, rejects customers with 403)
- **Description:** Real aggregation queries over database records:
  - `totalRevenue` (sum of non-cancelled bookings)
  - `totalBookings`, `confirmedBookings`, `completedBookings`, `cancelledBookings`
  - `totalHotels`, `activeHotels`, `totalRooms`, `activeRooms`
  - `totalUsers`, `totalCustomers`
  - `cityDistribution` (count of properties per destination)
  - `recentBookings`

### `GET /admin/users`
- **Access:** Private (Admin only, rejects customers with 403)
- **Description:** Returns paginated list of all registered platform user accounts with role, status, and contact info.
- **Query Parameters:** `role` (`customer` | `admin`), `status` (`active` | `suspended`), `search`, `page`, `limit`.

### `PUT /admin/users/:id/status`
- **Access:** Private (Admin only)
- **Description:** Updates a user account's status (`active` | `suspended`) or role.
- **Request Body:** `{ "accountStatus": "suspended" }`

