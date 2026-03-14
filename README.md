# IMS – Inventory Management System (Odoo Hackathon)

A **cross-platform Inventory Management System** built with **React Native (Expo)** and a **Node.js + MySQL** backend. Designed for **Inventory Managers** and **Warehouse Staff** with a user-friendly **dark/light** UI.

---

## Features

### Authentication
- Sign up / Log in
- OTP-based password reset
- Redirect to Inventory Dashboard after login

### Dashboard
- **KPIs:** Total products, low stock, out of stock, pending receipts, pending deliveries, internal transfers scheduled
- **Filters:** By document type (Receipts, Delivery, Internal, Adjustments), status (Draft, Waiting, Ready, Done, Canceled), warehouse/location

### Products
- Create / update products (name, SKU, category, unit of measure, initial stock)
- Stock availability per location
- Product categories
- Reorder / low-stock threshold (min stock qty)

### Operations
1. **Receipts** – Incoming stock (validate → stock increases)
2. **Delivery orders** – Outgoing stock (validate → stock decreases)
3. **Internal transfers** – Move stock between locations (e.g. Main Store → Production Rack)
4. **Stock adjustment** – Enter physical count; system updates and logs the difference
5. **Move history** – Stock ledger (last 100 moves)

### Settings & Profile
- **Warehouse settings** – View warehouses and locations
- **Profile** – My profile, theme (Light / Dark / System), logout

---

## Tech Stack

| Layer    | Technology        |
|----------|-------------------|
| Mobile   | React Native (Expo), React Navigation, AsyncStorage, Axios |
| Backend  | Node.js, Express |
| Database | MySQL (XAMPP / phpMyAdmin) |

---

## Setup

### 1. Database (XAMPP + phpMyAdmin)

1. Start **XAMPP** and run **Apache** and **MySQL**.
2. Open **phpMyAdmin** (e.g. http://localhost/phpmyadmin).
3. Create a database or use the one from the script.
4. Import the schema:
   - Go to **Import** and choose `database/ims_schema.sql`.
   - Or run the SQL file in the SQL tab (creates `ims_odoo` and all tables + seed data).

### 2. Backend (Node.js API)

```bash
cd backend
cp .env.example .env
# Edit .env: set DB_HOST, DB_USER, DB_PASSWORD, DB_NAME, JWT_SECRET
npm install
npm start
```

API runs at **http://localhost:3000**. Health check: `GET http://localhost:3000/api/health`.

### 3. Mobile app (React Native / Expo)

```bash
cd mobile
npm install
npx expo start
```

- Press **a** for Android, **i** for iOS, or scan QR with Expo Go.
- **Important:** On a physical device, set the API base URL to your machine’s IP:
  - Edit `mobile/src/config/api.js` and set `API_BASE_URL` to e.g. `http://192.168.1.5:3000/api`.

---

## Project structure

```
Hacakthon_Cursor/
├── backend/                 # Express API
│   ├── config/db.js        # MySQL connection
│   ├── middleware/auth.js  # JWT auth
│   ├── routes/
│   │   ├── auth.js         # Register, login, forgot/reset password, theme
│   │   ├── products.js     # Products CRUD, categories, UoM
│   │   ├── warehouses.js   # Warehouses, locations
│   │   ├── dashboard.js    # KPIs, pickings list
│   │   └── stock.js        # Receipts, deliveries, internal, adjustment, ledger
│   └── server.js
├── database/
│   └── ims_schema.sql      # Full MySQL schema + seed (UoM, warehouses, locations, categories)
├── mobile/                  # Expo app
│   ├── App.js
│   ├── src/
│   │   ├── config/api.js   # API base URL
│   │   ├── context/        # Theme, Auth
│   │   ├── navigation/     # Auth stack, Drawer, Tabs
│   │   ├── screens/        # Auth, Dashboard, Products, Operations, Settings, Profile
│   │   ├── components/    # CustomDrawer
│   │   └── services/api.js
│   └── assets/
└── README.md
```

---

## API overview

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST   | /api/auth/register | Register |
| POST   | /api/auth/login | Login |
| POST   | /api/auth/forgot-password | Request OTP |
| POST   | /api/auth/reset-password | Reset with OTP |
| GET    | /api/auth/me | Current user (auth) |
| PUT    | /api/auth/theme | Set theme (auth) |
| GET    | /api/dashboard/kpis | Dashboard KPIs |
| GET    | /api/dashboard/pickings | Pickings (filters: type, state, warehouse_id) |
| GET    | /api/products | List products (search, low_stock) |
| GET    | /api/products/:id | Product + stock by location |
| POST   | /api/products | Create product |
| PUT    | /api/products/:id | Update product |
| GET    | /api/warehouses | List warehouses |
| GET    | /api/warehouses/:id/locations | Locations of warehouse |
| POST   | /api/stock/receipts | Create receipt |
| POST   | /api/stock/deliveries | Create delivery |
| POST   | /api/stock/internal | Internal transfer |
| POST   | /api/stock/adjustment | Stock adjustment |
| GET    | /api/stock/ledger | Move history |
| GET    | /api/stock/picking/:id | Picking + moves |

---

## Inventory flow (example)

1. **Receive:** Receipt 100 kg Steel → stock +100.
2. **Transfer:** Internal: Main Store → Production Rack → location updated, total unchanged.
3. **Deliver:** Delivery 20 steel → stock −20.
4. **Adjust:** Physical count: 3 kg damaged → adjustment −3.

All moves are recorded in the **stock ledger**.

---

## Dark / light theme

- **Profile → Appearance:** Light, Dark, or System.
- Stored in AsyncStorage and (when logged in) synced to backend.

---

## Odoo Hackathon – Problem Statement Coverage

- **Core IMS:** Digitized stock operations, centralized, real-time.
- **Target users:** Inventory managers, warehouse staff.
- **Auth:** Sign up, login, OTP password reset, redirect to dashboard.
- **Dashboard:** KPIs and filters (document type, status, warehouse/location).
- **Navigation:** Products (create/update, stock per location, categories, reorder rules concept), Operations (Receipts, Delivery, Adjustment, Move history), Dashboard, Settings (warehouses), Profile (My profile, Logout).
- **Core features:** Product management, Receipts, Delivery orders, Internal transfers, Stock adjustments, Stock ledger.
- **Extra:** Low-stock awareness, multi-warehouse/locations, SKU search and filters.

Good luck with the hackathon.
