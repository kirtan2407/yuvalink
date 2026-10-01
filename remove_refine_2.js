const fs = require('fs');
let code = fs.readFileSync('backend/routes/attendance.js', 'utf8');

code = code.replace(/date: z\.string\(\)\.regex\(dateRegex\)\.refine[\s\S]*?'Future dates are not allowed'\),/g, "date: z.string().regex(dateRegex),");
code = code.replace(/from: z\.string\(\)\.regex\(dateRegex\)\.refine[\s\S]*?'Future dates are not allowed'\),/g, "from: z.string().regex(dateRegex),");
code = code.replace(/to: z\.string\(\)\.regex\(dateRegex\)\.refine[\s\S]*?'Future dates are not allowed'\),/g, "to: z.string().regex(dateRegex),");

fs.writeFileSync('backend/routes/attendance.js', code);
