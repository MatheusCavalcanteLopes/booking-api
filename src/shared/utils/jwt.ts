import jwt from 'jsonwebtoken';
import { env } from '../../config/env';
import { Role } from '@prisma/client';

export interface TokenPayload {
  sub: string; // user id
  role: Role;
}

/**
 * Why two tokens instead of one?
 *
 * - Access token: short-lived (15 min). Sent on every request. If it
 *   leaks, the damage window is small.
 * - Refresh token: long-lived (7 days). Only used to obtain a new
 *   access token, via a dedicated endpoint. This lets us keep users
 *   logged in without forcing them to re-enter credentials constantly,
 *   while still limiting how long a stolen access token is useful.
 */
export function generateAccessToken(payload: TokenPayload): string {
  return jwt.sign(payload, env.jwt.accessSecret, {
    expiresIn: env.jwt.accessExpiresIn,
  } as jwt.SignOptions);
}

export function generateRefreshToken(payload: TokenPayload): string {
  return jwt.sign(payload, env.jwt.refreshSecret, {
    expiresIn: env.jwt.refreshExpiresIn,
  } as jwt.SignOptions);
}

export function verifyAccessToken(token: string): TokenPayload {
  return jwt.verify(token, env.jwt.accessSecret) as TokenPayload;
}

export function verifyRefreshToken(token: string): TokenPayload {
  return jwt.verify(token, env.jwt.refreshSecret) as TokenPayload;
}
