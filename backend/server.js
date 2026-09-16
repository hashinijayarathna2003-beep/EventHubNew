const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const db = require('./database');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Routes will go here
app.get('/', (req, res) => {
  res.send('EventHub API is running.');
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
