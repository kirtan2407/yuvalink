const fs = require('fs');
let code = fs.readFileSync('frontend/src/components/ImportMembers.jsx', 'utf8');

const regex = /const selectedDupeIndices = Object\.keys\(selectedDuplicates\)[\s\S]*?method: 'POST',\s*body: JSON\.stringify\(\{[\s\S]*?\}\)\s*\}\);/m;

const replacement = `const selectedDupeIndices = Object.keys(selectedDuplicates)
          .filter(k => selectedDuplicates[k])
          .map(Number);
          
        const commitRows = [
          ...preview.validRows,
          ...selectedDupeIndices.map(idx => preview.duplicates[idx])
        ];
        
        const data = await apiCall('/api/import/commit', {
          method: 'POST',
          body: JSON.stringify({ rows: commitRows })
        });`;

code = code.replace(regex, replacement);
fs.writeFileSync('frontend/src/components/ImportMembers.jsx', code);
