import { useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useLocale } from '../../i18n/LocaleContext';
import { formatApiError } from '../../lib/formatApiError';
import { translateErrorMessage } from '../../i18n/errorMessages';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { ErrorBanner } from '../ui/ErrorBanner';

export function LoginForm() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const { t } = useLocale();
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
      await login(email, password);
      navigate('/resources');
    } catch (error) {
      const formatted = formatApiError(error);
      if (formatted.kind === 'validation') {
        const translated: Record<string, string> = {};
        for (const [field, message] of Object.entries(formatted.fields)) {
          translated[field] = translateErrorMessage(message, t);
        }
        setFieldErrors(translated);
      } else {
        // 401 "Invalid email or password" is intentionally generic on the
        // backend (doesn't say which field is wrong, to avoid leaking
        // which emails are registered) — keep that ambiguity in the UI too.
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
        label={t('auth.login.email')}
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        error={fieldErrors.email}
        required
      />
      <Input
        label={t('auth.login.password')}
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        error={fieldErrors.password}
        required
      />
      <Button type="submit" disabled={isSubmitting} className="w-full">
        {isSubmitting ? t('auth.login.signingIn') : t('auth.login.signIn')}
      </Button>
    </form>
  );
}
