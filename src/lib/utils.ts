export function formatPrice(amount: number): string {
  return amount.toLocaleString('ar-EG');
}

export function getRegistrationCodePrefix(grantCode?: string): string {
  const sanitized = (grantCode || '')
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, '');

  return sanitized.charAt(0) || 'Z';
}

export function createRegistrationCodeCandidate(grantCode?: string): string {
  const prefix = getRegistrationCodePrefix(grantCode);
  const suffix = Math.floor(100 + Math.random() * 900).toString();
  return `${prefix}${suffix}`.slice(0, 6);
}

export function normalizePhoneNumber(phone: string): string {
  return phone.replace(/[^\d]/g, '');
}

export function normalizeWhatsappTarget(phone: string): string {
  const normalized = normalizePhoneNumber(phone);

  if (normalized.startsWith('20')) return normalized;
  if (normalized.startsWith('0')) return `2${normalized}`;

  return normalized;
}

export function buildWhatsappLink(phone: string, message: string): string {
  return `https://wa.me/${normalizeWhatsappTarget(phone)}?text=${encodeURIComponent(message)}`;
}
