import { AxiosError } from 'axios';
import type { ApiErrorBody } from '../types/api';

export type FormattedApiError =
  | { kind: 'validation'; fields: Record<string, string[]>; message: string }
  | { kind: 'conflict'; message: string }
  | { kind: 'generic'; message: string };

const FALLBACK_MESSAGE = 'Something went wrong. Please try again.';

/**
 * Classifies an API error so callers can render it appropriately instead of
 * dumping every error into one generic banner. The 422/409 distinction
 * matters most: a validation issue belongs next to the offending field,
 * while a booking conflict is a real scheduling clash, not a typo.
 */
export function formatApiError(error: unknown): FormattedApiError {
  if (!(error instanceof AxiosError) || !error.response) {
    return { kind: 'generic', message: FALLBACK_MESSAGE };
  }

  const body = error.response.data as ApiErrorBody | undefined;
  const message = body?.message ?? FALLBACK_MESSAGE;

  if (error.response.status === 422 && body?.issues?.length) {
    // A single field (e.g. password) can fail several rules at once — Zod
    // reports each as its own issue with the same path. Keep every message
    // for that field, or all but the last violation silently disappear and
    // the user just sees the same field rejected again with a different,
    // seemingly unrelated reason each retry.
    const fields: Record<string, string[]> = {};
    for (const issue of body.issues) {
      (fields[issue.path] ??= []).push(issue.message);
    }
    return { kind: 'validation', fields, message };
  }

  if (error.response.status === 409) {
    return { kind: 'conflict', message };
  }

  return { kind: 'generic', message };
}
