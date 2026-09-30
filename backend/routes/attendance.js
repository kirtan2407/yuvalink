const express = require('express');
const { z } = require('zod');
const Attendance = require('../models/Attendance');
const Member = require('../models/Member');

const router = express.Router();

const dateRegex = /^\d{4}-\d{2}-\d{2}$/;

// Zod schemas
const dateQuerySchema = z.object({
  date: z.string().regex(dateRegex, 'Invalid date format, use YYYY-MM-DD').refine((val) => {
    return new Date(val) <= new Date();
  }, 'Future dates are not allowed')
});

const putSchema = z.object({
  date: z.string().regex(dateRegex).refine(val => new Date(val) <= new Date(), 'Future dates are not allowed'),
  memberId: z.string().length(24),
  status: z.enum(['P', 'A'])
});

const putBulkSchema = z.object({
  date: z.string().regex(dateRegex).refine(val => new Date(val) <= new Date(), 'Future dates are not allowed'),
  memberIds: z.array(z.string().length(24)),
  status: z.enum(['P', 'A'])
});

const reportQuerySchema = z.object({
  from: z.string().regex(dateRegex).refine(val => new Date(val) <= new Date(), 'Future dates are not allowed'),
  to: z.string().regex(dateRegex).refine(val => new Date(val) <= new Date(), 'Future dates are not allowed'),
  group: z.string().optional()
}).refine(data => data.from <= data.to, {
  message: "'from' date must be before or equal to 'to' date",
  path: ['from']
});

// GET /?date=YYYY-MM-DD
router.get('/', async (req, res, next) => {
  try {
    const { date } = dateQuerySchema.parse(req.query);
    const records = await Attendance.find({ date });
    res.json(records);
  } catch (err) {
    if (err instanceof z.ZodError) {
      return res.status(400).json({ message: err.errors[0].message, errors: err.errors });
    }
    next(err);
  }
});

// PUT /
router.put('/', async (req, res, next) => {
  try {
    const { date, memberId, status } = putSchema.parse(req.body);
    const member = await Member.findById(memberId);
    
    if (!member || member.isDeleted) {
      return res.status(400).json({ message: 'Member not found or is deleted' });
    }
    
    const record = await Attendance.findOneAndUpdate(
      { date, memberId },
      { status, markedAt: new Date() },
      { upsert: true, new: true }
    );
    
    res.json(record);
  } catch (err) {
    if (err instanceof z.ZodError) {
      return res.status(400).json({ message: err.errors[0].message, errors: err.errors });
    }
    next(err);
  }
});

// PUT /bulk
router.put('/bulk', async (req, res, next) => {
  try {
    const { date, memberIds, status } = putBulkSchema.parse(req.body);
    
    // Check members
    const members = await Member.find({ _id: { $in: memberIds }, isDeleted: { $ne: true } });
    if (members.length !== memberIds.length) {
      return res.status(400).json({ message: 'One or more members are deleted or not found' });
    }
    
    const bulkOps = memberIds.map(id => ({
      updateOne: {
        filter: { date, memberId: id },
        update: { $set: { status, markedAt: new Date() } },
        upsert: true
      }
    }));
    
    if (bulkOps.length > 0) {
      await Attendance.bulkWrite(bulkOps);
    }
    
    res.json({ message: 'Bulk attendance marked successfully' });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return res.status(400).json({ message: err.errors[0].message, errors: err.errors });
    }
    next(err);
  }
});

// GET /report
router.get('/report', async (req, res, next) => {
  try {
    const { from, to, group } = reportQuerySchema.parse(req.query);
    
    const memberMatch = { isDeleted: { $ne: true } };
    if (group) {
      memberMatch.group = group;
    }

    const members = await Member.find(memberMatch).lean();
    const memberIds = members.map(m => m._id);

    const attendanceRecords = await Attendance.find({
      date: { $gte: from, $lte: to },
      memberId: { $in: memberIds }
    }).lean();

    const stats = {};
    for (const m of members) {
      stats[m._id.toString()] = {
        memberId: m._id,
        name: m.name,
        group: m.group || '',
        present: 0,
        absent: 0,
        percentage: 0
      };
    }

    for (const r of attendanceRecords) {
      const sid = r.memberId.toString();
      if (stats[sid]) {
        if (r.status === 'P') stats[sid].present++;
        if (r.status === 'A') stats[sid].absent++;
      }
    }

    const result = Object.values(stats).map(s => {
      const total = s.present + s.absent;
      s.percentage = total === 0 ? 0 : Math.round((s.present / total) * 100);
      return s;
    });

    res.json(result);
  } catch (err) {
    if (err instanceof z.ZodError) {
      return res.status(400).json({ message: err.errors[0].message, errors: err.errors });
    }
    next(err);
  }
});

module.exports = router;
