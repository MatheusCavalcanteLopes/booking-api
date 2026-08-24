import { NextFunction, Request, Response } from 'express';
import { ZodError } from 'zod';
import { AppError } from '../errors/AppError';

/**
 * Centralized error handler. Every thrown error in the app ends up here
 * because controllers wrap their logic and call `next(error)` (or, for
 * async controllers, we rely on the asyncHandler wrapper below).
 *
 * This is what keeps every controller free of duplicated
 * try/catch + res.status(...).json(...) noise.
 */
export function errorHandler(
  err: unknown,
  _req: Request,
  res: Response,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _next: NextFunction
): void {
  if (err instanceof ZodError) {
    res.status(422).json({
      message: 'Validation error',
      issues: err.issues.map((issue) => ({
        path: issue.path.join('.'),
        message: issue.message,
      })),
    });
    return;
  }

  if (err instanceof AppError) {
    res.status(err.statusCode).json({ message: err.message });
    return;
  }

  // Unexpected error: never leak internals to the client.
  console.error('Unexpected error:', err);
  res.status(500).json({ message: 'Internal server error' });
}

/**
 * Wraps an async Express handler so that any rejected promise is
 * forwarded to next(), instead of crashing the process or requiring
 * try/catch in every single controller.
 */
export function asyncHandler(
  fn: (req: Request, res: Response, next: NextFunction) => Promise<void>
) {
  return (req: Request, res: Response, next: NextFunction): void => {
    fn(req, res, next).catch(next);
  };
}
