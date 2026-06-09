import { z } from 'zod';

export const employeeLoginSchema = z.object({
  loginIdentifier: z.string().trim().min(3, 'معرّف الدخول مطلوب'),
  password: z.string().min(6, 'كلمة المرور مطلوبة'),
});

export const adminLoginSchema = z.object({
  password: z.string().min(6, 'كلمة المرور مطلوبة'),
});

export const createEmployeeSchema = z.object({
  fullName: z.string().trim().min(3, 'اسم الموظف مطلوب'),
  whatsappNumber: z.string().trim().min(10, 'رقم الواتساب غير صالح'),
  defaultCodeValidityDays: z.coerce.number().int().min(1).max(365).default(7),
});

export const createStudentSchema = z.object({
  fullName: z.string().trim().min(3, 'اسم الطالب مطلوب'),
  phone: z.string().trim().min(10, 'رقم الهاتف غير صالح'),
  studyLevel: z.string().trim().min(1, 'المستوى الدراسي مطلوب'),
  age: z.coerce.number().int().min(5).max(100),
  courseIds: z.array(z.coerce.number().int()).min(1, 'اختر دورة واحدة على الأقل'),
  codeValidityDays: z.coerce.number().int().min(1).max(365),
});

export const updateCodeValiditySchema = z.object({
  codeValidityDays: z.coerce.number().int().min(1).max(365),
});
