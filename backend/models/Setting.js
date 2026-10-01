const mongoose = require('mongoose');

// Only ONE settings document exists (key = "app")
const settingSchema = new mongoose.Schema(
  {
    key: { type: String, default: 'app', unique: true },
    passwordHash: { type: String, default: '' },
    autoLogoutMinutes: { type: Number, min: 1, max: 240, default: 15 },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Setting', settingSchema);
