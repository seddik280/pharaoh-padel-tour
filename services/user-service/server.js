const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

app.use('/api/users', require('./routes/users'));
app.get('/', (req, res) => res.json({ service: 'User Service', port: process.env.PORT }));

const PORT = process.env.PORT || 5002;
const MONGO_URI = process.env.NODE_ENV === 'test'
  ? 'mongodb://localhost:27017/padelpro_test'
  : process.env.MONGO_URI;

const startServer = async () => {
  await mongoose.connect(MONGO_URI);
  console.log(`User Service connected to MongoDB (${process.env.NODE_ENV || 'dev'})`);
  return app.listen(PORT, () => console.log(`👤 User Service running on port ${PORT}`));
};

if (process.env.NODE_ENV !== 'test') startServer();

module.exports = { app, startServer };
