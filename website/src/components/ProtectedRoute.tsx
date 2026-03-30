import { Navigate } from 'react-router-dom';
import { Center, Loader } from '@mantine/core';
import { useAuth } from '../context/AuthContext';
import type { ReactNode } from 'react';

interface Props {
  children: ReactNode;
  requireAdmin?: boolean;
  requireManager?: boolean;
}

export function ProtectedRoute({ children, requireAdmin, requireManager }: Props) {
  const { user, loading, isAdmin, isManager } = useAuth();

  if (loading) {
    return <Center h={200}><Loader /></Center>;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (requireAdmin && !isAdmin) {
    return <Navigate to="/" replace />;
  }

  if (requireManager && !isManager && !isAdmin) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}
