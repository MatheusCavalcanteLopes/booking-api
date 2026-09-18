import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { LoginForm } from '../components/auth/LoginForm';
import { Dialog } from '../components/ui/Dialog';
import { Button } from '../components/ui/Button';
import { LanguageSwitcher } from '../components/ui/LanguageSwitcher';
import { useLocale } from '../i18n/LocaleContext';

export function LoginPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const { t } = useLocale();
  const [showRegisterWarning, setShowRegisterWarning] = useState(false);
  const justRegistered = Boolean(
    (location.state as { justRegistered?: boolean } | null)?.justRegistered
  );

  return (
    <div className="relative flex min-h-screen items-center justify-center bg-slate-50 px-4">
      <div className="absolute right-4 top-4">
        <LanguageSwitcher />
      </div>
      <div className="w-full max-w-sm space-y-6">
        <div className="text-center">
          <h1 className="text-2xl font-semibold text-slate-900">{t('auth.login.title')}</h1>
          <p className="mt-1 text-sm text-slate-500">{t('auth.login.subtitle')}</p>
        </div>
        {justRegistered && (
          <p className="rounded-md border border-green-300 bg-green-50 px-3 py-2 text-sm text-green-800">
            {t('auth.login.justRegistered')}
          </p>
        )}
        <LoginForm />
        <p className="text-center text-sm text-slate-500">
          {t('auth.login.noAccountYet')}{' '}
          <button
            type="button"
            onClick={() => setShowRegisterWarning(true)}
            className="font-medium text-slate-900 underline"
          >
            {t('auth.login.registerLink')}
          </button>
        </p>
      </div>

      <Dialog open={showRegisterWarning} onClose={() => setShowRegisterWarning(false)}>
        <h2 className="text-lg font-semibold text-slate-900">{t('auth.registerWarning.title')}</h2>
        <p className="mt-2 text-sm text-slate-600">{t('auth.registerWarning.body')}</p>
        <Button className="mt-4 w-full" onClick={() => navigate('/register')}>
          {t('auth.registerWarning.continue')}
        </Button>
      </Dialog>
    </div>
  );
}
