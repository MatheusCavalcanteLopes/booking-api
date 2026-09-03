import { useState, type FormEvent } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useCreateBooking } from '../../hooks/useBookings';
import { formatApiError } from '../../lib/formatApiError';
import { localInputToIso } from '../../lib/datetime';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { ErrorBanner } from '../ui/ErrorBanner';
import type { Resource } from '../../types/api';

interface BookingFormProps {
  resource: Resource;
  onClose: () => void;
}

// Fast client-side feedback for the same two rules the backend enforces
// (endTime after startTime, startTime in the future) — never authoritative,
// since clock skew or a stale form makes it possible for the server to
// disagree, and the server's response is always what actually gets shown.
function validateLocally(startTime: string, endTime: string): Record<string, string> {
  const errors: Record<string, string> = {};
  if (!startTime || !endTime) return errors;

  const start = new Date(startTime);
  const end = new Date(endTime);

  if (start.getTime() <= Date.now()) {
    errors.startTime = 'startTime must be in the future';
  }
  if (end <= start) {
    errors.endTime = 'endTime must be after startTime';
  }
  return errors;
}

export function BookingForm({ resource, onClose }: BookingFormProps) {
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [notes, setNotes] = useState('');
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [conflictMessage, setConflictMessage] = useState<string | null>(null);
  const [genericError, setGenericError] = useState<string | null>(null);

  const createBooking = useCreateBooking();
  const queryClient = useQueryClient();

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setConflictMessage(null);
    setGenericError(null);

    const localErrors = validateLocally(startTime, endTime);
    if (Object.keys(localErrors).length > 0) {
      setFieldErrors(localErrors);
      return;
    }
    setFieldErrors({});

    try {
      await createBooking.mutateAsync({
        resourceId: resource.id,
        startTime: localInputToIso(startTime),
        endTime: localInputToIso(endTime),
        notes: notes || undefined,
      });
      onClose();
    } catch (error) {
      const formatted = formatApiError(error);
      if (formatted.kind === 'validation') {
        setFieldErrors(formatted.fields);
      } else if (formatted.kind === 'conflict') {
        // The one error the requirements call out as needing to be
        // visibly distinct from a plain validation mistake — a scheduling
        // clash, not a typo. Inputs are deliberately left as-is so the
        // user can just nudge the time and resubmit.
        setConflictMessage(formatted.message);
      } else {
        // Covers the 404 case too (resource deactivated mid-session) —
        // refresh the resource list so it reflects reality.
        setGenericError(formatted.message);
        queryClient.invalidateQueries({ queryKey: ['resources'] });
      }
    }
  }

  return (
    <div className="rounded-lg border border-slate-200 bg-white p-4">
      <h3 className="mb-3 font-semibold text-slate-900">Book “{resource.name}”</h3>
      <form onSubmit={handleSubmit} className="space-y-4">
        {conflictMessage && <ErrorBanner tone="conflict" message={conflictMessage} />}
        {genericError && <ErrorBanner message={genericError} />}
        <Input
          label="Start"
          type="datetime-local"
          value={startTime}
          onChange={(e) => setStartTime(e.target.value)}
          error={fieldErrors.startTime}
          required
        />
        <Input
          label="End"
          type="datetime-local"
          value={endTime}
          onChange={(e) => setEndTime(e.target.value)}
          error={fieldErrors.endTime}
          required
        />
        <Input
          label="Notes (optional)"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
        />
        <div className="flex gap-2">
          <Button type="submit" disabled={createBooking.isPending}>
            {createBooking.isPending ? 'Booking…' : 'Confirm booking'}
          </Button>
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancel
          </Button>
        </div>
      </form>
    </div>
  );
}
