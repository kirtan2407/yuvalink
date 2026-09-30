const express = require('express');
const { z } = require('zod');
const bcrypt = require('bcryptjs');
const Setting = require('../models/Setting');

const router = express.Router();

const passwordSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: z.string().min(8, 'New password must be at least 8 characters long')
});

const autoLogoutSchema = z.object({
  minutes: z.number().int().min(1).max(240, 'Must be between 1 and 240 minutes')
});

// PUT /password
router.put('/password', async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = passwordSchema.parse(req.body);

    const setting = await Setting.findOne();
    if (!setting) {
      return res.status(503).json({ message: 'Settings not found' });
    }

    const isMatch = await bcrypt.compare(currentPassword, setting.passwordHash);
    if (!isMatch) {
      return res.status(401).json({ message: 'Incorrect current password' });
    }

    const newHash = await bcrypt.hash(newPassword, 10);
    setting.passwordHash = newHash;
    await setting.save();

    res.status(200).json({ message: 'Password updated successfully' });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return res.status(400).json({ message: err.errors[0].message, errors: err.errors });
    }
    next(err);
  }
});

// PUT /auto-logout
router.put('/auto-logout', async (req, res, next) => {
  try {
    const { minutes } = autoLogoutSchema.parse(req.body);
    
    const setting = await Setting.findOne();
    if (!setting) {
      return res.status(503).json({ message: 'Settings not found' });
    }
    
    setting.autoLogoutMinutes = minutes;
    await setting.save();
    
    res.json({ message: 'Auto-logout time updated', autoLogoutMinutes: minutes });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return res.status(400).json({ message: err.errors[0].message, errors: err.errors });
    }
    next(err);
  }
});

module.exports = router;
