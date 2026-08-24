import bcrypt from 'bcryptjs';

// 12 salt rounds is a common balance between security and hashing speed.
// Higher = slower to brute-force, but slower for legitimate logins too.
const SALT_ROUNDS = 12;

export async function hashPassword(plainPassword: string): Promise<string> {
  return bcrypt.hash(plainPassword, SALT_ROUNDS);
}

export async function comparePassword(
  plainPassword: string,
  passwordHash: string
): Promise<boolean> {
  return bcrypt.compare(plainPassword, passwordHash);
}
