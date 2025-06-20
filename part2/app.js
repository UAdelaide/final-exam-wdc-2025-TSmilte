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
    // Fetch all dogs without the photo column
    const [rows] = await pool.query(
      `SELECT dog_id, name, size, owner_id FROM Dogs`
    );

    // For each dog, assign a random image from Dog CEO API
    const dogsWithPhotos = rows.map(dog => {
      // Dog CEO supports random images for all breeds
      // To avoid getting the same image for each dog per reload, add a random query string or use the random endpoint
      return {
        ...dog,
        photo: `https://dog.ceo/api/breeds/image/random?dummy=${Math.random()}`
      };
    });

    res.json(dogsWithPhotos);
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Export the app instead of listening here
module.exports = app;