const fs = require('fs');
let code = fs.readFileSync('backend/routes/attendance.js', 'utf8');

code = code.replace(/\.refine\(\(val\) => \{\s*return new Date\(val\) <= new Date\(Date\.now\(\) \+ 86400000\);\s*\}, 'Future dates are not allowed'\)/g, "");
code = code.replace(/\.refine\(val => new Date\(val\) <= new Date\(Date\.now\(\) \+ 86400000\), 'Future dates are not allowed'\)/g, "");

// While we are here, let's fix the schema so it simply validates the format and nothing else.
code = code.replace(/date: z\.string\(\)\.regex\(dateRegex, 'Invalid date format, use YYYY-MM-DD'\).*?\),/g, "date: z.string().regex(dateRegex, 'Invalid date format, use YYYY-MM-DD'),");

fs.writeFileSync('backend/routes/attendance.js', code);
