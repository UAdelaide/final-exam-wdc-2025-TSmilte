const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');

const users = require('./routes/users');
const dogs = require('./routes/dogs');
const requests = require('./routes/requests');
const applications = require('./routes/applications');
const ratings = require('./routes/ratings');

const app = express();
app.use(cors());
app.use(bodyParser.json());

app.use(express.static('public'));

app.use('/api/users', users);
app.use('/api/dogs', dogs);
app.use('/api/requests', requests);
app.use('/api/applications', applications);
app.use('/api/ratings', ratings);

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/public/index.html');
});

app.listen(3000, () => console.log('Server running on port 8080'));
