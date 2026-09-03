import { useState } from 'react';
import { useDeactivateResource } from '../../hooks/useResources';
import { ResourceFormDialog } from './ResourceFormDialog';
import { Button } from '../ui/Button';
import type { Resource } from '../../types/api';

type FormTarget = 'new' | Resource | null;

export function ResourceTable({ resources }: { resources: Resource[] }) {
  const [formTarget, setFormTarget] = useState<FormTarget>(null);
  const deactivateResource = useDeactivateResource();

  async function handleDeactivate(resource: Resource) {
    const confirmed = window.confirm(
      `Deactivate "${resource.name}"? It will disappear from every list (soft delete — past bookings are preserved).`
    );
    if (confirmed) await deactivateResource.mutateAsync(resource.id);
  }

  return (
    <div className="space-y-3">
      <div className="flex justify-end">
        <Button onClick={() => setFormTarget('new')}>New resource</Button>
      </div>

      {formTarget === 'new' && (
        <ResourceFormDialog onClose={() => setFormTarget(null)} />
      )}

      {resources.length === 0 && (
        <p className="text-sm text-slate-500">No active resources.</p>
      )}

      {resources.map((resource) => (
        <div key={resource.id} className="space-y-2">
          <div className="flex items-center justify-between rounded-lg border border-slate-200 bg-white p-4">
            <div>
              <h3 className="font-medium text-slate-900">{resource.name}</h3>
              <p className="text-xs text-slate-400">
                Capacity {resource.capacity}
                {resource.location ? ` · ${resource.location}` : ''}
              </p>
            </div>
            <div className="flex gap-2">
              <Button variant="secondary" onClick={() => setFormTarget(resource)}>
                Edit
              </Button>
              <Button variant="danger" onClick={() => handleDeactivate(resource)}>
                Deactivate
              </Button>
            </div>
          </div>
          {formTarget !== 'new' && formTarget?.id === resource.id && (
            <ResourceFormDialog resource={resource} onClose={() => setFormTarget(null)} />
          )}
        </div>
      ))}
    </div>
  );
}
