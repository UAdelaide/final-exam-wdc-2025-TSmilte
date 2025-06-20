const express = require('express');
const router = express.Router();
const pool = require('../db');

// Sign up
router.post('/signup', async (req, res) => {
  const { username, email, password, role } = req.body;
  try {
    await pool.query(
      'INSERT INTO Users (username, email, password_hash, role) VALUES (?, ?, ?, ?)',
      [username, email, password, role]
    );
    res.status(201).json({ message: 'User registered.' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Log in
router.post('/login', async (req, res) => {
  const { username, password } = req.body;
  try {
    const [users] = await pool.query(
      'SELECT * FROM Users WHERE username=? AND password_hash=?',
      [username, password]
    );
    if (users.length) {
      res.json({ user: users[0] });
    } else {
      res.status(401).json({ error: 'Invalid credentials.' });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
