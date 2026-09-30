import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { MembersProvider } from './context/MembersContext';
import ServerGate from './components/ServerGate';

// Placeholder Pages
const Login = () => <div className="card"><h1>Login Page</h1></div>;
const Members = () => <div className="card"><h1>Members Page</h1></div>;
const Attendance = () => <div className="card"><h1>Attendance Page</h1></div>;
const Report = () => <div className="card"><h1>Report Page</h1></div>;
const Trash = () => <div className="card"><h1>Trash Page</h1></div>;
const Settings = () => <div className="card"><h1>Settings Page</h1></div>;

function App() {
  return (
    <AuthProvider>
      <MembersProvider>
        <ServerGate>
          <Router>
            <div style={{ padding: 'var(--spacing-4)', maxWidth: '1200px', margin: '0 auto' }}>
              <Routes>
                <Route path="/login" element={<Login />} />
                <Route path="/members" element={<Members />} />
                <Route path="/attendance" element={<Attendance />} />
                <Route path="/report" element={<Report />} />
                <Route path="/trash" element={<Trash />} />
                <Route path="/settings" element={<Settings />} />
                <Route path="/" element={<Navigate to="/members" replace />} />
              </Routes>
            </div>
          </Router>
        </ServerGate>
      </MembersProvider>
    </AuthProvider>
  );
}

export default App;
