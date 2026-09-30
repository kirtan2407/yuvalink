const express = require('express');
const healthRoutes = require('./health');

const router = express.Router();

router.use('/api', healthRoutes);

module.exports = router;
