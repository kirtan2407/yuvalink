const express = require('express');
const helmet = require('helmet');
const compression = require('compression');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const config = require('./config/env');
const routes = require('./routes');
const errorHandler = require('./middleware/errorHandler');

const app = express();

app.use(helmet());
app.use(compression());
app.use(cors({ origin: config.CORS_ORIGIN }));
app.use(express.json({ limit: '1mb' }));

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
});
app.use(limiter);

const authRoutes = require('./routes/auth');
const requireAuth = require('./middleware/auth');

app.use('/api/auth', authRoutes);

// Protect all other /api/* except /api/health and /api/auth/*
app.use('/api', (req, res, next) => {
  if (req.path === '/health' || req.path.startsWith('/auth/')) {
    return next();
  }
  return requireAuth(req, res, next);
});

app.use('/', routes);

app.use((req, res, next) => {
  res.status(404).json({ message: 'Not Found' });
});

app.use(errorHandler);

module.exports = app;
