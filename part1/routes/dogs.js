const express = require('express');
const router = express.Router();
const pool = require('../models/db');


router.get('/owner/:owner_id', async (req, res) => {
  const { owner_id } = req.params;
  const [dogs] = await pool.query('SELECT * FROM Dogs WHERE owner_id = ?', [owner_id]);
  res.json(dogs);
});


router.post('/', async (req, res) => {
  const { owner_id, name, size } = req.body;
  try {
    await pool.query(
      'INSERT INTO Dogs (owner_id, name, size) VALUES (?, ?, ?)',
      [owner_id, name, size]
    );
    res.status(201).json({ message: 'Dog added.' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
