const express = require('express');
const db = require('../config/db');
const auth = require('../middleware/auth');
const router = express.Router();

router.use(auth);

// Helper: update stock and ledger
async function updateStock(productId, locationId, change, reference, moveId = null, pickingId = null) {
  const [q] = await db.query(
    'SELECT quantity FROM stock_quant WHERE product_id = ? AND location_id = ?',
    [productId, locationId]
  );
  const before = q.length ? parseFloat(q[0].quantity) : 0;
  const after = Math.max(0, before + change);
  if (q.length) {
    await db.query('UPDATE stock_quant SET quantity = ? WHERE product_id = ? AND location_id = ?', [after, productId, locationId]);
  } else {
    await db.query('INSERT INTO stock_quant (product_id, location_id, quantity) VALUES (?, ?, ?)', [productId, locationId, after]);
  }
  await db.query(
    'INSERT INTO stock_ledger (product_id, location_id, quantity_before, quantity_after, quantity_change, reference, move_id, picking_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
    [productId, locationId, before, after, change, reference, moveId, pickingId]
  );
  return { before, after };
}

// Create receipt (incoming)
router.post('/receipts', async (req, res) => {
  try {
    const { partner_name, moves } = req.body; // moves: [{ product_id, quantity, uom_id }]
    if (!moves || !moves.length) return res.status(400).json({ error: 'At least one move required.' });
    const [locIn] = await db.query("SELECT id FROM locations WHERE code = 'IN' AND warehouse_id = 1 LIMIT 1");
    const [locStock] = await db.query("SELECT id FROM locations WHERE code = 'STOCK' AND warehouse_id = 1 LIMIT 1");
    const locInId = locIn[0]?.id || 1;
    const locStockId = locStock[0]?.id || 1;
    const [pickingResult] = await db.query(
      'INSERT INTO stock_picking (name, picking_type, state, warehouse_id, location_id, location_dest_id, partner_name, user_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      ['REC/' + Date.now(), 'receipt', 'draft', 1, locInId, locStockId, partner_name || null, req.user.id]
    );
    const pickingId = pickingResult.insertId;
    for (const m of moves) {
      const [p] = await db.query('SELECT uom_id FROM products WHERE id = ?', [m.product_id]);
      const uomId = m.uom_id || p[0]?.uom_id;
      const [moveResult] = await db.query(
        'INSERT INTO stock_move (picking_id, product_id, product_uom_id, location_id, location_dest_id, quantity_demand, quantity_done, state) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
        [pickingId, m.product_id, uomId, locInId, locStockId, m.quantity, m.quantity, 'done']
      );
      await updateStock(m.product_id, locStockId, m.quantity, 'Receipt', moveResult.insertId, pickingId);
    }
    await db.query("UPDATE stock_picking SET state = 'done', done_date = NOW() WHERE id = ?", [pickingId]);
    const [created] = await db.query('SELECT * FROM stock_picking WHERE id = ?', [pickingId]);
    res.status(201).json(created[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Create delivery (outgoing)
router.post('/deliveries', async (req, res) => {
  try {
    const { partner_name, moves } = req.body;
    if (!moves || !moves.length) return res.status(400).json({ error: 'At least one move required.' });
    const [locStock] = await db.query("SELECT id FROM locations WHERE code = 'STOCK' AND warehouse_id = 1 LIMIT 1");
    const [locOut] = await db.query("SELECT id FROM locations WHERE code = 'OUT' AND warehouse_id = 1 LIMIT 1");
    const locStockId = locStock[0]?.id || 1;
    const locOutId = locOut[0]?.id || 1;
    for (const m of moves) {
      const [q] = await db.query('SELECT quantity FROM stock_quant WHERE product_id = ? AND location_id = ?', [m.product_id, locStockId]);
      const available = q.length ? parseFloat(q[0].quantity) : 0;
      if (available < m.quantity) return res.status(400).json({ error: `Insufficient stock for product ${m.product_id}. Available: ${available}` });
    }
    const [pickingResult] = await db.query(
      'INSERT INTO stock_picking (name, picking_type, state, warehouse_id, location_id, location_dest_id, partner_name, user_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      ['OUT/' + Date.now(), 'delivery', 'draft', 1, locStockId, locOutId, partner_name || null, req.user.id]
    );
    const pickingId = pickingResult.insertId;
    for (const m of moves) {
      const [p] = await db.query('SELECT uom_id FROM products WHERE id = ?', [m.product_id]);
      const [moveResult] = await db.query(
        'INSERT INTO stock_move (picking_id, product_id, product_uom_id, location_id, location_dest_id, quantity_demand, quantity_done, state) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
        [pickingId, m.product_id, p[0].uom_id, locStockId, locOutId, m.quantity, m.quantity, 'done']
      );
      await updateStock(m.product_id, locStockId, -m.quantity, 'Delivery', moveResult.insertId, pickingId);
    }
    await db.query("UPDATE stock_picking SET state = 'done', done_date = NOW() WHERE id = ?", [pickingId]);
    const [created] = await db.query('SELECT * FROM stock_picking WHERE id = ?', [pickingId]);
    res.status(201).json(created[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Internal transfer
router.post('/internal', async (req, res) => {
  try {
    const { location_id_from, location_id_dest, moves } = req.body;
    if (!location_id_from || !location_id_dest || !moves?.length) return res.status(400).json({ error: 'Source, destination and moves required.' });
    for (const m of moves) {
      const [q] = await db.query('SELECT quantity FROM stock_quant WHERE product_id = ? AND location_id = ?', [m.product_id, location_id_from]);
      const available = q.length ? parseFloat(q[0].quantity) : 0;
      if (available < m.quantity) return res.status(400).json({ error: `Insufficient stock for product ${m.product_id} at source.` });
    }
    const [pickingResult] = await db.query(
      'INSERT INTO stock_picking (name, picking_type, state, warehouse_id, location_id, location_dest_id, user_id) VALUES (?, ?, ?, 1, ?, ?, ?)',
      ['INT/' + Date.now(), 'internal', 'draft', location_id_from, location_id_dest, req.user.id]
    );
    const pickingId = pickingResult.insertId;
    for (const m of moves) {
      const [p] = await db.query('SELECT uom_id FROM products WHERE id = ?', [m.product_id]);
      const [moveResult] = await db.query(
        'INSERT INTO stock_move (picking_id, product_id, product_uom_id, location_id, location_dest_id, quantity_demand, quantity_done, state) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
        [pickingId, m.product_id, p[0].uom_id, location_id_from, location_id_dest, m.quantity, m.quantity, 'done']
      );
      await updateStock(m.product_id, location_id_from, -m.quantity, 'Internal transfer out', moveResult.insertId, pickingId);
      await updateStock(m.product_id, location_id_dest, m.quantity, 'Internal transfer in', moveResult.insertId, pickingId);
    }
    await db.query("UPDATE stock_picking SET state = 'done', done_date = NOW() WHERE id = ?", [pickingId]);
    const [created] = await db.query('SELECT * FROM stock_picking WHERE id = ?', [pickingId]);
    res.status(201).json(created[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Stock adjustment
router.post('/adjustment', async (req, res) => {
  try {
    const { product_id, location_id, counted_quantity } = req.body;
    if (!product_id || !location_id || counted_quantity === undefined) return res.status(400).json({ error: 'Product, location and counted quantity required.' });
    const [q] = await db.query('SELECT quantity FROM stock_quant WHERE product_id = ? AND location_id = ?', [product_id, location_id]);
    const before = q.length ? parseFloat(q[0].quantity) : 0;
    const change = parseFloat(counted_quantity) - before;
    await updateStock(product_id, location_id, change, 'Inventory adjustment');
    const [updated] = await db.query('SELECT * FROM stock_quant WHERE product_id = ? AND location_id = ?', [product_id, location_id]);
    res.json({ stock_quant: updated[0], adjustment: change });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Move history (ledger)
router.get('/ledger', async (req, res) => {
  try {
    const { product_id, location_id, limit } = req.query;
    let sql = `
      SELECT sl.*, p.name AS product_name, p.sku, l.name AS location_name
      FROM stock_ledger sl
      JOIN products p ON sl.product_id = p.id
      JOIN locations l ON sl.location_id = l.id
      WHERE 1=1
    `;
    const params = [];
    if (product_id) { sql += ' AND sl.product_id = ?'; params.push(product_id); }
    if (location_id) { sql += ' AND sl.location_id = ?'; params.push(location_id); }
    sql += ' ORDER BY sl.created_at DESC LIMIT ?';
    params.push(parseInt(limit) || 100);
    const [rows] = await db.query(sql, params);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get picking by ID with moves
router.get('/picking/:id', async (req, res) => {
  try {
    const [pickings] = await db.query('SELECT sp.*, w.name AS warehouse_name FROM stock_picking sp JOIN warehouses w ON sp.warehouse_id = w.id WHERE sp.id = ?', [req.params.id]);
    if (!pickings.length) return res.status(404).json({ error: 'Not found.' });
    const [moves] = await db.query(`
      SELECT sm.*, p.name AS product_name, p.sku
      FROM stock_move sm
      JOIN products p ON sm.product_id = p.id
      WHERE sm.picking_id = ?
    `, [req.params.id]);
    res.json({ ...pickings[0], moves });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
