const express = require('express');
const router = express.Router();
const db = require('../models/db');

router.post('/login', async (req, res) => {
  const { username, password } = req.body;

  try {
    const [rows] = await db.query(
      'SELECT * FROM Users WHERE username = ?',
      [username]
    );
    if (rows.length === 0) {
      // No user found
      return res.json({ success: false, message: 'User not found' });
    }

    const user = rows[0];

    // If you use 'hashed...' as prefix in your DB, you can do:
    // For plaintext password, match directly:
    // const match = password === user.password_hash;

    // If passwords in DB look like 'hashed123', you can do:
    const match = password === user.password_hash.replace('hashed', '');

    if (!match) {
      return res.json({ success: false, message: 'Invalid password' });
    }

    // Set session, etc.
    req.session.userId = user.user_id;
    req.session.role = user.role;
    res.json({ success: true, role: user.role });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;
