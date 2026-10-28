# HotelPro — 3-5 Minute Examiner Demonstration Guide

This guide provides a structured, fail-safe walkthrough for presenting **HotelPro** during college project evaluations.

---

## Pre-Demo Setup (10 Seconds)

1. Open your terminal in the `hotelpro` directory:
   ```bash
   cd hotelpro
   ```
2. Start the application:
   ```bash
   npm start
   ```
   *(Or run `npm run server` and `npm run client` in separate terminals).*
3. Open your browser and navigate to:
   **[http://localhost:5173](http://localhost:5173)** (or `http://localhost:5000` if viewing the unified build).

---

## 3–5 Minute Step-by-Step Presentation Walkthrough

### Step 1: Homepage & Visual Aesthetics (45 seconds)
1. Point out the **Navy, Warm Beige, and Gold accents** color palette tailored for luxury hospitality.
2. Note the responsive, clean navbar with navigation links (`Explore Stays`, `About Us`, `Contact & Support`).
3. Scroll through the **Curated Collection** of 5-star properties across Mumbai, Goa, Jaipur, Udaipur, and Munnar.
4. Highlight the **"Why Book with HotelPro"** value pillars (100% Verified Stays, Best Price Promise, Flexible Cancellation, 24/7 Concierge).

### Step 2: Search & Live Filters (45 seconds)
1. On the homepage search bar or the **Explore Stays** page:
   - Click on the destination pills (e.g. **Goa** or **Mumbai**).
   - Filter by **5-Star Luxury Only** or sort by **Price: Low to High**.
2. Explain to the reviewer:
   > *"The frontend queries our Express API (`/api/hotels`), which performs indexed MongoDB query filtering and aggregates the lowest available nightly rate per property."*

### Step 3: Hotel Details & Suite Inspection (45 seconds)
1. Click **"Select Suites"** on any property (e.g., *The Grand Palace Marine Drive* or *Azure Bay Sands*).
2. Showcase:
   - High-resolution photography gallery.
   - Verified hotel amenities, check-in policies, and concierge contact details.
   - The interactive room catalog showing bed types, capacity, and nightly rates.
3. Select dates (e.g., check-in tomorrow, check-out in 3 nights) and click **"Reserve Suite"**.

### Step 4: Authentication & Role Authorization (30 seconds)
1. Notice how the application detects an unauthenticated guest and prompts for login while preserving the destination URL.
2. On the Sign In page, point out the **Quick Demo Access** buttons:
   - Click **"Demo Guest (Jane Doe)"** to auto-fill `jane@example.com` / `UserPassword123!`.
   - Click **"Sign In"**.
3. Note how the session is authenticated using **Bcrypt hashed credentials and JWT in secure HttpOnly cookies / Authorization headers**.

### Step 5: Booking Completion & Official Voucher (45 seconds)
1. In the booking checkout modal:
   - Verify guest contact information.
   - Point out the **real server-side financial calculation**:
     $$\text{Total} = (\text{Room Price} \times \text{Nights} \times \text{Rooms}) + 12\%\text{ Tax}$$
   - Select **"Instant Demo Confirmation"** and click **"Confirm & Book Now"**.
2. Showcase the **Official Booking Voucher** page:
   - Displays a unique reference (e.g. `HP-XXXXX-XXXX`).
   - Confirmed status, guest details, check-in instructions, and financial breakdown.
   - Click **"Print Voucher"** to show printable receipt formatting.

### Step 6: Customer Booking History & Safe Cancellation (30 seconds)
1. Click **"View in My Reservations"** or click the user menu &rarr; **"My Reservations"**.
2. Notice the newly created booking appears at the top of the history list alongside seeded past itineraries.
3. Click **"Cancel Stay"** on a confirmed booking:
   - Select a reason (e.g. "Personal schedule change").
   - Confirm cancellation.
4. Highlight to the reviewer:
   > *"Cancellation updates the status to 'cancelled' in real time and automatically reopens physical room inventory for other guests without overselling."*

### Step 7: Administrator Control Center (60 seconds)
1. Click the user profile icon at top-right &rarr; **"Sign Out"**.
2. Click **"Sign In"** &rarr; click **"System Administrator"** quick-fill button (`admin@hotelpro.com` / `AdminPassword123!`).
3. Click the user profile menu &rarr; **"Admin Control Center"** (`/admin`).
4. Walk through the four admin tabs:
   - **Analytics Overview:** Real MongoDB aggregation counters: Net Revenue, Total Reservations, Active Properties, Registered Guests, and Destination Distribution.
   - **Properties Registry:** View all hotels, toggle active status with one click, or add a new property via the modal.
   - **Suites & Inventory:** Select any hotel and view/configure its physical room counts and prices.
   - **Global Bookings:** View every reservation on the platform and update its status (`Confirmed`, `Completed`, `Cancelled`).
5. Demonstrate security:
   - If a normal customer attempts to access `/admin`, the server enforces strict role authorization and returns `403 Forbidden`.

---

## Configured Demonstration Credentials

| Role | Email | Password | Permissions |
|------|-------|----------|-------------|
| **Demo Customer** | `jane@example.com` | `UserPassword123!` | Public stays, search, booking creation, personal reservation history, voucher printing, cancellation. |
| **System Admin** | `admin@hotelpro.com` | `AdminPassword123!` | Full administrative control, property & suite CRUD, revenue metrics, global bookings management. |

*(Both accounts can be autofilled with one click from the Login page).*

