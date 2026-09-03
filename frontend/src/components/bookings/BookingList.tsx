import { BookingRow } from './BookingRow';
import type { Booking } from '../../types/api';

export function BookingList({ bookings }: { bookings: Booking[] }) {
  if (bookings.length === 0) {
    return <p className="text-sm text-slate-500">You have no bookings yet.</p>;
  }

  return (
    <div className="space-y-3">
      {bookings.map((booking) => (
        <BookingRow key={booking.id} booking={booking} />
      ))}
    </div>
  );
}
