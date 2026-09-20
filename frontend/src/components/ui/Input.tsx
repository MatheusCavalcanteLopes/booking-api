import { useState, type InputHTMLAttributes } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
}

function EyeIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-5 w-5">
      <path d="M10 3.5c-4.14 0-7.65 2.6-9 6.25 1.35 3.65 4.86 6.25 9 6.25s7.65-2.6 9-6.25c-1.35-3.65-4.86-6.25-9-6.25ZM10 13.5a3.75 3.75 0 1 1 0-7.5 3.75 3.75 0 0 1 0 7.5Z" />
    </svg>
  );
}

function EyeOffIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-5 w-5">
      <path
        fillRule="evenodd"
        d="M3.28 2.22a.75.75 0 0 0-1.06 1.06l14.5 14.5a.75.75 0 1 0 1.06-1.06l-1.86-1.86c1.73-1.13 3.1-2.78 3.9-4.66a1.8 1.8 0 0 0 0-1.4c-1.35-3.65-4.86-6.25-9-6.25-1.6 0-3.1.39-4.42 1.08L3.28 2.22Zm4.1 4.1 1.4 1.4a2.25 2.25 0 0 1 3.05 3.05l1.4 1.4a3.75 3.75 0 0 0-5.85-5.85Z"
        clipRule="evenodd"
      />
      <path d="M2.31 8.56A9.96 9.96 0 0 0 1.1 10.66a1.8 1.8 0 0 0 0 1.4c1.35 3.65 4.86 6.25 9 6.25 1.35 0 2.64-.28 3.81-.78l-1.6-1.6a6.25 6.25 0 0 1-6.51-3.63c.35-.75.79-1.44 1.32-2.05L2.31 8.56Z" />
    </svg>
  );
}

export function Input({ label, error, id, className = '', type, ...props }: InputProps) {
  const [showPassword, setShowPassword] = useState(false);
  const inputId = id ?? label.toLowerCase().replace(/\s+/g, '-');
  const isPassword = type === 'password';
  const resolvedType = isPassword && showPassword ? 'text' : type;

  return (
    <div>
      <label htmlFor={inputId} className="mb-1 block text-sm font-medium text-slate-700">
        {label}
      </label>
      <div className="relative">
        <input
          id={inputId}
          type={resolvedType}
          className={`w-full rounded-md border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-400 ${
            isPassword ? 'pr-10' : ''
          } ${error ? 'border-red-400' : 'border-slate-300'} ${className}`}
          aria-invalid={Boolean(error)}
          {...props}
        />
        {isPassword && (
          <button
            type="button"
            onClick={() => setShowPassword((current) => !current)}
            // Keeps focus order on the field itself when tabbing through
            // the form — this is a convenience toggle, not a form field.
            tabIndex={-1}
            aria-label={showPassword ? 'Hide password' : 'Show password'}
            className="absolute inset-y-0 right-0 flex items-center px-3 text-slate-400 hover:text-slate-600"
          >
            {showPassword ? <EyeOffIcon /> : <EyeIcon />}
          </button>
        )}
      </div>
      {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
    </div>
  );
}
