import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { ProtectedRoute } from '../routes/ProtectedRoute';

const authState = vi.hoisted(() => ({
  current: { isAuthenticated: false },
}));

vi.mock('../context/AuthContext', () => ({
  useAuth: () => authState.current,
}));

function renderAt(path: string) {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <Routes>
        <Route path="/login" element={<div>Login page</div>} />
        <Route element={<ProtectedRoute />}>
          <Route path="/secret" element={<div>Secret content</div>} />
        </Route>
      </Routes>
    </MemoryRouter>
  );
}

describe('ProtectedRoute', () => {
  it('redirects to /login when not authenticated', () => {
    authState.current = { isAuthenticated: false };
    renderAt('/secret');

    expect(screen.getByText('Login page')).toBeInTheDocument();
    expect(screen.queryByText('Secret content')).not.toBeInTheDocument();
  });

  it('renders the protected content when authenticated', () => {
    authState.current = { isAuthenticated: true };
    renderAt('/secret');

    expect(screen.getByText('Secret content')).toBeInTheDocument();
  });
});
