import { useMutation, useQueryClient } from '@tanstack/react-query';
import * as adminApi from '../api/admin.api';

const resourcesKey = ['resources'] as const;
const myBookingsKey = ['bookings', 'me'] as const;

export function useResetResources() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: adminApi.resetResources,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: resourcesKey }),
  });
}

export function useResetMyBookings() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: adminApi.resetMyBookings,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: myBookingsKey }),
  });
}

export function useResetAll() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: adminApi.resetAll,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: resourcesKey });
      queryClient.invalidateQueries({ queryKey: myBookingsKey });
    },
  });
}
