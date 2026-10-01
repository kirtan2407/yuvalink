const mongoose = require('mongoose');
const { Attendance, Member } = require('./models');
require('dotenv').config();

async function audit() {
  await mongoose.connect(process.env.MONGODB_URI);
  
  const records = await Attendance.find().lean();
  let invalidStatus = 0;
  let invalidDate = 0;
  let invalidMemberId = 0;
  let duplicatePairs = new Set();
  let duplicates = 0;
  let dateCounts = {};
  
  const activeMembers = new Set((await Member.find({ isDeleted: { $ne: true } }).lean()).map(m => m._id.toString()));
  
  for (const r of records) {
    if (r.status !== 'P' && r.status !== 'A') invalidStatus++;
    if (!/^\\d{4}-\\d{2}-\\d{2}$/.test(r.date)) invalidDate++;
    if (!r.memberId || !activeMembers.has(r.memberId.toString())) invalidMemberId++;
    
    const pair = r.date + '_' + r.memberId.toString();
    if (duplicatePairs.has(pair)) duplicates++;
    duplicatePairs.add(pair);
    
    dateCounts[r.date] = (dateCounts[r.date] || 0) + 1;
  }
  
  console.log("Total records:", records.length);
  console.log("Invalid Status:", invalidStatus);
  console.log("Invalid Date:", invalidDate);
  console.log("Invalid/Deleted MemberId:", invalidMemberId);
  console.log("Duplicate Pairs:", duplicates);
  console.log("Date Counts:", dateCounts);
  
  process.exit(0);
}

audit().catch(console.error);
