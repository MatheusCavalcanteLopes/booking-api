import { useState } from 'react';
import { useResources, useDeactivateResource } from '../hooks/useResources';
import { ResourceList } from '../components/resources/ResourceList';
import { ResourceFormDialog } from '../components/admin/ResourceFormDialog';
import { Button } from '../components/ui/Button';
import { Spinner } from '../components/ui/Spinner';
import { ErrorBanner } from '../components/ui/ErrorBanner';
import { useAuth } from '../context/AuthContext';
import { useLocale } from '../i18n/LocaleContext';
import type { Resource } from '../types/api';

type FormTarget = 'new' | Resource | null;

export function ResourcesPage() {
  const { data: resources, isLoading, isError } = useResources();
  const { user } = useAuth();
  const { t } = useLocale();
  const deactivateResource = useDeactivateResource();
  const [formTarget, setFormTarget] = useState<FormTarget>(null);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [editError, setEditError] = useState<string | null>(null);
  const canManage = user?.role === 'ADMIN' || user?.role === 'MANAGER';

  function toggleChecked(id: string) {
    setEditError(null);
    setSelectedIds((current) => {
      const next = new Set(current);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function handleEditSelected() {
    if (selectedIds.size > 1) {
      setEditError(t('resources.editOnlyOneError'));
      return;
    }
    if (selectedIds.size !== 1 || !resources) return;
    setEditError(null);
    const [id] = selectedIds;
    const resource = resources.find((r) => r.id === id);
    if (resource) setFormTarget(resource);
  }

  async function handleDeleteSelected() {
    const confirmed = window.confirm(
      t('resources.deleteSelectedConfirm', { count: String(selectedIds.size) })
    );
    if (!confirmed) return;
    await Promise.all([...selectedIds].map((id) => deactivateResource.mutateAsync(id)));
    setSelectedIds(new Set());
  }

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-xl font-semibold text-slate-900">{t('resources.heading')}</h1>
        {canManage && (
          <button
            type="button"
            onClick={() => setFormTarget((current) => (current === 'new' ? null : 'new'))}
            aria-label={t('resources.newResource')}
            title={t('resources.newResource')}
            className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-900 text-white hover:bg-slate-700"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              fill="currentColor"
              className="h-5 w-5"
            >
              <path d="M10 4a.75.75 0 0 1 .75.75v4.5h4.5a.75.75 0 0 1 0 1.5h-4.5v4.5a.75.75 0 0 1-1.5 0v-4.5h-4.5a.75.75 0 0 1 0-1.5h4.5v-4.5A.75.75 0 0 1 10 4Z" />
            </svg>
          </button>
        )}
      </div>

      {formTarget && (
        <div className="mb-4">
          <ResourceFormDialog
            resource={formTarget === 'new' ? undefined : formTarget}
            onClose={() => setFormTarget(null)}
          />
        </div>
      )}

      {canManage && selectedIds.size > 0 && (
        <div className="mb-4 rounded-lg border border-slate-200 bg-slate-50 px-4 py-2">
          <div className="flex items-center justify-between">
            <span className="text-sm text-slate-600">
              {t('resources.selectedCount', { count: String(selectedIds.size) })}
            </span>
            <div className="flex gap-2">
              <Button
                variant="secondary"
                onClick={() => {
                  setSelectedIds(new Set());
                  setEditError(null);
                }}
              >
                {t('resources.clearSelection')}
              </Button>
              <Button variant="secondary" onClick={handleEditSelected}>
                {t('resources.editSelected')}
              </Button>
              <Button
                variant="danger"
                onClick={handleDeleteSelected}
                disabled={deactivateResource.isPending}
              >
                {t('resources.deleteSelected')}
              </Button>
            </div>
          </div>
          {editError && <p className="mt-2 text-sm text-red-600">{editError}</p>}
        </div>
      )}

      {isLoading && <Spinner />}
      {isError && <ErrorBanner message={t('resources.loadError')} />}
      {resources && (
        <ResourceList
          resources={resources}
          canManage={canManage}
          selectedIds={selectedIds}
          onToggleChecked={toggleChecked}
        />
      )}
    </div>
  );
}
