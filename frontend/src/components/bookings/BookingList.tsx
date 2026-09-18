import { BookingRow } from './BookingRow';
import type { Booking } from '../../types/api';

interface BookingListProps {
  bookings: Booking[];
  emptyMessage: string;
}

export function BookingList({ bookings, emptyMessage }: BookingListProps) {
  if (bookings.length === 0) {
    return <p className="text-sm text-slate-500">{emptyMessage}</p>;
  }

  return (
    <div className="space-y-3">
      {bookings.map((booking) => (
        <BookingRow key={booking.id} booking={booking} />
      ))}
    </div>
  );
}
