const { test, describe, before, after } = require('node:test');
const assert = require('node:assert');
const request = require('supertest');
const mongoose = require('mongoose');
const xlsx = require('xlsx');
const app = require('../app');
const Member = require('../models/Member');
const jwt = require('jsonwebtoken');

let mongoServer;
let token;

function createExcelBuffer(data) {
  const ws = xlsx.utils.json_to_sheet(data);
  const wb = xlsx.utils.book_new();
  xlsx.utils.book_append_sheet(wb, ws, "Sheet1");
  return xlsx.write(wb, { type: 'buffer', bookType: 'xlsx' });
}

describe('Import Endpoints', async () => {
  before(async () => {
    const { MongoMemoryServer } = require('mongodb-memory-server');
    mongoServer = await MongoMemoryServer.create();
    const uri = mongoServer.getUri();
    await mongoose.connect(uri);

    token = jwt.sign({ username: 'admin' }, process.env.JWT_SECRET || 'secret');
  });

  after(async () => {
    await mongoose.disconnect();
    if (mongoServer) {
      await mongoServer.stop();
    }
  });

  test('POST /api/import/preview - valid file', async () => {
    const buffer = createExcelBuffer([
      { Name: 'John Doe', Mobile: '1234567890', 'Birth Date': '15/05/2000', Group: 'A', 'Added in Satsang App': 'yes' }
    ]);

    const res = await request(app)
      .post('/api/import/preview')
      .set('Authorization', `Bearer ${token}`)
      .attach('file', buffer, 'test.xlsx');

    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.body.validRows.length, 1);
    assert.strictEqual(res.body.errors.length, 0);
    assert.strictEqual(res.body.validRows[0].data.name, 'John Doe');
    assert.strictEqual(res.body.validRows[0].data.group, 'A');
    assert.strictEqual(res.body.validRows[0].data.addedInSatsangApp, true);
  });

  test('POST /api/import/preview - parsing variants', async () => {
    const buffer = createExcelBuffer([
      { 'full name': 'Jane Doe', Contact: '0987654321', DOB: '2001-10-12', 'Mandal': 'b' }
    ]);

    const res = await request(app)
      .post('/api/import/preview')
      .set('Authorization', `Bearer ${token}`)
      .attach('file', buffer, 'test.xlsx');

    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.body.validRows.length, 1);
    assert.strictEqual(res.body.validRows[0].data.name, 'Jane Doe');
    assert.strictEqual(res.body.validRows[0].data.group, 'B'); // uppercased
  });

  test('POST /api/import/preview - invalid group', async () => {
    const buffer = createExcelBuffer([
      { name: 'Invalid Group', mobile: '1111111111', group: 'AB' }
    ]);

    const res = await request(app)
      .post('/api/import/preview')
      .set('Authorization', `Bearer ${token}`)
      .attach('file', buffer, 'test.xlsx');

    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.body.errors.length, 1);
    assert.ok(res.body.errors[0].reason.includes('Invalid Group'));
  });

  test('POST /api/import/preview - duplicates', async () => {
    await Member.create({ name: 'Existing User', mobile: '5555555555', group: 'C' });

    const buffer = createExcelBuffer([
      { name: 'Duplicate Mobile', mobile: '5555555555' }
    ]);

    const res = await request(app)
      .post('/api/import/preview')
      .set('Authorization', `Bearer ${token}`)
      .attach('file', buffer, 'test.xlsx');

    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.body.validRows.length, 0);
    assert.strictEqual(res.body.duplicates.length, 1);
    assert.strictEqual(res.body.duplicates[0].data.mobile, '5555555555');
  });

  test('POST /api/import/preview - missing name or invalid mobile', async () => {
    const buffer = createExcelBuffer([
      { mobile: '1234567890' }, // missing name
      { name: 'Bad Mobile', mobile: '123' } // bad mobile
    ]);

    const res = await request(app)
      .post('/api/import/preview')
      .set('Authorization', `Bearer ${token}`)
      .attach('file', buffer, 'test.xlsx');

    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.body.errors.length, 2);
    assert.ok(res.body.errors[0].reason.includes('Missing Name'));
    assert.ok(res.body.errors[1].reason.includes('Invalid Mobile'));
  });

  test('POST /api/import/commit', async () => {
    const payload = {
      rows: [
        {
          data: {
            name: 'New Commit User',
            mobile: '6666666666',
            group: 'D',
            addedInSatsangApp: false,
            ybMember: true
          }
        },
        {
          data: {
            name: 'Existing User', // From previous test
            mobile: '5555555555'
          }
        }
      ]
    };

    const res = await request(app)
      .post('/api/import/commit')
      .set('Authorization', `Bearer ${token}`)
      .send(payload);

    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.body.imported, 1);
    assert.strictEqual(res.body.skipped, 1); // skipped existing

    const member = await Member.findOne({ mobile: '6666666666' });
    assert.ok(member);
    assert.strictEqual(member.name, 'New Commit User');
    assert.strictEqual(member.group, 'D');
    assert.strictEqual(member.ybMember, true);
  });
});
