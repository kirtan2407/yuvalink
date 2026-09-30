const mongoose = require('mongoose');

const settingSchema = new mongoose.Schema({
  passwordHash: { type: String, required: true },
  autoLogoutMinutes: { type: Number, default: 30 }
}, { timestamps: true });

module.exports = mongoose.model('Setting', settingSchema);
