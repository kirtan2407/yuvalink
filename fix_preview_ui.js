const fs = require('fs');
let code = fs.readFileSync('frontend/src/components/ImportMembers.jsx', 'utf8');

code = code.replace(/\{preview\.validCount \|\| 0\}/g, '{preview.validRows?.length || 0}');
code = code.replace(/\{preview\.errorCount \|\| 0\}/g, '{preview.errors?.length || 0}');
code = code.replace(/\{e\.message\}/g, '{e.reason}');

fs.writeFileSync('frontend/src/components/ImportMembers.jsx', code);
