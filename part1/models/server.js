const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');

const users = require('./routes/users');
const dogs = require('./routes/dogs');
const requests = require('./routes/requests');
const ratings = require('./routes/ratings');

const app = express();
app.use(cors());
app.use(bodyParser.json());

app.use('/api/users', users);
app.use('/api/dogs', dogs);
app.use('/api/requests', requests);
app.use('/api/ratings', ratings);

app.listen(3000, () => console.log('Server running on port 3000'));
