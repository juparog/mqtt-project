import { randomBytes } from 'node:crypto';

export function generateToken(prefix: string, length = 32): string {
  const randomPart = randomBytes(length).toString('base64url');
  return `${prefix}${randomPart}`;
}
