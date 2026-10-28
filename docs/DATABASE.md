# HotelPro Database Architecture & Models

HotelPro uses MongoDB with Mongoose object modeling. In environments without an active MongoDB daemon, a high-fidelity in-memory engine transparently activates so demonstrations succeed out-of-the-box.

---

## Entity Relationship Overview

```
 [User] (Customer / Admin)
   │
   │ 1 : N
   ▼
 [Booking] ◄────────┐
   │                │
   │ N : 1          │ N : 1
   ▼                │
 [Hotel] ────────► [Room]
      1 : N
```

---

## 1. User Model (`server/src/models/User.js`)

Stores credentials and role authorization levels.

| Field | Type | Attributes | Description |
|-------|------|------------|-------------|
| `_id` | ObjectId | Primary Key | Auto-generated |
| `name` | String | Required, Trim | Guest / Admin full name |
| `email` | String | Required, Unique, Lowercase, Indexed | Normalized login identifier |
| `password` | String | Required | Salted bcrypt hash (rounds = 10) |
| `role` | String | Enum: `['customer', 'admin']`, Default: `'customer'` | Authorization access level |
| `phone` | String | Optional, Trim | Guest contact number |
| `accountStatus` | String | Enum: `['active', 'inactive', 'suspended']` | Operational account state |
| `createdAt` | Date | Timestamp | Account creation timestamp |
| `updatedAt` | Date | Timestamp | Last profile update timestamp |

**Security Rules:**
- Passwords are never saved in plaintext; `pre('save')` middleware hashes modified passwords.
- `toJSON()` method explicitly strips `password` from all serialized responses.

---

## 2. Hotel Model (`server/src/models/Hotel.js`)

Stores properties, geographical locations, policies, and imagery.

| Field | Type | Attributes | Description |
|-------|------|------------|-------------|
| `_id` | ObjectId | Primary Key | Auto-generated |
| `name` | String | Required, Trim, Max: 120 | Property name |
| `slug` | String | Required, Unique, Indexed | Clean URL identifier (e.g. `the-grand-palace`) |
| `tagline` | String | Optional | Marketing highlight |
| `description` | String | Required, Trim | Full narrative description |
| `address` | Subdocument | Required | `{ street, city, state, country, zipCode }` |
| `starRating` | Number | Min: 1, Max: 5, Default: 4 | Star classification |
| `images` | Array of String | URLs | Curated high-resolution imagery |
| `amenities` | Array of String | Default list | Features (Pool, Wi-Fi, Spa, Gym, Butler) |
| `contact` | Subdocument | Phone, Email, Website | Direct concierge reach |
| `policies` | Subdocument | Check-in, Check-out, Cancellation | Check-in/out hours & free cancellation terms |
| `featured` | Boolean | Default: `false` | Highlighted on homepage |
| `isActive` | Boolean | Default: `true`, Indexed | Soft deactivation flag |

**Indexes:**
- Text index on `{ name: 'text', description: 'text', 'address.city': 'text' }` for keyword searches.
- Compound index on `{ 'address.city': 1, isActive: 1 }` for fast city filtering.

---

## 3. Room Model (`server/src/models/Room.js`)

Stores suite categories and physical room inventories per hotel.

| Field | Type | Attributes | Description |
|-------|------|------------|-------------|
| `_id` | ObjectId | Primary Key | Auto-generated |
| `hotel` | ObjectId | Ref: `'Hotel'`, Required, Indexed | Parent property reference |
| `roomType` | String | Required, Trim | Category (e.g. `Deluxe King Suite`) |
| `description` | String | Trim | Suite features and view details |
| `images` | Array of String | URLs | Interior suite photography |
| `capacity` | Subdocument | `{ maxGuests, adults, children }` | Guest accommodation bounds |
| `bedConfiguration` | String | e.g. `'1 King Bed'` | Bed setup |
| `sizeSqFt` | Number | Default: 350 | Square footage |
| `amenities` | Array of String | Features | Ensuite bath, espresso, balcony, smart TV |
| `pricePerNight` | Number | Required, Min: 0 | Trusted nightly rate in INR |
| `totalInventory` | Number | Required, Min: 1, Default: 5 | Total physical rooms of this category |
| `isActive` | Boolean | Default: `true` | Availability toggle |

**Indexes:**
- Compound index on `{ hotel: 1, isActive: 1 }`.
- Index on `{ pricePerNight: 1 }` for price sorting.

---

## 4. Booking Model (`server/src/models/Booking.js`)

Stores reservations, guest information, financial breakdowns, and status.

| Field | Type | Attributes | Description |
|-------|------|------------|-------------|
| `_id` | ObjectId | Primary Key | Auto-generated |
| `bookingReference` | String | Required, Unique, Uppercase, Indexed | e.g. `HP-DEMO-7721` |
| `user` | ObjectId | Ref: `'User'`, Required, Indexed | Customer owner |
| `hotel` | ObjectId | Ref: `'Hotel'`, Required, Indexed | Reserved hotel property |
| `room` | ObjectId | Ref: `'Room'`, Required, Indexed | Reserved room category |
| `checkIn` | Date | Required | Start date of stay |
| `checkOut` | Date | Required | Departure date |
| `nights` | Number | Required, Min: 1 | Duration of stay in days |
| `roomCount` | Number | Required, Default: 1 | Number of rooms booked |
| `guestDetails` | Subdocument | Required | `{ primaryGuestName, email, phone, specialRequests, adults, children }` |
| `pricing` | Subdocument | Required | Server-calculated `{ pricePerNight, subtotal, taxAndFees, discount, totalAmount }` |
| `bookingStatus` | String | Enum: `['confirmed', 'cancelled', 'completed']` | Reservation lifecycle state |
| `paymentStatus` | String | Enum: `['pending', 'paid', 'demo_verified', 'refunded']` | Settlement status |
| `paymentMethod` | String | Default: `'demo_checkout'` | Payment route indicator |
| `cancellationReason` | String | Optional | Recorded reason when cancelled |
| `cancelledAt` | Date | Optional | Cancellation timestamp |

---

## 5. Booking Half-Open Interval Logic

Two bookings for room $R$ overlap if and only if:
$$\text{existing.checkIn} < \text{requested.checkOut} \quad\land\quad \text{existing.checkOut} > \text{requested.checkIn}$$

**Safety Guarantees:**
1. Cancelled bookings (`bookingStatus === 'cancelled'`) are excluded from overlap checks.
2. The server sums all overlapping rooms across non-cancelled bookings. If `currentlyBooked + requestedCount > totalInventory`, reservation is rejected with `409 Conflict`.
3. Client-submitted prices are completely ignored; rates are calculated server-side from `room.pricePerNight`.

