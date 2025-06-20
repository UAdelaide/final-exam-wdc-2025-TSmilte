const express = require('express');
const router = express.Router();
const pool = require('..//db');


router.post('/signup', async (req, res) => {
  const { username, email, password, role } = req.body;
  try {
    await pool.query(
      'INSERT INTO Users (username, email, password_hash, role) VALUES (?, ?, ?, ?)',
      [username, email, password, role]
    );
    res.json({ message: 'User created' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/login', async (req, res) => {
  const { username, password } = req.body;
  const [rows] = await pool.query(
    'SELECT * FROM Users WHERE username=? AND password_hash=?',
    [username, password]
  );
  if (rows.length) res.json({ user: rows[0] });
  else res.status(401).json({ error: 'Invalid credentials' });
});

module.exports = router;
