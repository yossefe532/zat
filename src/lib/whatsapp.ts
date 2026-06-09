import type { StudentSummary } from '@/lib/portal';

function normalizeDigits(input: string) {
  return input.replace(/[^\d]/g, '');
}

export type WasenderConfig = {
  apiKey: string;
  baseUrl: string;
};

export function normalizeWhatsappTarget(phone: string) {
  const normalized = normalizeDigits(phone);

  if (normalized.startsWith('20')) {
    return normalized;
  }

  if (normalized.startsWith('0')) {
    return `2${normalized}`;
  }

  return normalized;
}

export function buildRegistrationWhatsappMessage(student: StudentSummary) {
  const courses = student.courses.map((course) => `- ${course.name}`).join('\n');
  const expiryDate = new Date(student.codeExpiresAt).toLocaleDateString('ar-EG');

  return [
    'تم تسجيلك بنجاح في مبادرة ذات.',
    '',
    `الكود النهائي: ${student.finalCode}`,
    `المستوى الدراسي الحالي: ${student.studyLevel}`,
    `إجمالي المبلغ المستحق: ${student.totalAmount.toLocaleString('ar-EG')} جنيه`,
    `مدة صلاحية الكود: ${student.codeValidityDays} يوم حتى ${expiryDate}`,
    `الموظف المسؤول: ${student.employeeName}`,
    `رقم تواصل الموظف: ${student.employeeNumber}`,
    `رقم الموظف داخل النظام: ${student.employeeNumber}`,
    'الدورات المسجل بها:',
    courses,
  ].join('\n');
}

export function getWasenderConfig(): WasenderConfig {
  const apiKey = process.env.WASENDER_API_KEY ?? process.env.WHATSAPP_TOKEN;
  const baseUrl = (process.env.WASENDER_API_BASE_URL ?? 'https://www.wasenderapi.com/api').replace(/\/$/, '');

  if (!apiKey) {
    throw new Error('مفتاح Wasender API غير مهيأ في البيئة');
  }

  return {
    apiKey,
    baseUrl,
  };
}

export async function sendWhatsappTextMessage(to: string, message: string) {
  const { apiKey, baseUrl } = getWasenderConfig();

  const response = await fetch(`${baseUrl}/send-message`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      to: normalizeWhatsappTarget(to),
      text: message,
    }),
  });

  const data = (await response.json().catch(() => ({}))) as {
    success?: boolean;
    message?: string;
    error?: string | { message?: string };
    data?: {
      id?: string;
      messageId?: string;
      key?: {
        id?: string;
      };
    };
  };

  if (!response.ok || data.success === false) {
    const errorMessage = typeof data.error === 'string'
      ? data.error
      : data.error?.message;

    throw new Error(errorMessage ?? data.message ?? 'فشل إرسال رسالة الواتساب');
  }

  return data;
}
