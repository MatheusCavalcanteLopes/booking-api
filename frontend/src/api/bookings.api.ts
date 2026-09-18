import { apiClient } from '../lib/apiClient';
import type { Booking, CreateBookingInput } from '../types/api';

export async function createBooking(input: CreateBookingInput): Promise<Booking> {
  const { data } = await apiClient.post<{ booking: Booking }>('/bookings', input);
  return data.booking;
}

export async function listMyBookings(): Promise<Booking[]> {
  const { data } = await apiClient.get<{ bookings: Booking[] }>('/bookings/me');
  return data.bookings;
}

export async function cancelBooking(id: string): Promise<Booking> {
  const { data } = await apiClient.delete<{ booking: Booking }>(`/bookings/${id}`);
  return data.booking;
}

export async function clearTrash(): Promise<void> {
  await apiClient.delete('/bookings/trash');
}
