import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import * as bookingsApi from '../api/bookings.api';
import type { CreateBookingInput } from '../types/api';

const myBookingsKey = ['bookings', 'me'] as const;
const resourcesKey = ['resources'] as const;

export function useMyBookings() {
  return useQuery({ queryKey: myBookingsKey, queryFn: bookingsApi.listMyBookings });
}

export function useCreateBooking() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateBookingInput) => bookingsApi.createBooking(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: myBookingsKey });
      queryClient.invalidateQueries({ queryKey: resourcesKey });
    },
  });
}

export function useCancelBooking() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => bookingsApi.cancelBooking(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: myBookingsKey }),
  });
}

export function useClearTrash() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => bookingsApi.clearTrash(),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: myBookingsKey }),
  });
}
