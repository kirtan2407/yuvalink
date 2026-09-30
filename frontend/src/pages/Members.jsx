import { useState, useMemo } from 'react';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { useMembers } from '../context/MembersContext';
import MemberFormModal from '../components/MemberFormModal';
import ImportMembers from '../components/ImportMembers';
import { filterMembers } from '../utils/memberUtils';

export default function Members() {
  const { state, deleteMember, restoreMember } = useMembers();
  const { members, trashMembers } = state;
  
  const [activeTab, setActiveTab] = useState('all'); // 'all', 'satsang'
  const [showDeletedSatsang, setShowDeletedSatsang] = useState(false);
  const [sortOrder, setSortOrder] = useState('Name A-Z'); 
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingMember, setEditingMember] = useState(null);

  const [groupFilter, setGroupFilter] = useState('All');
  const [search, setSearch] = useState('');

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

    return filterMembers(list, { group: groupFilter, search, sortOrder });
  }, [members, trashMembers, activeTab, showDeletedSatsang, sortOrder, groupFilter, search]);

  const calculateAge = (dob) => {
    if (!dob) return '';
    const diff = Date.now() - new Date(dob).getTime();
    return Math.abs(new Date(diff).getUTCFullYear() - 1970);
  };

  const exportFilename = () => {
    const d = new Date().toISOString().split('T')[0];
    const grp = groupFilter === 'All' ? 'All' : groupFilter;
    return `YuvaLink_Members_Group-${grp}_${d}`;
  };

  const handleExportExcel = () => {
    if (filteredMembers.length === 0) {
      alert("No data to export.");
      return;
    }
    const wsData = filteredMembers.map(m => ({
      Name: m.name,
      Group: m.group || 'Unassigned',
      Mobile: m.mobile,
      Address: m.address || '',
      Study: m.currentStudy || m.study || '',
      Occupation: m.occupation || '',
      Age: m.birthDate ? calculateAge(m.birthDate) : ''
    }));
    const ws = XLSX.utils.json_to_sheet(wsData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Members');
    XLSX.writeFile(wb, `${exportFilename()}.xlsx`);
  };

  const handleExportPDF = () => {
    if (filteredMembers.length === 0) {
      alert("No data to export.");
      return;
    }
    const doc = new jsPDF('landscape');
    
    doc.setFontSize(18);
    doc.text("YuvaLink Members", 14, 22);
    doc.setFontSize(11);
    doc.text(`Group: ${groupFilter === 'All' ? 'All' : groupFilter} | Total: ${filteredMembers.length} | Date: ${new Date().toISOString().split('T')[0]}`, 14, 30);
    
    const tableData = filteredMembers.map(m => [
      m.name,
      m.group || 'Unassigned',
      m.mobile,
      m.address || '',
      m.currentStudy || m.study || '',
      m.occupation || '',
      m.birthDate ? calculateAge(m.birthDate) : ''
    ]);
    
    doc.autoTable({
      startY: 36,
      head: [['Name', 'Group', 'Mobile', 'Address', 'Study', 'Occupation', 'Age']],
      body: tableData,
      styles: { font: 'helvetica' },
      headStyles: { fillColor: [59, 130, 246] }
    });
    
    doc.save(`${exportFilename()}.pdf`);
  };

  const handleSearchChange = (e) => {
    setSearch(e.target.value);
  };

  const clearSearch = () => setSearch('');
  
  const clearGroup = () => setGroupFilter('All');

  const groups = ['All', 'Unassigned', ...Array.from({length: 26}, (_, i) => String.fromCharCode(65 + i))];

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '1rem' }}>
        <h1 style={{ margin: 0 }}>Members</h1>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button onClick={handleExportExcel} style={btnSecondary} disabled={filteredMembers.length === 0}>Export Excel</button>
          <button onClick={handleExportPDF} style={btnSecondary} disabled={filteredMembers.length === 0}>Export PDF</button>
          <button onClick={handleAddClick} style={btnPrimary}>Add Member</button>
        </div>
      </div>

      <ImportMembers onImportComplete={() => window.location.reload()} />

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', marginBottom: '1rem', alignItems: 'center' }}>
        <div style={{ flex: 1, minWidth: '250px', position: 'relative' }}>
          <input 
            type="text" 
            placeholder="Type a single letter to filter by Group or search by name..." 
            value={search} 
            onChange={handleSearchChange}
            style={{...inputStyle, width: '100%', boxSizing: 'border-box'}}
          />
          {search && (
            <button onClick={clearSearch} style={{ position: 'absolute', right: '10px', top: '10px', background: 'transparent', border: 'none', cursor: 'pointer' }}>✕</button>
          )}
        </div>
        
        <div>
          <select value={groupFilter} onChange={e => setGroupFilter(e.target.value)} style={inputStyle}>
            {groups.map(g => <option key={g} value={g}>{g === 'All' ? 'All Groups' : g === 'Unassigned' ? 'Unassigned' : `Group ${g}`}</option>)}
          </select>
        </div>

        <div>
          <select value={sortOrder} onChange={e => setSortOrder(e.target.value)} style={inputStyle}>
            <option value="Name A-Z">Name A-Z</option>
            <option value="Name Z-A">Name Z-A</option>
            <option value="Newest">Newest First</option>
            <option value="Oldest">Oldest First</option>
          </select>
        </div>
      </div>
      
      {groupFilter !== 'All' && (
        <div style={{ marginBottom: '1rem' }}>
          <span style={{ padding: '0.25rem 0.5rem', backgroundColor: '#e0e7ff', color: '#4338ca', borderRadius: '999px', fontSize: '0.875rem', display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}>
            {groupFilter === 'Unassigned' ? 'Unassigned' : `Group ${groupFilter}`}
            <button onClick={clearGroup} style={{ background: 'transparent', border: 'none', cursor: 'pointer', padding: 0, color: '#4338ca', fontSize: '1rem' }}>✕</button>
          </span>
        </div>
      )}

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

      <div style={{ marginBottom: '1rem' }}>
        Total Members: {filteredMembers.length}
      </div>

      {filteredMembers.length === 0 ? (
        <div style={{ padding: '2rem', textAlign: 'center', backgroundColor: '#fff', borderRadius: '0.5rem' }}>
          {groupFilter !== 'All' ? `No members in Group ${groupFilter}` : 'No members found.'}
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
                      backgroundColor: m.group === 'Unassigned' || !m.group ? '#f3f4f6' : '#e0e7ff',
                      color: m.group === 'Unassigned' || !m.group ? '#6b7280' : '#4338ca',
                      fontSize: '0.875rem'
                    }}>
                      {!m.group || m.group === 'Unassigned' ? '—' : m.group}
                    </span>
                  </td>
                  <td data-label="Mobile">{m.mobile}</td>
                  <td data-label="Address">{m.address || '-'}</td>
                  <td data-label="Study">{m.currentStudy || m.study || '-'}</td>
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

const btnSecondary = {
  padding: '0.5rem 1rem',
  backgroundColor: '#f3f4f6',
  color: '#374151',
  border: '1px solid #d1d5db',
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
