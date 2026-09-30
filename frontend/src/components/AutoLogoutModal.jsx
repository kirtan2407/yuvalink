import { useEffect } from 'react';
import { useAuth } from '../context/AuthContext';

export default function AutoLogoutModal({ timeLeft, stayLoggedIn }) {
  const { logout } = useAuth();

  useEffect(() => {
    if (timeLeft === 0) {
      logout();
    }
  }, [timeLeft, logout]);

  return (
    <div style={overlayStyle}>
      <div style={modalStyle}>
        <h2>Session Expiring</h2>
        <p>Your session will expire in {timeLeft} seconds due to inactivity.</p>
        <div style={buttonContainerStyle}>
          <button onClick={stayLoggedIn} style={stayButtonStyle}>Stay Logged In</button>
          <button onClick={logout} style={logoutButtonStyle}>Logout Now</button>
        </div>
      </div>
    </div>
  );
}

const overlayStyle = {
  position: 'fixed',
  top: 0, left: 0, right: 0, bottom: 0,
  backgroundColor: 'rgba(0,0,0,0.5)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  zIndex: 1000
};

const modalStyle = {
  backgroundColor: '#fff',
  padding: '2rem',
  borderRadius: '8px',
  textAlign: 'center',
  boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
};

const buttonContainerStyle = {
  display: 'flex',
  justifyContent: 'center',
  gap: '1rem',
  marginTop: '1.5rem'
};

const stayButtonStyle = {
  padding: '0.5rem 1rem',
  backgroundColor: '#3b82f6',
  color: 'white',
  border: 'none',
  borderRadius: '4px',
  cursor: 'pointer'
};

const logoutButtonStyle = {
  padding: '0.5rem 1rem',
  backgroundColor: '#ef4444',
  color: 'white',
  border: 'none',
  borderRadius: '4px',
  cursor: 'pointer'
};
