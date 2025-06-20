const express = require('express');
const router = express.Router();
const pool = require('../db');

// Add a rating (by owner after walk)
router.post('/', async (req, res) => {
  const { request_id, walker_id, owner_id, rating, comments } = req.body;
  try {

    const [walks] = await pool.query(
      "SELECT status FROM WalkRequests WHERE request_id = ?",
      [request_id]
    );
    if (!walks.length || walks[0].status !== 'completed') {
      return res.status(400).json({ error: "You can only rate a completed walk." });
    }

    await pool.query(
      'INSERT INTO WalkRatings (request_id, walker_id, owner_id, rating, comments) VALUES (?, ?, ?, ?, ?)',
      [request_id, walker_id, owner_id, rating, comments]
    );
    res.status(201).json({ message: 'Rating added.' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get ratings for a walker
router.get('/walker/:walker_id', async (req, res) => {
  const { walker_id } = req.params;
  const [ratings] = await pool.query(
    'SELECT * FROM WalkRatings WHERE walker_id = ?', [walker_id]
  );
  res.json(ratings);
});

module.exports = router;
