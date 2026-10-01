const mongoose = require('mongoose');

const attendanceSchema = new mongoose.Schema({
  // Stored as text "YYYY-MM-DD" so dates never shift with time zones
  date: {
    type: String,
    required: [true, 'Date is required'],
    match: [/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format'],
  },
  memberId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Member',
    required: true,
  },
  status: {
    type: String,
    enum: { values: ['P', 'A'], message: 'Status must be P or A' },
    required: true,
  },
  markedAt: { type: Date, default: Date.now },
});

// One record per member per day
attendanceSchema.index({ date: 1, memberId: 1 }, { unique: true });
attendanceSchema.index({ date: 1 });

module.exports = mongoose.model('Attendance', attendanceSchema);
