const mongoose = require('mongoose');
const config = require('../config/env');
const models = require('../models');

async function syncIndexes() {
  try {
    await mongoose.connect(config.MONGODB_URI);
    console.log('Connected to DB');
    
    for (const [name, model] of Object.entries(models)) {
      console.log(`Syncing indexes for ${name}...`);
      await model.syncIndexes();
    }
    
    console.log('Indexes synced successfully');
    process.exit(0);
  } catch (error) {
    console.error('Error syncing indexes:', error);
    process.exit(1);
  }
}

syncIndexes();
