const express = require('express');
const db = require('../config/db');
const auth = require('../middleware/auth');
const router = express.Router();

router.use(auth);

// List products with optional filters
router.get('/', async (req, res) => {
  try {
    const { category_id, search, low_stock } = req.query;
    let sql = `
      SELECT p.*, pc.name AS category_name, u.name AS uom_name, u.code AS uom_code
      FROM products p
      LEFT JOIN product_categories pc ON p.category_id = pc.id
      LEFT JOIN uom u ON p.uom_id = u.id
      WHERE p.is_active = 1
    `;
    const params = [];
    if (category_id) { sql += ' AND p.category_id = ?'; params.push(category_id); }
    if (search) { sql += ' AND (p.name LIKE ? OR p.sku LIKE ?)'; params.push(`%${search}%`, `%${search}%`); }
    sql += ' ORDER BY p.name';
    const [rows] = await db.query(sql, params);
    let products = rows;
    if (low_stock === 'true') {
      const [quants] = await db.query('SELECT product_id, SUM(quantity) AS total FROM stock_quant GROUP BY product_id');
      const byProduct = {};
      quants.forEach(q => { byProduct[q.product_id] = parseFloat(q.total); });
      products = products.filter(p => (byProduct[p.id] || 0) <= (p.min_stock_qty || 0));
    }
    res.json(products);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get single product with stock per location
router.get('/:id', async (req, res) => {
  try {
    const [products] = await db.query(`
      SELECT p.*, pc.name AS category_name, u.name AS uom_name, u.code AS uom_code
      FROM products p
      LEFT JOIN product_categories pc ON p.category_id = pc.id
      LEFT JOIN uom u ON p.uom_id = u.id
      WHERE p.id = ?
    `, [req.params.id]);
    if (!products.length) return res.status(404).json({ error: 'Product not found.' });
    const [stock] = await db.query(`
      SELECT sq.*, l.name AS location_name, l.code AS location_code, w.name AS warehouse_name
      FROM stock_quant sq
      JOIN locations l ON sq.location_id = l.id
      JOIN warehouses w ON l.warehouse_id = w.id
      WHERE sq.product_id = ?
    `, [req.params.id]);
    res.json({ ...products[0], stock_by_location: stock });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Create product
router.post('/', async (req, res) => {
  try {
    const { name, sku, category_id, uom_id, description, min_stock_qty, initial_stock } = req.body;
    if (!name || !sku || !uom_id) return res.status(400).json({ error: 'Name, SKU and UoM are required.' });
    const [uom] = await db.query('SELECT id FROM uom WHERE id = ?', [uom_id]);
    if (!uom.length) return res.status(400).json({ error: 'Invalid UoM.' });
    const [existing] = await db.query('SELECT id FROM products WHERE sku = ?', [sku]);
    if (existing.length) return res.status(400).json({ error: 'SKU already exists.' });
    const [result] = await db.query(
      'INSERT INTO products (name, sku, category_id, uom_id, description, min_stock_qty) VALUES (?, ?, ?, ?, ?, ?)',
      [name, sku, category_id || null, uom_id, description || null, min_stock_qty || 0]
    );
    const productId = result.insertId;
    if (initial_stock && initial_stock > 0) {
      const [loc] = await db.query("SELECT id FROM locations WHERE code = 'STOCK' AND warehouse_id = 1 LIMIT 1");
      if (loc.length) {
        await db.query(
          'INSERT INTO stock_quant (product_id, location_id, quantity) VALUES (?, ?, ?) ON DUPLICATE KEY UPDATE quantity = quantity + ?',
          [productId, loc[0].id, initial_stock, initial_stock]
        );
        await db.query(
          'INSERT INTO stock_ledger (product_id, location_id, quantity_before, quantity_after, quantity_change, reference) VALUES (?, ?, 0, ?, ?, ?)',
          [productId, loc[0].id, initial_stock, initial_stock, 'Initial stock']
        );
      }
    }
    const [newProduct] = await db.query(`
      SELECT p.*, pc.name AS category_name, u.name AS uom_name
      FROM products p
      LEFT JOIN product_categories pc ON p.category_id = pc.id
      LEFT JOIN uom u ON p.uom_id = u.id
      WHERE p.id = ?
    `, [productId]);
    res.status(201).json(newProduct[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update product
router.put('/:id', async (req, res) => {
  try {
    const { name, sku, category_id, uom_id, description, min_stock_qty } = req.body;
    const [existing] = await db.query('SELECT id FROM products WHERE id = ?', [req.params.id]);
    if (!existing.length) return res.status(404).json({ error: 'Product not found.' });
    if (sku) {
      const [dup] = await db.query('SELECT id FROM products WHERE sku = ? AND id != ?', [sku, req.params.id]);
      if (dup.length) return res.status(400).json({ error: 'SKU already exists.' });
    }
    await db.query(
      'UPDATE products SET name = COALESCE(?, name), sku = COALESCE(?, sku), category_id = COALESCE(?, category_id), uom_id = COALESCE(?, uom_id), description = COALESCE(?, description), min_stock_qty = COALESCE(?, min_stock_qty) WHERE id = ?',
      [name, sku, category_id, uom_id, description, min_stock_qty, req.params.id]
    );
    const [updated] = await db.query('SELECT * FROM products WHERE id = ?', [req.params.id]);
    res.json(updated[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Categories list
router.get('/meta/categories', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM product_categories ORDER BY name');
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// UoM list
router.get('/meta/uom', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM uom ORDER BY name');
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
