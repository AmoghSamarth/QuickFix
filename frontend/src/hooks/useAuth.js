import { useContext } from 'react';
import { AuthContext } from '../context/authContextDef';

/**
 * Custom hook to consume QuickFix authentication and role context
 */
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export default useAuth;
