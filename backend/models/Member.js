const mongoose = require('mongoose');

const memberSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
      minlength: [2, 'Name must be at least 2 characters'],
      maxlength: [80, 'Name must be at most 80 characters'],
    },
    mobile: {
      type: String,
      required: [true, 'Mobile number is required'],
      trim: true,
      match: [/^[0-9]{10}$/, 'Mobile number must be exactly 10 digits'],
    },
    address: { type: String, trim: true, maxlength: 250, default: '' },
    currentStudy: { type: String, trim: true, maxlength: 100, default: '' },
    occupation: { type: String, trim: true, maxlength: 100, default: '' },
    birthDate: {
      type: Date,
      default: null,
      validate: {
        validator: (v) => !v || v <= new Date(),
        message: 'Birth date cannot be in the future',
      },
    },

    // Group A-Z: OPTIONAL. Empty string means "Unassigned".
    // Can be set at creation or changed any time via edit.
    group: {
      type: String,
      trim: true,
      uppercase: true,
      default: '',
      validate: {
        validator: (v) => v === '' || /^[A-Z]$/.test(v),
        message: 'Group must be a single letter A-Z or empty',
      },
    },

    addedInSatsangApp: { type: Boolean, default: false },
    ybMember: { type: Boolean, default: false },

    // Soft delete (Trash)
    isDeleted: { type: Boolean, default: false },
    deletedAt: { type: Date, default: null },
  },
  { timestamps: true } // createdAt, updatedAt
);

memberSchema.index({ group: 1, name: 1 });
memberSchema.index({ isDeleted: 1 });
memberSchema.index({ mobile: 1 });
memberSchema.index({ birthDate: 1 });

module.exports = mongoose.model('Member', memberSchema);
