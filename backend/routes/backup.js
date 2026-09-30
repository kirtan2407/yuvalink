const express = require('express');
const xlsx = require('xlsx');
const Member = require('../models/Member');
const Attendance = require('../models/Attendance');
const Society = require('../models/Society');

const router = express.Router();

// GET /export
router.get('/export', async (req, res, next) => {
  try {
    const members = await Member.find().lean();
    const attendances = await Attendance.find().lean();
    const societies = await Society.find().lean();

    const membersSheet = members.map(m => ({
      ID: m._id.toString(),
      Name: m.name,
      Mobile: m.mobile,
      Group: m.group,
      BirthDate: m.birthDate ? m.birthDate.toISOString().split('T')[0] : '',
      AddedInSatsangApp: m.addedInSatsangApp ? 'Yes' : 'No',
      YBMember: m.ybMember ? 'Yes' : 'No',
      IsDeleted: m.isDeleted ? 'Yes' : 'No',
      Address: m.address,
      CurrentStudy: m.currentStudy,
      Occupation: m.occupation
    }));

    const attendanceSheet = attendances.map(a => ({
      ID: a._id.toString(),
      Date: a.date,
      MemberID: a.memberId.toString(),
      Status: a.status
    }));

    const societiesSheet = societies.map(s => ({
      ID: s._id.toString(),
      SocietyName: s.societyName,
      MembersCount: s.membersCount,
      Area: s.area,
      Landmark: s.landmark
    }));

    const wb = xlsx.utils.book_new();

    const wsMembers = xlsx.utils.json_to_sheet(membersSheet);
    const wsAttendance = xlsx.utils.json_to_sheet(attendanceSheet);
    const wsSocieties = xlsx.utils.json_to_sheet(societiesSheet);

    xlsx.utils.book_append_sheet(wb, wsMembers, 'Members');
    xlsx.utils.book_append_sheet(wb, wsAttendance, 'Attendance');
    xlsx.utils.book_append_sheet(wb, wsSocieties, 'Societies');

    const buf = xlsx.write(wb, { type: 'buffer', bookType: 'xlsx' });

    res.setHeader('Content-Disposition', 'attachment; filename="backup.xlsx"');
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.send(buf);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
