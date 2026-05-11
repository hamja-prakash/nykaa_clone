# GlamCart — Beauty & Cosmetics E-Commerce Platform

![Next.js](https://img.shields.io/badge/Next.js-14-black?logo=next.js)
![Node.js](https://img.shields.io/badge/Node.js-18%2B-green?logo=node.js)
![Flutter](https://img.shields.io/badge/Flutter-3.x-blue?logo=flutter)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-blue?logo=postgresql)
![Prisma](https://img.shields.io/badge/Prisma-5-2D3748?logo=prisma)
![Razorpay](https://img.shields.io/badge/Razorpay-Test_Mode-3395FF)

A full-stack beauty e-commerce platform inspired by Nykaa. Ships a **Next.js web app**, a **Node.js REST API**, and a **Flutter mobile app** — all sharing the same PostgreSQL database via Prisma ORM.

---

## Table of Contents

1. [Features](#features)
2. [Tech Stack](#tech-stack)
3. [Architecture](#architecture)
4. [Folder Structure](#folder-structure)
5. [Setup](#setup)
6. [Available Scripts](#available-scripts)
7. [API Reference](#api-reference)
8. [Demo Credentials & Coupons](#demo-credentials--coupons)
9. [Database Models](#database-models)
10. [Validation Rules](#validation-rules)
11. [Known Limitations](#known-limitations)

---

## Features

### Web (Next.js)
- Hero carousel, category grid, featured products and bestsellers on homepage
- Product listing with filters: category, brand, price range, search, featured, bestseller flags
- Sorting by relevance, price, rating, newest
- Product detail page with image gallery, ratings, and customer reviews
- Add to cart / wishlist — redirects guest to login then completes the action automatically after sign-in
- Cart with quantity controls and coupon code input
- Collapsible coupon list (one-tap apply)
- Multi-step checkout: Address → Payment → Review
- Razorpay integration (UPI, Card, Net Banking) + Cash on Delivery
- Order history and order detail view
- Profile management: name, phone, avatar
- Address book: add, set default, delete

### Mobile (Flutter)
- Splash screen with auto-login from saved token
- Login / Register with field-level validation
- Home screen with featured products
- Product listing with category and price filters
- Product detail with add-to-cart
- Cart with quantity controls
- Checkout with address and payment selection
- Order history with status badges

### Backend (REST API)
- JWT authentication (7-day tokens, auto-invalidated on 401)
- Role-based access: `USER` and `ADMIN`
- Full product catalog with categories (tree) and brands
- Cart with upsert pattern (adds or increments quantity)
- Wishlist, orders, address management
- Coupon validation: PERCENT (capped) and FLAT discounts, with min-order, usage limits, expiry
- Razorpay order creation and HMAC signature verification
- Colour-coded request logger (green/yellow/red by status code)

---

## Tech Stack

| Layer | Technology | Version |
|---|---|---|
| Web Frontend | Next.js (App Router) + Tailwind CSS | 14 |
| Mobile | Flutter (Dart) | 3.x |
| Backend | Node.js + Express.js | 18+ / 4.x |
| ORM | Prisma | 5 |
| Database | PostgreSQL | 14+ |
| Auth | JSON Web Tokens + bcryptjs | — |
| Payments | Razorpay (test mode) | 2.x |
| HTTP Client | Axios (web), Dio (Flutter) | — |
| State (web) | React Context API | — |
| State (mobile) | Flutter Provider | — |

---

## Architecture

### System Diagram

```
  ┌──────────────────────┐     ┌──────────────────────┐
  │   Next.js Web App    │     │   Flutter Mobile App  │
  │   localhost:3000     │     │   iOS / Android       │
  │                      │     │                       │
  │  AuthContext ─────┐  │     │  AuthProvider ─────┐  │
  │  CartContext ─────┤  │     │  CartProvider ─────┤  │
  └──────────────┬────┘  │     └───────────────┬────┘  │
                 │  Axios│                      │  Dio  │
                 └───────┘                      └───────┘
                          │   HTTP/JSON   │
                          └───────┬───────┘
                                  │
                    ┌─────────────▼──────────────┐
                    │     Express REST API        │
                    │     localhost:5002          │
                    │                            │
                    │  ┌──────────────────────┐  │
                    │  │  JWT Middleware       │  │
                    │  │  (authenticate)       │  │
                    │  └──────────────────────┘  │
                    │                            │
                    │  Routes: auth, products,   │
                    │  cart, orders, wishlist,   │
                    │  users, coupons, payments  │
                    │                            │
                    │  Prisma ORM (singleton)    │
                    └─────────────┬──────────────┘
                                  │
                    ┌─────────────▼──────────────┐
                    │        PostgreSQL           │
                    │    db: nykaa_latest         │
                    │                            │
                    │  11 models: User, Product, │
                    │  Cart, Order, Coupon, ...  │
                    └────────────────────────────┘
```

### Authentication Flow

```
  Client                  API                   DB
    │                      │                     │
    │  POST /auth/login     │                     │
    │  { email, password }  │                     │
    │──────────────────────►│                     │
    │                       │  findUnique(email)  │
    │                       │────────────────────►│
    │                       │◄────────────────────│
    │                       │  bcrypt.compare()   │
    │  { user, token }      │                     │
    │◄──────────────────────│                     │
    │                       │                     │
    │  (store token in      │                     │
    │   localStorage /      │                     │
    │   SharedPreferences)  │                     │
    │                       │                     │
    │  GET /cart            │                     │
    │  Authorization: Bearer│                     │
    │──────────────────────►│                     │
    │                       │  jwt.verify()       │
    │                       │  → req.user.id      │
    │  [cart items]         │                     │
    │◄──────────────────────│                     │
```

### Key Design Decisions

| Decision | Reason |
|---|---|
| Single Prisma singleton (`src/db.js`) | Prevents spawning 10+ separate connection pools (one per route file) |
| Axios / Dio interceptors attach JWT | No page needs to manually pass the token — all API calls are authenticated automatically |
| Cart uses upsert on `userId_productId` | Prevents duplicate cart rows; adding same product just increments quantity |
| React `useCallback` with `[]` deps for `fetchCart` | Avoids stale closure bug after login — reads JWT from localStorage via interceptor, not React state |
| `navigator.onLine` check in error handler | Distinguishes "server is down" from "no internet connection" for a correct error message |
| Shared `utils/validate.js` | Email, password, phone, pincode validators defined once — used in both auth and users routes |

---

## Folder Structure

```
nykaa_clone/
├── backend/                    # Express REST API
│   ├── .env.example            # Environment variable template
│   ├── prisma/
│   │   ├── schema.prisma       # All 11 database models
│   │   └── seed.js             # Seed: categories, brands, 40+ products, coupons, demo user
│   └── src/
│       ├── index.js            # Entry point — all routes registered, request logger
│       ├── db.js               # Singleton PrismaClient (import this in routes)
│       ├── middleware/
│       │   └── auth.js         # JWT authenticate & authorizeAdmin
│       ├── utils/
│       │   ├── jwt.js          # generateToken(payload) → 7-day JWT
│       │   └── validate.js     # validateEmail / validatePassword / validatePhone / validatePincode
│       └── routes/
│           ├── auth.js         # POST /register, POST /login, GET /me
│           ├── products.js     # GET / (filters, search, pagination), GET /:slug
│           ├── categories.js   # GET /, GET /:slug
│           ├── brands.js       # GET /, GET /:slug
│           ├── cart.js         # GET, POST, PATCH /:productId, DELETE /:productId, DELETE /
│           ├── wishlist.js     # GET, POST, DELETE /:productId
│           ├── orders.js       # GET, GET /:id, POST (place order from cart)
│           ├── users.js        # GET/PATCH profile, change-password, GET/POST/DELETE addresses
│           ├── coupons.js      # GET / (public), POST /validate
│           └── payments.js     # POST /create-order, POST /verify (Razorpay)
│
├── frontend/                   # Next.js 14 web app
│   └── src/
│       ├── lib/
│       │   └── api.js          # All API calls (Axios). Auto-attaches JWT from localStorage.
│       ├── context/
│       │   ├── AuthContext.js  # User auth state, token management, signIn/signOut
│       │   └── CartContext.js  # Cart state, add/update/remove, cart count & total
│       ├── components/
│       │   ├── Header.js       # Sticky header with search, cart badge, user dropdown
│       │   ├── Footer.js
│       │   ├── ProductCard.js  # Reusable product tile with wishlist toggle
│       │   └── ui/
│       │       ├── ErrorState.js   # Reusable error block (icon + message + retry button)
│       │       └── LoadingGrid.js  # Reusable skeleton loading grid
│       └── app/                # Next.js App Router pages
│           ├── page.js         # Homepage (hero carousel, categories, featured, bestsellers)
│           ├── products/       # Product listing + [slug] detail page
│           ├── cart/           # Cart with coupon section
│           ├── checkout/       # 3-step checkout (address → payment → review)
│           ├── orders/         # Order history + [id] order detail
│           ├── login/          # Login form
│           ├── register/       # Registration form
│           ├── profile/        # Profile editor + address book
│           └── wishlist/       # Saved products
│
└── glamcart_flutter/           # Flutter mobile app
    └── lib/
        ├── main.dart           # App entry, Provider setup, route guards
        ├── config/
        │   └── api_config.dart # API base URL + Razorpay key
        ├── models/             # user.dart, product.dart, cart_item.dart, order.dart, address.dart
        ├── providers/
        │   ├── auth_provider.dart   # Login, register, logout, init from SharedPreferences
        │   └── cart_provider.dart   # Cart operations with error propagation
        ├── services/
        │   └── api_service.dart     # Dio singleton, auth interceptor, getErrorMessage()
        ├── screens/
        │   ├── splash_screen.dart
        │   ├── login_screen.dart
        │   ├── register_screen.dart
        │   ├── home_screen.dart
        │   ├── products_screen.dart
        │   ├── product_detail_screen.dart
        │   ├── cart_screen.dart
        │   ├── checkout_screen.dart
        │   └── orders_screen.dart
        └── widgets/
            └── product_card.dart    # Reusable product card widget
```

---

## Setup

### Prerequisites

| Tool | Version | Install |
|---|---|---|
| Node.js | 18+ | https://nodejs.org |
| PostgreSQL | 14+ | https://postgresql.org |
| Flutter SDK | 3.x | https://flutter.dev |
| Git | any | https://git-scm.com |

---

### Step 1 — Clone the repo

```bash
git clone https://github.com/hamja-prakash/nykaa_clone.git
cd nykaa_clone
```

---

### Step 2 — Create the PostgreSQL database

```bash
# Connect to PostgreSQL and create the database
psql -U postgres -c "CREATE DATABASE nykaa_latest;"
```

> If your PostgreSQL user or password is different, update the `DATABASE_URL` in the next step accordingly.

---

### Step 3 — Backend setup

```bash
cd backend
npm install
```

Copy the environment template and fill in your values:

```bash
cp .env.example .env
```

Edit `backend/.env`:

```env
DATABASE_URL="postgresql://postgres:password@127.0.0.1:5432/nykaa_latest"
JWT_SECRET="any-long-random-string"
RAZORPAY_KEY_ID="rzp_test_xxxxxxxxxxxx"
RAZORPAY_KEY_SECRET="your-razorpay-secret"
PORT=5002
```

> Get Razorpay test credentials free at [dashboard.razorpay.com](https://dashboard.razorpay.com). Without them, Razorpay payment flows won't work, but all other features (COD, cart, orders) still work.

Run database migrations and seed sample data:

```bash
npm run db:migrate     # creates all tables (runs prisma migrate dev)
npm run db:seed        # seeds 6 categories, 10 brands, 40+ products, 6 coupons, 1 demo user
```

Start the backend:

```bash
npm run dev            # starts with nodemon (auto-restarts on file changes)
```

Verify it's running:

```bash
curl http://localhost:5002/api/health
# Expected: {"status":"ok","message":"GlamCart API running"}
```

---

### Step 4 — Frontend (Web) setup

```bash
cd ../frontend
npm install
```

Optionally create `frontend/.env.local` if your backend runs on a different port:

```env
NEXT_PUBLIC_API_URL=http://localhost:5002/api
```

> If this file is absent, the frontend defaults to `http://localhost:5002/api`.

Start the dev server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

### Step 5 — Flutter (Mobile) setup

```bash
cd ../glamcart_flutter
flutter pub get
```

Update the API URL in [lib/config/api_config.dart](glamcart_flutter/lib/config/api_config.dart) if needed:

```dart
// For Android emulator (maps to your Mac's localhost):
static const String baseUrl = 'http://10.0.2.2:5002/api';

// For iOS Simulator or physical device on same WiFi:
static const String baseUrl = 'http://YOUR_LOCAL_IP:5002/api';

// For development on the same machine:
static const String baseUrl = 'http://localhost:5002/api';
```

Run the app:

```bash
flutter run
```

---

### Troubleshooting

| Problem | Cause | Fix |
|---|---|---|
| `EADDRINUSE :::5002` | Previous server process still running | `lsof -ti :5002 \| xargs kill -9` |
| `EADDRINUSE :::3000` | Previous Next.js process still running | `lsof -ti :3000 \| xargs kill -9` |
| `Error: Cannot find module '.prisma/client'` | Prisma client not generated | `cd backend && npx prisma generate` |
| `npm start` fails with BUILD_ID error | No production build exists | Run `npm run build` first, then `npm start` |
| Flutter: `Connection refused` on Android emulator | `localhost` doesn't resolve in emulator | Use `10.0.2.2` instead of `localhost` |
| `Invalid database URL` | Wrong Postgres credentials | Check `DATABASE_URL` in `backend/.env` |
| Products page shows "Server is unavailable" | Backend not running | Start backend with `npm run dev` in `backend/` |

---

## Available Scripts

### Backend (`cd backend`)

| Script | Command | What it does |
|---|---|---|
| Start dev | `npm run dev` | Start with nodemon (auto-restart) |
| Start prod | `npm start` | Start with node (no auto-restart) |
| Migrate DB | `npm run db:migrate` | Run Prisma migrations |
| Seed DB | `npm run db:seed` | Insert sample data |
| Reset DB | `npm run db:reset` | Drop all data + re-seed |
| Prisma Studio | `npm run db:studio` | Open visual DB browser at :5555 |

### Frontend (`cd frontend`)

| Script | Command | What it does |
|---|---|---|
| Start dev | `npm run dev` | Dev server with hot reload at :3000 |
| Build | `npm run build` | Create production bundle |
| Start prod | `npm start` | Serve the production build |
| Lint | `npm run lint` | Run ESLint |

### Flutter (`cd glamcart_flutter`)

| Command | What it does |
|---|---|
| `flutter pub get` | Install dependencies |
| `flutter run` | Run on connected device/emulator |
| `flutter build apk` | Build Android APK |
| `flutter build ios` | Build iOS (requires Mac + Xcode) |

---

## API Reference

Base URL: `http://localhost:5002/api`

All protected routes require: `Authorization: Bearer <token>`

### Auth

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/auth/register` | No | Create account |
| POST | `/auth/login` | No | Get JWT token |
| GET | `/auth/me` | Yes | Get current user |

### Products

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/products` | No | List with filters (see query params below) |
| GET | `/products/:slug` | No | Single product + reviews |

**Product query params:** `category`, `brand`, `search`, `featured`, `bestseller`, `minPrice`, `maxPrice`, `sort` (relevance/price_asc/price_desc/rating/newest), `page`, `limit`

### Cart

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/cart` | Yes | Get cart items |
| POST | `/cart` | Yes | Add item `{ productId, quantity }` |
| PATCH | `/cart/:productId` | Yes | Update quantity |
| DELETE | `/cart/:productId` | Yes | Remove item |
| DELETE | `/cart` | Yes | Clear cart |

### Orders

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/orders` | Yes | List user's orders |
| GET | `/orders/:id` | Yes | Order detail |
| POST | `/orders` | Yes | Place order from current cart |

### Users

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/users/profile` | Yes | Get profile |
| PATCH | `/users/profile` | Yes | Update name, phone, avatar |
| POST | `/users/change-password` | Yes | Change password |
| GET | `/users/addresses` | Yes | List addresses |
| POST | `/users/addresses` | Yes | Add address |
| DELETE | `/users/addresses/:id` | Yes | Delete address |

### Other

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/categories` | No | Category tree |
| GET | `/brands` | No | Brand list |
| GET | `/wishlist` | Yes | Get wishlist |
| POST | `/wishlist` | Yes | Add to wishlist |
| DELETE | `/wishlist/:productId` | Yes | Remove from wishlist |
| GET | `/coupons` | No | List active coupons |
| POST | `/coupons/validate` | Yes | Validate coupon code |
| POST | `/payments/create-order` | Yes | Create Razorpay order |
| POST | `/payments/verify` | Yes | Verify Razorpay payment |
| GET | `/health` | No | Health check |

---

## Demo Credentials & Coupons

### Login

| Field | Value |
|---|---|
| Email | `demo@glamcart.com` |
| Password | `Demo@1234` |

### Coupons

| Code | Discount | Min Order | Cap |
|---|---|---|---|
| `GLAMCART10` | 10% off | ₹500 | ₹200 |
| `FIRST50` | ₹50 flat | ₹299 | — |
| `BEAUTY20` | 20% off | ₹799 | ₹300 |
| `SKINCARE15` | 15% off | ₹599 | ₹250 |
| `FREESHIP` | ₹49 off | None | — |
| `MEGA30` | 30% off | ₹1499 | ₹500 |

---

## Database Models

| Model | Key Fields | Notes |
|---|---|---|
| `User` | id, email, password (hashed), name, phone, avatar, role | role: USER \| ADMIN |
| `Address` | userId, type, name, phone, line1, city, state, pincode, isDefault | type: HOME \| WORK \| OTHER |
| `Category` | name, slug, parentId | Self-referencing tree for sub-categories |
| `Brand` | name, slug, logo | — |
| `Product` | name, slug, price, mrp, images[], stock, rating, isFeatured, isBestSeller | categoryId + brandId FK |
| `CartItem` | userId, productId, quantity, shade, size | Composite PK: `userId_productId` |
| `WishlistItem` | userId, productId | Composite PK: `userId_productId` |
| `Order` | userId, addressId, status, paymentStatus, subtotal, discount, total | status: PENDING \| CONFIRMED \| SHIPPED \| DELIVERED \| CANCELLED |
| `OrderItem` | orderId, productId, quantity, price, shade, size | Snapshot of product price at time of order |
| `Review` | userId, productId, rating, comment | — |
| `Coupon` | code, type, value, minOrder, maxDiscount, usageLimit, usedCount, expiresAt | type: PERCENT \| FLAT |

---

## Validation Rules

Enforced on both frontend (form) and backend (route handler):

| Field | Rule |
|---|---|
| Name | Minimum 2 characters |
| Email | Valid format (`user@domain.tld`) |
| Password | Minimum 8 characters + at least 1 special character |
| Phone | Exactly 10 digits |
| Pincode | Exactly 6 digits |

---

## Known Limitations

| Area | Limitation |
|---|---|
| Payments | Razorpay is in test mode — no real money moves |
| Images | Product images are URLs only — no file upload support |
| Admin panel | No UI — manage products/coupons via seed script or Prisma Studio |
| Flutter | Some web features absent: wishlist page, profile editing, address book |
| Email | No order confirmation or notification emails |
| Currency | INR only — no multi-currency support |
| Reviews | Review data is seeded; submitting new reviews from UI is not wired up |

---

## Color Theme

| Token | Hex | Usage |
|---|---|---|
| `nykaa-pink` | `#fc2779` | Buttons, active states, badges |
| `nykaa-dark` | `#1a1a2e` | Headings, body text |
| `nykaa-gray` | `#6b7280` | Subtext, placeholders |
| `nykaa-light-gray` | `#f9fafb` | Page backgrounds, section fills |
| `nykaa-border` | `#e5e7eb` | Card borders, dividers |
