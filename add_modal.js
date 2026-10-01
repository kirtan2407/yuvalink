const fs = require('fs');

let membersCode = fs.readFileSync('frontend/src/pages/Members.jsx', 'utf8');

// Add state
membersCode = membersCode.replace(
  /const \[search, setSearch\] = useState\(''\);/,
  "const [search, setSearch] = useState('');\n  const [memberToDelete, setMemberToDelete] = useState(null);"
);

// Update handler
membersCode = membersCode.replace(
  /const handleDeleteClick = \(id\) => \{\s*if \(window\.confirm\('Are you sure you want to delete this member\?'\)\) \{\s*deleteMember\(id\);\s*\}\s*\};/g,
  `const handleDeleteClick = (id) => {
    setMemberToDelete(id);
  };
  const confirmDelete = () => {
    if (memberToDelete) {
      deleteMember(memberToDelete);
      setMemberToDelete(null);
    }
  };`
);

// Add modal JSX just before closing </div>
const modalJSX = `
      {memberToDelete && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, padding: '1rem' }}>
          <div style={{ backgroundColor: 'white', padding: '1.5rem', borderRadius: '0.5rem', maxWidth: '400px', width: '100%', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}>
            <h3 style={{ marginTop: 0, color: '#111827', fontSize: '1.25rem' }}>Delete Member</h3>
            <p style={{ color: '#4b5563', margin: '1rem 0' }}>Are you sure you want to delete this member? They will be moved to the Trash.</p>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem' }}>
              <button onClick={() => setMemberToDelete(null)} style={{ padding: '0.5rem 1rem', backgroundColor: '#fff', border: '1px solid #d1d5db', borderRadius: '0.375rem', color: '#374151', cursor: 'pointer' }}>
                Cancel
              </button>
              <button onClick={confirmDelete} style={{ padding: '0.5rem 1rem', backgroundColor: '#dc2626', color: 'white', border: 'none', borderRadius: '0.375rem', cursor: 'pointer' }}>
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
`;

membersCode = membersCode.replace(/ {4}<\/div>\s*\);\s*\}/, modalJSX);

fs.writeFileSync('frontend/src/pages/Members.jsx', membersCode);
