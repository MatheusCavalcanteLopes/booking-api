import { useState } from 'react';
import { ResourceCard } from './ResourceCard';
import { BookingForm } from './BookingForm';
import type { Resource } from '../../types/api';

export function ResourceList({ resources }: { resources: Resource[] }) {
  const [selectedId, setSelectedId] = useState<string | null>(null);

  if (resources.length === 0) {
    return <p className="text-sm text-slate-500">No resources available yet.</p>;
  }

  return (
    <div className="space-y-3">
      {resources.map((resource) => (
        <div key={resource.id} className="space-y-2">
          <ResourceCard
            resource={resource}
            isSelected={selectedId === resource.id}
            onToggleBook={() =>
              setSelectedId((current) => (current === resource.id ? null : resource.id))
            }
          />
          {selectedId === resource.id && (
            <BookingForm resource={resource} onClose={() => setSelectedId(null)} />
          )}
        </div>
      ))}
    </div>
  );
}
