import { createContext, useContext, useMemo } from 'react';
import { useCurrentUser } from '../hooks/useAuth';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const { user, isLoading, error, isAuthenticated } = useCurrentUser();
  const value = useMemo(
    () => ({ user, isLoading, error, isAuthenticated }),
    [user, isLoading, error, isAuthenticated]
  );

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};
