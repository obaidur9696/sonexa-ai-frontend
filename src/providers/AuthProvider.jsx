import { createContext, useContext } from 'react';
import { useCurrentUser } from '../hooks/useAuth';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const { user, isLoading, error, refetch, isAuthenticated } = useCurrentUser();

  const updateUser = () => {
    if (typeof refetch === 'function') {
      refetch();
    }
  }
  const clearUser = () => {
    if (typeof refetch === 'function') {
      refetch();
    }
  }

  return (
    <AuthContext.Provider value={{ user, isLoading, error, isAuthenticated, updateUser, clearUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};

