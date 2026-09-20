import { useLocale } from '../../i18n/LocaleContext';
import type { Locale } from '../../types/api';

const OPTIONS: { value: Locale; label: string }[] = [
  { value: 'en', label: 'EN' },
  { value: 'pt-BR', label: 'PT' },
];

export function LanguageSwitcher() {
  const { locale, setLocale } = useLocale();

  return (
    <div className="flex rounded-md border border-slate-300 text-xs font-medium">
      {OPTIONS.map(({ value, label }, index) => (
        <button
          key={value}
          type="button"
          onClick={() => setLocale(value)}
          aria-pressed={locale === value}
          className={`px-2 py-1 ${index === 0 ? 'rounded-l-md' : 'rounded-r-md border-l border-slate-300'} ${
            locale === value ? 'bg-slate-900 text-white' : 'bg-white text-slate-600 hover:bg-slate-50'
          }`}
        >
          {label}
        </button>
      ))}
    </div>
  );
}
