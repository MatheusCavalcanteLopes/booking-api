// The backend always answers in English (see src/shared/errors/AppError.ts
// and each module's Zod schema). The UI already funnels every API error
// through formatApiError() into a small, fixed set of known strings — this
// maps that known set to translation keys. Anything not in the map (e.g. a
// Zod default message on an untouched field) falls back to the raw English
// text, which is a documented scope boundary, not a bug: fully localizing
// arbitrary backend text would mean shipping i18n on the API too.
const KNOWN_MESSAGES: Record<string, string> = {
  'Invalid email or password': 'errors.invalidCredentials',
  'Unable to register with the provided data': 'errors.registerFailed',
  'This resource is already booked for the selected time window': 'errors.bookingConflict',
  'Bookings can only be cancelled at least 2 hours before they start':
    'errors.cancellationWindow',
  'You can only cancel your own bookings': 'errors.notYourBooking',
  'You do not have permission to perform this action': 'errors.forbidden',
  'Resource not found or not available': 'errors.resourceUnavailable',
  'Admin preview is only available for regular user accounts': 'errors.adminPreviewNotEligible',
  'You are not currently in admin preview': 'errors.adminPreviewNotActive',
  'Resource not found': 'errors.resourceNotFound',
  'Booking not found': 'errors.bookingNotFound',
  'startTime must be in the future': 'errors.validation.startTimeFuture',
  'endTime must be after startTime': 'errors.validation.endTimeAfterStart',
  'Name must have at least 2 characters': 'errors.validation.nameTooShort',
  'Invalid email address': 'errors.validation.invalidEmail',
  'Password is required': 'errors.validation.passwordRequired',
  'Password must have at least 8 characters': 'errors.validation.passwordTooShort',
  'Password must contain at least one uppercase letter': 'errors.validation.passwordNeedsUppercase',
  'Password must contain at least one number': 'errors.validation.passwordNeedsNumber',
};

export function translateErrorMessage(
  message: string,
  t: (key: string) => string
): string {
  const key = KNOWN_MESSAGES[message];
  return key ? t(key) : message;
}

// A single field (e.g. password) can carry several simultaneous rule
// violations — translate each individually rather than the joined blob,
// or a combined string that doesn't exactly match any known message just
// falls back to raw English in its entirety.
export function translateFieldMessages(
  messages: string[],
  t: (key: string) => string
): string {
  return messages.map((message) => translateErrorMessage(message, t)).join(' ');
}
