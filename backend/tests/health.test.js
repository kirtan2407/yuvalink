const { test, describe } = require('node:test');
const assert = require('node:assert');
const request = require('supertest');
const app = require('../app');

describe('Health Routes', () => {
  test('GET /api/health returns ok', async () => {
    const res = await request(app).get('/api/health');
    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.body.status, 'ok');
    assert.ok(['connected', 'disconnected'].includes(res.body.db));
  });
});
