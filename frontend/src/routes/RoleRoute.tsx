import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import type { Role } from '../types/api';

interface RoleRouteProps {
  allowedRoles: Role[];
  // A "Try as Admin" preview carries role:'ADMIN' too (see AuthContext),
  // so allowedRoles alone can't distinguish a preview from a genuine
  // admin. Pass this for routes where that distinction actually matters.
  requireGenuine?: boolean;
}

// This gate is UX only — it just avoids showing a page whose mutations
// would 403 anyway. The API's `authorize()` middleware (and, for the
// requireGenuine case, the service-layer genuine-admin check) is the
// real security boundary; this component never should be treated as one.
export function RoleRoute({ allowedRoles, requireGenuine }: RoleRouteProps) {
  const { user, isAuthenticated } = useAuth();

  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (!user || !allowedRoles.includes(user.role)) {
    return <Navigate to="/resources" replace />;
  }
  if (requireGenuine && user.previewRole) {
    return <Navigate to="/resources" replace />;
  }
  return <Outlet />;
}
