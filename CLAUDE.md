# Nykaa Clone - Project Documentation

## Architecture
- **Frontend**: Next.js 14 (App Router) + Tailwind CSS — runs on port 3000
- **Backend**: Node.js + Express + Prisma ORM — runs on port 5001
- **Database**: SQLite (local dev via Prisma)

## Quick Start

### 1. Install dependencies
```bash
cd backend && npm install
cd ../frontend && npm install
```

### 2. Set up database
```bash
cd backend
npx prisma migrate dev --name init
node prisma/seed.js
```

### 3. Run both servers
```bash
# Terminal 1 (backend)
cd backend && npm run dev

# Terminal 2 (frontend)
cd frontend && npm run dev
```

### Demo credentials
- Email: `demo@nykaa.com`
- Password: `password123`
- Coupon code: `NYKAA10` (10% off, min ₹500 order)

## Project Structure
```
Nykaa_clone/
├── backend/
│   ├── prisma/
│   │   ├── schema.prisma      # DB schema (User, Product, Order, Cart, Wishlist, etc.)
│   │   └── seed.js            # Seed data (12 products, brands, categories)
│   └── src/
│       ├── index.js           # Express server entry
│       ├── middleware/auth.js  # JWT authentication middleware
│       ├── routes/            # auth, products, categories, brands, cart, wishlist, orders, users, coupons
│       └── utils/jwt.js
├── frontend/
│   └── src/
│       ├── app/               # Next.js App Router pages
│       ├── components/        # Header, Footer, ProductCard
│       ├── context/           # AuthContext, CartContext
│       └── lib/api.js         # Axios API client
└── package.json               # Monorepo scripts
```

## API Endpoints
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | /api/auth/register | - | Create account |
| POST | /api/auth/login | - | Login |
| GET | /api/auth/me | ✓ | Get current user |
| GET | /api/products | - | List products (filters: category, brand, search, featured, bestseller, price) |
| GET | /api/products/:slug | - | Get product details |
| GET | /api/categories | - | List categories |
| GET | /api/brands | - | List brands |
| GET/POST | /api/cart | ✓ | Get/add cart items |
| PATCH/DELETE | /api/cart/:productId | ✓ | Update/remove cart item |
| GET/POST | /api/wishlist | ✓ | Get/add wishlist items |
| DELETE | /api/wishlist/:productId | ✓ | Remove from wishlist |
| GET/POST | /api/orders | ✓ | List orders / place order |
| GET | /api/orders/:id | ✓ | Get order detail |
| PATCH | /api/users/profile | ✓ | Update profile |
| GET/POST | /api/users/addresses | ✓ | Manage addresses |
| POST | /api/coupons/validate | ✓ | Validate coupon code |

## Color Theme
- **Primary Pink**: `#fc2779` (Nykaa's brand color)
- **Dark Pink**: `#e01f6a`
- **Light Pink**: `#ffe0ef`
- **Pale Pink**: `#fff5f9`
