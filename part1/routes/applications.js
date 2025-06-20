const express = require('express');
const router = express.Router();
const pool = require('../db');

// Walker applies to a walk request
router.post('/', async (req, res) => {
  const { request_id, walker_id } = req.body;
  try {
    await pool.query(
      'INSERT INTO WalkApplications (request_id, walker_id) VALUES (?, ?)',
      [request_id, walker_id]
    );
    res.status(201).json({ message: 'Applied for walk.' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// routes/applications.js
router.get('/request/:request_id', async (req, res) => {
  const { request_id } = req.params;
  const [apps] = await pool.query(
    `SELECT wa.*, u.username FROM WalkApplications wa
     JOIN Users u ON wa.walker_id = u.user_id
     WHERE wa.request_id = ?`,
    [request_id]
  );
  res.json(apps);
});


module.exports = router;
