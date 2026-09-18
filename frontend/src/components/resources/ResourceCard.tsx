import { Button } from '../ui/Button';
import { useLocale } from '../../i18n/LocaleContext';
import type { Resource } from '../../types/api';

interface ResourceCardProps {
  resource: Resource;
  isSelected: boolean;
  onToggleBook: () => void;
  canManage: boolean;
  isChecked: boolean;
  onToggleChecked: () => void;
}

export function ResourceCard({
  resource,
  isSelected,
  onToggleBook,
  canManage,
  isChecked,
  onToggleChecked,
}: ResourceCardProps) {
  const { t } = useLocale();

  return (
    <div className="flex items-start justify-between rounded-lg border border-slate-200 bg-white p-4">
      <div className="flex items-start gap-3">
        {canManage && (
          <input
            type="checkbox"
            checked={isChecked}
            onChange={onToggleChecked}
            aria-label={resource.name}
            className="mt-1 h-4 w-4 rounded border-slate-300"
          />
        )}
        <div>
          <h3 className="font-medium text-slate-900">{resource.name}</h3>
          {resource.description && (
            <p className="mt-1 text-sm text-slate-500">{resource.description}</p>
          )}
          <p className="mt-2 text-xs text-slate-400">
            {t('resources.capacity')} {resource.capacity}
            {resource.location ? ` · ${resource.location}` : ''}
          </p>
        </div>
      </div>
      <Button variant={isSelected ? 'secondary' : 'primary'} onClick={onToggleBook}>
        {isSelected ? t('resources.close') : t('resources.book')}
      </Button>
    </div>
  );
}
