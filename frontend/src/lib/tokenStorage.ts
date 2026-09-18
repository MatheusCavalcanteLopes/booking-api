import type { User } from '../types/api';

interface StoredSession {
  accessToken: string;
  refreshToken: string;
  user: User;
}

const STORAGE_KEY = 'booking-api.session';

// The only module allowed to touch localStorage directly, so every other
// module (apiClient, AuthContext, LocaleContext) can be tested/reasoned
// about without caring where the session actually lives.
export const tokenStorage = {
  get(): StoredSession | null {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    try {
      return JSON.parse(raw) as StoredSession;
    } catch {
      return null;
    }
  },

  set(session: StoredSession): void {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
  },

  // /auth/refresh rotates both tokens but doesn't return `user`, so callers
  // update just the token pair while keeping the previously stored user.
  setTokens(tokens: { accessToken: string; refreshToken: string }): void {
    const current = tokenStorage.get();
    if (!current) return;
    tokenStorage.set({ ...current, ...tokens });
  },

  // Used after a successful PATCH /users/me locale change, so a reload
  // before the next login still shows the right language immediately.
  updateCachedUser(patch: Partial<User>): void {
    const current = tokenStorage.get();
    if (!current) return;
    tokenStorage.set({ ...current, user: { ...current.user, ...patch } });
  },

  clear(): void {
    localStorage.removeItem(STORAGE_KEY);
  },
};
