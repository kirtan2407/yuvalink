import { createContext, useContext, useState } from 'react';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const token = sessionStorage.getItem('token');
    return token ? { id: 1, role: 'admin' } : null;
  });
  const [loading] = useState(false);

  const login = (token, userData) => {
    sessionStorage.setItem('token', token);
    setUser(userData);
  };

  const logout = () => {
    sessionStorage.removeItem('token');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {!loading && children}
    </AuthContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => useContext(AuthContext);
