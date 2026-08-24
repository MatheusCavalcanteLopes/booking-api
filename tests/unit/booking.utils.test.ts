import { windowsOverlap, canBeCancelled, MIN_HOURS_BEFORE_CANCELLATION } from '../../src/modules/bookings/booking.utils';

describe('windowsOverlap', () => {
  it('detects a clear overlap', () => {
    const a = { startTime: new Date('2026-01-01T09:00:00'), endTime: new Date('2026-01-01T11:00:00') };
    const b = { startTime: new Date('2026-01-01T10:00:00'), endTime: new Date('2026-01-01T12:00:00') };
    expect(windowsOverlap(a, b)).toBe(true);
  });

  it('detects when one window is fully inside another', () => {
    const a = { startTime: new Date('2026-01-01T09:00:00'), endTime: new Date('2026-01-01T13:00:00') };
    const b = { startTime: new Date('2026-01-01T10:00:00'), endTime: new Date('2026-01-01T11:00:00') };
    expect(windowsOverlap(a, b)).toBe(true);
  });

  it('returns false for back-to-back bookings (touching boundary)', () => {
    const a = { startTime: new Date('2026-01-01T09:00:00'), endTime: new Date('2026-01-01T10:00:00') };
    const b = { startTime: new Date('2026-01-01T10:00:00'), endTime: new Date('2026-01-01T11:00:00') };
    expect(windowsOverlap(a, b)).toBe(false);
  });

  it('returns false for completely separate windows', () => {
    const a = { startTime: new Date('2026-01-01T09:00:00'), endTime: new Date('2026-01-01T10:00:00') };
    const b = { startTime: new Date('2026-01-01T14:00:00'), endTime: new Date('2026-01-01T15:00:00') };
    expect(windowsOverlap(a, b)).toBe(false);
  });

  it('is symmetric: order of arguments does not matter', () => {
    const a = { startTime: new Date('2026-01-01T09:00:00'), endTime: new Date('2026-01-01T11:00:00') };
    const b = { startTime: new Date('2026-01-01T10:00:00'), endTime: new Date('2026-01-01T12:00:00') };
    expect(windowsOverlap(a, b)).toBe(windowsOverlap(b, a));
  });
});

describe('canBeCancelled', () => {
  const now = new Date('2026-01-01T10:00:00');

  it('allows cancellation when start time is comfortably in the future', () => {
    const startTime = new Date('2026-01-01T13:00:00'); // 3h ahead
    expect(canBeCancelled(startTime, now)).toBe(true);
  });

  it('blocks cancellation inside the minimum window', () => {
    const startTime = new Date('2026-01-01T11:00:00'); // 1h ahead
    expect(canBeCancelled(startTime, now)).toBe(false);
  });

  it('allows cancellation exactly at the boundary', () => {
    const startTime = new Date(now.getTime() + MIN_HOURS_BEFORE_CANCELLATION * 60 * 60 * 1000);
    expect(canBeCancelled(startTime, now)).toBe(true);
  });
});
