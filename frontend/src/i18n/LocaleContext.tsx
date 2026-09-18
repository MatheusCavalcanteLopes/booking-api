import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react';
import { en, type TranslationDictionary } from './translations/en';
import { ptBR } from './translations/pt-BR';
import { tokenStorage } from '../lib/tokenStorage';
import * as usersApi from '../api/users.api';
import type { Locale } from '../types/api';

const dictionaries: Record<Locale, TranslationDictionary> = { en, 'pt-BR': ptBR };
const OVERRIDE_KEY = 'booking-api.locale-override';

function resolveInitialLocale(): Locale {
  const override = localStorage.getItem(OVERRIDE_KEY);
  if (override === 'en' || override === 'pt-BR') return override;

  const sessionUser = tokenStorage.get()?.user;
  if (sessionUser?.locale) return sessionUser.locale;

  return navigator.language.toLowerCase().startsWith('pt') ? 'pt-BR' : 'en';
}

function getByPath(dict: TranslationDictionary, path: string): string | undefined {
  const value = path.split('.').reduce<unknown>((node, key) => {
    if (node && typeof node === 'object' && key in node) {
      return (node as Record<string, unknown>)[key];
    }
    return undefined;
  }, dict);
  return typeof value === 'string' ? value : undefined;
}

function interpolate(template: string, vars?: Record<string, string>): string {
  if (!vars) return template;
  return template.replace(/\{\{(\w+)\}\}/g, (match, key) => vars[key] ?? match);
}

interface LocaleContextValue {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: (key: string, vars?: Record<string, string>) => string;
}

const LocaleContext = createContext<LocaleContextValue | undefined>(undefined);

export function LocaleProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>(resolveInitialLocale);

  const setLocale = useCallback((next: Locale) => {
    setLocaleState(next);
    localStorage.setItem(OVERRIDE_KEY, next);

    // Only persist server-side if there's an active session — the language
    // switcher also works pre-login, on /login and /register.
    if (tokenStorage.get()) {
      tokenStorage.updateCachedUser({ locale: next });
      usersApi.updateLocale(next).catch(() => {
        // The UI already switched, which is what matters; a failed sync
        // just means the next login re-resolves from the override above.
      });
    }
  }, []);

  const t = useCallback(
    (key: string, vars?: Record<string, string>) => {
      const dict = dictionaries[locale];
      const value = getByPath(dict, key) ?? getByPath(en, key) ?? key;
      return interpolate(value, vars);
    },
    [locale]
  );

  const value = useMemo(() => ({ locale, setLocale, t }), [locale, setLocale, t]);

  return <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>;
}

export function useLocale(): LocaleContextValue {
  const ctx = useContext(LocaleContext);
  if (!ctx) throw new Error('useLocale must be used within a LocaleProvider');
  return ctx;
}
