import assert from 'assert';

function getExportFilename(groupFilter, dateStr) {
  const grp = groupFilter === 'All' ? 'All' : groupFilter;
  return `YuvaLink_Members_Group-${grp}_${dateStr}`;
}

function filterExportData(members, groupFilter) {
  if (groupFilter === 'All') return members;
  if (groupFilter === 'Unassigned') return members.filter(m => !m.group || m.group === 'Unassigned');
  return members.filter(m => m.group === groupFilter);
}

try {
  // Test export filename
  const d = '2023-10-01';
  assert.strictEqual(getExportFilename('All', d), 'YuvaLink_Members_Group-All_2023-10-01');
  assert.strictEqual(getExportFilename('A', d), 'YuvaLink_Members_Group-A_2023-10-01');
  assert.strictEqual(getExportFilename('Unassigned', d), 'YuvaLink_Members_Group-Unassigned_2023-10-01');

  // Test row selection logic
  const members = [
    { name: 'John', group: 'A' },
    { name: 'Jane', group: 'B' },
    { name: 'Doe' }, // Unassigned
    { name: 'Smith', group: 'Unassigned' }
  ];

  assert.strictEqual(filterExportData(members, 'All').length, 4);
  assert.strictEqual(filterExportData(members, 'A').length, 1);
  assert.strictEqual(filterExportData(members, 'Unassigned').length, 2);

  console.log('All export.test.js tests passed!');
} catch (err) {
  console.error('Test failed:', err);
  // eslint-disable-next-line no-undef
  process.exit(1);
}
