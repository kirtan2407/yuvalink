const { describe, it, before, after, beforeEach } = require('node:test');
const assert = require('assert');
const request = require('supertest');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const app = require('../app');
const Member = require('../models/Member');
const Attendance = require('../models/Attendance');
const Society = require('../models/Society');
const Setting = require('../models/Setting');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

let mongoServer;
let token;

before(async () => {
  mongoServer = await MongoMemoryServer.create();
  await mongoose.connect(mongoServer.getUri());

  const hash = await bcrypt.hash('password123', 10);
  await Setting.create({ passwordHash: hash, autoLogoutMinutes: 30 });

  token = jwt.sign({ id: 'dummy' }, process.env.JWT_SECRET || 'testsecret', { expiresIn: '1h' });
});

after(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

beforeEach(async () => {
  await Member.deleteMany({});
  await Attendance.deleteMany({});
  await Society.deleteMany({});
});

describe('Phase 5 Tests', () => {
  describe('Attendance endpoints', () => {
    it('should delete attendance by date and get count', async () => {
      const member = await Member.create({ name: 'Test', mobile: '1234567890' });
      await Attendance.create([
        { date: '2023-10-10', memberId: member._id, status: 'P' },
        { date: '2023-10-10', memberId: new mongoose.Types.ObjectId(), status: 'A' },
        { date: '2023-10-11', memberId: member._id, status: 'P' }
      ]);

      const countRes = await request(app)
        .get('/api/attendance/count?date=2023-10-10')
        .set('Authorization', `Bearer ${token}`);
      assert.strictEqual(countRes.status, 200);
      assert.strictEqual(countRes.body.count, 2);

      const deleteRes = await request(app)
        .delete('/api/attendance/date/2023-10-10')
        .set('Authorization', `Bearer ${token}`);
      assert.strictEqual(deleteRes.status, 200);
      assert.strictEqual(deleteRes.body.deletedCount, 2);

      const countResAfter = await request(app)
        .get('/api/attendance/count?date=2023-10-10')
        .set('Authorization', `Bearer ${token}`);
      assert.strictEqual(countResAfter.body.count, 0);
    });
  });

  describe('Societies endpoints', () => {
    it('should clear all societies only if confirm is true', async () => {
      await Society.create({ societyName: 'Soc 1' });
      
      const resNoConfirm = await request(app)
        .delete('/api/societies/all')
        .set('Authorization', `Bearer ${token}`)
        .send({});
      assert.strictEqual(resNoConfirm.status, 400);
      
      const resFalse = await request(app)
        .delete('/api/societies/all')
        .set('Authorization', `Bearer ${token}`)
        .send({ confirm: false });
      assert.strictEqual(resFalse.status, 400);
      
      const resOk = await request(app)
        .delete('/api/societies/all')
        .set('Authorization', `Bearer ${token}`)
        .send({ confirm: true });
      assert.strictEqual(resOk.status, 200);
      assert.strictEqual(resOk.body.deletedCount, 1);
    });
  });

  describe('Settings endpoints', () => {
    it('should update password and auto-logout', async () => {
      const res = await request(app)
        .put('/api/settings/password')
        .set('Authorization', `Bearer ${token}`)
        .send({ currentPassword: 'password123', newPassword: 'newpassword' });
      assert.strictEqual(res.status, 200);
      
      const setting = await Setting.findOne();
      const match = await bcrypt.compare('newpassword', setting.passwordHash);
      assert.strictEqual(match, true);

      const resLogout = await request(app)
        .put('/api/settings/auto-logout')
        .set('Authorization', `Bearer ${token}`)
        .send({ minutes: 60 });
      assert.strictEqual(resLogout.status, 200);
      assert.strictEqual(resLogout.body.autoLogoutMinutes, 60);
    });
  });

  describe('Birthdays endpoints', () => {
    it('should return birthdays within 7 days', async () => {
      const today = new Date();
      const bday1 = new Date(today);
      bday1.setFullYear(2000);
      bday1.setDate(bday1.getDate() + 2); // In 2 days

      const bday2 = new Date(today);
      bday2.setFullYear(2000);
      bday2.setDate(bday2.getDate() + 10); // In 10 days, shouldn't appear

      await Member.create([
        { name: 'Bday 1', mobile: '1234567891', birthDate: bday1 },
        { name: 'Bday 2', mobile: '1234567892', birthDate: bday2 }
      ]);

      const res = await request(app)
        .get('/api/birthdays')
        .set('Authorization', `Bearer ${token}`);
      assert.strictEqual(res.status, 200);
      assert.strictEqual(res.body.length, 1);
      assert.strictEqual(res.body[0].name, 'Bday 1');
      assert.ok(Math.abs(res.body[0].daysDiff) <= 7);
    });
  });
});
