// src/contexts/MockAuthContext.tsx
'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { UserRole, IUser } from '@/core/interfaces/models';
import mockData from '@/data/mockData.json';

interface AuthContextType {
  currentUser: IUser | null;
  userRole: UserRole;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<IUser | null>(null);
  const [userRole, setUserRole] = useState<UserRole>(UserRole.DEVELOPER);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    // Simular carga de usuario mock (usar el primer usuario por defecto)
    const mockUser = mockData.users[0] as IUser;
    setCurrentUser(mockUser);
    setUserRole(mockUser.role as UserRole);
    setLoading(false);
  }, []);

  const value = {
    currentUser,
    userRole,
    loading,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthContext;
