import { useEffect, useRef, useState } from 'react';
import { useAuth } from '../context/AuthContext';

export function useInactivityTimer() {
  const { autoLogoutMinutes, isAuthenticated } = useAuth();
  const [showModal, setShowModal] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);
  
  const timeoutRef = useRef(null);
  const intervalRef = useRef(null);
  const lastActivityRef = useRef(null);
  const maxIdleTime = autoLogoutMinutes * 60 * 1000;
  
  if (lastActivityRef.current === null) {
    lastActivityRef.current = Date.now();
  }

  const resetTimer = () => {
    lastActivityRef.current = Date.now();
  };

  useEffect(() => {
    if (!isAuthenticated) {
      setShowModal(false);
      return;
    }

    const events = ['mousemove', 'keydown', 'click', 'touchstart', 'scroll'];
    
    let throttleTimer = false;
    const handleActivity = () => {
      if (throttleTimer) return;
      throttleTimer = true;
      setTimeout(() => { throttleTimer = false; }, 1000);
      resetTimer();
    };

    events.forEach(event => {
      window.addEventListener(event, handleActivity);
    });

    const checkInactivity = () => {
      const now = Date.now();
      const idleTime = now - lastActivityRef.current;
      
      if (idleTime >= maxIdleTime && !showModal) {
        setShowModal(true);
        setTimeLeft(60);
      }
    };

    intervalRef.current = setInterval(checkInactivity, 1000);

    return () => {
      events.forEach(event => {
        window.removeEventListener(event, handleActivity);
      });
      clearInterval(intervalRef.current);
    };
  }, [isAuthenticated, maxIdleTime, showModal]);

  useEffect(() => {
    if (showModal) {
      timeoutRef.current = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            clearInterval(timeoutRef.current);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    
    return () => clearInterval(timeoutRef.current);
  }, [showModal]);

  const stayLoggedIn = () => {
    resetTimer();
    setShowModal(false);
  };

  return { showModal, timeLeft, stayLoggedIn };
}
