require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const Setting = require('../models/Setting');

async function setPassword() {
  const password = process.argv[2];
  if (!password) {
    console.error('Usage: npm run set-password <password>');
    process.exit(1);
  }

  if (!process.env.MONGODB_URI) {
    console.error('MONGODB_URI is missing');
    process.exit(1);
  }

  try {
    await mongoose.connect(process.env.MONGODB_URI);
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    let setting = await Setting.findOne();
    if (!setting) {
      setting = new Setting({ passwordHash, autoLogoutMinutes: 15 });
    } else {
      setting.passwordHash = passwordHash;
      if (!setting.autoLogoutMinutes) {
        setting.autoLogoutMinutes = 15;
      }
    }
    await setting.save();
    console.log('Password updated successfully.');
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

setPassword();
