import { apiClient } from '../lib/apiClient';
import type { LoginResponse, User } from '../types/api';

export interface RegisterInput {
  name: string;
  email: string;
  password: string;
}

export interface LoginInput {
  email: string;
  password: string;
}

export async function register(input: RegisterInput): Promise<User> {
  const { data } = await apiClient.post<{ user: User }>('/auth/register', input);
  return data.user;
}

export async function login(input: LoginInput): Promise<LoginResponse> {
  const { data } = await apiClient.post<LoginResponse>('/auth/login', input);
  return data;
}
