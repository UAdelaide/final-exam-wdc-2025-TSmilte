const express = require('express');
const router = express.Router();
const db = require('../db'); 
const bcrypt = require('bcrypt'); // Or skip if using plain hashes for now

router.post('/login', async (req, res) => {
  const { username, password } = req.body;

  // Query the user
  const [user] = await db.query(
    'SELECT * FROM Users WHERE username = ?',
    [username]
  );

  if (!user) {
    return res.json({ success: false, message: 'User not found' });
  }

  // If password is hashed, use bcrypt.compare; otherwise just compare directly
  // const match = await bcrypt.compare(password, user.password_hash);
  const match = password === user.password_hash.replace('hashed', ''); // Remove 'hashed' for demo

  if (!match) {
    return res.json({ success: false, message: 'Invalid password' });
  }

  // Set session (using express-session)
  req.session.userId = user.user_id;
  req.session.role = user.role;

  res.json({ success: true, role: user.role });
});

module.exports = router;
