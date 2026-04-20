# IMS – Inventory Management System
## Project Report
### Odoo Hackathon 2026

---

**Project Title:** IMS – Inventory Management System
**Technology Stack:** React Native (Expo), Node.js, Express, MySQL
**Team Member:** Jay Dholariya
**Date:** April 2026

---

## 1. Introduction

The IMS (Inventory Management System) is a cross-platform mobile and web application developed as part of the Odoo Hackathon 2026. The system is designed to digitize and streamline inventory operations for businesses that manage physical stock across multiple warehouses and locations.

Traditional inventory management relies heavily on manual processes, spreadsheets, and paper-based records, which are prone to errors, delays, and data inconsistencies. The IMS addresses these challenges by providing a real-time, centralized platform accessible from both mobile devices and web browsers.

The application supports two types of users: Inventory Managers, who oversee the entire stock lifecycle, and Warehouse Staff, who perform day-to-day stock operations such as receiving goods, dispatching deliveries, and conducting stock adjustments.

The system is built using React Native with Expo for the mobile frontend, Node.js with Express for the backend API, and MySQL as the relational database. The architecture follows a client-server model where the mobile app communicates with the backend through a RESTful API secured with JSON Web Tokens (JWT).

---

## 2. Objectives

The primary objectives of the IMS project are as follows:

- To develop a cross-platform inventory management application that works on both Android mobile devices and web browsers.
- To implement secure user authentication with role-based access for Inventory Managers and Warehouse Staff.
- To provide a real-time dashboard displaying key performance indicators (KPIs) such as total products, low stock alerts, out-of-stock items, and pending operations.
- To enable complete product lifecycle management including creation, updating, stock tracking per location, and category management.
- To implement core stock operations including Receipts (incoming goods), Delivery Orders (outgoing goods), Internal Transfers (between locations), and Stock Adjustments (physical count corrections).
- To maintain a complete stock ledger that records every stock movement with before and after quantities for full traceability.
- To support multi-warehouse and multi-location stock management.
- To provide a responsive user interface that adapts to different screen sizes with support for both dark and light themes.
- To implement OTP-based password reset functionality for account recovery.

---

## 3. System Architecture

The IMS follows a three-tier architecture:

**Presentation Layer:** React Native (Expo) mobile application with React Navigation for screen management, AsyncStorage for local data persistence, and Axios for HTTP communication.

**Business Logic Layer:** Node.js with Express framework providing RESTful API endpoints. JWT middleware handles authentication and authorization for protected routes.

**Data Layer:** MySQL relational database managed through XAMPP/phpMyAdmin, containing tables for users, products, warehouses, locations, stock quantities, stock movements, and stock ledger entries.

### Project Structure

```
Hacakthon_Cursor/
├── backend/
│   ├── config/db.js          MySQL connection pool
│   ├── middleware/auth.js    JWT authentication middleware
│   ├── routes/
│   │   ├── auth.js           Authentication endpoints
│   │   ├── products.js       Product management endpoints
│   │   ├── warehouses.js     Warehouse and location endpoints
│   │   ├── dashboard.js      KPI and picking list endpoints
│   │   └── stock.js          Stock operation endpoints
│   └── server.js             Express application entry point
├── database/
│   ├── ims_schema.sql        Database schema and seed data
│   └── dummy_data.sql        Sample data for testing
└── mobile/
    ├── App.js                Application entry point
    └── src/
        ├── config/api.js     API base URL configuration
        ├── context/          Theme and Auth context providers
        ├── navigation/       Navigation stack and drawer
        ├── screens/          All application screens
        ├── components/       Reusable UI components
        └── services/api.js   Axios instance configuration
```

---

## 4. Code Explanation

### 4.1 Backend Entry Point (server.js)

The backend is initialized using Express.js. CORS is enabled to allow cross-origin requests from the mobile application. All route modules are registered under the `/api` prefix. A global error handler catches unhandled exceptions and returns a standardized error response.

```javascript
require('dotenv').config();
const express = require('express');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/products', productsRoutes);
app.use('/api/warehouses', warehousesRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/stock', stockRoutes);

app.listen(PORT, () => {
  console.log(`IMS API running on http://localhost:${PORT}`);
});
```

The server listens on port 3000 by default, configurable through environment variables. This allows flexible deployment across different environments.

### 4.2 Authentication (auth.js route)

User registration hashes passwords using bcryptjs with a salt factor of 10 before storing in the database. Login validates credentials and issues a JWT token valid for 7 days. The token is used for all subsequent authenticated requests.

```javascript
router.post('/register', async (req, res) => {
  const { email, password, full_name, role } = req.body;
  const hash = await bcrypt.hash(password, 10);
  await db.query(
    'INSERT INTO users (email, password_hash, full_name, role) VALUES (?, ?, ?, ?)',
    [email, hash, full_name, role || 'warehouse_staff']
  );
  const token = jwt.sign({ id: rows[0].id, email }, JWT_SECRET, { expiresIn: '7d' });
  res.status(201).json({ user: rows[0], token });
});
```

Password reset uses a 6-digit OTP with a 10-minute expiry window, stored in the users table and validated before allowing the password change.

### 4.3 Stock Operations (stock.js route)

The core of the system is the stock management module. A helper function `updateStock` handles all stock quantity changes atomically, updating the `stock_quant` table and inserting a ledger entry simultaneously.

```javascript
async function updateStock(productId, locationId, change, reference, moveId, pickingId) {
  const [q] = await db.query(
    'SELECT quantity FROM stock_quant WHERE product_id = ? AND location_id = ?',
    [productId, locationId]
  );
  const before = q.length ? parseFloat(q[0].quantity) : 0;
  const after = Math.max(0, before + change);
  // Update or insert stock quantity
  // Insert ledger entry with before/after values
}
```

**Receipt (Incoming):** Creates a picking record of type 'receipt', inserts stock moves, and calls `updateStock` with a positive quantity change to increase stock at the destination location.

**Delivery (Outgoing):** Validates available stock before processing. Creates a picking of type 'delivery' and calls `updateStock` with a negative quantity change to decrease stock.

**Internal Transfer:** Decreases stock at the source location and increases at the destination location, maintaining total stock quantity while updating location-level quantities.

**Stock Adjustment:** Calculates the difference between the physical count and the system quantity, then applies the difference as a positive or negative adjustment.

### 4.4 Mobile App Entry Point (App.js)

The application uses React Context for global state management. The `ThemeProvider` manages light/dark/system theme preferences, and the `AuthProvider` manages authentication state including JWT token storage in AsyncStorage.

```javascript
export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <RootNavigator />
      </AuthProvider>
    </ThemeProvider>
  );
}
```

A custom `TransitionScreen` component provides an animated transition between the login and dashboard screens using React Native's `Animated` API.

### 4.5 Products Screen (ProductsScreen.js)

The products screen implements search and filter functionality. Products can be filtered by low stock or out-of-stock status. The `useFocusEffect` hook ensures data is refreshed every time the screen comes into focus, keeping the list current after any product updates.

```javascript
const fetchProducts = useCallback(async () => {
  const params = {};
  if (search) params.search = search;
  if (lowStockOnly) params.low_stock = 'true';
  if (outOfStockOnly) params.out_of_stock = 'true';
  const { data } = await api.get('/products', { params });
  setProducts(data);
}, [search, lowStockOnly, outOfStockOnly]);
```

### 4.6 Receipt Screen (ReceiptScreen.js)

The receipt screen allows warehouse staff to record incoming goods. Multiple product lines can be added dynamically. Each line allows selection of a product from a horizontally scrollable chip list and entry of quantity. On validation, the data is posted to the backend which updates stock quantities immediately.

```javascript
const submit = async () => {
  await api.post('/stock/receipts', {
    partner_name: partner_name.trim() || null,
    moves: filtered.map((m) => ({
      product_id: parseInt(m.product_id, 10),
      quantity: parseFloat(m.quantity)
    })),
  });
  Alert.alert('Success', 'Receipt recorded. Stock updated.');
};
```

### 4.7 API Service Configuration (services/api.js)

A centralized Axios instance is configured with the base URL, timeout, and default headers. A response interceptor handles 401 unauthorized responses globally, enabling automatic logout when tokens expire.

```javascript
export const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' },
});
```

---

## 5. Database Schema

The MySQL database `ims_odoo` contains the following key tables:

| Table | Description |
|---|---|
| users | User accounts with hashed passwords and roles |
| products | Product catalog with SKU, category, and UoM |
| product_categories | Product classification categories |
| uom | Units of measure (kg, pcs, litre, etc.) |
| warehouses | Warehouse definitions |
| locations | Storage locations within warehouses |
| stock_quant | Current stock quantity per product per location |
| stock_picking | Stock operation headers (receipt, delivery, internal) |
| stock_move | Individual product movement lines within a picking |
| stock_ledger | Complete audit trail of all stock changes |
| reorder_rules | Minimum stock thresholds for reorder alerts |

---

## 6. API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| POST | /api/auth/register | Register new user |
| POST | /api/auth/login | Login and receive JWT |
| POST | /api/auth/forgot-password | Request OTP for reset |
| POST | /api/auth/reset-password | Reset password with OTP |
| GET | /api/auth/me | Get current user profile |
| GET | /api/dashboard/kpis | Dashboard KPI counts |
| GET | /api/dashboard/pickings | List stock operations |
| GET | /api/products | List products with search/filter |
| POST | /api/products | Create new product |
| PUT | /api/products/:id | Update product |
| GET | /api/warehouses | List warehouses |
| GET | /api/warehouses/:id/locations | Locations in warehouse |
| POST | /api/stock/receipts | Create receipt |
| POST | /api/stock/deliveries | Create delivery |
| POST | /api/stock/internal | Internal transfer |
| POST | /api/stock/adjustment | Stock adjustment |
| GET | /api/stock/ledger | Move history |

---

## 7. Key Features

**Authentication and Security:** JWT-based authentication with bcrypt password hashing. Role-based access for inventory managers and warehouse staff. OTP-based password recovery.

**Dashboard KPIs:** Real-time counts of total products, low stock items, out-of-stock items, pending receipts, pending deliveries, and scheduled internal transfers. Each KPI card is tappable and navigates to the relevant filtered list.

**Product Management:** Full CRUD operations for products with SKU, category, unit of measure, description, and minimum stock quantity. Stock availability displayed per warehouse location.

**Stock Operations:** Complete implementation of the four core inventory operations with real-time stock updates and automatic ledger recording.

**Move History:** Complete stock ledger showing all movements with product name, location, quantity before and after, and timestamp.

**Theme Support:** Light, dark, and system-adaptive themes stored per user in both AsyncStorage and the backend database.

**Responsive Design:** Adaptive layouts using React Native's Flexbox system that work across mobile phones, tablets, and web browsers.

---

## 8. Screenshots

*(Add screenshots of the following screens in the printed report:)*

1. Landing Screen with 3D animated background
2. Login Screen
3. Register Screen
4. Dashboard with KPI cards
5. Products list with search and filter
6. Product form (add/edit)
7. Operations screen
8. Receipt screen
9. Delivery screen
10. Internal Transfer screen
11. Stock Adjustment screen
12. Move History screen
13. Settings screen (warehouses)
14. Profile screen with theme toggle

---

## 9. Inventory Flow

The following example illustrates a complete inventory cycle:

1. **Receive:** A receipt is created for 100 kg of Steel Sheet. The system increases stock at the STOCK location by 100 kg and records the movement in the ledger.

2. **Internal Transfer:** 30 kg of Steel Sheet is transferred from Main Store to Production Rack. The system decreases Main Store by 30 kg and increases Production Rack by 30 kg. Total stock remains 100 kg.

3. **Delivery:** A delivery order is created for 20 kg of Steel Sheet. The system validates available stock, decreases STOCK location by 20 kg, and records the outgoing movement.

4. **Adjustment:** A physical count reveals 2 kg of damaged stock. A stock adjustment of -2 is applied, updating the system quantity to match the physical count.

All four operations are fully recorded in the stock ledger with complete before/after audit trail.

---

## 10. Conclusion

The IMS project successfully delivers a fully functional cross-platform inventory management system that addresses the core requirements of the Odoo Hackathon problem statement. The application provides real-time stock visibility, complete operation tracking, and a user-friendly interface accessible from both mobile devices and web browsers.

The system demonstrates practical application of modern mobile development technologies including React Native, Expo, and React Navigation, combined with a robust Node.js backend and MySQL database. The implementation covers all required features including authentication, dashboard KPIs, product management, and the four core stock operations.

The dark/light theme support, responsive layouts, and smooth navigation transitions contribute to a professional user experience suitable for real-world deployment. The stock ledger provides complete traceability of all inventory movements, which is essential for audit compliance and inventory accuracy.

Future enhancements could include cloud deployment for remote access without a local server, barcode scanning for faster product selection, push notifications for low stock alerts, and reporting/export functionality for management analysis.

---

*Report prepared for Odoo Hackathon 2026*
*Font sizes for print: Main headings – 14pt, Body content – 12pt, Image/table captions – 10pt*
*Text alignment: Justified | Print: One-sided, Spiral binding*
