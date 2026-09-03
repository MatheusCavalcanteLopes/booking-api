interface ErrorBannerProps {
  message: string;
  tone?: 'error' | 'conflict';
}

const toneClasses = {
  // Distinct from validation red on purpose: a 409 conflict means "this
  // isn't a typo, it's a real scheduling clash," not "you filled something
  // in wrong."
  error: 'bg-red-50 border-red-300 text-red-800',
  conflict: 'bg-amber-50 border-amber-300 text-amber-900',
};

export function ErrorBanner({ message, tone = 'error' }: ErrorBannerProps) {
  return (
    <div role="alert" className={`rounded-md border px-3 py-2 text-sm ${toneClasses[tone]}`}>
      {message}
    </div>
  );
}
