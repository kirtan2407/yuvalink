import { useMembers } from '../context/MembersContext';

export default function Trash() {
  const { state, restoreMember, deletePermanent } = useMembers();
  const { trashMembers } = state;

  const handleRestore = (id) => {
    restoreMember(id);
  };

  const handleDeletePermanent = (id) => {
    if (window.confirm('Are you sure you want to permanently delete this member? This cannot be undone.')) {
      deletePermanent(id);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString() + ' ' + new Date(dateString).toLocaleTimeString();
  };

  return (
    <div>
      <h1 style={{ marginBottom: '1rem' }}>Trash</h1>

      {trashMembers.length === 0 ? (
        <div style={{ padding: '2rem', textAlign: 'center', backgroundColor: '#fff', borderRadius: '0.5rem' }}>
          Trash is empty.
        </div>
      ) : (
        <div className="table-responsive" style={{ overflowX: 'auto', backgroundColor: '#fff', borderRadius: '0.5rem', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
          <style>{`
            .trash-table { width: 100%; border-collapse: collapse; }
            .trash-table th, .trash-table td { padding: 0.75rem 1rem; text-align: left; border-bottom: 1px solid #e5e7eb; }
            .trash-table th { background-color: #f9fafb; font-weight: 600; color: #374151; }
            @media (max-width: 768px) {
              .trash-table thead { display: none; }
              .trash-table tr { display: block; padding: 1rem; border-bottom: 1px solid #e5e7eb; }
              .trash-table td { display: block; padding: 0.25rem 0; border: none; }
              .trash-table td::before { content: attr(data-label) ": "; font-weight: 600; }
              .trash-table td:last-child { margin-top: 0.5rem; }
            }
          `}</style>
          <table className="trash-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Mobile</th>
                <th>Deleted At</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {trashMembers.map(m => {
                const rowId = m._id || m.id;
                return (
                <tr key={rowId}>
                  <td data-label="Name">{m.name}</td>
                  <td data-label="Mobile">{m.mobile}</td>
                  <td data-label="Deleted At">{formatDate(m.deletedAt)}</td>
                  <td data-label="Actions" style={{ display: 'flex', gap: '0.5rem' }}>
                    <button onClick={() => handleRestore(rowId)} style={btnSmall}>Restore</button>
                    <button onClick={() => handleDeletePermanent(rowId)} style={{ ...btnSmall, color: '#dc2626' }}>Delete Permanently</button>
                  </td>
                </tr>
              )})}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

const btnSmall = {
  padding: '0.25rem 0.5rem',
  backgroundColor: '#f3f4f6',
  border: '1px solid #d1d5db',
  borderRadius: '0.25rem',
  cursor: 'pointer',
  fontSize: '0.875rem'
};
