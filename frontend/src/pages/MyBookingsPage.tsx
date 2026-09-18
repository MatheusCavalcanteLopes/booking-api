import { useMemo, useState } from 'react';
import { useMyBookings, useClearTrash } from '../hooks/useBookings';
import { BookingList } from '../components/bookings/BookingList';
import { Button } from '../components/ui/Button';
import { Spinner } from '../components/ui/Spinner';
import { ErrorBanner } from '../components/ui/ErrorBanner';
import { useLocale } from '../i18n/LocaleContext';

type Tab = 'active' | 'trash';

const tabClass = (isActive: boolean) =>
  `border-b-2 px-3 py-2 text-sm font-medium ${
    isActive ? 'border-slate-900 text-slate-900' : 'border-transparent text-slate-500 hover:text-slate-700'
  }`;

export function MyBookingsPage() {
  const { data: bookings, isLoading, isError } = useMyBookings();
  const clearTrash = useClearTrash();
  const { t } = useLocale();
  const [tab, setTab] = useState<Tab>('active');

  const { active, trash } = useMemo(() => {
    const list = bookings ?? [];
    return {
      active: list.filter((b) => b.status !== 'CANCELLED'),
      trash: list.filter((b) => b.status === 'CANCELLED'),
    };
  }, [bookings]);

  function handleClearTrash() {
    if (window.confirm(t('bookings.clearTrashConfirm'))) {
      clearTrash.mutate();
    }
  }

  return (
    <div>
      <h1 className="mb-4 text-xl font-semibold text-slate-900">{t('bookings.heading')}</h1>
      {isLoading && <Spinner />}
      {isError && <ErrorBanner message={t('bookings.loadError')} />}
      {bookings && (
        <>
          <div className="mb-4 flex items-center justify-between border-b border-slate-200">
            <div className="flex gap-2">
              <button type="button" className={tabClass(tab === 'active')} onClick={() => setTab('active')}>
                {t('bookings.tabActive')} ({active.length})
              </button>
              <button type="button" className={tabClass(tab === 'trash')} onClick={() => setTab('trash')}>
                {t('bookings.tabTrash')} ({trash.length})
              </button>
            </div>
            {tab === 'trash' && trash.length > 0 && (
              <Button variant="secondary" onClick={handleClearTrash} disabled={clearTrash.isPending}>
                {t('bookings.clearTrash')}
              </Button>
            )}
          </div>
          {tab === 'active' ? (
            <BookingList bookings={active} emptyMessage={t('bookings.empty')} />
          ) : (
            <BookingList bookings={trash} emptyMessage={t('bookings.emptyTrash')} />
          )}
        </>
      )}
    </div>
  );
}
