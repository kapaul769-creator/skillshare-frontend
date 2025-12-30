
import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '../types';
import { getCurrentUser, setCurrentUser as setStorageUser, initializeStorage } from '../services/storageService';

interface AuthContextType {
  user: User | null;
  login: (user: User) => void;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Run initialization once on mount to ensure persistent keys exist
    initializeStorage();
    
    const storedUser = getCurrentUser();
    if (storedUser) {
      setUser(storedUser);
    }
    setIsLoading(false);
  }, []);

  const login = (newUser: User) => {
    setUser(newUser);
    setStorageUser(newUser); // Persists to CURRENT_USER key
  };

  const logout = () => {
    // Explicitly end the user session
    setUser(null);
    setStorageUser(null); // Removes ONLY the CURRENT_USER key
    
    // Note: initializeStorage is NOT called here.
    // Business data (Listings, Messages, etc.) remains untouched in other keys.
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
