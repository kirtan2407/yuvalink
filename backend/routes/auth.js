const express = require('express');
const authController = require('../controllers/authController');
const requireAuth = require('../middleware/auth');
const rateLimit = require('express-rate-limit');

const router = express.Router();

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 attempts per IP
  message: { message: 'Too many login attempts, please try again after 15 minutes' },
  standardHeaders: true,
  legacyHeaders: false,
});

router.post('/login', loginLimiter, authController.login);
router.get('/me', requireAuth, authController.me);
router.post('/logout', authController.logout);

module.exports = router;
