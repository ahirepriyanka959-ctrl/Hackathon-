const express = require('express');
const db = require('../config/db');
const auth = require('../middleware/auth');
const router = express.Router();

router.use(auth);

// Dashboard KPIs
router.get('/kpis', async (req, res) => {
  try {
    const [totalProducts] = await db.query('SELECT COUNT(*) AS count FROM products WHERE is_active = 1');
    const [stockByProduct] = await db.query(`
      SELECT product_id, SUM(quantity) AS total
      FROM stock_quant
      GROUP BY product_id
    `);
    const byProduct = {};
    stockByProduct.forEach(r => { byProduct[r.product_id] = parseFloat(r.total); });
    const [productsWithMin] = await db.query('SELECT id, min_stock_qty FROM products WHERE is_active = 1 AND (min_stock_qty IS NOT NULL AND min_stock_qty > 0)');
    let lowStock = 0, outOfStock = 0;
    productsWithMin.forEach(p => {
      const qty = byProduct[p.id] || 0;
      if (qty <= 0) outOfStock++;
      else if (qty <= p.min_stock_qty) lowStock++;
    });
    const [pendingReceipts] = await db.query(
      "SELECT COUNT(*) AS count FROM stock_picking WHERE picking_type = 'receipt' AND state IN ('draft','waiting','ready')"
    );
    const [pendingDeliveries] = await db.query(
      "SELECT COUNT(*) AS count FROM stock_picking WHERE picking_type = 'delivery' AND state IN ('draft','waiting','ready')"
    );
    const [internalScheduled] = await db.query(
      "SELECT COUNT(*) AS count FROM stock_picking WHERE picking_type = 'internal' AND state IN ('draft','waiting','ready')"
    );
    res.json({
      total_products: totalProducts[0].count,
      low_stock_count: lowStock,
      out_of_stock_count: outOfStock,
      pending_receipts: pendingReceipts[0].count,
      pending_deliveries: pendingDeliveries[0].count,
      internal_transfers_scheduled: internalScheduled[0].count,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Pickings list with filters
router.get('/pickings', async (req, res) => {
  try {
    const { type, state, warehouse_id } = req.query;
    let sql = `
      SELECT sp.*, w.name AS warehouse_name
      FROM stock_picking sp
      JOIN warehouses w ON sp.warehouse_id = w.id
      WHERE 1=1
    `;
    const params = [];
    if (type) { sql += ' AND sp.picking_type = ?'; params.push(type); }
    if (state) { sql += ' AND sp.state = ?'; params.push(state); }
    if (warehouse_id) { sql += ' AND sp.warehouse_id = ?'; params.push(warehouse_id); }
    sql += ' ORDER BY sp.created_at DESC LIMIT 100';
    const [rows] = await db.query(sql, params);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
