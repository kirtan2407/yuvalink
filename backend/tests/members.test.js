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

test('create w/o group', async () => {
  const res = await request(app)
    .post('/api/members')
    .set('Authorization', `Bearer ${token}`)
    .send({
      name: 'John Doe',
      mobile: '1234567890'
    });
  
  assert.strictEqual(res.status, 201);
  assert.strictEqual(res.body.name, 'John Doe');
  assert.strictEqual(res.body.group, '');
});

test('create with s -> S', async () => {
  const res = await request(app)
    .post('/api/members')
    .set('Authorization', `Bearer ${token}`)
    .send({
      name: 'Jane Doe',
      mobile: '0987654321',
      group: 's'
    });
  
  assert.strictEqual(res.status, 201);
  assert.strictEqual(res.body.group, 'S');
});

test('duplicate mobile warning (saves anyway)', async () => {
  await Member.create({ name: 'Old User', mobile: '1111111111' });

  const res = await request(app)
    .post('/api/members')
    .set('Authorization', `Bearer ${token}`)
    .send({
      name: 'New User',
      mobile: '1111111111'
    });
  
  assert.strictEqual(res.status, 201);
  assert.strictEqual(res.body.duplicateWarning, true);
});

test('edit group, duplicate mobile warning', async () => {
  const m1 = await Member.create({ name: 'User1', mobile: '2222222222' });
  const m2 = await Member.create({ name: 'User2', mobile: '3333333333' });

  const res = await request(app)
    .put(`/api/members/${m2._id}`)
    .set('Authorization', `Bearer ${token}`)
    .send({
      name: 'User2 Edited',
      mobile: '2222222222',
      group: 'a'
    });
  
  assert.strictEqual(res.status, 200);
  assert.strictEqual(res.body.group, 'A');
  assert.strictEqual(res.body.duplicateWarning, true);
});

test('invalid group rejected', async () => {
  const res = await request(app)
    .post('/api/members')
    .set('Authorization', `Bearer ${token}`)
    .send({
      name: 'Invalid Group User',
      mobile: '4444444444',
      group: 'ss'
    });
  
  assert.strictEqual(res.status, 400);
});

test('soft delete', async () => {
  const m1 = await Member.create({ name: 'User To Delete', mobile: '5555555555' });
  
  const res = await request(app)
    .delete(`/api/members/${m1._id}`)
    .set('Authorization', `Bearer ${token}`);
  
  assert.strictEqual(res.status, 200);
  assert.strictEqual(res.body.isDeleted, true);
  assert.ok(res.body.deletedAt);

  const trashRes = await request(app)
    .get('/api/members/trash')
    .set('Authorization', `Bearer ${token}`);
  
  assert.strictEqual(trashRes.status, 200);
  assert.strictEqual(trashRes.body.length, 1);
});

test('restore', async () => {
  const m1 = await Member.create({ name: 'Deleted User', mobile: '6666666666', isDeleted: true, deletedAt: new Date() });
  
  const res = await request(app)
    .post(`/api/members/${m1._id}/restore`)
    .set('Authorization', `Bearer ${token}`);
  
  assert.strictEqual(res.status, 200);
  assert.strictEqual(res.body.isDeleted, false);
  assert.strictEqual(res.body.deletedAt, null);
});

test('permanent delete (check attendance deleted)', async () => {
  const m1 = await Member.create({ name: 'Permanent Delete User', mobile: '7777777777' });
  await Attendance.create({ date: '2023-01-01', memberId: m1._id, status: 'P' });

  const res = await request(app)
    .delete(`/api/members/${m1._id}/permanent`)
    .set('Authorization', `Bearer ${token}`);
  
  assert.strictEqual(res.status, 200);

  const memberCheck = await Member.findById(m1._id);
  assert.strictEqual(memberCheck, null);

  const attCheck = await Attendance.find({ memberId: m1._id });
  assert.strictEqual(attCheck.length, 0);
});
