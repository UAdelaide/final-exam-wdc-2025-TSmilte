const express = require('express');
const path = require('path');
require('dotenv').config();

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

// Export the app instead of listening here
module.exports = app;