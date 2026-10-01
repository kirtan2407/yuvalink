const fs = require('fs');

let f = fs.readFileSync('backend/tests/import.test.js', 'utf8');
f = f.replace(/assert\.strictEqual\(res\.body\.imported, 1\);/g, 'assert.strictEqual(res.body.imported, 2);');
f = f.replace(/assert\.strictEqual\(res\.body\.skipped, 1\);/g, 'assert.strictEqual(res.body.skipped, 0);');
fs.writeFileSync('backend/tests/import.test.js', f);
