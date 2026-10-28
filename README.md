# 🏨 HotelPro — Full-Stack Luxury Hotel Booking & Management System

> **College Capstone / Academic Submission Project**  
> Built with React (Vite) + Node.js/Express + MongoDB (Mongoose) + Bootstrap 5 & Modern CSS.

---

## 🌟 Executive Summary

**HotelPro** is a modern full-stack web application designed for discovering, reserving, and administering boutique luxury hotels and suites across prime destinations in India (Mumbai, Goa, Jaipur, Udaipur, Munnar).

Key capabilities:
- **Guest Experience:** Search properties by destination, dates, and guests; filter by star rating; sort by price and rating; inspect suites with high-res photography; live availability checks; instant booking confirmation with unique vouchers.
- **Customer Portal:** Protected customer reservation history; downloadable/printable vouchers; safe one-click cancellation with instantaneous inventory restoration.
- **Admin Control Center:** Real-time KPI metrics aggregated directly from database records (net revenue, booking counts, destination distribution); property and suite inventory CRUD; global reservation status manager.
- **Security Baseline:** Bcrypt salted password hashing, JWT in secure HttpOnly cookies / Authorization headers, Express rate limiting, Helmet security headers, server-side date validation (half-open intervals), and strict role-based access control (RBAC).
- **Dual-Engine Persistence:** Connects to standard MongoDB (`mongodb://127.0.0.1:27017/hotelpro` or MongoDB Atlas). If an external MongoDB daemon is not running on the examiner's computer, HotelPro automatically activates an embedded in-memory persistence engine with complete seed data, ensuring zero crashes during evaluation!

---

## 🛠️ Technology Stack

| Layer | Technologies |
|-------|--------------|
| **Frontend** | React 18, Vite, React Router v6, Axios, Bootstrap 5, Bootstrap Icons, Custom CSS |
| **Backend** | Node.js (ES Modules), Express.js, Helmet, CORS, Cookie-Parser, Morgan, Express-Rate-Limit |
| **Database** | MongoDB & Mongoose (with automated in-memory persistence fallback) |
| **Authentication** | JSON Web Tokens (JWT), Bcrypt.js password hashing, HttpOnly cookies |
| **Testing** | Node.js Test Runner (`node --test`), Supertest |

---

## 🚀 Quick Start Guide

### 1. Prerequisites
- **Node.js:** v18.0.0 or higher (Tested on Node v24.18.0)
- **npm:** v9.0.0 or higher
- *(Optional)* **MongoDB:** Running locally or a MongoDB Atlas URI (if omitted, the in-memory engine boots automatically).

### 2. Installation
Clone or navigate to the project directory:
```bash
cd hotelpro
```

Install server and client dependencies:
```bash
# In server directory:
cd server
npm install

# In client directory:
cd ../client
npm install
cd ..
```

### 3. Environment Variables
Copy `.env.example` to `server/.env`:
```bash
cp .env.example server/.env
```
*(Default settings work out-of-the-box without modifying any keys).*

### 4. Running the Application
From the `hotelpro` root folder, run:
```bash
npm start
```
This starts both the Express API server (Port 5000) and the Vite development client (Port 5173).

Alternatively, run services independently in separate terminal windows:
```bash
# Terminal 1: Backend Server (Port 5000)
cd server
npm run dev

# Terminal 2: Frontend Client (Port 5173)
cd client
npm run dev
```

Visit the application in your browser:
- **Client Application:** [http://localhost:5173](http://localhost:5173)
- **Backend API:** [http://localhost:5000/api](http://localhost:5000/api)
- **Health Check:** [http://localhost:5000/api/health](http://localhost:5000/api/health)

---

## 👤 Configured Demo Credentials

The application is pre-seeded with two accounts for frictionless evaluation:

| Role | Email | Password | Features Accessible |
|------|-------|----------|---------------------|
| **Customer** | `jane@example.com` | `UserPassword123!` | Search, book suites, view reservation vouchers, cancel reservations. |
| **Administrator** | `admin@hotelpro.com` | `AdminPassword123!` | Full admin dashboard, revenue analytics, hotel & suite CRUD, booking status manager. |

*(Quick autofill buttons are provided directly on the Login page).*

---

## 🧪 Automated Testing

Run the automated integration, security audit, and end-to-end journey test suites (28 tests total):
```bash
npm test
```
**Test Suites & Coverage:**
- **Health Check & Architecture:** Service status, uptime, and database connection state
- **Public Inventory:** Hotel listings with dynamic minimum rate calculation, city queries, and star rating filters
- **Authentication & RBAC:** Salted bcrypt hashing, JWT token issuance, protected endpoints, customer rejection on administrative resources (403 Forbidden)
- **Security & CORS:** Rejection of unauthorized origins with credentials, dedicated authentication rate limiting, ReDoS safe query escaping
- **Financial & Booking Calculation:** Server-side stay pricing (`nights * price + 12% GST`), capacity validation, half-open interval availability verification
- **Integrity & Concurrency:** Prevention of booking completed or past stays, prevention of double bookings when rooms are exhausted
- **Administrative Operations:** Real MongoDB aggregation metrics, property & suite inventory CRUD, global reservation manager, and user account status administration
- **Payment Verification:** HMAC-SHA256 signature verification when Razorpay keys are configured, honest demo fallback otherwise

---

## 📁 Repository Structure

```
hotelpro/
├── client/                     # Frontend React + Vite Application
│   ├── public/                 # Static assets
│   ├── src/
│   │   ├── api/                # Axios instance & interceptors (client.js)
│   │   ├── components/         # Navbar, Footer, ImageWithFallback, ProtectedRoute
│   │   ├── context/            # AuthContext (login, register, logout, session)
│   │   ├── pages/
│   │   │   ├── public/         # HomePage, HotelListing, HotelDetail, Confirmation, About, Contact, 404
│   │   │   ├── auth/           # LoginPage, RegisterPage
│   │   │   ├── user/           # MyBookingsPage, ProfilePage
│   │   │   └── admin/          # AdminDashboardPage (Overview, Hotels, Rooms, Bookings, Users)
│   │   ├── index.css           # Luxury design system (Navy, Gold, Warm Beige)
│   │   ├── App.jsx             # React Router routing table
│   │   └── main.jsx            # Application entrypoint
│   ├── package.json
│   └── vite.config.js
├── server/                     # Backend Node.js + Express API
│   ├── src/
│   │   ├── config/             # Database connection (db.js)
│   │   ├── controllers/        # Auth, Hotel, Room, Booking, Admin controllers
│   │   ├── middleware/         # Auth JWT verification, RBAC, ErrorHandler, Validation
│   │   ├── models/             # User, Hotel, Room, Booking Mongoose schemas
│   │   ├── routes/             # Express route declarations
│   │   ├── services/           # BookingService, In-memory persistence engine (dbStore.js)
│   │   ├── validators/         # Express-validator schemas
│   │   ├── seeds/              # Seed script (5 luxury properties, suites, sample bookings)
│   │   ├── app.js              # Express app configuration & middleware
│   │   └── server.js           # HTTP server listener
│   ├── tests/                  # Automated integration, security, & E2E tests (api, audit, e2e)
│   ├── package.json
│   └── .env.example
├── docs/                       # Project Documentation
│   ├── DEMO_GUIDE.md           # 3-5 minute examiner presentation script
│   ├── API.md                  # REST endpoint reference
│   ├── DATABASE.md             # Schemas, compound indexes, half-open interval logic
│   └── IMPLEMENTATION_STATUS.md # Implementation checklist & test results
├── run-all.js                  # Cross-platform runner for client & server
├── .gitignore
├── .env.example
├── package.json
└── README.md
```

---

## 📖 Additional Documentation

- **[Examiner Demo Guide](docs/DEMO_GUIDE.md)**: Step-by-step presentation script.
- **[REST API Reference](docs/API.md)**: Complete endpoint contract, parameters, and responses.
- **[Database Specification](docs/DATABASE.md)**: Schemas, indexes, relationships, and availability formulas.
- **[Implementation Status](docs/IMPLEMENTATION_STATUS.md)**: Verification log and test outcomes.

---

## 🌐 Production Deployment Guide

HotelPro is production-ready for deployment to single-instance PaaS (Render, Railway, Heroku, Fly.io, DigitalOcean App Platform) or Docker containers.

### 1. Build and Run Commands
- **Install dependencies:** `npm install --prefix server && npm install --prefix client`
- **Build frontend:** `npm run build` (outputs optimized bundle to `client/dist`)
- **Database seed (initial):** `npm run seed` (connects to `MONGODB_URI` and creates initial hotels, rooms, and admin)
- **Start production server:** `npm --prefix server start` (Node serves both the Express REST API and static frontend assets from `client/dist`)

### 2. Required Production Environment Variables
| Variable | Mandatory? | Recommended Production Value / Description |
|----------|------------|--------------------------------------------|
| `NODE_ENV` | **Yes** | `production` |
| `PORT` | **Yes** | `5000` (or injected by hosting platform) |
| `MONGODB_URI` | **Yes** | `mongodb+srv://<user>:<password>@cluster.mongodb.net/hotelpro?retryWrites=true&w=majority` |
| `JWT_SECRET` | **Yes** | High-entropy random 64-character secret string |
| `COOKIE_SECRET` | **Yes** | High-entropy random secret string |
| `CLIENT_URL` | **Yes** | Production domain (e.g. `https://hotelpro.yourdomain.com`) |
| `RAZORPAY_KEY_ID` | Optional | Razorpay Key ID (if enabling live payment) |
| `RAZORPAY_KEY_SECRET` | Optional | Razorpay Secret Key for HMAC-SHA256 verification |

### 3. Production Health Check
- **Endpoint:** `GET /api/health`
- **Expected Status:** `200 OK`
- **Response payload includes:** `status: "ok"`, `uptime`, `database: "connected"`.

---

## 🛡️ License & Academic Integrity
This project was developed for an academic college submission. Feel free to use, modify, and extend this codebase for learning and evaluation.

