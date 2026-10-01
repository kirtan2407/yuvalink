const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const { Attendance } = require('./backend/models');
require('dotenv').config({ path: './backend/.env' });

async function run() {
  await mongoose.connect(process.env.MONGODB_URI);
  
  try {
    const record = await Attendance.findOneAndUpdate(
      { date: '2026-10-01', memberId: new mongoose.Types.ObjectId() },
      { status: 'P', markedAt: new Date() },
      { upsert: true, new: true }
    );
    console.log("DB Insert Success:", record);
  } catch(e) {
    console.error("DB Insert Error:", e.message);
  }
  
  process.exit();
}
run();
