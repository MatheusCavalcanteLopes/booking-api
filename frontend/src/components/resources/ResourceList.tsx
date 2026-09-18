import { useState } from 'react';
import { ResourceCard } from './ResourceCard';
import { BookingForm } from './BookingForm';
import { useLocale } from '../../i18n/LocaleContext';
import type { Resource } from '../../types/api';

interface ResourceListProps {
  resources: Resource[];
  canManage: boolean;
  selectedIds: Set<string>;
  onToggleChecked: (id: string) => void;
}

export function ResourceList({ resources, canManage, selectedIds, onToggleChecked }: ResourceListProps) {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const { t } = useLocale();

  if (resources.length === 0) {
    return <p className="text-sm text-slate-500">{t('resources.empty')}</p>;
  }

  return (
    <div className="space-y-3">
      {resources.map((resource) => (
        <div key={resource.id} className="space-y-2">
          <ResourceCard
            resource={resource}
            isSelected={selectedId === resource.id}
            canManage={canManage}
            isChecked={selectedIds.has(resource.id)}
            onToggleChecked={() => onToggleChecked(resource.id)}
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
