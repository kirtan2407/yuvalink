require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');

const app = express();
app.use(express.json());

// Health check: responds even if the database is down (Render uses this)
app.get('/api/health', (req, res) => {
  const db = mongoose.connection.readyState === 1 ? 'connected' : 'disconnected';
  res.json({ status: 'ok', db });
});

const PORT = process.env.PORT || 5000;

async function start() {
  if (process.env.MONGODB_URI) {
    try {
      await mongoose.connect(process.env.MONGODB_URI);
      console.log('MongoDB connected');
    } catch (err) {
      console.error('MongoDB connection failed:', err.message);
    }
  } else {
    console.warn('MONGODB_URI is not set. Starting without a database.');
  }
  app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
}

start();