import React, { createContext, useContext, useState, useEffect } from 'react';
import authService from '../services/authService';
import { clearAuthStorage, getStoredUser } from '../utils/tokenUtils';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser]       = useState(null);
  const [loading, setLoading] = useState(true);

  // On mount: restore user from localStorage, then verify with server
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const storedUser = getStoredUser();
        if (storedUser) {
          setUser(storedUser); // optimistic restore
          // Re-validate with server so stale/suspended users are caught
          const freshUser = await authService.getMe();
          setUser(freshUser);
        }
      } catch {
        // Token invalid / expired — clear everything
        clearAuthStorage();
        setUser(null);
      } finally {
        setLoading(false);
      }
    };
    checkAuth();
  }, []);

  // Throws on failure — callers (LoginForm, RegisterForm) handle the error
  const login = async (credentials) => {
    const { user } = await authService.login(credentials);
    setUser(user);
    return { user };
  };

  // Throws on failure — callers handle the error
  const register = async (payload) => {
    const { user } = await authService.register(payload);
    setUser(user);
    return { user };
  };

  const logout = async () => {
    await authService.logout();
    setUser(null);
  };

  const value = {
    user,
    setUser,
    loading,
    login,
    register,
    logout,
    isAuthenticated: !!user,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};