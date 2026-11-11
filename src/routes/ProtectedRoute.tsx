import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export function ProtectedRoute({ adminOnly = false, superAdminOnly = false }: { adminOnly?: boolean; superAdminOnly?: boolean }) {
  const { isAuthenticated, isAdmin, isSuperAdmin } = useAuth();
  if (!isAuthenticated) return <Navigate to="/" replace />;
  if (superAdminOnly && !isSuperAdmin) return <Navigate to={isAdmin ? '/admin' : '/'} replace />;
  if (adminOnly && !isAdmin) return <Navigate to="/" replace />;
  return <Outlet />;
}

export function GuestRoute() {
  const { isAuthenticated, isAdmin } = useAuth();
  if (isAuthenticated) return <Navigate to={isAdmin ? '/admin' : '/'} replace />;
  return <Outlet />;
}
