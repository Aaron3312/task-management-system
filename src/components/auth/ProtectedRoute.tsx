'use client';

import { UserRole } from '@/core/interfaces/models';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRoles?: UserRole[];
}

// Componente simplificado - sin autenticación real para demo
const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  // En modo demo, simplemente renderizar los children
  return <>{children}</>;
};

export default ProtectedRoute;
