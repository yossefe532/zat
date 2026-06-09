import { describe, expect, it } from 'vitest';
import { buildRegistrationWhatsappMessage, normalizeWhatsappTarget } from './whatsapp';

describe('whatsapp helpers', () => {
  it('normalizes local phone numbers to international format', () => {
    expect(normalizeWhatsappTarget('01012345678')).toBe('201012345678');
    expect(normalizeWhatsappTarget('+201012345678')).toBe('201012345678');
  });

  it('builds a registration confirmation message with all required fields', () => {
    const message = buildRegistrationWhatsappMessage({
      id: '1',
      fullName: 'طالب تجريبي',
      phone: '01012345678',
      studyLevel: 'الصف الثالث الثانوي',
      age: 17,
      courses: [
        { id: 1, name: 'إنجليزي', price: 675, level: 'A1' },
        { id: 2, name: 'ICDL', price: 675, level: 'أساسي' },
      ],
      totalAmount: 1350,
      finalCode: 'ZAT-EMP01-AB12',
      codeValidityDays: 7,
      codeExpiresAt: '2026-06-20T00:00:00.000Z',
      employeeId: 'emp-1',
      employeeName: 'سارة',
      employeeNumber: 'EMP-001',
      whatsappSentAt: null,
      whatsappDeliveryId: null,
      createdAt: '2026-06-13T00:00:00.000Z',
    });

    expect(message).toContain('تم تسجيلك بنجاح');
    expect(message).toContain('ZAT-EMP01-AB12');
    expect(message).toContain('EMP-001');
    expect(message).toContain('إنجليزي');
    expect(message).toContain('١٬٣٥٠');
  });
});
