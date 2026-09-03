import { describe, expect, it } from 'vitest';
import { AxiosError } from 'axios';
import { formatApiError } from '../lib/formatApiError';

function makeAxiosError(status: number, data: unknown): AxiosError {
  return new AxiosError('Request failed', String(status), undefined, undefined, {
    status,
    data,
    statusText: '',
    headers: {},
    config: {} as never,
  });
}

describe('formatApiError', () => {
  it('maps a 422 validation error to a field->message map', () => {
    const error = makeAxiosError(422, {
      message: 'Validation error',
      issues: [
        { path: 'startTime', message: 'startTime must be in the future' },
        { path: 'endTime', message: 'endTime must be after startTime' },
      ],
    });

    const result = formatApiError(error);

    expect(result.kind).toBe('validation');
    if (result.kind === 'validation') {
      expect(result.fields.startTime).toBe('startTime must be in the future');
      expect(result.fields.endTime).toBe('endTime must be after startTime');
    }
  });

  it('flags a 409 as a conflict, distinct from a validation error', () => {
    const error = makeAxiosError(409, {
      message: 'This resource is already booked for the selected time window',
    });

    const result = formatApiError(error);

    expect(result).toEqual({
      kind: 'conflict',
      message: 'This resource is already booked for the selected time window',
    });
  });

  it('falls back to a generic message when there is no response (network error)', () => {
    const error = new AxiosError('Network Error');

    const result = formatApiError(error);

    expect(result.kind).toBe('generic');
    expect(result.message).toBeTruthy();
  });
});
