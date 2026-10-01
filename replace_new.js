const fs = require('fs');

let f1 = fs.readFileSync('backend/routes/attendance.js', 'utf8');
f1 = f1.replace(/new:\s*true/g, "returnDocument: 'after'");
fs.writeFileSync('backend/routes/attendance.js', f1);

let f2 = fs.readFileSync('backend/routes/societies.js', 'utf8');
f2 = f2.replace(/new:\s*true/g, "returnDocument: 'after'");
fs.writeFileSync('backend/routes/societies.js', f2);
