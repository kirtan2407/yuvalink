// Creates the collections and indexes in MongoDB, then prints them.
// Run from the backend folder:  node scripts/syncIndexes.js
require('dotenv').config();
const mongoose = require('mongoose');
const models = require('../models');

async function main() {
  if (!process.env.MONGODB_URI) {
    console.error('MONGODB_URI is not set in backend/.env');
    process.exit(1);
  }
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('Connected to:', mongoose.connection.name);

  for (const [name, Model] of Object.entries(models)) {
    await Model.createCollection().catch(() => {}); // ignore "already exists"
    await Model.syncIndexes();
    const indexes = await Model.collection.indexes();
    console.log(`\n${name} (${Model.collection.name})`);
    indexes.forEach((i) => console.log('  -', i.name));
  }

  await mongoose.disconnect();
  console.log('\nDone.');
}

main().catch((err) => {
  console.error('Failed:', err.message);
  process.exit(1);
});
