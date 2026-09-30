const mongoose = require('mongoose');
const app = require('./app');
const config = require('./config/env');

mongoose.connect(config.MONGODB_URI)
  .then(() => {
    console.log('Connected to MongoDB');
    app.listen(config.PORT, () => {
      console.log(`Server listening on port ${config.PORT}`);
    });
  })
  .catch((err) => {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  });