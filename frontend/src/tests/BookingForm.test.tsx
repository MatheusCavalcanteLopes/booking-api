import { beforeEach, describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AxiosError } from 'axios';
import { BookingForm } from '../components/resources/BookingForm';
import { LocaleProvider } from '../i18n/LocaleContext';
import type { Resource } from '../types/api';

const mutateAsyncMock = vi.fn();

vi.mock('../hooks/useBookings', () => ({
  useCreateBooking: () => ({ mutateAsync: mutateAsyncMock, isPending: false }),
}));

const resource: Resource = {
  id: 'r1',
  name: 'Conference Room A',
  description: null,
  capacity: 4,
  location: null,
  isActive: true,
  createdAt: '2024-01-01T00:00:00.000Z',
  updatedAt: '2024-01-01T00:00:00.000Z',
};

function axiosErrorWith(status: number, data: unknown): AxiosError {
  return new AxiosError('Request failed', String(status), undefined, undefined, {
    status,
    data,
    statusText: '',
    headers: {},
    config: {} as never,
  });
}

// Builds a "YYYY-MM-DDTHH:mm" string from local wall-clock components (not
// toISOString, which is UTC and would silently shift into the past/future
// by the runner's timezone offset once BookingForm re-parses it as local).
function toDateTimeLocal(date: Date): string {
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

function fillValidTimes() {
  const start = new Date(Date.now() + 60 * 60 * 1000);
  const end = new Date(Date.now() + 2 * 60 * 60 * 1000);
  fireEvent.change(screen.getByLabelText('Start'), {
    target: { value: toDateTimeLocal(start) },
  });
  fireEvent.change(screen.getByLabelText('End'), { target: { value: toDateTimeLocal(end) } });
}

function renderForm() {
  const queryClient = new QueryClient();
  return render(
    <QueryClientProvider client={queryClient}>
      <LocaleProvider>
        <BookingForm resource={resource} onClose={vi.fn()} />
      </LocaleProvider>
    </QueryClientProvider>
  );
}

describe('BookingForm', () => {
  beforeEach(() => {
    mutateAsyncMock.mockReset();
    // Locks tests to English regardless of jsdom's navigator.language, so
    // assertions against literal strings stay meaningful.
    localStorage.setItem('booking-api.locale-override', 'en');
  });

  it('renders a distinct conflict banner on a 409 and keeps the entered values', async () => {
    mutateAsyncMock.mockRejectedValueOnce(
      axiosErrorWith(409, {
        message: 'This resource is already booked for the selected time window',
      })
    );

    renderForm();
    fillValidTimes();
    fireEvent.click(screen.getByRole('button', { name: /confirm booking/i }));

    const banner = await screen.findByText(
      'This resource is already booked for the selected time window'
    );
    expect(banner).toBeInTheDocument();
    expect(screen.getByLabelText('Start')).not.toHaveValue('');
    expect(screen.getByLabelText('End')).not.toHaveValue('');
  });

  it('maps a 422 startTime issue to the startTime field, not a generic banner', async () => {
    mutateAsyncMock.mockRejectedValueOnce(
      axiosErrorWith(422, {
        message: 'Validation error',
        issues: [{ path: 'startTime', message: 'startTime must be in the future' }],
      })
    );

    renderForm();
    fillValidTimes();
    fireEvent.click(screen.getByRole('button', { name: /confirm booking/i }));

    expect(await screen.findByText('startTime must be in the future')).toBeInTheDocument();
  });
});
