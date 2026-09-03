import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import type { Role } from '../types/api';

interface RoleRouteProps {
  allowedRoles: Role[];
}

// This gate is UX only — it just avoids showing a page whose mutations
// would 403 anyway. The API's `authorize()` middleware is the real
// security boundary; this component never should be treated as one.
export function RoleRoute({ allowedRoles }: RoleRouteProps) {
  const { user, isAuthenticated } = useAuth();

  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (!user || !allowedRoles.includes(user.role)) {
    return <Navigate to="/resources" replace />;
  }
  return <Outlet />;
}
