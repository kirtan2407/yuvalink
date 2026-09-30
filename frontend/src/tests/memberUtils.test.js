import test from 'node:test';
import assert from 'node:assert';
import { filterMembers } from '../utils/memberUtils.js';

test('filterMembers - search with length 1 filters by group', () => {
  const members = [
    { id: 1, name: 'Alice', group: 'A' },
    { id: 2, name: 'Bob', group: 'B' },
    { id: 3, name: 'Charlie', group: 'A' }
  ];
  const result = filterMembers(members, { search: 'a' });
  assert.strictEqual(result.length, 2);
  assert.strictEqual(result[0].name, 'Alice');
});

test('filterMembers - search with length >= 2 searches multiple fields', () => {
  const members = [
    { id: 1, name: 'Alice', mobile: '12345' },
    { id: 2, name: 'Bob', address: '123 Main St' },
    { id: 3, name: 'Charlie', study: 'BSc' },
    { id: 4, name: 'David', occupation: 'Engineer' }
  ];
  const result1 = filterMembers(members, { search: '123' });
  assert.strictEqual(result1.length, 2);
  
  const result2 = filterMembers(members, { search: 'bsc' });
  assert.strictEqual(result2.length, 1);
  assert.strictEqual(result2[0].name, 'Charlie');
});

test('filterMembers - group filter', () => {
  const members = [
    { id: 1, name: 'Alice', group: 'A' },
    { id: 2, name: 'Bob', group: '' },
    { id: 3, name: 'Charlie' } // unassigned
  ];
  const all = filterMembers(members, { group: 'All' });
  assert.strictEqual(all.length, 3);
  
  const unassigned = filterMembers(members, { group: 'Unassigned' });
  assert.strictEqual(unassigned.length, 2);
  
  const aGroup = filterMembers(members, { group: 'A' });
  assert.strictEqual(aGroup.length, 1);
});

test('filterMembers - sortOrder', () => {
  const members = [
    { id: 1, name: 'Charlie' },
    { id: 2, name: 'Alice' },
    { id: 3, name: 'Bob' }
  ];
  const asc = filterMembers(members, { sortOrder: 'Name A-Z' });
  assert.strictEqual(asc[0].name, 'Alice');
  
  const desc = filterMembers(members, { sortOrder: 'Name Z-A' });
  assert.strictEqual(desc[0].name, 'Charlie');
});
