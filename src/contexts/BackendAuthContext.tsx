"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode
} from 'react';
import { apiClient } from '@/services/api/apiClient';
import { UserRole, IUser } from '@/core/interfaces/models';
import { toast } from '@/components/ui/use-toast';
import BackendAuthService from '@/services/auth/backendAuth';

interface AuthContextType {
  currentUser: IUser | null;
  userRole: UserRole;
  loading: boolean;
  error: string | null;
  isBackendAvailable: boolean;
  login: (username: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  updateProfile: (data: { fullName?: string, workMode?: string, role?: UserRole }) => Promise<boolean>;
  retryBackendConnection: () => Promise<boolean>;
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
  const [error, setError] = useState<string | null>(null);
  const [isBackendAvailable, setIsBackendAvailable] = useState<boolean>(true);

  // Check if backend is available
  const checkBackendConnection = async (): Promise<boolean> => {
    try {
      const isAvailable = await apiClient.healthCheck();
      setIsBackendAvailable(isAvailable);
      return isAvailable;
    } catch (error: unknown) { // Use `unknown` instead of `any`
      console.error("Backend connection failed:", error);
      setIsBackendAvailable(false);
      return false;
    }
  };

  // Retry backend connection
  const retryBackendConnection = async (): Promise<boolean> => {
    setLoading(true);
    const isAvailable = await checkBackendConnection();

    if (isAvailable) {
      await loadUserData();
    }

    setLoading(false);
    return isAvailable;
  };

  // Load user data from backend
  const loadUserData = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      if (token) {
        apiClient.setAuthToken(token);
        const user = await BackendAuthService.getCurrentUser();

        if (user) {
          setCurrentUser(user);
          setUserRole(user.role as UserRole || UserRole.DEVELOPER);
        } else {
          // Token inválido o expirado
          setCurrentUser(null);
          BackendAuthService.logout();
        }
      } else {
        setCurrentUser(null);
      }
    } catch (error: unknown) { // Use `unknown` instead of `any`
      console.error("Failed to load user data:", error);
      setCurrentUser(null);
      BackendAuthService.logout();
    }
  };

  useEffect(() => {
    const initializeAuth = async () => {
      await checkBackendConnection();
      await loadUserData();
      setLoading(false);
    };

    initializeAuth();
  }, []);

  const login = async (username: string, password: string) => {
    try {
      setError(null);
      setLoading(true);

      await BackendAuthService.login(username, password);
      await loadUserData();

      setLoading(false);
    } catch (err: unknown) { // Use `unknown` instead of `any`
      if (err instanceof Error) {
        setError(err.message || "Error al iniciar sesión");
      } else {
        setError("Error al iniciar sesión");
      }
      setLoading(false);
      throw err;
    }
  };

  const updateProfile = async (data: { fullName?: string, workMode?: string, role?: UserRole }) => {
    try {
      setError(null);

      if (!currentUser) {
        throw new Error("Usuario no autenticado");
      }

      const updatedData: Partial<IUser> = {
        full_name: data.fullName || currentUser.full_name,
        work_mode: data.workMode || currentUser.work_mode,
        role: data.role || currentUser.role,
      };

      // Actualizar el usuario en el backend
      if (currentUser.id) {
        const updatedUser = await apiClient.put<IUser>(`/userlist/${currentUser.id}`, updatedData);

        if (updatedUser) {
          setCurrentUser(updatedUser);
          if (data.role) {
            setUserRole(data.role);
          }
        }
      }

      return true;
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message || "Error al actualizar perfil");
        toast({
          title: "Error",
          description: err.message || "No se pudo actualizar el perfil.",
          variant: "destructive",
        });
      } else {
        setError("Error al actualizar perfil");
        toast({
          title: "Error",
          description: "No se pudo actualizar el perfil.",
          variant: "destructive",
        });
      }
      return false;
    }
  };

  const logout = async () => {
    try {
      setError(null);
      BackendAuthService.logout();
      setCurrentUser(null);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message || "Error al cerrar sesión");
      } else {
        setError("Error al cerrar sesión");
      }
      throw err;
    }
  };

  const value = {
    currentUser,
    userRole,
    loading,
    error,
    isBackendAvailable,
    login,
    logout,
    updateProfile,
    retryBackendConnection
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export default AuthContext;