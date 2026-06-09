import { describe, expect, it, beforeEach } from 'vitest';
import {
  decryptText,
  encryptText,
  hashPassword,
  hashValue,
  verifyPassword,
} from './security';

describe('security helpers', () => {
  beforeEach(() => {
    process.env.DATA_ENCRYPTION_KEY = 'test-encryption-key';
    process.env.AUTH_SECRET = 'test-auth-secret';
  });

  it('encrypts and decrypts values safely', () => {
    const encrypted = encryptText('01012345678');
    expect(encrypted).not.toBe('01012345678');
    expect(decryptText(encrypted)).toBe('01012345678');
  });

  it('hashes passwords and verifies the correct password', () => {
    const hashed = hashPassword('StrongPass123!');
    expect(verifyPassword('StrongPass123!', hashed)).toBe(true);
    expect(verifyPassword('wrong-password', hashed)).toBe(false);
  });

  it('normalizes hashed values consistently', () => {
    expect(hashValue('  Example@Mail.Com ')).toBe(hashValue('example@mail.com'));
  });
});
