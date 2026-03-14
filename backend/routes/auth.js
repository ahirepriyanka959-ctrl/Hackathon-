const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../config/db');
const auth = require('../middleware/auth');
const router = express.Router();

const JWT_SECRET = process.env.JWT_SECRET || 'ims-secret';

// Generate 6-digit OTP
function generateOTP() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// Register
router.post('/register', async (req, res) => {
  try {
    const { email, password, full_name, role } = req.body;
    if (!email || !password || !full_name) {
      return res.status(400).json({ error: 'Email, password and full name are required.' });
    }
    const [existing] = await db.query('SELECT id FROM users WHERE email = ?', [email]);
    if (existing.length) return res.status(400).json({ error: 'Email already registered.' });
    const hash = await bcrypt.hash(password, 10);
    await db.query(
      'INSERT INTO users (email, password_hash, full_name, role) VALUES (?, ?, ?, ?)',
      [email, hash, full_name, role || 'warehouse_staff']
    );
    const [rows] = await db.query('SELECT id, email, full_name, role FROM users WHERE email = ?', [email]);
    const token = jwt.sign({ id: rows[0].id, email: rows[0].email }, JWT_SECRET, { expiresIn: '7d' });
    res.status(201).json({ user: rows[0], token });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ error: 'Email and password required.' });
    const [rows] = await db.query('SELECT * FROM users WHERE email = ?', [email]);
    if (!rows.length) return res.status(401).json({ error: 'Invalid credentials.' });
    const valid = await bcrypt.compare(password, rows[0].password_hash);
    if (!valid) return res.status(401).json({ error: 'Invalid credentials.' });
    const user = { id: rows[0].id, email: rows[0].email, full_name: rows[0].full_name, role: rows[0].role };
    const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, { expiresIn: '7d' });
    res.json({ user, token });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Request OTP for password reset
router.post('/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ error: 'Email required.' });
    const otp = generateOTP();
    const expires = new Date(Date.now() + 10 * 60 * 1000); // 10 min
    await db.query('UPDATE users SET otp_code = ?, otp_expires_at = ? WHERE email = ?', [otp, expires, email]);
    // In production: send email via nodemailer. For hackathon we return OTP in response.
    res.json({ message: 'OTP sent to email.', otp: process.env.NODE_ENV === 'development' ? otp : undefined });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Reset password with OTP
router.post('/reset-password', async (req, res) => {
  try {
    const { email, otp, new_password } = req.body;
    if (!email || !otp || !new_password) return res.status(400).json({ error: 'Email, OTP and new password required.' });
    const [rows] = await db.query('SELECT id, otp_code, otp_expires_at FROM users WHERE email = ?', [email]);
    if (!rows.length) return res.status(400).json({ error: 'Invalid request.' });
    if (rows[0].otp_code !== otp) return res.status(400).json({ error: 'Invalid OTP.' });
    if (new Date() > new Date(rows[0].otp_expires_at)) return res.status(400).json({ error: 'OTP expired.' });
    const hash = await bcrypt.hash(new_password, 10);
    await db.query('UPDATE users SET password_hash = ?, otp_code = NULL, otp_expires_at = NULL WHERE id = ?', [hash, rows[0].id]);
    res.json({ message: 'Password reset successfully.' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get current user (protected)
router.get('/me', auth, async (req, res) => {
  try {
    const [rows] = await db.query('SELECT id, email, full_name, role, theme_preference FROM users WHERE id = ?', [req.user.id]);
    if (!rows.length) return res.status(404).json({ error: 'User not found.' });
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update theme preference (protected)
router.put('/theme', auth, async (req, res) => {
  try {
    const { theme } = req.body; // 'light' | 'dark' | 'system'
    await db.query('UPDATE users SET theme_preference = ? WHERE id = ?', [theme || 'system', req.user.id]);
    res.json({ theme: theme || 'system' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
