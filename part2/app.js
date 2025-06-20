const express = require('express');
const path = require('path');
require('dotenv').config();
const mysql = require('mysql2/promise');

const app = express();

// Middleware
app.use(express.json());
app.use(express.static(path.join(__dirname, '/public')));

// Routes
const walkRoutes = require('./routes/walkRoutes');
const userRoutes = require('./routes/userRoutes');
const session = require('express-session');
const authRoutes = require('./routes/auth');

app.use(session({
  secret: 'dogsecret',
  resave: false,
  saveUninitialized: false,
}));
app.use('/api', authRoutes);

app.use('/api/walks', walkRoutes);
app.use('/api/users', userRoutes);

const pool = mysql.createPool({
  host: 'localhost',
  user: 'root',       // your MySQL user
  password: '',       // your MySQL password
  database: 'DogWalkService'
});

// Login Route
app.post('/api/login', async (req, res) => {
  const { username, password } = req.body;
  try {
    const [rows] = await pool.query(
      'SELECT * FROM Users WHERE username = ?', [username]
    );
    if (rows.length === 0) {
      return res.json({ success: false, message: 'Invalid username or password.' });
    }
    const user = rows[0];
    if (user.password_hash !== password) {
      return res.json({ success: false, message: 'Invalid username or password.' });
    }
    // Save session
    req.session.userId = user.user_id;
    req.session.role = user.role;
    return res.json({ success: true, role: user.role });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Dogs List Route
app.get('/api/dogs', async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT d.dog_id, d.name, d.size, d.owner_id,
      CASE d.dog_id
        WHEN 1 THEN 'https://images.dog.ceo/breeds/bulldog-boston/n02096585_11347.jpg'
        WHEN 2 THEN 'https://images.dog.ceo/breeds/chihuahua/n02085620_1200.jpg'
        WHEN 3 THEN 'https://images.dog.ceo/breeds/germanshepherd/n02106662_3787.jpg'
        WHEN 4 THEN 'https://images.dog.ceo/breeds/terrier-lakeland/n02095570_2461.jpg'
        ELSE 'https://images.dog.ceo/breeds/terrier-norwich/n02094258_3184.jpg'
      END AS photo
      FROM Dogs d`
    );
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Export the app instead of listening here
module.exports = app;