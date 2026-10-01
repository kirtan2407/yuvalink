const fs = require('fs');

let report = fs.readFileSync('frontend/src/pages/Report.jsx', 'utf8');
report = report.replace(/\/\/ Mock API call to GET \/api\/attendance\/report[\s\S]*?setReportData\(mockData\);/m, `
      let url = '/api/attendance/report?from=' + fromDate + '&to=' + toDate;
      if (groupFilter !== 'All') {
        let g = groupFilter === 'Unassigned' ? '' : groupFilter;
        url += '&group=' + g;
      }
      const data = await apiCall(url);
      setReportData(data);
`);
if (!report.includes("import apiCall")) {
  report = "import apiCall from '../services/api';\n" + report;
}
fs.writeFileSync('frontend/src/pages/Report.jsx', report);

let att = fs.readFileSync('frontend/src/pages/Attendance.jsx', 'utf8');
// Wire fetch attendance
att = att.replace(/const \[attendanceRecords, setAttendanceRecords\] = useState\(\{\}\);\s*useEffect\(\(\) => \{\s*\/\/ In a real app[\s\S]*?\}, \[date\]\);/, `
  const [attendanceRecords, setAttendanceRecords] = useState({});
  useEffect(() => {
    async function load() {
      try {
        const records = await apiCall('/api/attendance?date=' + date);
        const map = {};
        records.forEach(r => map[r.memberId] = r.status === 'P' ? 'Present' : 'Absent');
        setAttendanceRecords(map);
      } catch (err) {
        console.error('Failed to fetch attendance', err);
      }
    }
    load();
  }, [date]);
`);
// Wire markAttendance
att = att.replace(/const markAttendance = async \(memberId, status\) => \{[\s\S]*?catch \(e\) \{/, `
  const markAttendance = async (memberId, status) => {
    const backendStatus = status === 'Present' ? 'P' : 'A';
    setAttendanceRecords(prev => ({ ...prev, [memberId]: status }));
    try {
      if (status) {
        await apiCall('/api/attendance', { method: 'PUT', body: JSON.stringify({ date, memberId, status: backendStatus }) });
      } else {
        // if null (unmarked), ideally we DELETE it, but backend doesn't have delete specific. We'll just leave it or backend doesn't support unmarking.
      }
    } catch (e) {
`);
// Wire markBulkAttendance
att = att.replace(/const markBulkAttendance = async \(status\) => \{[\s\S]*?catch \(e\) \{/, `
  const markBulkAttendance = async (status) => {
    const backendStatus = status === 'Present' ? 'P' : 'A';
    const updates = {};
    const memberIds = [];
    filteredMembers.forEach(m => {
      updates[m._id || m.id] = status;
      memberIds.push(m._id || m.id);
    });
    setAttendanceRecords(prev => ({ ...prev, ...updates }));
    
    try {
      await apiCall('/api/attendance/bulk', { method: 'PUT', body: JSON.stringify({ date, memberIds, status: backendStatus }) });
    } catch (e) {
`);
if (!att.includes("import apiCall")) {
  att = "import apiCall from '../services/api';\n" + att;
}
fs.writeFileSync('frontend/src/pages/Attendance.jsx', att);
