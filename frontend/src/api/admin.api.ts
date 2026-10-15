import { apiClient } from '../lib/apiClient';

export async function resetResources(): Promise<void> {
  await apiClient.post('/admin/reset/resources');
}

export async function resetMyBookings(): Promise<void> {
  await apiClient.post('/admin/reset/my-bookings');
}

export async function resetAll(): Promise<void> {
  await apiClient.post('/admin/reset/all');
}
