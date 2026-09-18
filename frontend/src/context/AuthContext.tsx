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
import { setSessionExpiredHandler } from '../lib/apiClient';
import { tokenStorage } from '../lib/tokenStorage';
import { DEMO_ADMIN_EMAIL, DEMO_ADMIN_PASSWORD } from '../lib/constants';
import type { User } from '../types/api';

interface AuthContextValue {
  user: User | null;
  isAuthenticated: boolean;
  isPreviewingAdmin: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  enterAdminPreview: () => Promise<void>;
  exitAdminPreview: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  // There's no /auth/me endpoint to re-verify against, and localStorage is
  // synchronous, so the cached user from the last login can be read
  // directly as the initial state — no loading flash, no effect needed.
  const [user, setUser] = useState<User | null>(() => tokenStorage.get()?.user ?? null);
  const [isPreviewingAdmin, setIsPreviewingAdmin] = useState(() => tokenStorage.hasStashedOriginal());
  const queryClient = useQueryClient();

  const logout = useCallback(() => {
    tokenStorage.discardStash();
    tokenStorage.clear();
    setUser(null);
    setIsPreviewingAdmin(false);
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

  // Swaps the active session for the seeded demo admin, real API calls
  // and all — a portfolio visitor with a regular account can actually
  // exercise the admin screens, not just look at a mocked-up version.
  const enterAdminPreview = useCallback(async () => {
    if (isPreviewingAdmin || !user || user.role !== 'USER') return;

    tokenStorage.stashOriginal();
    try {
      const result = await authApi.login({
        email: DEMO_ADMIN_EMAIL,
        password: DEMO_ADMIN_PASSWORD,
      });
      tokenStorage.set({
        accessToken: result.accessToken,
        refreshToken: result.refreshToken,
        user: result.user,
      });
      setUser(result.user);
      setIsPreviewingAdmin(true);
      queryClient.clear();
    } catch (error) {
      // Nothing was swapped in storage yet beyond the stash — discard it
      // so the user isn't left with a dangling "restore" target.
      tokenStorage.discardStash();
      throw error;
    }
  }, [isPreviewingAdmin, user, queryClient]);

  const exitAdminPreview = useCallback(() => {
    const restored = tokenStorage.restoreOriginal();
    if (!restored) return;
    setUser(restored.user);
    setIsPreviewingAdmin(false);
    queryClient.clear();
  }, [queryClient]);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      isAuthenticated: user !== null,
      isPreviewingAdmin,
      login,
      register,
      logout,
      enterAdminPreview,
      exitAdminPreview,
    }),
    [user, isPreviewingAdmin, login, register, logout, enterAdminPreview, exitAdminPreview]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
  return ctx;
}
