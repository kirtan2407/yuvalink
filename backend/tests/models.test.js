const { test, describe, before, after } = require('node:test');
const assert = require('node:assert');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const { Member, Attendance, Society } = require('../models');

describe('Models Validation', () => {
  let mongoServer;

  before(async () => {
    mongoServer = await MongoMemoryServer.create();
    await mongoose.connect(mongoServer.getUri());
  });

  after(async () => {
    await mongoose.disconnect();
    await mongoServer.stop();
  });

  test('Member validation', async () => {
    const validMember = new Member({
      name: 'John Doe',
      mobile: '1234567890',
      group: 'a'
    });
    
    await validMember.validate();
    assert.strictEqual(validMember.group, 'A');

    const invalidMember = new Member({
      name: 'Jane Doe',
      mobile: '123' // invalid mobile
    });

    try {
      await invalidMember.validate();
      assert.fail('Should have thrown validation error');
    } catch (error) {
      assert.ok(error.errors.mobile);
    }
  });

  test('Attendance validation', async () => {
    const validAttendance = new Attendance({
      date: '2023-10-25',
      memberId: new mongoose.Types.ObjectId(),
      status: 'P'
    });

    await validAttendance.validate();
  });
});
