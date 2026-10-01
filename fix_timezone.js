const fs = require('fs');
let code = fs.readFileSync('backend/routes/attendance.js', 'utf8');

code = code.replace(/new Date\(val\) <= new Date\(\)/g, "new Date(val) <= new Date(Date.now() + 86400000)");

fs.writeFileSync('backend/routes/attendance.js', code);
