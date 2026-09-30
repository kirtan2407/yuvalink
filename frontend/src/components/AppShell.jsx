import { useState, useEffect } from 'react';
import { NavLink, Outlet, useLocation } from 'react-router-dom';
import { Menu, X, Users, Calendar, FileText, Trash2, Settings, LogOut } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useInactivityTimer } from '../hooks/useInactivityTimer';
import AutoLogoutModal from './AutoLogoutModal';

export default function AppShell({ children }) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();
  const { logout } = useAuth();
  const { showModal, timeLeft, stayLoggedIn } = useInactivityTimer();

  const [prevLocation, setPrevLocation] = useState(location.pathname);
  if (location.pathname !== prevLocation) {
    setPrevLocation(location.pathname);
    setIsMobileMenuOpen(false);
  }

  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === 'Escape') setIsMobileMenuOpen(false);
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, []);
  return (
    <div style={appShellStyle}>
      {showModal && <AutoLogoutModal timeLeft={timeLeft} stayLoggedIn={stayLoggedIn} />}
      
      {/* Mobile Top Bar */}
      <div style={mobileTopBarStyle} className="mobile-top-bar">
        <button onClick={() => setIsMobileMenuOpen(true)} style={menuButtonStyle}>
          <Menu size={24} />
        </button>
        <h2 style={{ margin: 0 }}>YuvaLink</h2>
      </div>

      {/* Mobile Drawer Overlay */}
      {isMobileMenuOpen && (
        <div style={overlayStyle} onClick={() => setIsMobileMenuOpen(false)} />
      )}

      {/* Sidebar / Mobile Drawer */}
      <div style={{
        ...sidebarStyle,
        transform: isMobileMenuOpen ? 'translateX(0)' : 'translateX(-100%)'
      }} className="sidebar">
        <div style={mobileCloseContainerStyle} className="mobile-close-btn">
          <button onClick={() => setIsMobileMenuOpen(false)} style={menuButtonStyle}>
            <X size={24} />
          </button>
        </div>
        <NavContent />
      </div>

      {/* Desktop Sidebar (CSS media queries typically handle this, but we'll use inline styles with a class for simplicity or handle it via styled components. Since we only have inline, let's use a class to manage display) */}
      <style>{`
        .sidebar {
          position: fixed;
          top: 0;
          left: 0;
          height: 100vh;
          width: 250px;
          background-color: #1f2937;
          color: white;
          z-index: 1000;
          transition: transform 0.3s ease-in-out;
        }
        .main-content {
          margin-left: 0;
          padding: 2rem;
          padding-top: 4rem; /* For mobile top bar */
          min-height: 100vh;
          background-color: #f3f4f6;
        }
        @media (min-width: 768px) {
          .sidebar {
            transform: translateX(0) !important;
          }
          .main-content {
            margin-left: 250px;
            padding-top: 2rem;
          }
          .mobile-top-bar {
            display: none !important;
          }
          .mobile-close-btn {
            display: none !important;
          }
        }
      `}</style>

      {/* Main Content */}
      <main className="main-content">
        {children || <Outlet />}
      </main>
    </div>
  );
}

const NavContent = () => {
  const { logout } = useAuth();
  
  const navLinks = [
    { to: '/members', icon: <Users size={20} />, label: 'Members' },
    { to: '/attendance', icon: <Calendar size={20} />, label: 'Attendance' },
    { to: '/report', icon: <FileText size={20} />, label: 'Report' },
    { to: '/trash', icon: <Trash2 size={20} />, label: 'Trash' },
    { to: '/settings', icon: <Settings size={20} />, label: 'Settings' }
  ];

  return (
    <>
      <div style={logoContainerStyle}>
        <h2>YuvaLink</h2>
      </div>
      <nav style={navStyle}>
        {navLinks.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            style={({ isActive }) => ({
              ...linkStyle,
              ...(isActive ? activeLinkStyle : {})
            })}
          >
            {link.icon}
            <span>{link.label}</span>
          </NavLink>
        ))}
      </nav>
      <div style={logoutContainerStyle}>
        <button onClick={logout} style={logoutBtnStyle}>
          <LogOut size={20} />
          <span>Logout</span>
        </button>
      </div>
    </>
  );
};

const appShellStyle = {
  minHeight: '100vh',
  display: 'flex',
  flexDirection: 'column'
};

const mobileTopBarStyle = {
  display: 'flex',
  alignItems: 'center',
  padding: '1rem',
  backgroundColor: '#1f2937',
  color: 'white',
  position: 'fixed',
  top: 0,
  left: 0,
  right: 0,
  zIndex: 900
};

const mobileCloseContainerStyle = {
  display: 'flex',
  justifyContent: 'flex-end',
  padding: '1rem'
};

const sidebarStyle = {
  display: 'flex',
  flexDirection: 'column'
};

const overlayStyle = {
  position: 'fixed',
  top: 0, left: 0, right: 0, bottom: 0,
  backgroundColor: 'rgba(0,0,0,0.5)',
  zIndex: 950
};

const logoContainerStyle = {
  padding: '1rem 2rem',
  borderBottom: '1px solid #374151'
};

const navStyle = {
  display: 'flex',
  flexDirection: 'column',
  padding: '1rem',
  flexGrow: 1,
  gap: '0.5rem'
};

const linkStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: '1rem',
  padding: '0.75rem 1rem',
  color: '#d1d5db',
  textDecoration: 'none',
  borderRadius: '0.375rem',
  transition: 'background-color 0.2s'
};

const activeLinkStyle = {
  backgroundColor: '#374151',
  color: 'white'
};

const logoutContainerStyle = {
  padding: '1rem',
  borderTop: '1px solid #374151'
};

const logoutBtnStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: '1rem',
  padding: '0.75rem 1rem',
  width: '100%',
  color: '#f87171',
  background: 'none',
  border: 'none',
  cursor: 'pointer',
  borderRadius: '0.375rem'
};

const menuButtonStyle = {
  background: 'none',
  border: 'none',
  color: 'white',
  cursor: 'pointer',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  padding: '0.5rem'
};
