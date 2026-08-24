import { prisma } from '../../config/prisma';
import { ConflictError, UnauthorizedError } from '../../shared/errors/AppError';
import { comparePassword, hashPassword } from '../../shared/utils/password';
import {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
} from '../../shared/utils/jwt';
import { LoginInput, RegisterInput } from './auth.schema';

export const authService = {
  async register(input: RegisterInput) {
    const existingUser = await prisma.user.findUnique({
      where: { email: input.email },
    });

    if (existingUser) {
      // Deliberately vague message: don't confirm to an attacker that a
      // specific email is already registered.
      throw new ConflictError('Unable to register with the provided data');
    }

    const passwordHash = await hashPassword(input.password);

    const user = await prisma.user.create({
      data: {
        name: input.name,
        email: input.email,
        passwordHash,
      },
    });

    return {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
    };
  },

  async login(input: LoginInput) {
    const user = await prisma.user.findUnique({
      where: { email: input.email },
    });

    // Same generic message whether the email doesn't exist or the
    // password is wrong. This prevents user enumeration attacks.
    if (!user) {
      throw new UnauthorizedError('Invalid email or password');
    }

    const passwordMatches = await comparePassword(input.password, user.passwordHash);
    if (!passwordMatches) {
      throw new UnauthorizedError('Invalid email or password');
    }

    const payload = { sub: user.id, role: user.role };

    return {
      accessToken: generateAccessToken(payload),
      refreshToken: generateRefreshToken(payload),
      user: { id: user.id, name: user.name, email: user.email, role: user.role },
    };
  },

  async refresh(refreshToken: string) {
    let payload;
    try {
      payload = verifyRefreshToken(refreshToken);
    } catch {
      throw new UnauthorizedError('Invalid or expired refresh token');
    }

    const user = await prisma.user.findUnique({ where: { id: payload.sub } });
    if (!user) {
      throw new UnauthorizedError('Invalid or expired refresh token');
    }

    const newPayload = { sub: user.id, role: user.role };

    // Rotate both tokens on refresh. Reusing the same refresh token
    // indefinitely would widen the window an attacker could exploit it in.
    return {
      accessToken: generateAccessToken(newPayload),
      refreshToken: generateRefreshToken(newPayload),
    };
  },
};
