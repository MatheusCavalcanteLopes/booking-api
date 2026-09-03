import { useResources } from '../hooks/useResources';
import { ResourceTable } from '../components/admin/ResourceTable';
import { Spinner } from '../components/ui/Spinner';
import { ErrorBanner } from '../components/ui/ErrorBanner';

export function AdminResourcesPage() {
  const { data: resources, isLoading, isError } = useResources();

  return (
    <div>
      <h1 className="mb-1 text-xl font-semibold text-slate-900">Manage resources</h1>
      <p className="mb-4 text-sm text-slate-500">
        Deactivating a resource is permanent from this screen — it's a soft delete with no
        reactivation path in the current API, so past booking history is preserved but the
        resource itself won't reappear here.
      </p>
      {isLoading && <Spinner />}
      {isError && <ErrorBanner message="Could not load resources." />}
      {resources && <ResourceTable resources={resources} />}
    </div>
  );
}
