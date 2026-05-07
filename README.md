# GlamCart — Beauty & Cosmetics E-Commerce Platform

A full-stack beauty e-commerce app inspired by Nykaa. Includes a **Next.js web app**, a **Node.js REST API**, and a **Flutter mobile app** — all connected to the same backend.

---

## Project Overview

GlamCart lets users browse beauty products across categories like Makeup, Skincare, Haircare, and Fragrance. Users can add items to their cart, apply coupons, manage wishlists, save delivery addresses, and place orders with Cash on Delivery or Razorpay (UPI, Card, Net Banking).

---

## Features

### Web (Next.js)
- Browse products with filters (category, brand, price range, search)
- Product detail page with image gallery, ratings, and reviews
- Add to cart / wishlist (redirects to login if unauthenticated, then completes the action automatically after sign-in)
- Apply coupon codes — selectable coupon list with one-tap apply
- Multi-step checkout: Address → Payment → Review
- Razorpay integration (UPI, Card, Net Banking) + Cash on Delivery
- Order history with status tracking
- Profile management and address book

### Mobile (Flutter)
- Login / Register with full validation
- Product listing and detail screens
- Cart and checkout with coupon support
- Order history

### Backend (REST API)
- JWT authentication (7-day tokens)
- Role-based access (USER / ADMIN)
- Product catalog with categories and brands
- Cart, wishlist, orders, and address management
- Coupon validation (percent and flat discount)
- Razorpay order creation and payment verification

---

## Tech Stack

| Layer | Technology |
|---|---|
| Web Frontend | Next.js 14 (App Router), Tailwind CSS |
| Mobile | Flutter (Dart) |
| Backend | Node.js, Express.js |
| ORM | Prisma |
| Database | PostgreSQL |
| Auth | JWT + bcrypt |
| Payments | Razorpay (test mode) |
| HTTP Client | Axios (web), Dio (Flutter) |

---

## Folder Structure

```
nykaa_clone/
├── backend/                    # Express REST API
│   ├── prisma/
│   │   ├── schema.prisma       # All database models
│   │   └── seed.js             # Seed: categories, brands, products, coupons, demo user
│   └── src/
│       ├── index.js            # Entry point — all routes registered here
│       ├── middleware/
│       │   └── auth.js         # JWT authenticate & authorizeAdmin middleware
│       ├── utils/
│       │   └── jwt.js          # generateToken()
│       └── routes/
│           ├── auth.js         # Register, Login, Me
│           ├── products.js     # List, detail, filters, search, pagination
│           ├── categories.js   # Category tree
│           ├── brands.js       # Brand list
│           ├── cart.js         # Add, update, remove, clear
│           ├── wishlist.js     # Add, remove, list
│           ├── orders.js       # Place order, list, detail
│           ├── users.js        # Profile, change password, addresses
│           ├── coupons.js      # List active coupons, validate
│           └── payments.js     # Razorpay create order & verify
│
├── frontend/                   # Next.js 14 web app
│   └── src/
│       ├── lib/
│       │   └── api.js          # All API calls (Axios). Auto-attaches JWT from localStorage.
│       ├── context/
│       │   ├── AuthContext.js  # User auth state, token management
│       │   └── CartContext.js  # Cart state, add/update/remove
│       ├── components/
│       │   ├── Header.js       # Sticky header with search, cart count, user menu
│       │   ├── Footer.js
│       │   └── ProductCard.js  # Reusable product tile
│       └── app/                # Next.js App Router pages
│           ├── page.js         # Homepage
│           ├── products/       # Product listing + [slug] detail
│           ├── cart/           # Cart with coupon section
│           ├── checkout/       # Multi-step checkout
│           ├── orders/         # Order list + [id] detail
│           ├── login/
│           ├── register/
│           ├── profile/        # Profile + address book
│           └── wishlist/
│
└── glamcart_flutter/           # Flutter mobile app
    └── lib/
        ├── main.dart
        ├── config/             # API base URL, constants
        ├── models/             # Data models
        ├── providers/          # State management
        ├── services/
        │   └── api_service.dart  # Dio HTTP client, all API calls
        ├── screens/            # One file per screen
        │   ├── splash_screen.dart
        │   ├── login_screen.dart
        │   ├── register_screen.dart
        │   ├── home_screen.dart
        │   ├── products_screen.dart
        │   ├── product_detail_screen.dart
        │   ├── cart_screen.dart
        │   ├── checkout_screen.dart
        │   └── orders_screen.dart
        └── widgets/            # Reusable UI components
```

---

## Architecture

```
┌─────────────────┐     ┌─────────────────┐
│  Next.js Web    │     │  Flutter Mobile  │
│  (port 3000)    │     │  (iOS / Android) │
└────────┬────────┘     └────────┬─────────┘
         │  HTTP (Axios / Dio)   │
         └──────────┬────────────┘
                    ▼
         ┌──────────────────┐
         │  Express REST API │
         │  (port 5002)      │
         │  JWT Auth         │
         │  Razorpay         │
         └────────┬──────────┘
                  │  Prisma ORM
                  ▼
         ┌──────────────────┐
         │   PostgreSQL DB   │
         │  nykaa_latest     │
         └──────────────────┘
```

- All API calls flow through a single Axios instance (`lib/api.js`) that auto-attaches the JWT from `localStorage`.
- Cart and Auth state live in React Context (`CartContext`, `AuthContext`) and are shared across all pages.
- The Flutter app uses Dio with a shared `ApiService` singleton.

---

## Setup

### Prerequisites
- Node.js 18+
- PostgreSQL running locally
- Flutter SDK (for mobile)

### 1. Clone the repo
```bash
git clone https://github.com/hamja-prakash/nykaa_clone.git
cd nykaa_clone
```

### 2. Backend setup
```bash
cd backend
npm install
```

Create `backend/.env`:
```env
DATABASE_URL="postgresql://postgres:password@127.0.0.1:5432/nykaa_latest"
JWT_SECRET="your-secret-key"
RAZORPAY_KEY_ID="rzp_test_xxxx"
RAZORPAY_KEY_SECRET="your-razorpay-secret"
PORT=5002
```

Run migrations and seed:
```bash
npx prisma migrate dev --name init
node prisma/seed.js
```

Start the server:
```bash
npm run dev
```

### 3. Frontend (Web) setup
```bash
cd frontend
npm install
npm run dev
```

Web app runs at `http://localhost:3000`.

### 4. Flutter (Mobile) setup
```bash
cd glamcart_flutter
flutter pub get
```

Update the API base URL in `lib/config/` to point to your backend (e.g. `http://10.0.2.2:5002/api` for Android emulator or your machine's local IP for a physical device).

```bash
flutter run
```

---

## Demo Credentials

| Field | Value |
|---|---|
| Email | `demo@glamcart.com` |
| Password | `Demo@1234` |
| Coupon | `GLAMCART10` (10% off, min order ₹500) |

### Available Coupons

| Code | Discount | Min Order |
|---|---|---|
| `GLAMCART10` | 10% off (max ₹200) | ₹500 |
| `FIRST50` | ₹50 flat off | ₹299 |
| `BEAUTY20` | 20% off (max ₹300) | ₹799 |
| `SKINCARE15` | 15% off (max ₹250) | ₹599 |
| `FREESHIP` | ₹49 off (free delivery) | None |
| `MEGA30` | 30% off (max ₹500) | ₹1499 |

---

## Database Models

| Model | Description |
|---|---|
| `User` | Auth, profile, role (USER/ADMIN) |
| `Address` | Delivery addresses linked to user |
| `Category` | Self-referencing tree (parent → children) |
| `Brand` | Product brands |
| `Product` | Catalog with slug, images, price, stock, discount |
| `CartItem` | Composite key `userId_productId` |
| `WishlistItem` | Composite key `userId_productId` |
| `Order` + `OrderItem` | Placed orders with line items |
| `Review` | Product reviews with rating |
| `Coupon` | PERCENT or FLAT discount with min order and usage limits |

---

## Validation Rules

Enforced on both frontend and backend:

| Field | Rule |
|---|---|
| Name | Minimum 2 characters |
| Email | Valid email format |
| Password | Minimum 8 characters + at least 1 special character (`@`, `#`, `$`, etc.) |
| Phone | Exactly 10 digits |
| Pincode | Exactly 6 digits |

---

## Known Limitations

- **Razorpay is in test mode** — no real payments are processed. Use Razorpay test card/UPI details.
- **No image upload** — product images are stored as URLs. Uploading via the app is not supported.
- **No admin panel UI** — admin actions (add products, manage orders) must be done via API or seed script.
- **Flutter app is a companion** — not all web features are available in Flutter (e.g. wishlist, profile editing).
- **No email notifications** — order confirmation emails are not sent.
- **Single currency** — INR only, no multi-currency support.

---

## Color Theme

| Token | Hex |
|---|---|
| Primary Pink | `#fc2779` |
| Dark Pink | `#e01f6a` |
| Light Pink | `#ffe0ef` |
