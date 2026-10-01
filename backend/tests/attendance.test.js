process.env.MONGODB_URI = 'mongodb://localhost:27017/test';
process.env.JWT_SECRET = 'secret';
process.env.CORS_ORIGIN = '*';
process.env.PORT = '5000';

const test = require('node:test');
const assert = require('node:assert');
const request = require('supertest');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const { MongoMemoryServer } = require('mongodb-memory-server');
const app = require('../app');
const Member = require('../models/Member');
const Attendance = require('../models/Attendance');

let mongoServer;
let token;

test.before(async () => {
  mongoServer = await MongoMemoryServer.create();
  const mongoUri = mongoServer.getUri();
  await mongoose.disconnect(); // Ensure no active connection
  await mongoose.connect(mongoUri);
  
  token = jwt.sign({ id: 'test' }, process.env.JWT_SECRET);
});

test.after(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

test.afterEach(async () => {
  await Member.deleteMany({});
  await Attendance.deleteMany({});
});

function getTodayDate() {
  const d = new Date();
  return d.toISOString().split('T')[0];
}



test('invalid date format in GET /', async () => {
  const res = await request(app)
    .get('/api/attendance?date=01-01-2023')
    .set('Authorization', `Bearer ${token}`);
  assert.strictEqual(res.status, 400);
});

test('upsert attendance (unique index)', async () => {
  const m1 = await Member.create({ name: 'User1', mobile: '1234567890' });
  const today = getTodayDate();

  // First time
  const res1 = await request(app)
    .put('/api/attendance')
    .set('Authorization', `Bearer ${token}`)
    .send({ date: today, memberId: m1._id, status: 'P' });
  
  assert.strictEqual(res1.status, 200);
  assert.strictEqual(res1.body.status, 'P');

  // Second time (upsert)
  const res2 = await request(app)
    .put('/api/attendance')
    .set('Authorization', `Bearer ${token}`)
    .send({ date: today, memberId: m1._id, status: 'A' });
  
  assert.strictEqual(res2.status, 200);
  assert.strictEqual(res2.body.status, 'A');

  const count = await Attendance.countDocuments({ memberId: m1._id, date: today });
  assert.strictEqual(count, 1);
});

test('reject deleted member in PUT /', async () => {
  const m1 = await Member.create({ name: 'User1', mobile: '1234567890', isDeleted: true });
  const today = getTodayDate();

  const res = await request(app)
    .put('/api/attendance')
    .set('Authorization', `Bearer ${token}`)
    .send({ date: today, memberId: m1._id, status: 'P' });
  
  assert.strictEqual(res.status, 400);
});

test('bulk upsert attendance', async () => {
  const m1 = await Member.create({ name: 'User1', mobile: '1234567890' });
  const m2 = await Member.create({ name: 'User2', mobile: '0987654321' });
  const m3 = await Member.create({ name: 'User3', mobile: '1111111111', isDeleted: true });
  
  const today = getTodayDate();

  const res = await request(app)
    .put('/api/attendance/bulk')
    .set('Authorization', `Bearer ${token}`)
    .send({ date: today, memberIds: [m1._id.toString(), m2._id.toString()], status: 'P' });
  
  assert.strictEqual(res.status, 200);

  const count = await Attendance.countDocuments({ date: today });
  assert.strictEqual(count, 2);

  // Should fail if a deleted member is included
  const res2 = await request(app)
    .put('/api/attendance/bulk')
    .set('Authorization', `Bearer ${token}`)
    .send({ date: today, memberIds: [m1._id.toString(), m3._id.toString()], status: 'A' });
  
  assert.strictEqual(res2.status, 400);
});

test('report logic', async () => {
  const m1 = await Member.create({ name: 'User1', mobile: '1234567890', group: 'A' });
  const m2 = await Member.create({ name: 'User2', mobile: '0987654321', group: 'B' });
  const m3 = await Member.create({ name: 'User3', mobile: '1111111111', group: 'A', isDeleted: true });

  const date1 = '2023-01-01';
  const date2 = '2023-01-02';

  await Attendance.create({ date: date1, memberId: m1._id, status: 'P' });
  await Attendance.create({ date: date2, memberId: m1._id, status: 'P' });
  
  await Attendance.create({ date: date1, memberId: m2._id, status: 'A' });
  await Attendance.create({ date: date2, memberId: m2._id, status: 'P' });

  // deleted member attendance
  await Attendance.create({ date: date1, memberId: m3._id, status: 'P' });

  // Test full report
  const res = await request(app)
    .get(`/api/attendance/report?from=${date1}&to=${date2}`)
    .set('Authorization', `Bearer ${token}`);
  
  assert.strictEqual(res.status, 200);
  assert.strictEqual(res.body.length, 2); // Excludes deleted member m3

  const user1Report = res.body.find(r => r.memberId === m1._id.toString());
  assert.strictEqual(user1Report.present, 2);
  assert.strictEqual(user1Report.absent, 0);
  assert.strictEqual(user1Report.percentage, 100);

  const user2Report = res.body.find(r => r.memberId === m2._id.toString());
  assert.strictEqual(user2Report.present, 1);
  assert.strictEqual(user2Report.absent, 1);
  assert.strictEqual(user2Report.percentage, 50);

  // Test report with group filter
  const resGroup = await request(app)
    .get(`/api/attendance/report?from=${date1}&to=${date2}&group=A`)
    .set('Authorization', `Bearer ${token}`);
  
  assert.strictEqual(resGroup.status, 200);
  assert.strictEqual(resGroup.body.length, 1); // Only m1
  assert.strictEqual(resGroup.body[0].memberId, m1._id.toString());

  // Test from > to validation
  const resInvalid = await request(app)
    .get(`/api/attendance/report?from=${date2}&to=${date1}`)
    .set('Authorization', `Bearer ${token}`);
  
  assert.strictEqual(resInvalid.status, 400);
});
