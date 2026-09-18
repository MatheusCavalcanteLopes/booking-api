import { apiClient } from '../lib/apiClient';
import type { LoginResponse, Locale, User } from '../types/api';

export async function updateLocale(locale: Locale): Promise<User> {
  const { data } = await apiClient.patch<{ user: User }>('/users/me', { locale });
  return data.user;
}

export async function setAdminPreview(enabled: boolean): Promise<LoginResponse> {
  const { data } = await apiClient.patch<LoginResponse>('/users/me/admin-preview', { enabled });
  return data;
}
