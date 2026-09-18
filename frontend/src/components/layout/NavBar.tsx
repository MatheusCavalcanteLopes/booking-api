import { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useLocale } from '../../i18n/LocaleContext';
import { formatApiError } from '../../lib/formatApiError';
import { translateErrorMessage } from '../../i18n/errorMessages';
import { Button } from '../ui/Button';
import { LanguageSwitcher } from '../ui/LanguageSwitcher';

const linkClass = ({ isActive }: { isActive: boolean }) =>
  `text-sm font-medium ${isActive ? 'text-slate-900' : 'text-slate-500 hover:text-slate-700'}`;

export function NavBar() {
  const { user, logout, isPreviewingAdmin, enterAdminPreview, exitAdminPreview } = useAuth();
  const { t } = useLocale();
  const [toggleError, setToggleError] = useState<string | null>(null);
  const canToggleAdminPreview = isPreviewingAdmin || user?.role === 'USER';

  async function handleToggleAdminPreview() {
    setToggleError(null);
    try {
      if (isPreviewingAdmin) {
        await exitAdminPreview();
      } else {
        await enterAdminPreview();
      }
    } catch (error) {
      setToggleError(translateErrorMessage(formatApiError(error).message, t));
    }
  }

  return (
    <header className="border-b border-slate-200 bg-white">
      <nav className="mx-auto flex max-w-4xl items-center justify-between px-4 py-3">
        <div className="flex items-center gap-6">
          <span className="flex items-center gap-2 font-semibold text-slate-900">
            <img src="/logo.svg" alt="" className="h-6 w-6" />
            Booking API
          </span>
          <NavLink to="/resources" className={linkClass}>
            {t('nav.resources')}
          </NavLink>
          <NavLink to="/my-bookings" className={linkClass}>
            {t('nav.myBookings')}
          </NavLink>
        </div>
        <div className="flex items-center gap-4">
          {canToggleAdminPreview && (
            <label className="flex items-center gap-2 text-sm text-slate-600">
              <span>{t('nav.tryAsAdmin')}</span>
              <button
                type="button"
                role="switch"
                aria-checked={isPreviewingAdmin}
                onClick={handleToggleAdminPreview}
                className={`relative h-5 w-9 shrink-0 rounded-full transition-colors ${
                  isPreviewingAdmin ? 'bg-slate-900' : 'bg-slate-300'
                }`}
              >
                <span
                  className={`absolute top-0.5 left-0.5 h-4 w-4 rounded-full bg-white transition-transform ${
                    isPreviewingAdmin ? 'translate-x-4' : 'translate-x-0'
                  }`}
                />
              </button>
            </label>
          )}
          <LanguageSwitcher />
          <span className="text-sm text-slate-500">{user?.name}</span>
          <Button variant="secondary" onClick={logout}>
            {t('nav.logout')}
          </Button>
        </div>
      </nav>
      {isPreviewingAdmin && (
        <div className="border-t border-amber-200 bg-amber-50 px-4 py-1.5 text-center text-xs font-medium text-amber-800">
          {t('nav.previewBanner')}{' '}
          <button type="button" onClick={handleToggleAdminPreview} className="underline">
            {t('nav.turnOff')}
          </button>
        </div>
      )}
      {toggleError && (
        <div className="border-t border-red-200 bg-red-50 px-4 py-1.5 text-center text-xs text-red-800">
          {toggleError}
        </div>
      )}
    </header>
  );
}
