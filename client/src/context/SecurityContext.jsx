import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import securityService from '../services/securityService';

const SecurityContext = createContext();

export const useSecurity = () => {
  const context = useContext(SecurityContext);
  if (!context) {
    throw new Error('useSecurity must be used within a SecurityProvider');
  }
  return context;
};

export const SecurityProvider = ({ children }) => {
  const [stats, setStats] = useState({
    pending_communities: 0,
    open_reports: 0,
    suspended_users: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const refreshStats = useCallback(async () => {
    try {
      setLoading(true);
      const res = await securityService.getStats();
      setStats(res.data);
      setError(null);
    } catch (err) {
      console.error('Failed to fetch security stats:', err);
      setError('Could not load security statistics.');
    } finally {
      setLoading(false);
    }
  }, []);

  // Initial fetch
  useEffect(() => {
    refreshStats();
  }, [refreshStats]);

  const value = {
    stats,
    loading,
    error,
    refreshStats,
  };

  return (
    <SecurityContext.Provider value={value}>
      {children}
    </SecurityContext.Provider>
  );
};
