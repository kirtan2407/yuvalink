import apiCall from '../services/api';
import { useState, useRef } from 'react';
import * as XLSX from 'xlsx';

export default function ImportMembers({ onImportComplete }) {
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [selectedDuplicates, setSelectedDuplicates] = useState({});
  const fileInputRef = useRef(null);

  const downloadTemplate = () => {
    const ws = XLSX.utils.json_to_sheet([{
      name: 'John Doe',
      group: 'A',
      mobile: '9876543210',
      address: '123 Main St',
      study: 'B.Tech',
      occupation: 'Student',
      birthDate: '2000-01-01'
    }]);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Template');
    XLSX.writeFile(wb, 'YuvaLink_Import_Template.xlsx');
  };

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setLoading(true);
    setError('');
    
    try {
      const formData = new FormData();
      formData.append('file', file);
      
      
const data = await apiCall('/api/import/preview', { method: 'POST', body: formData });

      
      setPreview({
        ...data,
        filename: file.name,
        token: data.importToken
      });
      
      // Initialize all duplicates as checked by default
      const initialDupes = {};
      (data.duplicates || []).forEach((_, i) => {
        initialDupes[i] = true;
      });
      setSelectedDuplicates(initialDupes);
      
    } catch (err) {
      setError(err.message || 'Failed to process file');
    } finally {
      setLoading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleCommit = async () => {
    if (!preview) return;
    setLoading(true);
    try {
      const selectedDupeIndices = Object.keys(selectedDuplicates)
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
      
      if (!res.ok) throw new Error('Commit failed');
      
      setPreview(null);
      if (onImportComplete) onImportComplete();
      
    } catch (err) {
      setError(err.message || 'Failed to import');
    } finally {
      setLoading(false);
    }
  };

  const cancelImport = () => {
    setPreview(null);
    setError('');
  };

  const toggleDuplicate = (idx) => {
    setSelectedDuplicates(prev => ({
      ...prev,
      [idx]: !prev[idx]
    }));
  };

  return (
    <div style={{ marginBottom: '1rem', padding: '1rem', border: '1px solid #e5e7eb', borderRadius: '0.5rem', backgroundColor: '#f9fafb' }}>
      <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap' }}>
        <button onClick={() => fileInputRef.current?.click()} style={btnSecondary} disabled={loading}>
          {loading && !preview ? 'Processing...' : 'Select Backup to Import'}
        </button>
        <input 
          type="file" 
          ref={fileInputRef} 
          onChange={handleFileChange} 
          accept=".xlsx,.xls,.csv" 
          style={{ display: 'none' }} 
        />
        <button onClick={downloadTemplate} style={{ ...btnSecondary, background: 'transparent', color: '#3b82f6', border: 'none', textDecoration: 'underline' }}>
          Download Template
        </button>
      </div>

      {error && <div style={{ color: '#dc2626', marginTop: '0.5rem' }}>{error}</div>}

      {preview && (
        <div style={{ marginTop: '1rem', padding: '1rem', backgroundColor: '#fff', border: '1px solid #d1d5db', borderRadius: '0.375rem' }}>
          <h3 style={{ marginTop: 0 }}>Import Preview ({preview.filename})</h3>
          <p><strong>Valid rows:</strong> {preview.validRows?.length || 0}</p>
          <p><strong>Errors:</strong> {preview.errors?.length || 0}</p>
          
          {preview.errors && preview.errors.length > 0 && (
            <div style={{ maxHeight: '100px', overflowY: 'auto', fontSize: '0.875rem', color: '#dc2626', marginBottom: '1rem' }}>
              <ul>
                {preview.errors.map((e, i) => <li key={i}>Row {e.row}: {e.reason}</li>)}
              </ul>
            </div>
          )}

          {preview.duplicates && preview.duplicates.length > 0 && (
            <div style={{ marginBottom: '1rem' }}>
              <p><strong>Duplicates found:</strong> {preview.duplicates.length}</p>
              <div style={{ maxHeight: '150px', overflowY: 'auto', border: '1px solid #e5e7eb', borderRadius: '0.25rem', padding: '0.5rem' }}>
                {preview.duplicates.map((dupe, i) => (
                  <label key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem', fontSize: '0.875rem' }}>
                    <input 
                      type="checkbox" 
                      checked={!!selectedDuplicates[i]} 
                      onChange={() => toggleDuplicate(i)} 
                    />
                    <span>{dupe.name} ({dupe.mobile || 'No mobile'}) - {dupe.reason || 'Duplicate found'}</span>
                  </label>
                ))}
              </div>
            </div>
          )}

          <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem' }}>
            <button onClick={handleCommit} disabled={loading} style={btnPrimary}>
              {loading ? 'Importing...' : 'Import Selected'}
            </button>
            <button onClick={cancelImport} disabled={loading} style={btnSecondary}>
              Cancel
            </button>
          </div>
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
  cursor: 'pointer'
};

const btnSecondary = {
  padding: '0.5rem 1rem',
  backgroundColor: '#f3f4f6',
  border: '1px solid #d1d5db',
  borderRadius: '0.375rem',
  cursor: 'pointer',
  color: '#374151'
};
