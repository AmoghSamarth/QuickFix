import React, { useState, useEffect, useCallback } from 'react';
import authService from '../services/authService';
import { DEMO_USERS } from '../utils/mockData';
import { AuthContext } from './authContextDef';

export function AuthProvider({ children }) {
  // Check if there is an existing session stored in localStorage (defaults to null/unauthenticated)
  const [user, setUser] = useState(() => {
    try {
      const stored = localStorage.getItem('quickfix_user');
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });

  const [token, setToken] = useState(() => localStorage.getItem('quickfix_token') || null);
  const [isDemoMode, setIsDemoMode] = useState(() => {
    const isDemo = localStorage.getItem('quickfix_is_demo');
    return isDemo === 'true';
  });
  const [loading] = useState(false);

  // Synchronize state changes to localStorage
  useEffect(() => {
    if (user) {
      localStorage.setItem('quickfix_user', JSON.stringify(user));
    } else {
      localStorage.removeItem('quickfix_user');
    }
    localStorage.setItem('quickfix_is_demo', isDemoMode ? 'true' : 'false');
  }, [user, isDemoMode]);

  // Handle unauthorized response events from Axios
  useEffect(() => {
    const handleUnauthorized = () => {
      if (!isDemoMode) {
        setUser(null);
        setToken(null);
      }
    };

    window.addEventListener('quickfix:unauthorized', handleUnauthorized);
    return () => window.removeEventListener('quickfix:unauthorized', handleUnauthorized);
  }, [isDemoMode]);

  /**
   * Production login method using backend API
   */
  const login = useCallback(async (credentials) => {
    const response = await authService.login(credentials);
    setUser(response.user);
    setToken(response.token);
    setIsDemoMode(false);
    return response;
  }, []);

  /**
   * Isolated demo mode login/role-switch
   * Allows exploring Employee and Administrator views without requiring live backend
   */
  const loginAsDemo = useCallback((role = 'employee') => {
    const selected = role === 'admin' ? DEMO_USERS.admin : DEMO_USERS.employee;
    setUser(selected);
    setToken(`demo-${selected.role}-token`);
    setIsDemoMode(true);
    localStorage.setItem('quickfix_token', `demo-${selected.role}-token`);
    localStorage.setItem('quickfix_user', JSON.stringify(selected));
    localStorage.setItem('quickfix_is_demo', 'true');
  }, []);

  /**
   * Switch roles dynamically in demo mode
   */
  const switchDemoRole = useCallback((newRole) => {
    loginAsDemo(newRole);
  }, [loginAsDemo]);

  /**
   * Logout user and clear tokens
   */
  const logout = useCallback(async () => {
    if (!isDemoMode) {
      await authService.logout();
    }
    setUser(null);
    setToken(null);
    setIsDemoMode(false);
    localStorage.removeItem('quickfix_token');
    localStorage.removeItem('quickfix_user');
    localStorage.removeItem('quickfix_is_demo');
  }, [isDemoMode]);

  const value = {
    user,
    token,
    loading,
    isAuthenticated: Boolean(user),
    isAdmin: user?.role === 'admin',
    isEmployee: user?.role === 'employee',
    isDemoMode,
    login,
    loginAsDemo,
    switchDemoRole,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export default AuthContext;
