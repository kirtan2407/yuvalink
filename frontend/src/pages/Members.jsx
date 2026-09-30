import { useState, useMemo } from 'react';
import { useMembers } from '../context/MembersContext';
import MemberFormModal from '../components/MemberFormModal';

export default function Members() {
  const { state, deleteMember, restoreMember } = useMembers();
  const { members, trashMembers } = state;
  
  const [activeTab, setActiveTab] = useState('all'); // 'all', 'satsang'
  const [showDeletedSatsang, setShowDeletedSatsang] = useState(false);
  const [sortOrder, setSortOrder] = useState('name_asc'); // name_asc, name_desc, newest, oldest
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingMember, setEditingMember] = useState(null);

  const handleAddClick = () => {
    setEditingMember(null);
    setIsModalOpen(true);
  };

  const handleEditClick = (member) => {
    setEditingMember(member);
    setIsModalOpen(true);
  };

  const handleDeleteClick = (id) => {
    if (window.confirm('Are you sure you want to delete this member?')) {
      deleteMember(id);
    }
  };
  
  const handleRestoreClick = (id) => {
    restoreMember(id);
  };

  const filteredMembers = useMemo(() => {
    let list;
    if (activeTab === 'all') {
      list = [...members];
    } else {
      const activeSatsang = members.filter(m => m.addedInSatsangApp);
      if (showDeletedSatsang) {
        const deletedSatsang = trashMembers.filter(m => m.addedInSatsangApp);
        list = [...activeSatsang, ...deletedSatsang];
      } else {
        list = activeSatsang;
      }
    }

    list.sort((a, b) => {
      if (sortOrder === 'name_asc') return (a.name || '').localeCompare(b.name || '');
      if (sortOrder === 'name_desc') return (b.name || '').localeCompare(a.name || '');
      if (sortOrder === 'newest') return new Date(b.updatedAt || 0) - new Date(a.updatedAt || 0);
      if (sortOrder === 'oldest') return new Date(a.updatedAt || 0) - new Date(b.updatedAt || 0);
      return 0;
    });

    return list;
  }, [members, trashMembers, activeTab, showDeletedSatsang, sortOrder]);

  const calculateAge = (dob) => {
    if (!dob) return '';
    const diff = Date.now() - new Date(dob).getTime();
    return Math.abs(new Date(diff).getUTCFullYear() - 1970);
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '1rem' }}>
        <h1 style={{ margin: 0 }}>Members</h1>
        <button onClick={handleAddClick} style={btnPrimary}>Add Member</button>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          Total Members: {filteredMembers.length} of {activeTab === 'all' ? members.length : members.filter(m => m.addedInSatsangApp).length}
        </div>
        <div>
          <select value={sortOrder} onChange={e => setSortOrder(e.target.value)} style={inputStyle}>
            <option value="name_asc">Name A-Z</option>
            <option value="name_desc">Name Z-A</option>
            <option value="newest">Newest First</option>
            <option value="oldest">Oldest First</option>
          </select>
        </div>
      </div>

      <div style={{ display: 'flex', gap: '1rem', borderBottom: '1px solid #d1d5db', marginBottom: '1rem' }}>
        <button 
          style={activeTab === 'all' ? activeTabStyle : tabStyle} 
          onClick={() => setActiveTab('all')}
        >
          All Members
        </button>
        <button 
          style={activeTab === 'satsang' ? activeTabStyle : tabStyle} 
          onClick={() => setActiveTab('satsang')}
        >
          Satsang Members
        </button>
      </div>

      {activeTab === 'satsang' && (
        <div style={{ marginBottom: '1rem' }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
            <input 
              type="checkbox" 
              checked={showDeletedSatsang} 
              onChange={e => setShowDeletedSatsang(e.target.checked)} 
            />
            Show Deleted Satsang Members
          </label>
        </div>
      )}

      {filteredMembers.length === 0 ? (
        <div style={{ padding: '2rem', textAlign: 'center', backgroundColor: '#fff', borderRadius: '0.5rem' }}>
          No members added yet.
        </div>
      ) : (
        <div className="table-responsive" style={{ overflowX: 'auto', backgroundColor: '#fff', borderRadius: '0.5rem', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
          <style>{`
            .members-table { width: 100%; border-collapse: collapse; }
            .members-table th, .members-table td { padding: 0.75rem 1rem; text-align: left; border-bottom: 1px solid #e5e7eb; }
            .members-table th { background-color: #f9fafb; font-weight: 600; color: #374151; }
            @media (max-width: 768px) {
              .members-table thead { display: none; }
              .members-table tr { display: block; padding: 1rem; border-bottom: 1px solid #e5e7eb; }
              .members-table td { display: block; padding: 0.25rem 0; border: none; }
              .members-table td::before { content: attr(data-label) ": "; font-weight: 600; }
              .members-table td:last-child { margin-top: 0.5rem; }
            }
          `}</style>
          <table className="members-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Group</th>
                <th>Mobile</th>
                <th>Address</th>
                <th>Study</th>
                <th>Occupation</th>
                <th>Age</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredMembers.map(m => {
                const rowId = m._id || m.id;
                return (
                <tr key={rowId} style={{ opacity: m.deleted ? 0.6 : 1 }}>
                  <td data-label="Name">{m.name} {m.deleted && '(Deleted)'}</td>
                  <td data-label="Group">
                    <span style={{ 
                      padding: '0.25rem 0.5rem', 
                      borderRadius: '999px', 
                      backgroundColor: m.group === 'Unassigned' ? '#f3f4f6' : '#e0e7ff',
                      color: m.group === 'Unassigned' ? '#6b7280' : '#4338ca',
                      fontSize: '0.875rem'
                    }}>
                      {m.group === 'Unassigned' ? '—' : m.group}
                    </span>
                  </td>
                  <td data-label="Mobile">{m.mobile}</td>
                  <td data-label="Address">{m.address || '-'}</td>
                  <td data-label="Study">{m.currentStudy || '-'}</td>
                  <td data-label="Occupation">{m.occupation || '-'}</td>
                  <td data-label="Age">{m.birthDate ? calculateAge(m.birthDate) : '-'}</td>
                  <td data-label="Actions" style={{ display: 'flex', gap: '0.5rem' }}>
                    {m.deleted ? (
                      <button onClick={() => handleRestoreClick(rowId)} style={btnSmall}>Restore</button>
                    ) : (
                      <>
                        <button onClick={() => handleEditClick(m)} style={btnSmall}>Edit</button>
                        <button onClick={() => handleDeleteClick(rowId)} style={{ ...btnSmall, color: '#dc2626' }}>Delete</button>
                      </>
                    )}
                  </td>
                </tr>
              )})}
            </tbody>
          </table>
        </div>
      )}

      <MemberFormModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        initialData={editingMember} 
      />
    </div>
  );
}

const btnPrimary = {
  padding: '0.5rem 1rem',
  backgroundColor: '#3b82f6',
  color: 'white',
  border: 'none',
  borderRadius: '0.375rem',
  cursor: 'pointer'
};

const btnSmall = {
  padding: '0.25rem 0.5rem',
  backgroundColor: '#f3f4f6',
  border: '1px solid #d1d5db',
  borderRadius: '0.25rem',
  cursor: 'pointer',
  fontSize: '0.875rem'
};

const inputStyle = {
  padding: '0.5rem',
  border: '1px solid #d1d5db',
  borderRadius: '0.375rem',
  fontSize: '1rem'
};

const tabStyle = {
  padding: '0.75rem 1.5rem',
  background: 'none',
  border: 'none',
  cursor: 'pointer',
  fontSize: '1rem',
  color: '#6b7280',
  borderBottom: '2px solid transparent'
};

const activeTabStyle = {
  ...tabStyle,
  color: '#3b82f6',
  borderBottom: '2px solid #3b82f6',
  fontWeight: '600'
};
