import type { RegistrationRecord } from './types';
import { normalizePhoneNumber } from './utils';

export function normalizeRegistrantName(value: string): string {
  return value.trim().replace(/\s+/g, ' ').toLowerCase();
}

export function buildRegistrationPhoneCandidates(phone: string): string[] {
  const raw = phone.trim();
  const normalized = normalizePhoneNumber(phone);
  const localVariant = normalized.startsWith('20') ? `0${normalized.slice(2)}` : normalized;
  const internationalVariant = normalized.startsWith('0') ? `2${normalized}` : normalized;

  return Array.from(new Set([normalized, raw, localVariant, internationalVariant].filter(Boolean)));
}

export function mergeRegistrationBooking(
  existing: RegistrationRecord,
  next: Pick<
    RegistrationRecord,
    'courses' | 'totalPrice' | 'firstInstallment' | 'secondInstallment' | 'grantCodeUsed'
  >,
): RegistrationRecord {
  return {
    ...existing,
    courses: [...next.courses],
    totalPrice: next.totalPrice,
    firstInstallment: next.firstInstallment,
    secondInstallment: next.secondInstallment,
    grantCodeUsed: next.grantCodeUsed ?? null,
  };
}
