const express = require('express');
const router = express.Router();
const pool = require('../db');

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

router.get('/', async (req, res) => {
  const [requests] = await pool.query(
    `SELECT wr.*, d.name as dog_name, d.size
     FROM WalkRequests wr
     JOIN Dogs d ON wr.dog_id = d.dog_id
     WHERE wr.status = 'open'`
  );
  res.json(requests);
});

router.post('/accept', async (req, res) => {
  const { request_id, walker_id } = req.body;
  try {
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

module.exports = router;
