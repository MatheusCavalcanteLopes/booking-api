import { Navigate, Route, Routes } from 'react-router-dom';
import { AppLayout } from './components/layout/AppLayout';
import { ProtectedRoute } from './routes/ProtectedRoute';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { ResourcesPage } from './pages/ResourcesPage';
import { MyBookingsPage } from './pages/MyBookingsPage';

export function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />

      <Route element={<ProtectedRoute />}>
        <Route element={<AppLayout />}>
          <Route path="/" element={<Navigate to="/resources" replace />} />
          {/* Admin/manager resource management (create/edit/deactivate) now
              lives inline on this same page, gated by role — see
              ResourcesPage's canManage check — rather than a separate route. */}
          <Route path="/resources" element={<ResourcesPage />} />
          <Route path="/my-bookings" element={<MyBookingsPage />} />
        </Route>
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
