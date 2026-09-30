const mongoose = require('mongoose');

const societySchema = new mongoose.Schema({
  societyName: { type: String, required: true },
  membersCount: { type: Number, default: 0 },
  area: { type: String },
  landmark: { type: String }
}, { timestamps: true });

societySchema.index({ societyName: 1 });

module.exports = mongoose.model('Society', societySchema);
