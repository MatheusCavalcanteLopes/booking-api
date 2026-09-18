import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { useQueryClient } from '@tanstack/react-query';
import * as authApi from '../api/auth.api';
import * as usersApi from '../api/users.api';
import { setSessionExpiredHandler } from '../lib/apiClient';
import { tokenStorage } from '../lib/tokenStorage';
import type { User } from '../types/api';

interface AuthContextValue {
  user: User | null;
  isAuthenticated: boolean;
  isPreviewingAdmin: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  enterAdminPreview: () => Promise<void>;
  exitAdminPreview: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  // There's no /auth/me endpoint to re-verify against, and localStorage is
  // synchronous, so the cached user from the last login can be read
  // directly as the initial state — no loading flash, no effect needed.
  const [user, setUser] = useState<User | null>(() => tokenStorage.get()?.user ?? null);
  const queryClient = useQueryClient();

  const logout = useCallback(() => {
    tokenStorage.clear();
    setUser(null);
    // Prevents a next login (possibly as a different user) from seeing
    // this session's cached resources/bookings.
    queryClient.clear();
  }, [queryClient]);

  useEffect(() => {
    setSessionExpiredHandler(logout);
  }, [logout]);

  const login = useCallback(async (email: string, password: string) => {
    const result = await authApi.login({ email, password });
    tokenStorage.set({
      accessToken: result.accessToken,
      refreshToken: result.refreshToken,
      user: result.user,
    });
    setUser(result.user);
  }, []);

  const register = useCallback(async (name: string, email: string, password: string) => {
    // The API doesn't return tokens on register, so there's deliberately
    // no auto-login here — the caller routes to /login on success.
    await authApi.register({ name, email, password });
  }, []);

  // Temporarily elevates THIS SAME account to ADMIN — same bookings, same
  // trash, same everything, just with admin permissions for a while — so a
  // visitor with a regular account can exercise the real admin flow against
  // the real API, not a mocked-up version. See src/modules/users on the
  // backend: the role change is self-service and reversible, and only ever
  // touches the caller's own row.
  const enterAdminPreview = useCallback(async () => {
    const result = await usersApi.setAdminPreview(true);
    tokenStorage.set({
      accessToken: result.accessToken,
      refreshToken: result.refreshToken,
      user: result.user,
    });
    setUser(result.user);
    queryClient.invalidateQueries();
  }, [queryClient]);

  const exitAdminPreview = useCallback(async () => {
    const result = await usersApi.setAdminPreview(false);
    tokenStorage.set({
      accessToken: result.accessToken,
      refreshToken: result.refreshToken,
      user: result.user,
    });
    setUser(result.user);
    queryClient.invalidateQueries();
  }, [queryClient]);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      isAuthenticated: user !== null,
      isPreviewingAdmin: Boolean(user?.previewRole),
      login,
      register,
      logout,
      enterAdminPreview,
      exitAdminPreview,
    }),
    [user, login, register, logout, enterAdminPreview, exitAdminPreview]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
  return ctx;
}
