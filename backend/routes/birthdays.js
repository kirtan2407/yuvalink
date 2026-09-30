const express = require('express');
const Member = require('../models/Member');
const { getBirthdayDiff } = require('../utils/dateUtils');

const router = express.Router();

// GET /api/birthdays
router.get('/', async (req, res, next) => {
  try {
    const members = await Member.find({ isDeleted: { $ne: true }, birthDate: { $ne: null } }).lean();
    
    const result = [];
    for (const member of members) {
      if (member.birthDate) {
        const daysDiff = getBirthdayDiff(member.birthDate);
        if (daysDiff !== null && Math.abs(daysDiff) <= 7) {
          result.push({
            name: member.name,
            group: member.group,
            birthDate: member.birthDate.toISOString().split('T')[0],
            daysDiff
          });
        }
      }
    }
    
    // Sort by daysDiff (closest to -7 first, up to +7) or by closest to 0
    result.sort((a, b) => a.daysDiff - b.daysDiff);
    
    res.json(result);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
