import { describe, expect, it } from 'vitest';
import {
  buildRegistrationPhoneCandidates,
  mergeRegistrationBooking,
  normalizeRegistrantName,
} from './registration-booking';

describe('registration booking helpers', () => {
  it('normalizes registrant names consistently', () => {
    expect(normalizeRegistrantName('  Ahmed   Ali  ')).toBe('ahmed ali');
    expect(normalizeRegistrantName('أحمد   علي')).toBe('أحمد علي');
  });

  it('builds unique phone candidates for duplicate lookup', () => {
    expect(buildRegistrationPhoneCandidates('010 1234 5678')).toEqual(['01012345678', '010 1234 5678', '201012345678']);
    expect(buildRegistrationPhoneCandidates('+201012345678')).toEqual(['201012345678', '+201012345678', '01012345678']);
  });

  it('merges booking updates while preserving the same booking identity', () => {
    const merged = mergeRegistrationBooking(
      {
        id: 'reg-1',
        fullName: 'أحمد علي',
        phone: '01012345678',
        age: 19,
        courses: [1],
        totalPrice: 675,
        firstInstallment: 200,
        secondInstallment: 475,
        registrationCode: 'H.950',
        grantCodeUsed: 'H.E4U',
        whatsappSent: false,
        createdAt: '2026-06-10T12:00:00.000Z',
      },
      {
        courses: [1, 3],
        totalPrice: 1350,
        firstInstallment: 400,
        secondInstallment: 950,
        grantCodeUsed: 'H.E4U',
      },
    );

    expect(merged.id).toBe('reg-1');
    expect(merged.registrationCode).toBe('H.950');
    expect(merged.fullName).toBe('أحمد علي');
    expect(merged.courses).toEqual([1, 3]);
    expect(merged.totalPrice).toBe(1350);
  });
});
