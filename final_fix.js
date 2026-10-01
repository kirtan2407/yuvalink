const fs = require('fs');
let code = fs.readFileSync('frontend/src/components/ImportMembers.jsx', 'utf8');

const newStr = `const selectedDupeIndices = Object.keys(selectedDuplicates)
        .filter(k => selectedDuplicates[k])
        .map(Number);
      
      const commitRows = [
        ...preview.validRows,
        ...selectedDupeIndices.map(idx => preview.duplicates[idx])
      ];

      const res = await apiCall('/api/import/commit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rows: commitRows })
      });
      
      if (!res.ok) throw new Error('Commit failed');`;

if (code.includes('importToken: preview.token')) {
    code = code.replace(/const selectedDupeIndices = Object\.keys\(selectedDuplicates\)[\s\S]*?if \(\!res\.ok\) throw new Error\('Commit failed'\);/, newStr);
}

fs.writeFileSync('frontend/src/components/ImportMembers.jsx', code);
