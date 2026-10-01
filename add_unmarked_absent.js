const fs = require('fs');

let att = fs.readFileSync('frontend/src/pages/Attendance.jsx', 'utf8');

// Inject markUnmarkedAsAbsent function just after markBulkAttendance
const funcInjection = `
  const markUnmarkedAsAbsent = async () => {
    const unmarkedMembers = filteredMembers.filter(m => !attendanceRecords[m._id || m.id]);
    if (unmarkedMembers.length === 0) return;
    
    const updates = {};
    const memberIds = [];
    unmarkedMembers.forEach(m => {
      updates[m._id || m.id] = 'Absent';
      memberIds.push(m._id || m.id);
    });
    setAttendanceRecords(prev => ({ ...prev, ...updates }));
    
    try {
      await apiCall('/api/attendance/bulk', { method: 'PUT', body: JSON.stringify({ date, memberIds, status: 'A' }) });
    } catch (e) {
      console.error(e);
    }
  };
`;

att = att.replace(/(const lists = \{)/, funcInjection + '\n  $1');

// Inject the button
att = att.replace(
  /(<button onClick=\{\(\) => markBulkAttendance\('Absent'\)\} style=\{\{ \.\.\.btnPrimary, backgroundColor: '#ef4444' \}\}>Mark All Absent<\/button>)/,
  "$1\n        <button onClick={markUnmarkedAsAbsent} style={{ ...btnPrimary, backgroundColor: '#f59e0b' }}>Mark Unmarked as Absent</button>"
);

fs.writeFileSync('frontend/src/pages/Attendance.jsx', att);
