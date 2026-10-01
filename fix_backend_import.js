const fs = require('fs');
let code = fs.readFileSync('backend/routes/import.js', 'utf8');
code = code.replace(/const existing = await Member\.findOne\(\{[\s\S]*?if \(existing\) \{\s*skipped\+\+;\s*continue;\s*\}/, '// Frontend handles duplicates filtering.');
fs.writeFileSync('backend/routes/import.js', code);
