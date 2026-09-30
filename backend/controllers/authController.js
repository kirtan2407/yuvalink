const { z } = require('zod');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Setting = require('../models/Setting');
const config = require('../config/env');

const loginSchema = z.object({
  password: z.string().min(1, "Password is required")
});

exports.login = async (req, res, next) => {
  try {
    const parseResult = loginSchema.safeParse(req.body);
    if (!parseResult.success) {
      return res.status(400).json({ message: parseResult.error.errors[0].message });
    }
    const { password } = parseResult.data;

    const setting = await Setting.findOne();
    if (!setting || !setting.passwordHash) {
      return res.status(503).json({ message: 'Admin must run npm run set-password' });
    }

    const isMatch = await bcrypt.compare(password, setting.passwordHash);
    if (!isMatch) {
      return res.status(401).json({ message: 'Incorrect password' });
    }

    const autoLogoutMinutes = setting.autoLogoutMinutes || 15;
    const token = jwt.sign({}, config.JWT_SECRET || 'secret', { expiresIn: `${autoLogoutMinutes}m` });

    res.json({ token, expiresIn: autoLogoutMinutes * 60, autoLogoutMinutes });
  } catch (error) {
    next(error);
  }
};

exports.me = async (req, res, next) => {
  try {
    const setting = await Setting.findOne();
    const autoLogoutMinutes = setting ? setting.autoLogoutMinutes : 15;
    res.json({ authenticated: true, autoLogoutMinutes });
  } catch (error) {
    next(error);
  }
};

exports.logout = (req, res) => {
  res.status(204).send();
};
