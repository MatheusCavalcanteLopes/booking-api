import { useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useLocale } from '../../i18n/LocaleContext';
import { formatApiError } from '../../lib/formatApiError';
import { translateErrorMessage, translateFieldMessages } from '../../i18n/errorMessages';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { ErrorBanner } from '../ui/ErrorBanner';

export function RegisterForm() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const { t } = useLocale();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setFieldErrors({});
    setFormError(null);
    setIsSubmitting(true);

    try {
      await register(name, email, password);
      // The API doesn't return tokens on register, so there's no session
      // to start yet — send the user to log in explicitly rather than
      // leaving them wondering whether registration silently failed.
      navigate('/login', { state: { justRegistered: true } });
    } catch (error) {
      const formatted = formatApiError(error);
      if (formatted.kind === 'validation') {
        const translated: Record<string, string> = {};
        for (const [field, messages] of Object.entries(formatted.fields)) {
          translated[field] = translateFieldMessages(messages, t);
        }
        setFieldErrors(translated);
      } else {
        setFormError(translateErrorMessage(formatted.message, t));
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {formError && <ErrorBanner message={formError} />}
      <Input
        label={t('auth.register.name')}
        value={name}
        onChange={(e) => setName(e.target.value)}
        error={fieldErrors.name}
        required
      />
      <Input
        label={t('auth.register.email')}
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        error={fieldErrors.email}
        required
      />
      <Input
        label={t('auth.register.password')}
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        error={fieldErrors.password}
        required
      />
      <p className="text-xs text-slate-500">{t('auth.register.passwordHint')}</p>
      <Button type="submit" disabled={isSubmitting} className="w-full">
        {isSubmitting ? t('auth.register.creatingAccount') : t('auth.register.createAccount')}
      </Button>
    </form>
  );
}
