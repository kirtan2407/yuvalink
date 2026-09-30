import { useState, useMemo } from 'react';
import { useMembers } from '../context/MembersContext';

export default function Report() {
  const { state } = useMembers();
  const { members } = state;
  
  // Default to first day of current month and today
  const getKolkataDate = (firstDay = false) => {
    const d = new Date().toLocaleString('en-US', { timeZone: 'Asia/Kolkata' });
    const dateObj = new Date(d);
    const yyyy = dateObj.getFullYear();
    const mm = String(dateObj.getMonth() + 1).padStart(2, '0');
    const dd = firstDay ? '01' : String(dateObj.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  };

  const [fromDate, setFromDate] = useState(getKolkataDate(true));
  const [toDate, setToDate] = useState(getKolkataDate(false));
  const [groupFilter, setGroupFilter] = useState('All');
  
  const [reportData, setReportData] = useState([]);
  const [loading, setLoading] = useState(false);

  const groups = ['All', 'Unassigned', ...Array.from({length: 26}, (_, i) => String.fromCharCode(65 + i))];

  const fetchReport = async () => {
    setLoading(true);
    try {
      // Mock API call to GET /api/attendance/report
      // const res = await fetch(`/api/attendance/report?from=${fromDate}&to=${toDate}&group=${groupFilter}`);
      // const data = await res.json();
      console.log(`GET /api/attendance/report?from=${fromDate}&to=${toDate}&group=${groupFilter}`);
      
      // Simulate data based on members
      const activeMembers = members.filter(m => !m.deleted);
      let filtered = [...activeMembers];
      
      if (groupFilter !== 'All') {
        if (groupFilter === 'Unassigned') {
          filtered = filtered.filter(m => !m.group || m.group === 'Unassigned');
        } else {
          filtered = filtered.filter(m => m.group === groupFilter);
        }
      }

      const mockData = filtered.map(m => {
        const total = Math.floor(Math.random() * 10) + 5;
        const present = Math.floor(Math.random() * total);
        const absent = total - present;
        const percentage = Math.round((present / total) * 100);
        
        return {
          id: m._id || m.id,
          name: m.name,
          group: m.group || 'Unassigned',
          mobile: m.mobile,
          total,
          present,
          absent,
          percentage
        };
      });
      
      // Sort by percentage desc
      mockData.sort((a, b) => b.percentage - a.percentage);
      setReportData(mockData);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h1 style={{ marginBottom: '1rem' }}>Attendance Report</h1>
      
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.5rem', alignItems: 'flex-end', backgroundColor: '#fff', padding: '1rem', borderRadius: '0.5rem', border: '1px solid #e5e7eb' }}>
        <div>
          <label style={{ display: 'block', fontSize: '0.875rem', marginBottom: '0.25rem', color: '#374151' }}>From Date</label>
          <input 
            type="date" 
            value={fromDate} 
            onChange={(e) => setFromDate(e.target.value)}
            style={inputStyle}
          />
        </div>
        
        <div>
          <label style={{ display: 'block', fontSize: '0.875rem', marginBottom: '0.25rem', color: '#374151' }}>To Date</label>
          <input 
            type="date" 
            value={toDate} 
            onChange={(e) => setToDate(e.target.value)}
            style={inputStyle}
          />
        </div>
        
        <div>
          <label style={{ display: 'block', fontSize: '0.875rem', marginBottom: '0.25rem', color: '#374151' }}>Group (Optional)</label>
          <select value={groupFilter} onChange={e => setGroupFilter(e.target.value)} style={inputStyle}>
            {groups.map(g => <option key={g} value={g}>{g === 'All' ? 'All Groups' : g === 'Unassigned' ? 'Unassigned' : `Group ${g}`}</option>)}
          </select>
        </div>
        
        <div>
          <button onClick={fetchReport} style={btnPrimary}>Generate Report</button>
        </div>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '2rem', color: '#6b7280' }}>Loading report data...</div>
      ) : reportData.length === 0 ? (
        <div style={{ padding: '2rem', textAlign: 'center', backgroundColor: '#fff', borderRadius: '0.5rem', border: '1px solid #e5e7eb' }}>
          No attendance data to display.
        </div>
      ) : (
        <div className="report-grid">
          <style>{`
            .report-grid {
              display: grid;
              gap: 1rem;
              grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
            }
            .report-card {
              background: #fff;
              border: 1px solid #e5e7eb;
              border-radius: 0.5rem;
              padding: 1rem;
              box-shadow: 0 1px 2px rgba(0,0,0,0.05);
            }
            .report-header {
              display: flex;
              justify-content: space-between;
              border-bottom: 1px solid #f3f4f6;
              padding-bottom: 0.75rem;
              margin-bottom: 0.75rem;
            }
            .report-stats {
              display: grid;
              grid-template-columns: 1fr 1fr 1fr;
              text-align: center;
              gap: 0.5rem;
            }
            .stat-value {
              font-size: 1.25rem;
              font-weight: 600;
            }
            .stat-label {
              font-size: 0.75rem;
              color: '#6b7280';
              text-transform: uppercase;
            }
          `}</style>
          
          {reportData.map((row) => (
            <div key={row.id} className="report-card">
              <div className="report-header">
                <div>
                  <div style={{ fontWeight: 600, fontSize: '1.125rem' }}>{row.name}</div>
                  <div style={{ fontSize: '0.875rem', color: '#6b7280' }}>
                    {row.group === 'Unassigned' ? 'Unassigned' : `Group ${row.group}`} | {row.mobile}
                  </div>
                </div>
                <div style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  width: '3rem', height: '3rem', borderRadius: '999px',
                  backgroundColor: row.percentage >= 75 ? '#d1fae5' : row.percentage >= 50 ? '#fef3c7' : '#fee2e2',
                  color: row.percentage >= 75 ? '#047857' : row.percentage >= 50 ? '#b45309' : '#b91c1c',
                  fontWeight: 'bold', fontSize: '0.875rem'
                }}>
                  {row.percentage}%
                </div>
              </div>
              <div className="report-stats">
                <div>
                  <div className="stat-value" style={{ color: '#10b981' }}>{row.present}</div>
                  <div className="stat-label">Present</div>
                </div>
                <div>
                  <div className="stat-value" style={{ color: '#ef4444' }}>{row.absent}</div>
                  <div className="stat-label">Absent</div>
                </div>
                <div>
                  <div className="stat-value" style={{ color: '#374151' }}>{row.total}</div>
                  <div className="stat-label">Total</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

const btnPrimary = {
  padding: '0.5rem 1rem',
  backgroundColor: '#3b82f6',
  color: 'white',
  border: 'none',
  borderRadius: '0.375rem',
  cursor: 'pointer',
  height: '42px',
  fontWeight: 500
};

const inputStyle = {
  padding: '0.5rem',
  border: '1px solid #d1d5db',
  borderRadius: '0.375rem',
  fontSize: '1rem',
  height: '42px',
  boxSizing: 'border-box',
  width: '100%'
};
