import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { RoleRoute } from '../routes/RoleRoute';
import type { Role, User } from '../types/api';

const authState = vi.hoisted(() => ({
  current: { isAuthenticated: true, user: null as User | null },
}));

vi.mock('../context/AuthContext', () => ({
  useAuth: () => authState.current,
}));

function userWithRole(role: Role): User {
  return { id: 'u1', name: 'Test User', email: 'test@example.com', role };
}

function renderAdminRoute() {
  return render(
    <MemoryRouter initialEntries={['/admin/resources']}>
      <Routes>
        <Route path="/resources" element={<div>Resources page</div>} />
        <Route element={<RoleRoute allowedRoles={['ADMIN', 'MANAGER']} />}>
          <Route path="/admin/resources" element={<div>Admin table</div>} />
        </Route>
      </Routes>
    </MemoryRouter>
  );
}

describe('RoleRoute', () => {
  it('redirects a USER away from an admin-only route', () => {
    authState.current = { isAuthenticated: true, user: userWithRole('USER') };
    renderAdminRoute();

    expect(screen.getByText('Resources page')).toBeInTheDocument();
    expect(screen.queryByText('Admin table')).not.toBeInTheDocument();
  });

  it('renders the admin route for a MANAGER', () => {
    authState.current = { isAuthenticated: true, user: userWithRole('MANAGER') };
    renderAdminRoute();

    expect(screen.getByText('Admin table')).toBeInTheDocument();
  });
});
