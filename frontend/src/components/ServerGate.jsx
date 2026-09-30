import { useState, useEffect } from 'react';
import { apiCall } from '../services/api';
import '../styles/global.css';

export default function ServerGate({ children }) {
  const [isAwake, setIsAwake] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    let timeoutId;
    
    const pingServer = async (attempt = 1) => {
      try {
        await apiCall('/api/health');
        setIsAwake(true);
      } catch (err) {
        console.error(`Ping attempt ${attempt} failed:`, err);
        if (attempt < 5) {
          const backoff = Math.min(1000 * Math.pow(2, attempt), 10000);
          timeoutId = setTimeout(() => pingServer(attempt + 1), backoff);
        } else {
          setError('Could not connect to the server. Please try again later. Check console for details.');
        }
      }
    };

    pingServer();

    return () => clearTimeout(timeoutId);
  }, []);

  if (error) {
    return (
      <div className="empty-state" style={{ height: '100vh' }}>
        <p style={{ color: 'var(--color-danger)', fontWeight: 500 }}>{error}</p>
        <button className="btn btn-primary" onClick={() => window.location.reload()} style={{ marginTop: 'var(--spacing-4)' }}>
          Retry
        </button>
      </div>
    );
  }

  if (!isAwake) {
    return (
      <div className="empty-state" style={{ height: '100vh', justifyContent: 'center' }}>
        <div className="spinner" style={{ width: '3rem', height: '3rem', borderWidth: '4px' }}></div>
        <p style={{ marginTop: 'var(--spacing-6)', fontSize: '1.125rem', color: 'var(--color-secondary)' }}>
          Waking up the server, this can take up to a minute...
        </p>
      </div>
    );
  }

  return <>{children}</>;
}
