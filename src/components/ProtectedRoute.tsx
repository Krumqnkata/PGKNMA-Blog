import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/use-auth';
import { loginPath } from '@/lib/auth-paths';
import { PencilLoader } from '@/components/art/PencilLoader';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <PencilLoader />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to={loginPath(`${location.pathname}${location.search}${location.hash}`)} replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
