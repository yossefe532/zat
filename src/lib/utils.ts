export function generateRegistrationCode(): string {
  const prefix = 'ZAT';
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substring(2, 5).toUpperCase();
  return `${prefix}-${timestamp}-${random}`;
}

export function formatPrice(amount: number): string {
  return amount.toLocaleString('ar-EG');
}
