const express = require('express');
const healthRoutes = require('./health');

const router = express.Router();

router.use('/api', healthRoutes);
router.use('/api/members', require('./members'));

module.exports = router;
