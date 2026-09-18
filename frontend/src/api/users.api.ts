import { apiClient } from '../lib/apiClient';
import type { Locale, User } from '../types/api';

export async function updateLocale(locale: Locale): Promise<User> {
  const { data } = await apiClient.patch<{ user: User }>('/users/me', { locale });
  return data.user;
}
