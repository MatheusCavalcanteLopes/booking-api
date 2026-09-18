// Full-screen, low-opacity overlay for actions that take a noticeable
// moment (e.g. the admin-preview role swap: DB write + token reissue +
// a full query refetch) so the delay reads as "working", not "stuck".
export function LoadingOverlay() {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-white/60"
      role="status"
      aria-label="Loading"
    >
      <div className="h-10 w-10 animate-spin rounded-full border-4 border-slate-300 border-t-slate-900" />
    </div>
  );
}
