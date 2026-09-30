const { test, describe, before, after, beforeEach } = require('node:test');
const assert = require('node:assert');
const request = require('supertest');
const { MongoMemoryServer } = require('mongodb-memory-server');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

process.env.JWT_SECRET = 'test-secret';
process.env.MONGODB_URI = 'mongodb://localhost:27017/test';
process.env.CORS_ORIGIN = '*';
process.env.PORT = '5000';

const app = require('../app');
const Setting = require('../models/Setting');

describe('Auth Endpoints', () => {
  let mongoServer;

  before(async () => {
    mongoServer = await MongoMemoryServer.create();
    const uri = mongoServer.getUri();
    await mongoose.connect(uri);
  });

  after(async () => {
    await mongoose.disconnect();
    await mongoServer.stop();
  });

  beforeEach(async () => {
    await Setting.deleteMany({});
  });

  test('login: no password configured', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ password: 'any' });
    
    assert.strictEqual(res.status, 503);
    assert.strictEqual(res.body.message, 'Admin must run npm run set-password');
  });

  test('login: missing password in request', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({});
    
    assert.strictEqual(res.status, 400);
    assert.strictEqual(res.body.message, 'Required');
  });

  test('login: wrong password', async () => {
    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash('correctpass', salt);
    await Setting.create({ passwordHash: hash });

    const res = await request(app)
      .post('/api/auth/login')
      .send({ password: 'wrongpass' });
    
    assert.strictEqual(res.status, 401);
    assert.strictEqual(res.body.message, 'Incorrect password');
  });

  test('login: success', async () => {
    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash('correctpass', salt);
    await Setting.create({ passwordHash: hash, autoLogoutMinutes: 30 });

    const res = await request(app)
      .post('/api/auth/login')
      .send({ password: 'correctpass' });
    
    assert.strictEqual(res.status, 200);
    assert.ok(res.body.token);
    assert.strictEqual(res.body.autoLogoutMinutes, 30);
  });

  test('protected route: without token', async () => {
    const res = await request(app).get('/api/auth/me');
    assert.strictEqual(res.status, 401);
  });

  test('protected route: with valid token', async () => {
    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash('correctpass', salt);
    await Setting.create({ passwordHash: hash, autoLogoutMinutes: 30 });

    const loginRes = await request(app)
      .post('/api/auth/login')
      .send({ password: 'correctpass' });
    
    const token = loginRes.body.token;

    const res = await request(app)
      .get('/api/auth/me')
      .set('Authorization', `Bearer ${token}`);
    
    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.body.authenticated, true);
    assert.strictEqual(res.body.autoLogoutMinutes, 30);
  });
});
