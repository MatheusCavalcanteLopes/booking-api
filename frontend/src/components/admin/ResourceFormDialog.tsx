import { useState, type FormEvent } from 'react';
import { useCreateResource, useUpdateResource } from '../../hooks/useResources';
import { useLocale } from '../../i18n/LocaleContext';
import { translateErrorMessage } from '../../i18n/errorMessages';
import { formatApiError } from '../../lib/formatApiError';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { ErrorBanner } from '../ui/ErrorBanner';
import type { Resource } from '../../types/api';

interface ResourceFormDialogProps {
  resource?: Resource;
  onClose: () => void;
}

export function ResourceFormDialog({ resource, onClose }: ResourceFormDialogProps) {
  const { t } = useLocale();
  const isEditing = Boolean(resource);
  const [name, setName] = useState(resource?.name ?? '');
  const [description, setDescription] = useState(resource?.description ?? '');
  const [capacity, setCapacity] = useState(String(resource?.capacity ?? 1));
  const [location, setLocation] = useState(resource?.location ?? '');
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState<string | null>(null);

  const createResource = useCreateResource();
  const updateResource = useUpdateResource();
  const isSubmitting = createResource.isPending || updateResource.isPending;

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setFieldErrors({});
    setFormError(null);

    const input = {
      name,
      description: description || undefined,
      capacity: Number(capacity),
      location: location || undefined,
    };

    try {
      if (isEditing && resource) {
        await updateResource.mutateAsync({ id: resource.id, input });
      } else {
        await createResource.mutateAsync(input);
      }
      onClose();
    } catch (error) {
      const formatted = formatApiError(error);
      if (formatted.kind === 'validation') {
        const translated: Record<string, string> = {};
        for (const [field, message] of Object.entries(formatted.fields)) {
          translated[field] = translateErrorMessage(message, t);
        }
        setFieldErrors(translated);
      } else {
        setFormError(translateErrorMessage(formatted.message, t));
      }
    }
  }

  return (
    <div className="rounded-lg border border-slate-200 bg-white p-4">
      <h3 className="mb-3 font-semibold text-slate-900">
        {isEditing
          ? t('admin.resourceForm.editHeading', { name: resource?.name ?? '' })
          : t('admin.resourceForm.newHeading')}
      </h3>
      <form onSubmit={handleSubmit} className="space-y-4">
        {formError && <ErrorBanner message={formError} />}
        <Input
          label={t('admin.resourceForm.name')}
          value={name}
          onChange={(e) => setName(e.target.value)}
          error={fieldErrors.name}
          required
        />
        <Input
          label={t('admin.resourceForm.description')}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          error={fieldErrors.description}
        />
        <Input
          label={t('admin.resourceForm.capacity')}
          type="number"
          min={1}
          value={capacity}
          onChange={(e) => setCapacity(e.target.value)}
          error={fieldErrors.capacity}
          required
        />
        <Input
          label={t('admin.resourceForm.location')}
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          error={fieldErrors.location}
        />
        <div className="flex gap-2">
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? t('admin.resourceForm.saving') : t('admin.resourceForm.save')}
          </Button>
          <Button type="button" variant="secondary" onClick={onClose}>
            {t('admin.resourceForm.cancel')}
          </Button>
        </div>
      </form>
    </div>
  );
}
