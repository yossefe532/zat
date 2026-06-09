import type { StudentSummary } from '@/lib/portal';

function normalizeDigits(input: string) {
  return input.replace(/[^\d]/g, '');
}

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
