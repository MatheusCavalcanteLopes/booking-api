import { useState } from 'react';
import { useResetResources, useResetMyBookings, useResetAll } from '../hooks/useAdmin';
import { useLocale } from '../i18n/LocaleContext';
import { translateErrorMessage } from '../i18n/errorMessages';
import { formatApiError } from '../lib/formatApiError';
import { Button } from '../components/ui/Button';
import { ErrorBanner } from '../components/ui/ErrorBanner';

export function AdminPage() {
  const { t } = useLocale();
  const resetResources = useResetResources();
  const resetMyBookings = useResetMyBookings();
  const resetAll = useResetAll();
  const [feedback, setFeedback] = useState<{ kind: 'success' | 'error'; message: string } | null>(
    null
  );

  const isPending = resetResources.isPending || resetMyBookings.isPending || resetAll.isPending;

  async function runAction(confirmMessage: string, mutateAsync: () => Promise<void>) {
    if (!window.confirm(confirmMessage)) return;
    setFeedback(null);
    try {
      await mutateAsync();
      setFeedback({ kind: 'success', message: t('adminPanel.success') });
    } catch (error) {
      setFeedback({
        kind: 'error',
        message: translateErrorMessage(formatApiError(error).message, t),
      });
    }
  }

  return (
    <div>
      <h1 className="mb-1 text-xl font-semibold text-slate-900 dark:text-slate-100">
        {t('adminPanel.heading')}
      </h1>
      <p className="mb-4 text-sm text-slate-500 dark:text-slate-400">{t('adminPanel.description')}</p>

      {feedback && (
        <div className="mb-4">
          {feedback.kind === 'success' ? (
            <p className="rounded-md border border-green-300 bg-green-50 px-3 py-2 text-sm text-green-800 dark:border-green-800 dark:bg-green-950 dark:text-green-300">
              {feedback.message}
            </p>
          ) : (
            <ErrorBanner message={feedback.message} />
          )}
        </div>
      )}

      <div className="flex flex-wrap gap-3">
        <Button
          variant="danger"
          disabled={isPending}
          onClick={() =>
            runAction(t('adminPanel.confirmClearResources'), () => resetResources.mutateAsync())
          }
        >
          {t('adminPanel.clearResources')}
        </Button>
        <Button
          variant="danger"
          disabled={isPending}
          onClick={() =>
            runAction(t('adminPanel.confirmClearMyBookings'), () =>
              resetMyBookings.mutateAsync()
            )
          }
        >
          {t('adminPanel.clearMyBookings')}
        </Button>
        <Button
          variant="danger"
          disabled={isPending}
          onClick={() => runAction(t('adminPanel.confirmClearAll'), () => resetAll.mutateAsync())}
        >
          {t('adminPanel.clearAll')}
        </Button>
      </div>
    </div>
  );
}
