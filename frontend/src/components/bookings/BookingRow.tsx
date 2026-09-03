import { useState } from 'react';
import { useCancelBooking } from '../../hooks/useBookings';
import { formatApiError } from '../../lib/formatApiError';
import { formatDateTime, hoursUntil } from '../../lib/datetime';
import { Button } from '../ui/Button';
import type { Booking } from '../../types/api';

const statusClasses: Record<Booking['status'], string> = {
  CONFIRMED: 'bg-green-50 text-green-700 border-green-300',
  CANCELLED: 'bg-slate-100 text-slate-500 border-slate-300',
  PENDING: 'bg-amber-50 text-amber-700 border-amber-300',
};

export function BookingRow({ booking }: { booking: Booking }) {
  const cancelBooking = useCancelBooking();
  const [error, setError] = useState<string | null>(null);

  const isConfirmed = booking.status === 'CONFIRMED';
  // UX-only mirror of the backend's 2h cancellation-window rule — the
  // actual enforcement (and the source of truth) is the server's 403 on
  // the cancel call below, e.g. if this tab was left open past the mark.
  const withinCancelWindow = isConfirmed && hoursUntil(booking.startTime) < 2;

  async function handleCancel() {
    setError(null);
    try {
      await cancelBooking.mutateAsync(booking.id);
    } catch (err) {
      setError(formatApiError(err).message);
    }
  }

  return (
    <div className="rounded-lg border border-slate-200 bg-white p-4">
      <div className="flex items-start justify-between">
        <div>
          <h3 className="font-medium text-slate-900">{booking.resource.name}</h3>
          <p className="mt-1 text-sm text-slate-500">
            {formatDateTime(booking.startTime)} → {formatDateTime(booking.endTime)}
          </p>
          {booking.notes && <p className="mt-1 text-sm text-slate-400">{booking.notes}</p>}
        </div>
        <span
          className={`rounded-full border px-2 py-0.5 text-xs font-medium ${statusClasses[booking.status]}`}
        >
          {booking.status}
        </span>
      </div>
      {isConfirmed && (
        <div className="mt-3">
          <Button
            variant="danger"
            onClick={handleCancel}
            disabled={withinCancelWindow || cancelBooking.isPending}
            title={
              withinCancelWindow
                ? 'Cancellations must be made at least 2 hours in advance'
                : undefined
            }
          >
            {cancelBooking.isPending ? 'Cancelling…' : 'Cancel'}
          </Button>
        </div>
      )}
      {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
    </div>
  );
}
