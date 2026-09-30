const { test, describe } = require('node:test');
const assert = require('node:assert');
const { isValidDateString } = require('../utils/dateUtils');
const { normalizeGroup, isValidGroup } = require('../utils/groupUtils');

describe('Utils', () => {
  test('isValidDateString', () => {
    assert.strictEqual(isValidDateString('2023-10-25'), true);
    assert.strictEqual(isValidDateString('2023-02-29'), false); // 2023 is not leap year
    assert.strictEqual(isValidDateString('10-25-2023'), false);
  });

  test('normalizeGroup', () => {
    assert.strictEqual(normalizeGroup('a'), 'A');
    assert.strictEqual(normalizeGroup(' B '), 'B');
    assert.strictEqual(normalizeGroup('1'), '');
    assert.strictEqual(normalizeGroup(''), '');
  });

  test('isValidGroup', () => {
    assert.strictEqual(isValidGroup('A'), true);
    assert.strictEqual(isValidGroup(''), true);
    assert.strictEqual(isValidGroup('AA'), false);
    assert.strictEqual(isValidGroup('1'), false);
  });
});
