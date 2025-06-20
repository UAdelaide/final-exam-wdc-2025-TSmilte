const express = require('express');
const router = express.Router();
const db = require('../models/db');

router.post('/login', async (req, res) => {
  const { username, password } = req.body;


  const [user] = await db.query(
    'SELECT * FROM Users WHERE username = ?',
    [username]
  );

  if (!user) {
    return res.json({ success: false, message: 'User not found' });
  }


  const match = password === user.password_hash.replace('hashed', '');

  if (!match) {
    return res.json({ success: false, message: 'Invalid password' });
  }

  // Set session (using express-session)
  req.session.userId = user.user_id;
  req.session.role = user.role;

  res.json({ success: true, role: user.role });
});

module.exports = router;
