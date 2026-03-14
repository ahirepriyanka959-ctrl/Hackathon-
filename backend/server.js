require('dotenv').config();
const express = require('express');
const cors = require('cors');

const authRoutes = require('./routes/auth');
const productsRoutes = require('./routes/products');
const warehousesRoutes = require('./routes/warehouses');
const dashboardRoutes = require('./routes/dashboard');
const stockRoutes = require('./routes/stock');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/products', productsRoutes);
app.use('/api/warehouses', warehousesRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/stock', stockRoutes);

app.get('/api/health', (req, res) => res.json({ status: 'ok', message: 'IMS API running' }));

app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: err.message || 'Server error' });
});

app.listen(PORT, () => {
  console.log(`IMS API running on http://localhost:${PORT}`);
});
