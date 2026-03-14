const express = require('express');
const db = require('../config/db');
const auth = require('../middleware/auth');
const router = express.Router();

router.use(auth);

router.get('/', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM warehouses WHERE is_active = 1 ORDER BY name');
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/:id/locations', async (req, res) => {
  try {
    const [rows] = await db.query(
      'SELECT * FROM locations WHERE warehouse_id = ? ORDER BY name',
      [req.params.id]
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
