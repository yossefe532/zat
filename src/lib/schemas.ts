import { z } from 'zod';

const shortEmployeeCodeSchema = z
  .string()
  .trim()
  .min(3, 'الكود مطلوب')
  .max(6, 'الحد الأقصى 6 أحرف أو أرقام')
  .regex(/^[A-Za-z0-9]+$/, 'يُسمح بالأحرف والأرقام فقط');

export const employeeLoginSchema = z.object({
  loginIdentifier: shortEmployeeCodeSchema,
  password: z.string().min(6, 'كلمة المرور مطلوبة'),
});

export const adminLoginSchema = z.object({
  password: z.string().min(6, 'كلمة المرور مطلوبة'),
});

export const registrantLoginSchema = z.object({
  phone: z.string().trim().min(10, 'رقم الهاتف غير صالح'),
  registrationCode: z.string().trim().min(3, 'كود التسجيل مطلوب').max(6, 'الحد الأقصى 6 أحرف'),
});

export const createEmployeeSchema = z.object({
  fullName: z.string().trim().min(3, 'اسم الموظف مطلوب'),
  whatsappNumber: z.string().trim().min(10, 'رقم الواتساب غير صالح'),
  defaultCodeValidityDays: z.coerce.number().int().min(1).max(365).default(7),
  parentEmployeeId: z.string().uuid('الموظف الرئيسي غير صالح').nullable().optional(),
});

export const updateEmployeeSchema = z.object({
  employeeNumber: shortEmployeeCodeSchema,
  fullName: z.string().trim().min(3, 'اسم الموظف مطلوب'),
  whatsappNumber: z.string().trim().min(10, 'رقم الواتساب غير صالح'),
  defaultCodeValidityDays: z.coerce.number().int().min(1).max(365),
  staffCode: shortEmployeeCodeSchema,
  loginIdentifier: shortEmployeeCodeSchema,
  newPassword: z.string().trim().min(6, 'كلمة المرور يجب ألا تقل عن 6 أحرف').optional().or(z.literal('')),
  parentEmployeeId: z.string().uuid('الموظف الرئيسي غير صالح').nullable().optional(),
  isActive: z.coerce.boolean(),
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

export const updateStudentSchema = z.object({
  fullName: z.string().trim().min(3, 'اسم الطالب مطلوب'),
  phone: z.string().trim().min(10, 'رقم الهاتف غير صالح'),
  studyLevel: z.string().trim().min(1, 'المستوى الدراسي مطلوب'),
  age: z.coerce.number().int().min(5).max(100),
  courseIds: z.array(z.coerce.number().int()).min(1, 'اختر دورة واحدة على الأقل'),
  codeValidityDays: z.coerce.number().int().min(1).max(365),
});

export const courseSchema = z.object({
  nameAr: z.string().trim().min(2, 'الاسم العربي مطلوب'),
  nameEn: z.string().trim().min(2, 'الاسم الإنجليزي مطلوب'),
  level: z.string().trim().min(1, 'المستوى مطلوب'),
  icon: z.string().trim().min(1, 'الأيقونة مطلوبة'),
  benefitAr: z.string().trim().min(2, 'الوصف العربي مطلوب'),
  benefitEn: z.string().trim().min(2, 'الوصف الإنجليزي مطلوب'),
  detailsAr: z.array(z.string().trim()).default([]),
  detailsEn: z.array(z.string().trim()).default([]),
  originalPrice: z.coerce.number().min(0),
  grantPrice: z.coerce.number().min(0),
  isActive: z.coerce.boolean().default(true),
});
