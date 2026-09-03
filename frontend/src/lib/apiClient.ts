import axios, { type InternalAxiosRequestConfig } from 'axios';
import { tokenStorage } from './tokenStorage';
import type { AuthTokens } from '../types/api';

const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:3000';

export const apiClient = axios.create({ baseURL: API_URL });

// Set once by AuthContext on mount, so the interceptor (created outside the
// React tree) can force a logout when even a refreshed token gets rejected.
let onSessionExpired: () => void = () => {};
export function setSessionExpiredHandler(handler: () => void): void {
  onSessionExpired = handler;
}

apiClient.interceptors.request.use((config) => {
  const session = tokenStorage.get();
  if (session?.accessToken) {
    config.headers.Authorization = `Bearer ${session.accessToken}`;
  }
  return config;
});

interface RetriableConfig extends InternalAxiosRequestConfig {
  _retry?: boolean;
}

// Concurrent 401s (e.g. two queries firing at once) share one in-flight
// refresh call instead of each independently rotating the refresh token.
let refreshPromise: Promise<AuthTokens> | null = null;

async function refreshTokens(): Promise<AuthTokens> {
  const session = tokenStorage.get();
  if (!session) throw new Error('No session to refresh');

  const { data } = await axios.post<AuthTokens>(`${API_URL}/auth/refresh`, {
    refreshToken: session.refreshToken,
  });
  tokenStorage.setTokens(data);
  return data;
}

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const config = error.config as RetriableConfig | undefined;
    const status = error.response?.status;
    const isAuthEndpoint =
      config?.url?.includes('/auth/refresh') || config?.url?.includes('/auth/login');

    if (status !== 401 || !config || config._retry || isAuthEndpoint) {
      return Promise.reject(error);
    }

    config._retry = true;

    try {
      refreshPromise ??= refreshTokens().finally(() => {
        refreshPromise = null;
      });
      const tokens = await refreshPromise;
      config.headers.Authorization = `Bearer ${tokens.accessToken}`;
      return apiClient(config);
    } catch (refreshError) {
      tokenStorage.clear();
      onSessionExpired();
      return Promise.reject(refreshError);
    }
  }
);
