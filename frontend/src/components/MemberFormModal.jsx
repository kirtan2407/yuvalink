import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { useMembers } from '../context/MembersContext';

const modalStyle = {
  position: 'fixed',
  top: 0, left: 0, right: 0, bottom: 0,
  backgroundColor: 'rgba(0,0,0,0.5)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  zIndex: 1100,
  padding: '1rem'
};

const modalContentStyle = {
  backgroundColor: '#fff',
  borderRadius: '0.5rem',
  padding: '1.5rem',
  width: '100%',
  maxWidth: '500px',
  maxHeight: '90vh',
  overflowY: 'auto'
};

const headerStyle = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginBottom: '1rem'
};

const formGroupStyle = {
  marginBottom: '1rem',
  display: 'flex',
  flexDirection: 'column'
};

const labelStyle = {
  marginBottom: '0.25rem',
  fontWeight: '500',
  fontSize: '0.875rem',
  color: '#374151'
};

const inputStyle = {
  padding: '0.5rem',
  border: '1px solid #d1d5db',
  borderRadius: '0.375rem',
  fontSize: '1rem'
};

const checkboxGroupStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: '0.5rem',
  marginBottom: '1rem'
};

const buttonRowStyle = {
  display: 'flex',
  justifyContent: 'flex-end',
  gap: '0.75rem',
  marginTop: '1.5rem'
};

const btnSecondary = {
  padding: '0.5rem 1rem',
  backgroundColor: '#f3f4f6',
  border: '1px solid #d1d5db',
  borderRadius: '0.375rem',
  cursor: 'pointer'
};

const btnPrimary = {
  padding: '0.5rem 1rem',
  backgroundColor: '#3b82f6',
  color: 'white',
  border: 'none',
  borderRadius: '0.375rem',
  cursor: 'pointer'
};

const groups = ['Unassigned', ...Array.from({ length: 26 }, (_, i) => String.fromCharCode(65 + i))];

export default function MemberFormModal({ isOpen, onClose, initialData = null }) {
  const { addMember, editMember } = useMembers();
  
  const [formData, setFormData] = useState({
    name: '',
    mobile: '',
    address: '',
    currentStudy: '',
    occupation: '',
    birthDate: '',
    group: 'Unassigned',
    addedInSatsangApp: false,
    ybMember: false
  });
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (initialData) {
      setFormData({
        name: initialData.name || '',
        mobile: initialData.mobile || '',
        address: initialData.address || '',
        currentStudy: initialData.currentStudy || '',
        occupation: initialData.occupation || '',
        birthDate: initialData.birthDate || '',
        group: initialData.group || 'Unassigned',
        addedInSatsangApp: initialData.addedInSatsangApp || false,
        ybMember: initialData.ybMember || false
      });
    } else {
      setFormData({
        name: '',
        mobile: '',
        address: '',
        currentStudy: '',
        occupation: '',
        birthDate: '',
        group: 'Unassigned',
        addedInSatsangApp: false,
        ybMember: false
      });
    }
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const validate = () => {
    if (!formData.name.trim()) return 'Name is required.';
    if (!/^\d{10}$/.test(formData.mobile)) return 'Mobile must be exactly 10 digits.';
    if (formData.birthDate) {
      const selected = new Date(formData.birthDate);
      const today = new Date();
      if (selected > today) return 'Birth date cannot be in the future.';
    }
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    const valError = validate();
    if (valError) {
      setError(valError);
      return;
    }

    setIsSubmitting(true);
    try {
      let res;
      const memberId = initialData?.id || initialData?._id;
      if (memberId) {
        res = await editMember(memberId, formData);
      } else {
        res = await addMember(formData);
      }
      
      if (res?.duplicateWarning) {
        alert('Warning: ' + res.duplicateWarning);
      }
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to save member.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div style={modalStyle}>
      <div style={modalContentStyle}>
        <div style={headerStyle}>
          <h2 style={{ margin: 0 }}>{initialData ? 'Edit Member' : 'Add Member'}</h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
            <X size={20} />
          </button>
        </div>
        
        {error && <div style={{ color: 'red', marginBottom: '1rem', fontSize: '0.875rem' }}>{error}</div>}
        
        <form onSubmit={handleSubmit}>
          <div style={formGroupStyle}>
            <label style={labelStyle}>Name *</label>
            <input style={inputStyle} type="text" name="name" value={formData.name} onChange={handleChange} required />
          </div>
          <div style={formGroupStyle}>
            <label style={labelStyle}>Mobile (10 digits) *</label>
            <input style={inputStyle} type="text" name="mobile" value={formData.mobile} onChange={handleChange} required />
          </div>
          <div style={formGroupStyle}>
            <label style={labelStyle}>Address</label>
            <input style={inputStyle} type="text" name="address" value={formData.address} onChange={handleChange} />
          </div>
          <div style={formGroupStyle}>
            <label style={labelStyle}>Current Study</label>
            <input style={inputStyle} type="text" name="currentStudy" value={formData.currentStudy} onChange={handleChange} />
          </div>
          <div style={formGroupStyle}>
            <label style={labelStyle}>Occupation</label>
            <input style={inputStyle} type="text" name="occupation" value={formData.occupation} onChange={handleChange} />
          </div>
          <div style={formGroupStyle}>
            <label style={labelStyle}>Birth Date</label>
            <input style={inputStyle} type="date" name="birthDate" value={formData.birthDate} onChange={handleChange} max={new Date().toISOString().split('T')[0]} />
          </div>
          <div style={formGroupStyle}>
            <label style={labelStyle}>Group</label>
            <select style={inputStyle} name="group" value={formData.group} onChange={handleChange}>
              {groups.map(g => <option key={g} value={g}>{g}</option>)}
            </select>
          </div>
          <div style={checkboxGroupStyle}>
            <input type="checkbox" id="addedInSatsangApp" name="addedInSatsangApp" checked={formData.addedInSatsangApp} onChange={handleChange} />
            <label htmlFor="addedInSatsangApp" style={labelStyle}>Added in Satsang App</label>
          </div>
          <div style={checkboxGroupStyle}>
            <input type="checkbox" id="ybMember" name="ybMember" checked={formData.ybMember} onChange={handleChange} />
            <label htmlFor="ybMember" style={labelStyle}>YB Member</label>
          </div>
          
          <div style={buttonRowStyle}>
            <button type="button" onClick={onClose} style={btnSecondary} disabled={isSubmitting}>Cancel</button>
            <button type="submit" style={btnPrimary} disabled={isSubmitting}>{isSubmitting ? 'Saving...' : 'Save'}</button>
          </div>
        </form>
      </div>
    </div>
  );
}
