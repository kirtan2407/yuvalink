const mongoose = require('mongoose');
const { Attendance } = require('./models');
require('dotenv').config();

async function run() {
  await mongoose.connect(process.env.MONGODB_URI);
  try {
    const records = await Attendance.find({}).lean();
    console.log("All Attendance records:", records);
  } catch(e) {
    console.error("Error:", e.message);
  }
  process.exit();
}
run();
