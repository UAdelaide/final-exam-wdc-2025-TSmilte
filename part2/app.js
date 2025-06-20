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

app.use(session({
  secret: 'dogsecret',
  resave: false,
  saveUninitialized: false,
}));

app.use('/api/walks', walkRoutes);
app.use('/api/users', userRoutes);
app.use('/api', userRoutes);

const pool = mysql.createPool({
  host: 'localhost',
  user: 'root',       // your MySQL user
  password: '',       // your MySQL password
  database: 'DogWalkService'
});

// Dogs List Route
app.get('/api/dogs', async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT d.dog_id, d.name, d.size, u.username AS owner_username
      FROM Dogs d
      JOIN Users u ON d.owner_id = u.user_id
    `);

    // Add random image for each dog
    const dogsWithPhotos = await Promise.all(
      rows.map(async (dog) => {
        try {
          const response = await fetch('https://dog.ceo/api/breeds/image/random');
          const data = await response.json();
          return {
            ...dog,
            photo: data.message
          };
        } catch {
          return {
            ...dog,
            photo: 'https://images.dog.ceo/breeds/terrier-norwich/n02094258_3184.jpg'
          };
        }
      })
    );

    res.json(dogsWithPhotos);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});



// Export the app instead of listening here
module.exports = app;