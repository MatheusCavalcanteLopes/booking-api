import { useMyBookings } from '../hooks/useBookings';
import { BookingList } from '../components/bookings/BookingList';
import { Spinner } from '../components/ui/Spinner';
import { ErrorBanner } from '../components/ui/ErrorBanner';

export function MyBookingsPage() {
  const { data: bookings, isLoading, isError } = useMyBookings();

  return (
    <div>
      <h1 className="mb-4 text-xl font-semibold text-slate-900">My bookings</h1>
      {isLoading && <Spinner />}
      {isError && <ErrorBanner message="Could not load your bookings." />}
      {bookings && <BookingList bookings={bookings} />}
    </div>
  );
}
