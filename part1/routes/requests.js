const express = require('express');
const router = express.Router();
const pool = require('../db');

// Create a new walk request (by owner)
router.post('/', async (req, res) => {
  const { dog_id, requested_time, duration_minutes, location } = req.body;
  try {
    await pool.query(
      'INSERT INTO WalkRequests (dog_id, requested_time, duration_minutes, location) VALUES (?, ?, ?, ?)',
      [dog_id, requested_time, duration_minutes, location]
    );
    res.status(201).json({ message: 'Walk request created.' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get all open walk requests (for walkers)
router.get('/', async (req, res) => {
  const [requests] = await pool.query(
    `SELECT wr.*,
            d.owner_id,
            d.name as dog_name,
            d.size,
            wa.walker_id AS accepted_walker_id,
            u.username AS accepted_walker_name,
            CASE WHEN r.rating_id IS NULL THEN 0 ELSE 1 END AS rated
     FROM WalkRequests wr
     JOIN Dogs d ON wr.dog_id = d.dog_id
     LEFT JOIN WalkApplications wa
       ON wr.request_id = wa.request_id AND wa.status = 'accepted'
     LEFT JOIN Users u
       ON wa.walker_id = u.user_id
     LEFT JOIN WalkRatings r
       ON wr.request_id = r.request_id
     WHERE wr.status = 'open' OR wr.status = 'accepted'`
  );
  res.json(requests);
});


// Accept a walker for a walk request (by owner)
router.post('/accept', async (req, res) => {
  const { request_id, walker_id } = req.body;
  try {
    // Set accepted, set others to rejected
    await pool.query(
      'UPDATE WalkApplications SET status="accepted" WHERE request_id=? AND walker_id=?',
      [request_id, walker_id]
    );
    await pool.query(
      'UPDATE WalkApplications SET status="rejected" WHERE request_id=? AND walker_id<>?',
      [request_id, walker_id]
    );
    await pool.query(
      'UPDATE WalkRequests SET status="accepted" WHERE request_id=?',
      [request_id]
    );
    res.json({ message: 'Walker accepted for this walk.' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/deny', async (req, res) => {
  const { request_id, walker_id } = req.body;
  try {
    await pool.query(
      'UPDATE WalkApplications SET status="rejected" WHERE request_id=? AND walker_id=?',
      [request_id, walker_id]
    );
    const [apps] = await pool.query(
      'SELECT COUNT(*) AS pending FROM WalkApplications WHERE request_id=? AND status="pending"',
      [request_id]
    );
    if (apps[0].pending === 0) {
      await pool.query(
        'UPDATE WalkRequests SET status="cancelled" WHERE request_id=?',
        [request_id]
      );
    }
    res.json({ message: 'Walker denied for this walk.' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
