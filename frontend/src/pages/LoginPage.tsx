import { Link, useLocation } from 'react-router-dom';
import { LoginForm } from '../components/auth/LoginForm';

export function LoginPage() {
  const location = useLocation();
  const justRegistered = Boolean(
    (location.state as { justRegistered?: boolean } | null)?.justRegistered
  );

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
      <div className="w-full max-w-sm space-y-6">
        <div className="text-center">
          <h1 className="text-2xl font-semibold text-slate-900">Sign in</h1>
          <p className="mt-1 text-sm text-slate-500">Booking API demo</p>
        </div>
        {justRegistered && (
          <p className="rounded-md border border-green-300 bg-green-50 px-3 py-2 text-sm text-green-800">
            Account created. Please sign in.
          </p>
        )}
        <LoginForm />
        <p className="text-center text-sm text-slate-500">
          No account yet?{' '}
          <Link to="/register" className="font-medium text-slate-900 underline">
            Register
          </Link>
        </p>
      </div>
    </div>
  );
}
