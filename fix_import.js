const fs = require('fs');

let api = fs.readFileSync('frontend/src/services/api.js', 'utf8');
api = api.replace(/const headers = \{\s*'Content-Type': 'application\/json',\s*\.\.\.options\.headers,\s*\};/, `
  const headers = {
    ...options.headers,
  };
  if (!(options.body instanceof FormData)) {
    headers['Content-Type'] = headers['Content-Type'] || 'application/json';
  }
`);
fs.writeFileSync('frontend/src/services/api.js', api);

let imp = fs.readFileSync('frontend/src/components/ImportMembers.jsx', 'utf8');
imp = imp.replace(/await fetch\('\/api\/import\/preview'/g, "await apiCall('/api/import/preview'");
imp = imp.replace(/await fetch\('\/api\/import\/commit'/g, "await apiCall('/api/import/commit'");
// Remove manual headers and error throwing since apiCall does it
imp = imp.replace(/const res = await apiCall\('\/api\/import\/preview', \{\s*method: 'POST',\s*body: formData\s*\}\);\s*if \(!res\.ok\) throw new Error\('Preview failed'\);\s*const data = await res\.json\(\);/, `
const data = await apiCall('/api/import/preview', { method: 'POST', body: formData });
`);
imp = imp.replace(/const res = await apiCall\('\/api\/import\/commit', \{\s*method: 'POST',\s*headers: \{ 'Content-Type': 'application\/json' \},\s*body: JSON\.stringify\(\{([\s\S]*?)\}\)\s*\}\);\s*if \(!res\.ok\) throw new Error\('Commit failed'\);\s*const data = await res\.json\(\);/, `
const data = await apiCall('/api/import/commit', {
  method: 'POST',
  body: JSON.stringify({$1})
});
`);
if (!imp.includes("import apiCall")) {
  imp = "import apiCall from '../services/api';\n" + imp;
}
fs.writeFileSync('frontend/src/components/ImportMembers.jsx', imp);
