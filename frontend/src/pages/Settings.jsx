import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';

const Settings = () => {
  const { setAutoLogoutMinutes, autoLogoutMinutes } = useAuth() || {};
  
  // States for Birthdays
  const [birthdays, setBirthdays] = useState([]);
  const [birthdaysLoading, setBirthdaysLoading] = useState(false);
  const [birthdaysError, setBirthdaysError] = useState('');

  // States for Delete Attendance
  const [attendanceDate, setAttendanceDate] = useState('');
  const [attendanceLoading, setAttendanceLoading] = useState(false);
  const [attendanceError, setAttendanceError] = useState('');
  const [attendanceCount, setAttendanceCount] = useState(null);

  // States for Societies
  const [societies, setSocieties] = useState([]);
  const [societiesLoading, setSocietiesLoading] = useState(false);
  const [societiesError, setSocietiesError] = useState('');
  const [showSocietyModal, setShowSocietyModal] = useState(false);
  const [editingSociety, setEditingSociety] = useState(null);
  const [societyForm, setSocietyForm] = useState({ name: '', area: '', landmark: '' });

  // Settings Forms
  const [passwordForm, setPasswordForm] = useState({ currentPassword: '', newPassword: '' });
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordMessage, setPasswordMessage] = useState('');
  
  const [autoLogoutForm, setAutoLogoutForm] = useState(autoLogoutMinutes || 30);
  const [autoLogoutLoading, setAutoLogoutLoading] = useState(false);
  const [autoLogoutMessage, setAutoLogoutMessage] = useState('');

  const [backupLoading, setBackupLoading] = useState(false);

  const fetchBirthdays = async () => {
    setBirthdaysLoading(true);
    setBirthdaysError('');
    try {
      const res = await fetch('/api/birthdays');
      if (!res.ok) throw new Error('Failed to fetch birthdays');
      const data = await res.json();
      setBirthdays(data);
    } catch (err) {
      setBirthdaysError(err.message);
    } finally {
      setBirthdaysLoading(false);
    }
  };

  const fetchSocieties = async () => {
    setSocietiesLoading(true);
    setSocietiesError('');
    try {
      const res = await fetch('/api/societies');
      if (!res.ok) throw new Error('Failed to fetch societies');
      const data = await res.json();
      setSocieties(data);
    } catch (err) {
      setSocietiesError(err.message);
    } finally {
      setSocietiesLoading(false);
    }
  };

  useEffect(() => {
    fetchBirthdays();
    fetchSocieties();
  }, []);



  const checkAttendanceDate = async () => {
    if (!attendanceDate) return;
    setAttendanceLoading(true);
    setAttendanceError('');
    try {
      const res = await fetch(`/api/attendance/count?date=${attendanceDate}`);
      if (!res.ok) throw new Error('Failed to fetch count');
      const data = await res.json();
      setAttendanceCount(data.count);
    } catch (err) {
      setAttendanceError(err.message);
    } finally {
      setAttendanceLoading(false);
    }
  };

  const confirmDeleteAttendance = async () => {
    if (!attendanceDate) return;
    setAttendanceLoading(true);
    try {
      const res = await fetch(`/api/attendance/date/${attendanceDate}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete attendance');
      setAttendanceCount(null);
      setAttendanceDate('');
      alert('Attendance deleted successfully');
    } catch (err) {
      setAttendanceError(err.message);
    } finally {
      setAttendanceLoading(false);
    }
  };

  const handleSaveSociety = async (e) => {
    e.preventDefault();
    setSocietiesLoading(true);
    try {
      const url = editingSociety ? `/api/societies/${editingSociety.id}` : '/api/societies';
      const method = editingSociety ? 'PUT' : 'POST';
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(societyForm)
      });
      if (!res.ok) throw new Error('Failed to save society');
      await fetchSocieties();
      setShowSocietyModal(false);
    } catch (err) {
      setSocietiesError(err.message);
    } finally {
      setSocietiesLoading(false);
    }
  };

  const handleDeleteSociety = async (id) => {
    if (!window.confirm('Delete this society?')) return;
    setSocietiesLoading(true);
    try {
      const res = await fetch(`/api/societies/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete society');
      await fetchSocieties();
    } catch (err) {
      setSocietiesError(err.message);
    } finally {
      setSocietiesLoading(false);
    }
  };

  const clearAllSocieties = async () => {
    if (!window.confirm('Are you sure you want to clear ALL society data?')) return;
    setSocietiesLoading(true);
    try {
      const res = await fetch('/api/societies/all', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ confirm: true })
      });
      if (!res.ok) throw new Error('Failed to clear societies');
      await fetchSocieties();
    } catch (err) {
      setSocietiesError(err.message);
    } finally {
      setSocietiesLoading(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setPasswordLoading(true);
    setPasswordMessage('');
    try {
      const res = await fetch('/api/settings/password', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(passwordForm)
      });
      if (!res.ok) throw new Error('Failed to change password');
      setPasswordMessage('Password changed successfully');
      setPasswordForm({ currentPassword: '', newPassword: '' });
    } catch (err) {
      setPasswordMessage(err.message);
    } finally {
      setPasswordLoading(false);
    }
  };

  const handleAutoLogout = async (e) => {
    e.preventDefault();
    setAutoLogoutLoading(true);
    setAutoLogoutMessage('');
    try {
      const res = await fetch('/api/settings/autologout', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ minutes: parseInt(autoLogoutForm, 10) })
      });
      if (!res.ok) throw new Error('Failed to update auto-logout');
      if (setAutoLogoutMinutes) setAutoLogoutMinutes(parseInt(autoLogoutForm, 10));
      setAutoLogoutMessage('Auto-logout time updated');
    } catch (err) {
      setAutoLogoutMessage(err.message);
    } finally {
      setAutoLogoutLoading(false);
    }
  };

  const handleBackup = async () => {
    setBackupLoading(true);
    try {
      window.location.href = '/api/backup/export';
    } finally {
      setBackupLoading(false);
    }
  };

  return (
    <div className="settings-page" style={{ padding: '20px' }}>
      <h1>Settings</h1>

      <section className="card" style={sectionStyle}>
        <h2>Delete Attendance Date</h2>
        {attendanceError && <p style={{color: 'red'}}>{attendanceError}</p>}
        <div style={{ display: 'flex', gap: '10px' }}>
          <input 
            type="date" 
            value={attendanceDate} 
            onChange={(e) => {
              setAttendanceDate(e.target.value);
              setAttendanceCount(null);
            }} 
          />
          <button onClick={checkAttendanceDate} disabled={attendanceLoading || !attendanceDate}>Check</button>
        </div>
        {attendanceCount !== null && (
          <div style={{ marginTop: '10px' }}>
            <p>Found {attendanceCount} attendance records for {attendanceDate}.</p>
            <button onClick={confirmDeleteAttendance} disabled={attendanceLoading} style={{ background: 'red', color: 'white' }}>Confirm Delete</button>
          </div>
        )}
      </section>

      <section className="card" style={sectionStyle}>
        <h2>Upcoming Birthdays (±7 days)</h2>
        {birthdaysError && <p style={{color: 'red'}}>{birthdaysError}</p>}
        {birthdaysLoading ? <p>Loading...</p> : (
          <div>
            {birthdays.length === 0 ? <p>No upcoming birthdays.</p> : (
              <ul style={{ listStyleType: 'none', padding: 0 }}>
                {birthdays.map((b, i) => (
                  <li key={i} style={{ borderBottom: '1px solid #eee', padding: '5px 0' }}>
                    <strong>{b.name}</strong> ({b.group}) - {b.date} - <em>{b.text}</em>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}
      </section>

      <section className="card" style={sectionStyle}>
        <h2>Society Management</h2>
        {societiesError && <p style={{color: 'red'}}>{societiesError}</p>}
        <div style={{ marginBottom: '10px' }}>
          <button onClick={() => { setEditingSociety(null); setSocietyForm({ name: '', area: '', landmark: '' }); setShowSocietyModal(true); }}>Add Society</button>
          <button onClick={clearAllSocieties} style={{ background: 'red', color: 'white', marginLeft: '10px' }}>Clear All Society Data</button>
        </div>
        {societiesLoading ? <p>Loading...</p> : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse' }}>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Members Count</th>
                  <th>Area</th>
                  <th>Landmark</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {societies.map(soc => (
                  <tr key={soc.id}>
                    <td>{soc.name}</td>
                    <td>{soc.membersCount}</td>
                    <td>{soc.area}</td>
                    <td>{soc.landmark}</td>
                    <td>
                      <button onClick={() => { setEditingSociety(soc); setSocietyForm(soc); setShowSocietyModal(true); }}>Edit</button>
                      <button onClick={() => handleDeleteSociety(soc.id)} style={{ marginLeft: '5px' }}>Delete</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        
        {showSocietyModal && (
          <div style={{ marginTop: '10px', padding: '10px', border: '1px solid #ccc' }}>
            <h3>{editingSociety ? 'Edit Society' : 'Add Society'}</h3>
            <form onSubmit={handleSaveSociety} style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxWidth: '300px' }}>
              <input placeholder="Name" value={societyForm.name || ''} onChange={e => setSocietyForm({...societyForm, name: e.target.value})} required />
              <input placeholder="Area" value={societyForm.area || ''} onChange={e => setSocietyForm({...societyForm, area: e.target.value})} />
              <input placeholder="Landmark" value={societyForm.landmark || ''} onChange={e => setSocietyForm({...societyForm, landmark: e.target.value})} />
              <div>
                <button type="submit" disabled={societiesLoading}>Save</button>
                <button type="button" onClick={() => setShowSocietyModal(false)} style={{ marginLeft: '5px' }}>Cancel</button>
              </div>
            </form>
          </div>
        )}
      </section>

      <section className="card" style={sectionStyle}>
        <h2>System Settings</h2>
        
        <div style={{ marginBottom: '20px' }}>
          <h3>Change Password</h3>
          <form onSubmit={handleChangePassword} style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxWidth: '300px' }}>
            <input type="password" placeholder="Current Password" value={passwordForm.currentPassword} onChange={e => setPasswordForm({...passwordForm, currentPassword: e.target.value})} required />
            <input type="password" placeholder="New Password" value={passwordForm.newPassword} onChange={e => setPasswordForm({...passwordForm, newPassword: e.target.value})} required />
            <button type="submit" disabled={passwordLoading}>Change Password</button>
            {passwordMessage && <p>{passwordMessage}</p>}
          </form>
        </div>

        <div style={{ marginBottom: '20px' }}>
          <h3>Auto-Logout Timer</h3>
          <form onSubmit={handleAutoLogout} style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxWidth: '300px' }}>
            <input type="number" min="1" max="240" value={autoLogoutForm} onChange={e => setAutoLogoutForm(e.target.value)} required />
            <button type="submit" disabled={autoLogoutLoading}>Save Timer</button>
            {autoLogoutMessage && <p>{autoLogoutMessage}</p>}
          </form>
        </div>

        <div>
          <h3>Backup</h3>
          <button onClick={handleBackup} disabled={backupLoading}>Download Full Backup</button>
        </div>
      </section>

    </div>
  );
};

const sectionStyle = {
  marginBottom: '20px',
  padding: '15px',
  border: '1px solid #ddd',
  borderRadius: '8px'
};

export default Settings;
