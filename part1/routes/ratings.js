const express = require('express');
const router = express.Router();
const pool = require('../db');

router.post('/', async (req, res) => {
  const { request_id, walker_id, owner_id, rating, comments } = req.body;
  try {
    await pool.query(
      'INSERT INTO WalkRatings (request_id, walker_id, owner_id, rating, comments) VALUES (?, ?, ?, ?, ?)',
      [request_id, walker_id, owner_id, rating, comments]
    );
    await pool.query('UPDATE WalkRequests SET status="completed" WHERE request_id=?', [request_id]);
    res.status(201).json({ message: 'Rating added.' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/walker/:walker_id', async (req, res) => {
  const { walker_id } = req.params;
  const [ratings] = await pool.query(
    'SELECT * FROM WalkRatings WHERE walker_id = ?', [walker_id]
  );
  res.json(ratings);
});

module.exports = router;
