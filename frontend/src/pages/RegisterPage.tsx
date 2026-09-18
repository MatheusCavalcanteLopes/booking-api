import { Link } from 'react-router-dom';
import { RegisterForm } from '../components/auth/RegisterForm';
import { LanguageSwitcher } from '../components/ui/LanguageSwitcher';
import { useLocale } from '../i18n/LocaleContext';

export function RegisterPage() {
  const { t } = useLocale();

  return (
    <div className="relative flex min-h-screen items-center justify-center bg-slate-50 px-4">
      <div className="absolute right-4 top-4">
        <LanguageSwitcher />
      </div>
      <div className="w-full max-w-sm space-y-6">
        <div className="text-center">
          <h1 className="text-2xl font-semibold text-slate-900">{t('auth.register.title')}</h1>
          <p className="mt-1 text-sm text-slate-500">{t('auth.register.subtitle')}</p>
        </div>
        <RegisterForm />
        <p className="text-center text-sm text-slate-500">
          {t('auth.register.alreadyHaveAccount')}{' '}
          <Link to="/login" className="font-medium text-slate-900 underline">
            {t('auth.register.signInLink')}
          </Link>
        </p>
      </div>
    </div>
  );
}
