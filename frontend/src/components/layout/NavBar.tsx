import { NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../ui/Button';

const linkClass = ({ isActive }: { isActive: boolean }) =>
  `text-sm font-medium ${isActive ? 'text-slate-900' : 'text-slate-500 hover:text-slate-700'}`;

export function NavBar() {
  const { user, logout } = useAuth();
  const isPrivileged = user?.role === 'ADMIN' || user?.role === 'MANAGER';

  return (
    <header className="border-b border-slate-200 bg-white">
      <nav className="mx-auto flex max-w-4xl items-center justify-between px-4 py-3">
        <div className="flex items-center gap-6">
          <span className="font-semibold text-slate-900">Booking API</span>
          <NavLink to="/resources" className={linkClass}>
            Resources
          </NavLink>
          <NavLink to="/my-bookings" className={linkClass}>
            My bookings
          </NavLink>
          {isPrivileged && (
            <NavLink to="/admin/resources" className={linkClass}>
              Admin
            </NavLink>
          )}
        </div>
        <div className="flex items-center gap-3">
          <span className="text-sm text-slate-500">{user?.name}</span>
          <Button variant="secondary" onClick={logout}>
            Log out
          </Button>
        </div>
      </nav>
    </header>
  );
}
