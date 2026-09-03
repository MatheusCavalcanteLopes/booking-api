import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 30_000,
      refetchOnWindowFocus: false,
    },
    mutations: {
      // A rejected POST/PATCH/DELETE here is a terminal validation/conflict
      // error, not a transient network blip — retrying would just resubmit.
      retry: false,
    },
  },
});
