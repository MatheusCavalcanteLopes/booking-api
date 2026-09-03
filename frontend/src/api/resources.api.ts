import { apiClient } from '../lib/apiClient';
import type { CreateResourceInput, Resource, UpdateResourceInput } from '../types/api';

export async function listResources(): Promise<Resource[]> {
  const { data } = await apiClient.get<{ resources: Resource[] }>('/resources');
  return data.resources;
}

export async function createResource(input: CreateResourceInput): Promise<Resource> {
  const { data } = await apiClient.post<{ resource: Resource }>('/resources', input);
  return data.resource;
}

export async function updateResource(
  id: string,
  input: UpdateResourceInput
): Promise<Resource> {
  const { data } = await apiClient.patch<{ resource: Resource }>(`/resources/${id}`, input);
  return data.resource;
}

export async function deactivateResource(id: string): Promise<void> {
  await apiClient.delete(`/resources/${id}`);
}
