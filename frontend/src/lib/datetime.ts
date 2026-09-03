// `datetime-local` inputs give/accept "YYYY-MM-DDTHH:mm" in the browser's
// local time, with no timezone info — `new Date(...)` parses that as local
// time too, so a straight `.toISOString()` round-trip is correct here.
export function localInputToIso(value: string): string {
  return new Date(value).toISOString();
}

export function formatDateTime(iso: string): string {
  return new Date(iso).toLocaleString(undefined, {
    dateStyle: 'medium',
    timeStyle: 'short',
  });
}

export function hoursUntil(iso: string): number {
  return (new Date(iso).getTime() - Date.now()) / (1000 * 60 * 60);
}
