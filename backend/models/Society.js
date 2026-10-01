const mongoose = require('mongoose');

const societySchema = new mongoose.Schema(
  {
    societyName: {
      type: String,
      required: [true, 'Society name is required'],
      trim: true,
      maxlength: 120,
    },
    membersCount: { type: Number, min: 0, default: 0 },
    area: { type: String, trim: true, maxlength: 120, default: '' },
    landmark: { type: String, trim: true, maxlength: 160, default: '' },
  },
  { timestamps: true }
);

societySchema.index({ societyName: 1 });

module.exports = mongoose.model('Society', societySchema);
