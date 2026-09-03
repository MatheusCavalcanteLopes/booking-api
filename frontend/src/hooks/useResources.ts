import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import * as resourcesApi from '../api/resources.api';
import type { CreateResourceInput, UpdateResourceInput } from '../types/api';

const resourcesKey = ['resources'] as const;

export function useResources() {
  return useQuery({ queryKey: resourcesKey, queryFn: resourcesApi.listResources });
}

export function useCreateResource() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateResourceInput) => resourcesApi.createResource(input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: resourcesKey }),
  });
}

export function useUpdateResource() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: UpdateResourceInput }) =>
      resourcesApi.updateResource(id, input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: resourcesKey }),
  });
}

export function useDeactivateResource() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => resourcesApi.deactivateResource(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: resourcesKey }),
  });
}
