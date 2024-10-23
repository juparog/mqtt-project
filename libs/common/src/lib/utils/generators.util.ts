import { randomInt } from 'node:crypto';

export function generateToken(prefix: string, length = 32): string {
  const ALPHABET =
    'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  const alphabetLength = ALPHABET.length;

  let token = prefix;

  for (let i = 0; i < length; i++) {
    const randomIndex = randomInt(alphabetLength);
    token += ALPHABET[randomIndex];
  }

  return token;
}
