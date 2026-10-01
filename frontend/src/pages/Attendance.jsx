import apiCall from '../services/api';
import { useState, useMemo, useEffect } from 'react';
import { useMembers } from '../context/MembersContext';
import { filterMembers } from '../utils/memberUtils';

export default function Attendance() {
  const { state } = useMembers();
  const { members } = state;
  
  // Convert current date to Asia/Kolkata YYYY-MM-DD
  const getKolkataDate = () => {
    const d = new Date().toLocaleString('en-US', { timeZone: 'Asia/Kolkata' });
    const dateObj = new Date(d);
    const yyyy = dateObj.getFullYear();
    const mm = String(dateObj.getMonth() + 1).padStart(2, '0');
    const dd = String(dateObj.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  };

  const [date, setDate] = useState(getKolkataDate());
  const [groupFilter, setGroupFilter] = useState('All');
  const [search, setSearch] = useState('');
  
  // Mock state for optimistic UI, normally we'd fetch this from the backend based on date
  
  const [attendanceRecords, setAttendanceRecords] = useState({});
  useEffect(() => {
    async function load() {
      try {
        const records = await apiCall('/api/attendance?date=' + date);
        const map = {};
        records.forEach(r => map[r.memberId] = r.status === 'P' ? 'Present' : 'Absent');
        setAttendanceRecords(map);
      } catch (err) {
        console.error('Failed to fetch attendance', err);
      }
    }
    load();
  }, [date]);


  const activeMembers = useMemo(() => members.filter(m => !m.deleted), [members]);
  
  const filteredMembers = useMemo(() => {
    return filterMembers(activeMembers, { group: groupFilter, search, sortOrder: 'Name A-Z' });
  }, [activeMembers, groupFilter, search]);

  const handleSearchChange = (e) => setSearch(e.target.value);
  const clearSearch = () => setSearch('');
  const clearGroup = () => setGroupFilter('All');
  const groups = ['All', 'Unassigned', ...Array.from({length: 26}, (_, i) => String.fromCharCode(65 + i))];

  const presentCount = filteredMembers.filter(m => attendanceRecords[m._id || m.id] === 'Present').length;
  const absentCount = filteredMembers.filter(m => attendanceRecords[m._id || m.id] === 'Absent').length;
  const unmarkedCount = filteredMembers.length - presentCount - absentCount;

  
  const markAttendance = async (memberId, status) => {
    const backendStatus = status === 'Present' ? 'P' : 'A';
    setAttendanceRecords(prev => ({ ...prev, [memberId]: status }));
    try {
      if (status) {
        await apiCall('/api/attendance', { method: 'PUT', body: JSON.stringify({ date, memberId, status: backendStatus }) });
      } else {
        // if null (unmarked), ideally we DELETE it, but backend doesn't have delete specific. We'll just leave it or backend doesn't support unmarking.
      }
    } catch (e) {

      console.error(e);
      // Rollback on failure (simplified)
    }
  };

  
  const markBulkAttendance = async (status) => {
    const backendStatus = status === 'Present' ? 'P' : 'A';
    const updates = {};
    const memberIds = [];
    filteredMembers.forEach(m => {
      updates[m._id || m.id] = status;
      memberIds.push(m._id || m.id);
    });
    setAttendanceRecords(prev => ({ ...prev, ...updates }));
    
    try {
      await apiCall('/api/attendance/bulk', { method: 'PUT', body: JSON.stringify({ date, memberIds, status: backendStatus }) });
    } catch (e) {

      console.error(e);
    }
  };

  
  const markUnmarkedAsAbsent = async () => {
    const unmarkedMembers = filteredMembers.filter(m => !attendanceRecords[m._id || m.id]);
    if (unmarkedMembers.length === 0) return;
    
    const updates = {};
    const memberIds = [];
    unmarkedMembers.forEach(m => {
      updates[m._id || m.id] = 'Absent';
      memberIds.push(m._id || m.id);
    });
    setAttendanceRecords(prev => ({ ...prev, ...updates }));
    
    try {
      await apiCall('/api/attendance/bulk', { method: 'PUT', body: JSON.stringify({ date, memberIds, status: 'A' }) });
    } catch (e) {
      console.error(e);
    }
  };

  const lists = {
    Present: filteredMembers.filter(m => attendanceRecords[m._id || m.id] === 'Present'),
    Absent: filteredMembers.filter(m => attendanceRecords[m._id || m.id] === 'Absent'),
    Unmarked: filteredMembers.filter(m => !attendanceRecords[m._id || m.id])
  };

  const renderMemberCard = (m) => {
    const status = attendanceRecords[m._id || m.id];
    return (
      <div key={m._id || m.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.75rem', border: '1px solid #e5e7eb', borderRadius: '0.5rem', marginBottom: '0.5rem', backgroundColor: '#fff' }}>
        <div>
          <div style={{ fontWeight: 600 }}>{m.name}</div>
          <div style={{ fontSize: '0.875rem', color: '#6b7280' }}>
            {m.group === 'Unassigned' || !m.group ? 'Unassigned' : `Group ${m.group}`} | {m.mobile}
          </div>
        </div>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button 
            onClick={() => markAttendance(m._id || m.id, status === 'Present' ? null : 'Present')}
            style={{ ...btnSmall, backgroundColor: status === 'Present' ? '#10b981' : '#f3f4f6', color: status === 'Present' ? '#fff' : '#374151', border: status === 'Present' ? 'none' : '1px solid #d1d5db' }}
          >
            Present
          </button>
          <button 
            onClick={() => markAttendance(m._id || m.id, status === 'Absent' ? null : 'Absent')}
            style={{ ...btnSmall, backgroundColor: status === 'Absent' ? '#ef4444' : '#f3f4f6', color: status === 'Absent' ? '#fff' : '#374151', border: status === 'Absent' ? 'none' : '1px solid #d1d5db' }}
          >
            Absent
          </button>
        </div>
      </div>
    );
  };

  return (
    <div>
      <h1 style={{ marginBottom: '1rem' }}>Attendance</h1>
      
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', marginBottom: '1rem', alignItems: 'center' }}>
        <div>
          <label style={{ display: 'block', fontSize: '0.875rem', marginBottom: '0.25rem', color: '#374151' }}>Date</label>
          <input 
            type="date" 
            value={date} 
            onChange={(e) => setDate(e.target.value)}
            style={inputStyle}
          />
        </div>
        
        <div style={{ flex: 1, minWidth: '250px', position: 'relative' }}>
          <label style={{ display: 'block', fontSize: '0.875rem', marginBottom: '0.25rem', color: '#374151' }}>Search</label>
          <input 
            type="text" 
            placeholder="Type a single letter for Group or search name..." 
            value={search} 
            onChange={handleSearchChange}
            style={{...inputStyle, width: '100%', boxSizing: 'border-box'}}
          />
          {search && (
            <button onClick={clearSearch} style={{ position: 'absolute', right: '10px', top: '32px', background: 'transparent', border: 'none', cursor: 'pointer' }}>✕</button>
          )}
        </div>
        
        <div>
          <label style={{ display: 'block', fontSize: '0.875rem', marginBottom: '0.25rem', color: '#374151' }}>Group</label>
          <select value={groupFilter} onChange={e => setGroupFilter(e.target.value)} style={inputStyle}>
            {groups.map(g => <option key={g} value={g}>{g === 'All' ? 'All Groups' : g === 'Unassigned' ? 'Unassigned' : `Group ${g}`}</option>)}
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

      <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
        <div style={counterBox}>
          <div style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>{filteredMembers.length}</div>
          <div style={{ fontSize: '0.875rem', color: '#6b7280' }}>Total Active</div>
        </div>
        <div style={{ ...counterBox, borderBottom: '4px solid #10b981' }}>
          <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#10b981' }}>{presentCount}</div>
          <div style={{ fontSize: '0.875rem', color: '#6b7280' }}>Present</div>
        </div>
        <div style={{ ...counterBox, borderBottom: '4px solid #ef4444' }}>
          <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#ef4444' }}>{absentCount}</div>
          <div style={{ fontSize: '0.875rem', color: '#6b7280' }}>Absent</div>
        </div>
        <div style={{ ...counterBox, borderBottom: '4px solid #9ca3af' }}>
          <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#6b7280' }}>{unmarkedCount}</div>
          <div style={{ fontSize: '0.875rem', color: '#6b7280' }}>Unmarked</div>
        </div>
      </div>
      
      <div style={{ marginBottom: '1rem', display: 'flex', gap: '1rem' }}>
        <button onClick={() => markBulkAttendance('Present')} style={{ ...btnPrimary, backgroundColor: '#10b981' }}>Mark All Present</button>
        <button onClick={() => markBulkAttendance('Absent')} style={{ ...btnPrimary, backgroundColor: '#ef4444' }}>Mark All Absent</button>
        <button onClick={markUnmarkedAsAbsent} style={{ ...btnPrimary, backgroundColor: '#f59e0b' }}>Mark Unmarked as Absent</button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>
        <div>
          <h3 style={{ borderBottom: '2px solid #9ca3af', paddingBottom: '0.5rem', marginBottom: '1rem' }}>Unmarked ({lists.Unmarked.length})</h3>
          {lists.Unmarked.length === 0 ? <div style={{ color: '#6b7280' }}>All marked!</div> : lists.Unmarked.map(renderMemberCard)}
        </div>
        
        <div>
          <h3 style={{ borderBottom: '2px solid #10b981', paddingBottom: '0.5rem', marginBottom: '1rem' }}>Present ({lists.Present.length})</h3>
          {lists.Present.length === 0 ? <div style={{ color: '#6b7280' }}>None present</div> : lists.Present.map(renderMemberCard)}
        </div>
        
        <div>
          <h3 style={{ borderBottom: '2px solid #ef4444', paddingBottom: '0.5rem', marginBottom: '1rem' }}>Absent ({lists.Absent.length})</h3>
          {lists.Absent.length === 0 ? <div style={{ color: '#6b7280' }}>None absent</div> : lists.Absent.map(renderMemberCard)}
        </div>
      </div>
    </div>
  );
}

const btnPrimary = {
  padding: '0.5rem 1rem',
  color: 'white',
  border: 'none',
  borderRadius: '0.375rem',
  cursor: 'pointer',
  fontWeight: 500
};

const btnSmall = {
  padding: '0.375rem 0.75rem',
  borderRadius: '0.375rem',
  cursor: 'pointer',
  fontSize: '0.875rem',
  fontWeight: 500
};

const inputStyle = {
  padding: '0.5rem',
  border: '1px solid #d1d5db',
  borderRadius: '0.375rem',
  fontSize: '1rem',
  height: '42px',
  boxSizing: 'border-box'
};

const counterBox = {
  padding: '1rem',
  backgroundColor: '#fff',
  border: '1px solid #e5e7eb',
  borderRadius: '0.5rem',
  minWidth: '120px',
  textAlign: 'center',
  boxShadow: '0 1px 2px rgba(0,0,0,0.05)'
};
