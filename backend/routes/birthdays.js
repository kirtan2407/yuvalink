const express = require('express');
const Member = require('../models/Member');
const { getBirthdayDiff, todayInTimezone } = require('../utils/dateUtils');

const router = express.Router();

router.get('/', async (req, res, next) => {
  try {
    const members = await Member.find({ isDeleted: { $ne: true }, birthDate: { $ne: null } }).lean();
    
    const result = [];
    const today = todayInTimezone();
    const currentYear = today.getFullYear();
    
    for (const member of members) {
      if (member.birthDate) {
        const daysDiff = getBirthdayDiff(member.birthDate);
        if (daysDiff !== null && Math.abs(daysDiff) <= 7) {
          
          let turningAge = currentYear - member.birthDate.getFullYear();
          // If birthday hasn't happened this year yet (in daysDiff > 0 context normally, but wait, if it's wrap around we might add 1)
          // Just approximation: turningAge is currentYear - birthYear. If daysDiff > 0 and their birth month is < today's month, it means it's a wrap-around next year
          
          if (daysDiff > 0 && member.birthDate.getMonth() < today.getMonth()) {
             turningAge = (currentYear + 1) - member.birthDate.getFullYear();
          } else if (daysDiff < 0 && member.birthDate.getMonth() > today.getMonth()) {
             turningAge = (currentYear - 1) - member.birthDate.getFullYear();
          }
          
          result.push({
            id: member._id,
            name: member.name,
            group: member.group,
            mobile: member.mobile,
            birthDate: member.birthDate.toISOString().split('T')[0],
            address: member.address,
            currentStudy: member.currentStudy,
            occupation: member.occupation,
            turningAge,
            daysDiff
          });
        }
      }
    }
    
    // Sort: 0 first, then positive (upcoming) ascending, then negative (passed) descending
    result.sort((a, b) => {
      if (a.daysDiff === 0 && b.daysDiff !== 0) return -1;
      if (b.daysDiff === 0 && a.daysDiff !== 0) return 1;
      if (a.daysDiff > 0 && b.daysDiff > 0) return a.daysDiff - b.daysDiff;
      if (a.daysDiff < 0 && b.daysDiff < 0) return b.daysDiff - a.daysDiff;
      if (a.daysDiff > 0 && b.daysDiff < 0) return -1;
      if (a.daysDiff < 0 && b.daysDiff > 0) return 1;
      return 0;
    });
    
    res.json(result);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
