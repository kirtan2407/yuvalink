import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { MembersProvider } from './context/MembersContext';
import ServerGate from './components/ServerGate';
import Login from './pages/Login';
import AppShell from './components/AppShell';
import ProtectedRoute from './components/ProtectedRoute';

import Members from './pages/Members';
import Trash from './pages/Trash';

import Attendance from './pages/Attendance';
import Report from './pages/Report';
import Settings from './pages/Settings';

function App() {
  return (
    <AuthProvider>
      <MembersProvider>
        <ServerGate>
          <Router>
            <Routes>
              <Route path="/login" element={<Login />} />
              
              <Route path="/" element={<ProtectedRoute><AppShell /></ProtectedRoute>}>
                <Route path="members" element={<Members />} />
                <Route path="attendance" element={<Attendance />} />
                <Route path="report" element={<Report />} />
                <Route path="trash" element={<Trash />} />
                <Route path="settings" element={<Settings />} />
                <Route index element={<Navigate to="/members" replace />} />
              </Route>
              
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </Router>
        </ServerGate>
      </MembersProvider>
    </AuthProvider>
  );
}

export default App;
