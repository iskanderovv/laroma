'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAppSelector } from '@/hooks/redux';

interface User {
  id?: string;
  _id?: string;
  telegramId?: number;
  firstName: string;
  lastName?: string;
  phone?: string;
  username?: string;
  photo_url?: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (userData: User, token: string) => void;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  // Redux store-dan Telegram auth holatini olish
  const { user: reduxUser, token, isLoading: reduxLoading } = useAppSelector((state) => state.auth);

  useEffect(() => {
    if (reduxUser && token) {
      setUser(reduxUser);
      setIsLoading(false);
    } else if (!reduxLoading) {
      // Fallback: localStorage-dan token tekshirish
      const storedToken = localStorage.getItem('token') || 
                          localStorage.getItem('auth-token') || 
                          localStorage.getItem('access_token');
      
      if (storedToken && reduxUser) {
        setUser(reduxUser);
      }
      setIsLoading(false);
    }
  }, [reduxUser, token, reduxLoading]);

  const login = (userData: User, authToken: string) => {
    setUser(userData);
    localStorage.setItem('token', authToken);
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('token');
    localStorage.removeItem('auth-token');
    localStorage.removeItem('access_token');
  };

  const value = {
    user,
    isAuthenticated: !!user,
    login,
    logout,
    isLoading
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
