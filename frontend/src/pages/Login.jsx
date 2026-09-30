import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { apiCall } from '../services/api';

export default function Login() {
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password.length < 8) {
      setError('Password must be at least 8 characters long');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const data = await apiCall('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({ password })
      });

      login(data.token);
      navigate('/members', { replace: true });
    } catch (err) {
      if (err.message.includes('429')) {
        setError('Too many attempts. Please try again later.');
      } else {
        setError(err.message || 'Login failed');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={containerStyle}>
      <div style={cardStyle}>
        <h1 style={titleStyle}>YuvaLink</h1>
        <form onSubmit={handleSubmit} style={formStyle}>
          <div style={inputContainerStyle}>
            <input
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                if (error) setError('');
              }}
              placeholder="Enter password"
              style={inputStyle}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              style={iconButtonStyle}
            >
              {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>
          {error && <p style={errorStyle}>{error}</p>}
          <button type="submit" disabled={loading} style={submitButtonStyle}>
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>
      </div>
    </div>
  );
}

const containerStyle = {
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  minHeight: '100vh',
  backgroundColor: '#f3f4f6'
};

const cardStyle = {
  backgroundColor: '#ffffff',
  padding: '2rem',
  borderRadius: '8px',
  boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
  width: '100%',
  maxWidth: '400px'
};

const titleStyle = {
  textAlign: 'center',
  marginBottom: '2rem',
  color: '#1f2937'
};

const formStyle = {
  display: 'flex',
  flexDirection: 'column',
  gap: '1rem'
};

const inputContainerStyle = {
  position: 'relative',
  display: 'flex',
  alignItems: 'center'
};

const inputStyle = {
  width: '100%',
  padding: '0.75rem',
  paddingRight: '2.5rem',
  borderRadius: '4px',
  border: '1px solid #d1d5db',
  fontSize: '1rem'
};

const iconButtonStyle = {
  position: 'absolute',
  right: '0.5rem',
  background: 'none',
  border: 'none',
  cursor: 'pointer',
  color: '#6b7280'
};

const submitButtonStyle = {
  padding: '0.75rem',
  backgroundColor: '#3b82f6',
  color: '#ffffff',
  border: 'none',
  borderRadius: '4px',
  fontSize: '1rem',
  cursor: 'pointer',
  fontWeight: 'bold'
};

const errorStyle = {
  color: '#ef4444',
  fontSize: '0.875rem',
  margin: 0
};
