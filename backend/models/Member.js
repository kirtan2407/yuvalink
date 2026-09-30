const mongoose = require('mongoose');

const memberSchema = new mongoose.Schema({
  name: { type: String, required: true },
  mobile: { type: String, required: true, match: /^[0-9]{10}$/ },
  address: { type: String },
  currentStudy: { type: String },
  occupation: { type: String },
  birthDate: { type: Date },
  group: { 
    type: String, 
    default: '', 
    set: v => v ? v.toUpperCase() : ''
  },
  addedInSatsangApp: { type: Boolean, default: false },
  ybMember: { type: Boolean, default: false },
  isDeleted: { type: Boolean, default: false },
  deletedAt: { type: Date }
}, { timestamps: true });

memberSchema.index({ group: 1, name: 1 });
memberSchema.index({ isDeleted: 1 });
memberSchema.index({ mobile: 1 });
memberSchema.index({ birthDate: 1 });

module.exports = mongoose.model('Member', memberSchema);
