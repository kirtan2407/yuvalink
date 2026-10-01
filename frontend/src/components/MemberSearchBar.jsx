import React from 'react';
import { Search, X } from 'lucide-react';

export default function MemberSearchBar({ search, setSearch, groupFilter, setGroupFilter }) {
  const groups = ['All', 'Unassigned', ...Array.from({length: 26}, (_, i) => String.fromCharCode(65 + i))];
  
  const inputStyle = {
    padding: '8px 12px',
    border: '1px solid #d1d5db',
    borderRadius: '4px',
    fontSize: '14px'
  };

  return (
    <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', marginBottom: '1rem' }}>
      <div style={{ flex: 1, minWidth: '250px', position: 'relative' }}>
        <input 
          type="text" 
          placeholder="Type a single letter to filter by Group or search by name..." 
          value={search} 
          onChange={(e) => setSearch(e.target.value)}
          style={{ ...inputStyle, width: '100%', boxSizing: 'border-box' }}
        />
        {search && (
          <button 
            onClick={() => setSearch('')} 
            style={{ 
              position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', 
              background: 'transparent', border: 'none', cursor: 'pointer', padding: '0', display: 'flex', alignItems: 'center' 
            }}
          >
            <X size={16} />
          </button>
        )}
      </div>
      
      <div>
        <select 
          value={groupFilter} 
          onChange={e => setGroupFilter(e.target.value)} 
          style={inputStyle}
        >
          {groups.map(g => (
            <option key={g} value={g}>
              {g === 'All' ? 'All Groups' : g === 'Unassigned' ? 'Unassigned' : `Group ${g}`}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
