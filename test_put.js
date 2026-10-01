const http = require('http');
const req = http.request('http://localhost:5000/api/attendance', {
  method: 'PUT',
  headers: { 'Content-Type': 'application/json' }
}, (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => console.log('STATUS:', res.statusCode, 'BODY:', data));
});
req.write(JSON.stringify({ date: '2026-10-01', memberId: '64d2b2f0e4b0a1a2b3c4d5e6', status: 'P' }));
req.end();
