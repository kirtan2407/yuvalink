import { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => sessionStorage.getItem('token'));
  const [isAuthenticated, setIsAuthenticated] = useState(!!token);
  const [loading, setLoading] = useState(!!token);
  const [autoLogoutMinutes] = useState(30);

  useEffect(() => {
    const verifyToken = async () => {
      if (!token) {
        setIsAuthenticated(false);
        setLoading(false);
        return;
      }
      try {
        const res = await fetch('/api/auth/me', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        if (res.ok) {
          setIsAuthenticated(true);
        } else {
          sessionStorage.removeItem('token');
          setToken(null);
          setIsAuthenticated(false);
        }
      } catch {
        sessionStorage.removeItem('token');
        setToken(null);
        setIsAuthenticated(false);
      } finally {
        setLoading(false);
      }
    };
    verifyToken();
  }, [token]);

  const login = (newToken) => {
    sessionStorage.setItem('token', newToken);
    setToken(newToken);
    setIsAuthenticated(true);
  };

  const logout = () => {
    sessionStorage.removeItem('token');
    setToken(null);
    setIsAuthenticated(false);
  };

  return (
    <AuthContext.Provider value={{ token, login, logout, isAuthenticated, loading, autoLogoutMinutes }}>
      {children}
    </AuthContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => useContext(AuthContext);
