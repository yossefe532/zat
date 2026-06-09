import {
  createCipheriv,
  createDecipheriv,
  createHash,
  randomBytes,
  scryptSync,
  timingSafeEqual,
} from 'node:crypto';

function getRequiredSecret(name: string) {
  const value = process.env[name];

  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }

  return value;
}

function createKey(name: string) {
  return createHash('sha256').update(getRequiredSecret(name)).digest();
}

export function hashValue(value: string) {
  return createHash('sha256').update(value.trim().toLowerCase()).digest('hex');
}

export function encryptText(value: string) {
  const key = createKey('DATA_ENCRYPTION_KEY');
  const iv = randomBytes(12);
  const cipher = createCipheriv('aes-256-gcm', key, iv);
  const encrypted = Buffer.concat([cipher.update(value, 'utf8'), cipher.final()]);
  const authTag = cipher.getAuthTag();

  return `${iv.toString('base64url')}.${authTag.toString('base64url')}.${encrypted.toString('base64url')}`;
}

export function decryptText(payload: string) {
  const [ivPart, tagPart, cipherPart] = payload.split('.');

  if (!ivPart || !tagPart || !cipherPart) {
    throw new Error('Invalid encrypted payload');
  }

  const key = createKey('DATA_ENCRYPTION_KEY');
  const decipher = createDecipheriv(
    'aes-256-gcm',
    key,
    Buffer.from(ivPart, 'base64url'),
  );

  decipher.setAuthTag(Buffer.from(tagPart, 'base64url'));

  const decrypted = Buffer.concat([
    decipher.update(Buffer.from(cipherPart, 'base64url')),
    decipher.final(),
  ]);

  return decrypted.toString('utf8');
}

export function hashPassword(password: string) {
  const salt = randomBytes(16).toString('base64url');
  const hash = scryptSync(password, salt, 64).toString('base64url');
  return `${salt}.${hash}`;
}

export function verifyPassword(password: string, storedHash: string) {
  const [salt, hash] = storedHash.split('.');

  if (!salt || !hash) {
    return false;
  }

  const derived = scryptSync(password, salt, 64);
  const saved = Buffer.from(hash, 'base64url');

  if (derived.length !== saved.length) {
    return false;
  }

  return timingSafeEqual(derived, saved);
}

export function randomToken(bytes = 32) {
  return randomBytes(bytes).toString('base64url');
}

export function signToken(token: string) {
  return createHash('sha256')
    .update(`${token}.${getRequiredSecret('AUTH_SECRET')}`)
    .digest('hex');
}
