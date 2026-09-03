import { Button } from '../ui/Button';
import type { Resource } from '../../types/api';

interface ResourceCardProps {
  resource: Resource;
  isSelected: boolean;
  onToggleBook: () => void;
}

export function ResourceCard({ resource, isSelected, onToggleBook }: ResourceCardProps) {
  return (
    <div className="flex items-start justify-between rounded-lg border border-slate-200 bg-white p-4">
      <div>
        <h3 className="font-medium text-slate-900">{resource.name}</h3>
        {resource.description && (
          <p className="mt-1 text-sm text-slate-500">{resource.description}</p>
        )}
        <p className="mt-2 text-xs text-slate-400">
          Capacity {resource.capacity}
          {resource.location ? ` · ${resource.location}` : ''}
        </p>
      </div>
      <Button variant={isSelected ? 'secondary' : 'primary'} onClick={onToggleBook}>
        {isSelected ? 'Close' : 'Book'}
      </Button>
    </div>
  );
}
