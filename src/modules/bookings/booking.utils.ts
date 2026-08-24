export interface TimeWindow {
  startTime: Date;
  endTime: Date;
}

/**
 * Two time windows overlap when one starts before the other ends,
 * in both directions. This is the classic interval-overlap check:
 *
 *   A: |--------|
 *   B:      |--------|      -> overlap
 *
 *   A: |--------|
 *   B:            |------|  -> no overlap
 *
 * Touching boundaries (A ends exactly when B starts) do NOT count as
 * a conflict — a 9-10am booking and a 10-11am booking can coexist.
 */
export function windowsOverlap(a: TimeWindow, b: TimeWindow): boolean {
  return a.startTime < b.endTime && b.startTime < a.endTime;
}

// A booking can only be cancelled if it starts at least this many
// hours from now. This models a real-world cancellation policy and
// is exactly the kind of business rule that's worth showing off.
export const MIN_HOURS_BEFORE_CANCELLATION = 2;

export function canBeCancelled(startTime: Date, now: Date = new Date()): boolean {
  const hoursUntilStart = (startTime.getTime() - now.getTime()) / (1000 * 60 * 60);
  return hoursUntilStart >= MIN_HOURS_BEFORE_CANCELLATION;
}
