const express = require('express');
const mongoose = require('mongoose');
const router = express.Router();

router.get('/health', (req, res) => {
  const dbStatus = mongoose.connection.readyState === 1 ? 'connected' : 'disconnected';
  res.status(200).json({
    status: 'ok',
    db: dbStatus
  });
});

module.exports = router;
