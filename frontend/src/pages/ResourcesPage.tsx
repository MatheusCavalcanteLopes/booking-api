import { useResources } from '../hooks/useResources';
import { ResourceList } from '../components/resources/ResourceList';
import { Spinner } from '../components/ui/Spinner';
import { ErrorBanner } from '../components/ui/ErrorBanner';

export function ResourcesPage() {
  const { data: resources, isLoading, isError } = useResources();

  return (
    <div>
      <h1 className="mb-4 text-xl font-semibold text-slate-900">Resources</h1>
      {isLoading && <Spinner />}
      {isError && <ErrorBanner message="Could not load resources." />}
      {resources && <ResourceList resources={resources} />}
    </div>
  );
}
