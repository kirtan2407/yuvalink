const fs = require('fs');
let c = fs.readFileSync('frontend/src/pages/Settings.jsx', 'utf8');
c = c.replace(/const res = await apiCall\((.*?)\);\s*if \(!res\.ok\) throw new Error\(.*?\);\s*const data = await res\.json\(\);/g, 'const data = await apiCall($1);');
c = c.replace(/const res = await apiCall\((.*?)\);\s*if \(!res\.ok\) throw new Error\(.*?\);/g, 'await apiCall($1);');
fs.writeFileSync('frontend/src/pages/Settings.jsx', c);
