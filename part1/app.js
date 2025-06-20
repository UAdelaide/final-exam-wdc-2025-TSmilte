// part1/app.js
const express = require('express');
const mysql = require('mysql2/promise');
const app = express();

// DB setup (use same as in starthere)
const pool = mysql.createPool({
  host: 'localhost',
  user: 'root',
  password: '',      // or your MySQL root password
  database: 'DogWalkService'
});


app.get('/api/dogs', async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT d.name AS dog_name, d.size, u.username AS owner_username
      FROM Dogs d
      JOIN Users u ON d.owner_id = u.user_id
    `);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// --- /api/walkrequests/open ---
app.get('/api/walkrequests/open', async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT
        wr.request_id,
        d.name AS dog_name,
        wr.requested_time,
        wr.duration_minutes,
        wr.location,
        u.username AS owner_username
      FROM WalkRequests wr
      JOIN Dogs d ON wr.dog_id = d.dog_id
      JOIN Users u ON d.owner_id = u.user_id
      WHERE wr.status = 'open'
    `);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// --- /api/walkers/summary ---
app.get('/api/walkers/summary', async (req, res) => {
  try {
    const [walkers] = await pool.query(`
      SELECT user_id, username
      FROM Users
      WHERE role = 'walker'
    `);

    const summaries = await Promise.all(walkers.map(async walker => {
      // Ratings
      const [[ratingStats]] = await pool.query(
        `SELECT COUNT(*) AS total_ratings, AVG(rating) AS average_rating
         FROM WalkRatings WHERE walker_id = ?`,
        [walker.user_id]
      );
      // Completed walks
      const [[completedStats]] = await pool.query(
        `SELECT COUNT(*) AS completed_walks
         FROM WalkRequests wr
         JOIN WalkApplications wa ON wr.request_id = wa.request_id
         WHERE wr.status = 'completed' AND wa.walker_id = ? AND wa.status = 'accepted'`,
        [walker.user_id]
      );
      return {
        walker_username: walker.username,
        total_ratings: ratingStats.total_ratings,
        average_rating: ratingStats.average_rating,
        completed_walks: completedStats.completed_walks
      };
    }));

    res.json(summaries);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// --- Start server (see starthere/app.js for pattern) ---
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
