'use server';

import { COURSES } from '@/lib/data';
import {
  decryptText,
  encryptText,
  hashPassword,
  hashValue,
  randomToken,
} from '@/lib/security';
import { requireServiceSupabaseClient } from '@/lib/server-supabase';
import type { SessionActor } from '@/lib/auth';

type CourseRow = {
  id: number;
  name_ar: string;
  name_en: string;
  icon?: string | null;
  level?: string | null;
  original_price?: number | string | null;
  grant_price: number | string;
  benefit_ar?: string | null;
  benefit_en?: string | null;
  details_ar?: string[] | null;
  details_en?: string[] | null;
  is_active?: boolean;
};

type EmployeeRow = {
  id: string;
  employee_number: string;
  full_name: string;
  whatsapp_encrypted: string;
  whatsapp_last4: string;
  staff_code: string;
  login_identifier: string;
  default_code_validity_days: number;
  is_active: boolean;
  created_by: string | null;
  created_at: string;
};

type StudentRow = {
  id: string;
  full_name_encrypted: string;
  phone_encrypted: string;
  study_level: string;
  age: number;
  courses: CourseSnapshot[];
  total_amount: number | string;
  final_code: string;
  code_validity_days: number;
  code_expires_at: string;
  employee_id: string;
  employee_name: string;
  employee_number: string;
  whatsapp_sent_at: string | null;
  whatsapp_delivery_id: string | null;
  created_at: string;
};

type RegistrationRow = {
  id: string;
  full_name: string;
  phone: string;
  age: number | null;
  courses: number[] | null;
  total_price: number | string;
  first_installment: number | string | null;
  second_installment: number | string | null;
  registration_code: string;
  grant_code_used: string | null;
  whatsapp_sent: boolean | null;
  created_at: string | null;
};

type AuditLogRow = {
  id: string;
  actor_role: string;
  actor_name: string;
  action: string;
  target_table: string;
  target_id: string;
  metadata: Record<string, unknown> | null;
  created_at: string;
};

type BackupRow = {
  id: string;
  backup_type: string;
  summary: Record<string, unknown> | null;
  created_at: string;
  created_by: string;
};

export type CourseSnapshot = {
  id: number;
  name: string;
  price: number;
  level: string;
};

export type CourseCatalogItem = CourseSnapshot & {
  nameAr: string;
  nameEn: string;
  icon: string;
  benefitAr: string;
  benefitEn: string;
  detailsAr: string[];
  detailsEn: string[];
  originalPrice: number;
  grantPrice: number;
  isActive: boolean;
};

export type EmployeeSummary = {
  id: string;
  employeeNumber: string;
  fullName: string;
  whatsappNumber: string;
  whatsappLast4: string;
  staffCode: string;
  loginIdentifier: string;
  defaultCodeValidityDays: number;
  isActive: boolean;
  createdBy: string | null;
  createdAt: string;
};

export type StudentSummary = {
  id: string;
  fullName: string;
  phone: string;
  studyLevel: string;
  age: number;
  courses: CourseSnapshot[];
  totalAmount: number;
  finalCode: string;
  codeValidityDays: number;
  codeExpiresAt: string;
  employeeId: string;
  employeeName: string;
  employeeNumber: string;
  whatsappSentAt: string | null;
  whatsappDeliveryId: string | null;
  createdAt: string;
};

export type RegistrationSummary = {
  id: string;
  fullName: string;
  phone: string;
  age: number | null;
  courseIds: number[];
  totalPrice: number;
  firstInstallment: number;
  secondInstallment: number;
  registrationCode: string;
  grantCodeUsed: string | null;
  whatsappSent: boolean;
  createdAt: string | null;
};

export type AuditLogSummary = {
  id: string;
  actorRole: string;
  actorName: string;
  action: string;
  targetTable: string;
  targetId: string;
  metadata: Record<string, unknown> | null;
  createdAt: string;
};

export type BackupSummary = {
  id: string;
  backupType: string;
  summary: Record<string, unknown> | null;
  createdAt: string;
  createdBy: string;
};

export type AdminOverview = {
  employees: EmployeeSummary[];
  students: StudentSummary[];
  registrations: RegistrationSummary[];
  auditLogs: AuditLogSummary[];
  backups: BackupSummary[];
  stats: {
    registrationCount: number;
    studentCount: number;
    employeeCount: number;
    whatsappCount: number;
    activeCodes: number;
    totalRevenue: number;
  };
};

function normalizePhoneNumber(value: string) {
  return value.replace(/[^\d]/g, '');
}

function toFallbackCourseCatalogItem(id: number): CourseCatalogItem | null {
  const course = COURSES.find((item) => item.id === id);

  if (!course) {
    return null;
  }

  return {
    id: course.id,
    name: course.nameAr,
    price: course.grantPrice,
    level: course.level,
    nameAr: course.nameAr,
    nameEn: course.nameEn,
    icon: course.icon,
    benefitAr: course.benefitAr,
    benefitEn: course.benefitEn,
    detailsAr: course.detailsAr ?? [],
    detailsEn: course.detailsEn ?? [],
    originalPrice: course.originalPrice,
    grantPrice: course.grantPrice,
    isActive: true,
  };
}

function toCourseSnapshot(course: CourseCatalogItem): CourseSnapshot {
  return {
    id: course.id,
    name: course.nameAr,
    price: course.grantPrice,
    level: course.level,
  };
}

function mapCourseRow(row: CourseRow): CourseCatalogItem {
  return {
    id: row.id,
    name: row.name_ar,
    price: Number(row.grant_price),
    level: row.level ?? 'عام',
    nameAr: row.name_ar,
    nameEn: row.name_en,
    icon: row.icon ?? '📚',
    benefitAr: row.benefit_ar ?? row.details_ar?.[0] ?? 'تفاصيل الكورس متاحة عبر الإدارة.',
    benefitEn: row.benefit_en ?? row.details_en?.[0] ?? 'Course details are available from the admin panel.',
    detailsAr: row.details_ar ?? [],
    detailsEn: row.details_en ?? [],
    originalPrice: Number(row.original_price ?? row.grant_price),
    grantPrice: Number(row.grant_price),
    isActive: row.is_active ?? true,
  };
}

function normalizeCourseTextList(values: string[]) {
  return values
    .map((value) => value.trim())
    .filter(Boolean);
}

function normalizeCourseInput(input: {
  nameAr: string;
  nameEn: string;
  level: string;
  icon: string;
  benefitAr: string;
  benefitEn: string;
  detailsAr: string[];
  detailsEn: string[];
  originalPrice: number;
  grantPrice: number;
  isActive: boolean;
}) {
  const detailsAr = normalizeCourseTextList(input.detailsAr);
  const detailsEn = normalizeCourseTextList(input.detailsEn);

  return {
    name_ar: input.nameAr.trim(),
    name_en: input.nameEn.trim(),
    icon: input.icon.trim() || '📚',
    level: input.level.trim() || 'عام',
    benefit_ar: input.benefitAr.trim(),
    benefit_en: input.benefitEn.trim(),
    details_ar: detailsAr,
    details_en: detailsEn,
    original_price: input.originalPrice,
    grant_price: input.grantPrice,
    is_active: input.isActive,
  };
}

function formatEmployeeNumber(seed: string) {
  return `EMP-${seed.toUpperCase()}`;
}

function formatStaffCode(seed: string) {
  return `ZT-${seed.toUpperCase()}`;
}

function buildTempPassword() {
  return `Zat!${randomToken(6).replace(/[^A-Za-z0-9]/g, '').slice(0, 8)}`;
}

async function logAudit(
  actor: SessionActor | { role: 'system'; subjectId: string; fullName?: string },
  action: string,
  targetTable: string,
  targetId: string,
  metadata: Record<string, unknown> | null,
) {
  const supabase = requireServiceSupabaseClient();

  const payload = {
    actor_role: actor.role,
    actor_name: actor.fullName ?? actor.subjectId,
    action,
    target_table: targetTable,
    target_id: targetId,
    metadata,
  };

  const { error } = await supabase.from('audit_logs').insert([payload]);

  if (error) {
    console.error('Failed to write audit log', error.message);
  }
}

async function generateUniqueEmployeeIdentifiers() {
  const supabase = requireServiceSupabaseClient();

  for (let attempt = 0; attempt < 15; attempt += 1) {
    const seed = randomToken(5).replace(/[^A-Za-z0-9]/g, '').slice(0, 5);
    const employeeNumber = formatEmployeeNumber(seed);
    const staffCode = formatStaffCode(seed);
    const loginIdentifier = employeeNumber;

    const { data, error } = await supabase
      .from('employees')
      .select('id')
      .or(`employee_number.eq.${employeeNumber},staff_code.eq.${staffCode},login_identifier.eq.${loginIdentifier}`)
      .limit(1);

    if (error) {
      throw new Error(error.message);
    }

    if (!data || data.length === 0) {
      return { employeeNumber, staffCode, loginIdentifier };
    }
  }

  throw new Error('تعذر إنشاء معرفات موظف فريدة');
}

async function generateUniqueStudentCode(staffCode: string) {
  const supabase = requireServiceSupabaseClient();
  const prefix = staffCode.replace(/[^A-Z0-9]/gi, '').slice(0, 6).toUpperCase();

  for (let attempt = 0; attempt < 20; attempt += 1) {
    const suffix = randomToken(4).replace(/[^A-Za-z0-9]/g, '').slice(0, 5).toUpperCase();
    const finalCode = `ZAT-${prefix}-${suffix}`;
    const { data, error } = await supabase
      .from('student_records')
      .select('id')
      .eq('final_code', finalCode)
      .maybeSingle();

    if (error) {
      throw new Error(error.message);
    }

    if (!data) {
      return finalCode;
    }
  }

  throw new Error('تعذر إنشاء كود طالب فريد');
}

function mapEmployee(row: EmployeeRow): EmployeeSummary {
  return {
    id: row.id,
    employeeNumber: row.employee_number,
    fullName: row.full_name,
    whatsappNumber: decryptText(row.whatsapp_encrypted),
    whatsappLast4: row.whatsapp_last4,
    staffCode: row.staff_code,
    loginIdentifier: row.login_identifier,
    defaultCodeValidityDays: row.default_code_validity_days,
    isActive: row.is_active,
    createdBy: row.created_by,
    createdAt: row.created_at,
  };
}

function mapStudent(row: StudentRow): StudentSummary {
  return {
    id: row.id,
    fullName: decryptText(row.full_name_encrypted),
    phone: decryptText(row.phone_encrypted),
    studyLevel: row.study_level,
    age: row.age,
    courses: row.courses,
    totalAmount: Number(row.total_amount),
    finalCode: row.final_code,
    codeValidityDays: row.code_validity_days,
    codeExpiresAt: row.code_expires_at,
    employeeId: row.employee_id,
    employeeName: row.employee_name,
    employeeNumber: row.employee_number,
    whatsappSentAt: row.whatsapp_sent_at,
    whatsappDeliveryId: row.whatsapp_delivery_id,
    createdAt: row.created_at,
  };
}

function mapRegistration(row: RegistrationRow): RegistrationSummary {
  return {
    id: row.id,
    fullName: row.full_name,
    phone: row.phone,
    age: row.age,
    courseIds: Array.isArray(row.courses)
      ? row.courses.map((value) => Number(value)).filter((value) => Number.isFinite(value))
      : [],
    totalPrice: Number(row.total_price ?? 0),
    firstInstallment: Number(row.first_installment ?? 0),
    secondInstallment: Number(row.second_installment ?? 0),
    registrationCode: row.registration_code,
    grantCodeUsed: row.grant_code_used,
    whatsappSent: Boolean(row.whatsapp_sent),
    createdAt: row.created_at,
  };
}

function mapAudit(row: AuditLogRow): AuditLogSummary {
  return {
    id: row.id,
    actorRole: row.actor_role,
    actorName: row.actor_name,
    action: row.action,
    targetTable: row.target_table,
    targetId: row.target_id,
    metadata: row.metadata,
    createdAt: row.created_at,
  };
}

function mapBackup(row: BackupRow): BackupSummary {
  return {
    id: row.id,
    backupType: row.backup_type,
    summary: row.summary,
    createdAt: row.created_at,
    createdBy: row.created_by,
  };
}

export async function getCourseCatalog(options?: { includeInactive?: boolean }) {
  const supabase = requireServiceSupabaseClient();
  let query = supabase
    .from('courses')
    .select('id, name_ar, name_en, icon, level, original_price, grant_price, benefit_ar, benefit_en, details_ar, details_en, is_active')
    .order('id');

  if (!options?.includeInactive) {
    query = query.eq('is_active', true);
  }

  const { data, error } = await query;

  if (error || !data || data.length === 0) {
    const fallbackCourses = COURSES.map((course) => toFallbackCourseCatalogItem(course.id)).filter(
      (course): course is CourseCatalogItem => Boolean(course),
    );

    return options?.includeInactive
      ? fallbackCourses
      : fallbackCourses.filter((course) => course.isActive);
  }

  return (data as CourseRow[]).map(mapCourseRow);
}

export async function createCourse(
  input: {
    nameAr: string;
    nameEn: string;
    level: string;
    icon: string;
    benefitAr: string;
    benefitEn: string;
    detailsAr: string[];
    detailsEn: string[];
    originalPrice: number;
    grantPrice: number;
    isActive: boolean;
  },
  actor: SessionActor,
) {
  if (actor.role !== 'admin') {
    throw new Error('FORBIDDEN');
  }

  const supabase = requireServiceSupabaseClient();
  const payload = normalizeCourseInput(input);
  const { data, error } = await supabase
    .from('courses')
    .insert([payload])
    .select('id, name_ar, name_en, icon, level, original_price, grant_price, benefit_ar, benefit_en, details_ar, details_en, is_active')
    .single<CourseRow>();

  if (error || !data) {
    throw new Error(error?.message ?? 'تعذر إنشاء الكورس');
  }

  await logAudit(actor, 'create_course', 'courses', String(data.id), {
    nameAr: data.name_ar,
    nameEn: data.name_en,
  });

  return mapCourseRow(data);
}

export async function updateCourse(
  courseId: number,
  input: {
    nameAr: string;
    nameEn: string;
    level: string;
    icon: string;
    benefitAr: string;
    benefitEn: string;
    detailsAr: string[];
    detailsEn: string[];
    originalPrice: number;
    grantPrice: number;
    isActive: boolean;
  },
  actor: SessionActor,
) {
  if (actor.role !== 'admin') {
    throw new Error('FORBIDDEN');
  }

  const supabase = requireServiceSupabaseClient();
  const payload = normalizeCourseInput(input);
  const { data, error } = await supabase
    .from('courses')
    .update(payload)
    .eq('id', courseId)
    .select('id, name_ar, name_en, icon, level, original_price, grant_price, benefit_ar, benefit_en, details_ar, details_en, is_active')
    .single<CourseRow>();

  if (error || !data) {
    throw new Error(error?.message ?? 'تعذر تحديث الكورس');
  }

  await logAudit(actor, 'update_course', 'courses', String(courseId), {
    nameAr: data.name_ar,
    isActive: data.is_active ?? true,
  });

  return mapCourseRow(data);
}

export async function deleteCourse(courseId: number, actor: SessionActor) {
  if (actor.role !== 'admin') {
    throw new Error('FORBIDDEN');
  }

  const supabase = requireServiceSupabaseClient();
  const { error } = await supabase.from('courses').delete().eq('id', courseId);

  if (error) {
    throw new Error(error.message);
  }

  await logAudit(actor, 'delete_course', 'courses', String(courseId), null);
}

export async function listEmployees() {
  const supabase = requireServiceSupabaseClient();
  const { data, error } = await supabase
    .from('employees')
    .select('id, employee_number, full_name, whatsapp_encrypted, whatsapp_last4, staff_code, login_identifier, default_code_validity_days, is_active, created_by, created_at')
    .order('created_at', { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  return ((data ?? []) as EmployeeRow[]).map(mapEmployee);
}

export async function createEmployee(
  input: { fullName: string; whatsappNumber: string; defaultCodeValidityDays: number },
  actor: SessionActor,
) {
  const supabase = requireServiceSupabaseClient();
  const identifiers = await generateUniqueEmployeeIdentifiers();
  const tempPassword = buildTempPassword();
  const normalizedPhone = normalizePhoneNumber(input.whatsappNumber);

  const payload = {
    employee_number: identifiers.employeeNumber,
    full_name: input.fullName.trim(),
    whatsapp_encrypted: encryptText(normalizedPhone),
    whatsapp_hash: hashValue(normalizedPhone),
    whatsapp_last4: normalizedPhone.slice(-4),
    staff_code: identifiers.staffCode,
    login_identifier: identifiers.loginIdentifier,
    password_hash: hashPassword(tempPassword),
    default_code_validity_days: input.defaultCodeValidityDays,
    created_by: actor.subjectId,
  };

  const { data, error } = await supabase
    .from('employees')
    .insert([payload])
    .select('id, employee_number, full_name, whatsapp_encrypted, whatsapp_last4, staff_code, login_identifier, default_code_validity_days, is_active, created_by, created_at')
    .single<EmployeeRow>();

  if (error || !data) {
    throw new Error(error?.message ?? 'تعذر إنشاء الموظف');
  }

  await logAudit(actor, 'create_employee', 'employees', data.id, {
    employeeNumber: data.employee_number,
    staffCode: data.staff_code,
  });

  return {
    employee: mapEmployee(data),
    tempPassword,
  };
}

export async function updateEmployeeStatus(
  employeeId: string,
  isActive: boolean,
  actor: SessionActor,
) {
  const supabase = requireServiceSupabaseClient();
  const { data, error } = await supabase
    .from('employees')
    .update({ is_active: isActive, updated_at: new Date().toISOString() })
    .eq('id', employeeId)
    .select('id, employee_number, full_name, whatsapp_encrypted, whatsapp_last4, staff_code, login_identifier, default_code_validity_days, is_active, created_by, created_at')
    .single<EmployeeRow>();

  if (error || !data) {
    throw new Error(error?.message ?? 'تعذر تحديث حالة الموظف');
  }

  await logAudit(actor, 'toggle_employee_status', 'employees', employeeId, { isActive });
  return mapEmployee(data);
}

export async function updateEmployee(
  employeeId: string,
  input: {
    fullName: string;
    whatsappNumber: string;
    defaultCodeValidityDays: number;
    staffCode: string;
    loginIdentifier: string;
    isActive: boolean;
  },
  actor: SessionActor,
) {
  if (actor.role !== 'admin') {
    throw new Error('FORBIDDEN');
  }

  const supabase = requireServiceSupabaseClient();
  const normalizedPhone = normalizePhoneNumber(input.whatsappNumber);
  const { data, error } = await supabase
    .from('employees')
    .update({
      full_name: input.fullName.trim(),
      whatsapp_encrypted: encryptText(normalizedPhone),
      whatsapp_hash: hashValue(normalizedPhone),
      whatsapp_last4: normalizedPhone.slice(-4),
      staff_code: input.staffCode.trim().toUpperCase(),
      login_identifier: input.loginIdentifier.trim(),
      default_code_validity_days: input.defaultCodeValidityDays,
      is_active: input.isActive,
      updated_at: new Date().toISOString(),
    })
    .eq('id', employeeId)
    .select('id, employee_number, full_name, whatsapp_encrypted, whatsapp_last4, staff_code, login_identifier, default_code_validity_days, is_active, created_by, created_at')
    .single<EmployeeRow>();

  if (error || !data) {
    throw new Error(error?.message ?? 'تعذر تحديث الكود');
  }

  await logAudit(actor, 'update_employee_code', 'employees', employeeId, {
    fullName: data.full_name,
    staffCode: data.staff_code,
    loginIdentifier: data.login_identifier,
    isActive: data.is_active,
    whatsappLast4: data.whatsapp_last4,
  });

  return mapEmployee(data);
}

export async function deleteEmployee(employeeId: string, actor: SessionActor) {
  if (actor.role !== 'admin') {
    throw new Error('FORBIDDEN');
  }

  const supabase = requireServiceSupabaseClient();
  const { count, error: countError } = await supabase
    .from('student_records')
    .select('id', { count: 'exact', head: true })
    .eq('employee_id', employeeId);

  if (countError) {
    throw new Error(countError.message);
  }

  if ((count ?? 0) > 0) {
    throw new Error('لا يمكن حذف الكود لارتباطه بطلبات أو سجلات طلاب حالية');
  }

  const { data: existing, error: existingError } = await supabase
    .from('employees')
    .select('staff_code, full_name')
    .eq('id', employeeId)
    .maybeSingle<{ staff_code: string; full_name: string }>();

  if (existingError) {
    throw new Error(existingError.message);
  }

  const { error } = await supabase.from('employees').delete().eq('id', employeeId);

  if (error) {
    throw new Error(error.message);
  }

  await logAudit(actor, 'delete_employee_code', 'employees', employeeId, {
    staffCode: existing?.staff_code ?? null,
    fullName: existing?.full_name ?? null,
  });
}

async function resolveSelectedCourses(courseIds: number[]) {
  const courseCatalog = await getCourseCatalog({ includeInactive: true });
  const selectedCourses = courseIds
    .map((id) => courseCatalog.find((course) => course.id === id) ?? toFallbackCourseCatalogItem(id))
    .filter((course): course is CourseCatalogItem => Boolean(course))
    .map(toCourseSnapshot);

  if (selectedCourses.length === 0) {
    throw new Error('لم يتم العثور على الدورات المختارة');
  }

  return selectedCourses;
}

export async function listStudents(actor: SessionActor) {
  const supabase = requireServiceSupabaseClient();
  let query = supabase
    .from('student_records')
    .select('id, full_name_encrypted, phone_encrypted, study_level, age, courses, total_amount, final_code, code_validity_days, code_expires_at, employee_id, employee_name, employee_number, whatsapp_sent_at, whatsapp_delivery_id, created_at')
    .order('created_at', { ascending: false });

  if (actor.role === 'employee') {
    query = query.eq('employee_id', actor.subjectId);
  }

  const { data, error } = await query;

  if (error) {
    throw new Error(error.message);
  }

  return ((data ?? []) as StudentRow[]).map(mapStudent);
}

export async function listRegistrations() {
  const supabase = requireServiceSupabaseClient();
  const { data, error } = await supabase
    .from('registrations')
    .select('id, full_name, phone, age, courses, total_price, first_installment, second_installment, registration_code, grant_code_used, whatsapp_sent, created_at')
    .order('created_at', { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  return ((data ?? []) as RegistrationRow[]).map(mapRegistration);
}

export async function createStudentRecord(
  input: {
    fullName: string;
    phone: string;
    studyLevel: string;
    age: number;
    courseIds: number[];
    codeValidityDays: number;
  },
  actor: SessionActor,
) {
  if (actor.role !== 'employee' || !actor.employeeId || !actor.employeeNumber || !actor.staffCode) {
    throw new Error('FORBIDDEN');
  }

  const supabase = requireServiceSupabaseClient();
  const selectedCourses = await resolveSelectedCourses(input.courseIds);
  const normalizedPhone = normalizePhoneNumber(input.phone);
  const totalAmount = selectedCourses.reduce((sum, course) => sum + course.price, 0);
  const finalCode = await generateUniqueStudentCode(actor.staffCode);
  const codeExpiresAt = new Date(
    Date.now() + input.codeValidityDays * 24 * 60 * 60 * 1000,
  ).toISOString();

  const payload = {
    full_name_encrypted: encryptText(input.fullName.trim()),
    full_name_hash: hashValue(input.fullName),
    phone_encrypted: encryptText(normalizedPhone),
    phone_hash: hashValue(normalizedPhone),
    phone_last4: normalizedPhone.slice(-4),
    study_level: input.studyLevel.trim(),
    age: input.age,
    courses: selectedCourses,
    total_amount: totalAmount,
    final_code: finalCode,
    code_validity_days: input.codeValidityDays,
    code_expires_at: codeExpiresAt,
    employee_id: actor.employeeId,
    employee_name: actor.fullName,
    employee_number: actor.employeeNumber,
  };

  const { data, error } = await supabase
    .from('student_records')
    .insert([payload])
    .select('id, full_name_encrypted, phone_encrypted, study_level, age, courses, total_amount, final_code, code_validity_days, code_expires_at, employee_id, employee_name, employee_number, whatsapp_sent_at, whatsapp_delivery_id, created_at')
    .single<StudentRow>();

  if (error || !data) {
    throw new Error(error?.message ?? 'تعذر تسجيل الطالب');
  }

  await logAudit(actor, 'create_student_record', 'student_records', data.id, {
    finalCode: data.final_code,
    codeValidityDays: data.code_validity_days,
  });

  return mapStudent(data);
}

async function getStudentRowForActor(studentId: string, actor: SessionActor) {
  const supabase = requireServiceSupabaseClient();
  const { data, error } = await supabase
    .from('student_records')
    .select('id, full_name_encrypted, phone_encrypted, study_level, age, courses, total_amount, final_code, code_validity_days, code_expires_at, employee_id, employee_name, employee_number, whatsapp_sent_at, whatsapp_delivery_id, created_at')
    .eq('id', studentId)
    .maybeSingle<StudentRow>();

  if (error) {
    throw new Error(error.message);
  }

  if (!data) {
    throw new Error('NOT_FOUND');
  }

  if (actor.role === 'employee' && data.employee_id !== actor.subjectId) {
    throw new Error('FORBIDDEN');
  }

  return data;
}

export async function updateStudentCodeValidity(
  studentId: string,
  codeValidityDays: number,
  actor: SessionActor,
) {
  const existing = await getStudentRowForActor(studentId, actor);
  const supabase = requireServiceSupabaseClient();
  const codeExpiresAt = new Date(
    Date.now() + codeValidityDays * 24 * 60 * 60 * 1000,
  ).toISOString();

  const { data, error } = await supabase
    .from('student_records')
    .update({
      code_validity_days: codeValidityDays,
      code_expires_at: codeExpiresAt,
      updated_at: new Date().toISOString(),
    })
    .eq('id', studentId)
    .select('id, full_name_encrypted, phone_encrypted, study_level, age, courses, total_amount, final_code, code_validity_days, code_expires_at, employee_id, employee_name, employee_number, whatsapp_sent_at, whatsapp_delivery_id, created_at')
    .single<StudentRow>();

  if (error || !data) {
    throw new Error(error?.message ?? 'تعذر تحديث صلاحية الكود');
  }

  await logAudit(actor, 'update_code_validity', 'student_records', studentId, {
    previousValidityDays: existing.code_validity_days,
    nextValidityDays: codeValidityDays,
  });

  return mapStudent(data);
}

export async function updateStudentRecord(
  studentId: string,
  input: {
    fullName: string;
    phone: string;
    studyLevel: string;
    age: number;
    courseIds: number[];
    codeValidityDays: number;
  },
  actor: SessionActor,
) {
  if (actor.role !== 'admin') {
    throw new Error('FORBIDDEN');
  }

  const existing = await getStudentRowForActor(studentId, actor);
  const supabase = requireServiceSupabaseClient();
  const selectedCourses = await resolveSelectedCourses(input.courseIds);
  const normalizedPhone = normalizePhoneNumber(input.phone);
  const totalAmount = selectedCourses.reduce((sum, course) => sum + course.price, 0);
  const codeExpiresAt = new Date(
    Date.now() + input.codeValidityDays * 24 * 60 * 60 * 1000,
  ).toISOString();

  const { data, error } = await supabase
    .from('student_records')
    .update({
      full_name_encrypted: encryptText(input.fullName.trim()),
      full_name_hash: hashValue(input.fullName),
      phone_encrypted: encryptText(normalizedPhone),
      phone_hash: hashValue(normalizedPhone),
      phone_last4: normalizedPhone.slice(-4),
      study_level: input.studyLevel.trim(),
      age: input.age,
      courses: selectedCourses,
      total_amount: totalAmount,
      code_validity_days: input.codeValidityDays,
      code_expires_at: codeExpiresAt,
      updated_at: new Date().toISOString(),
    })
    .eq('id', studentId)
    .select('id, full_name_encrypted, phone_encrypted, study_level, age, courses, total_amount, final_code, code_validity_days, code_expires_at, employee_id, employee_name, employee_number, whatsapp_sent_at, whatsapp_delivery_id, created_at')
    .single<StudentRow>();

  if (error || !data) {
    throw new Error(error?.message ?? 'تعذر تحديث بيانات الطالب');
  }

  await logAudit(actor, 'update_student_record', 'student_records', studentId, {
    previousPhoneLast4: decryptText(existing.phone_encrypted).slice(-4),
    nextPhoneLast4: normalizedPhone.slice(-4),
    previousValidityDays: existing.code_validity_days,
    nextValidityDays: input.codeValidityDays,
  });

  return mapStudent(data);
}

export async function deleteStudentRecord(studentId: string, actor: SessionActor) {
  if (actor.role !== 'admin') {
    throw new Error('FORBIDDEN');
  }

  const existing = await getStudentRowForActor(studentId, actor);
  const supabase = requireServiceSupabaseClient();
  const { error } = await supabase.from('student_records').delete().eq('id', studentId);

  if (error) {
    throw new Error(error.message);
  }

  await logAudit(actor, 'delete_student_record', 'student_records', studentId, {
    finalCode: existing.final_code,
  });
}

export async function markStudentWhatsappSent(
  studentId: string,
  actor: SessionActor,
  deliveryId: string | null,
) {
  const supabase = requireServiceSupabaseClient();
  await getStudentRowForActor(studentId, actor);

  const { data, error } = await supabase
    .from('student_records')
    .update({
      whatsapp_sent_at: new Date().toISOString(),
      whatsapp_delivery_id: deliveryId,
      updated_at: new Date().toISOString(),
    })
    .eq('id', studentId)
    .select('id, full_name_encrypted, phone_encrypted, study_level, age, courses, total_amount, final_code, code_validity_days, code_expires_at, employee_id, employee_name, employee_number, whatsapp_sent_at, whatsapp_delivery_id, created_at')
    .single<StudentRow>();

  if (error || !data) {
    throw new Error(error?.message ?? 'تعذر تحديث حالة الواتساب');
  }

  await logAudit(actor, 'send_whatsapp', 'student_records', studentId, {
    deliveryId,
  });

  return mapStudent(data);
}

export async function getStudentForMessaging(studentId: string, actor: SessionActor) {
  const row = await getStudentRowForActor(studentId, actor);
  return mapStudent(row);
}

export async function listAuditLogs(limit = 60) {
  const supabase = requireServiceSupabaseClient();
  const { data, error } = await supabase
    .from('audit_logs')
    .select('id, actor_role, actor_name, action, target_table, target_id, metadata, created_at')
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) {
    throw new Error(error.message);
  }

  return ((data ?? []) as AuditLogRow[]).map(mapAudit);
}

export async function listBackups(limit = 20) {
  const supabase = requireServiceSupabaseClient();
  const { data, error } = await supabase
    .from('backup_snapshots')
    .select('id, backup_type, summary, created_at, created_by')
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) {
    throw new Error(error.message);
  }

  return ((data ?? []) as BackupRow[]).map(mapBackup);
}

export async function createBackupSnapshot(actor: SessionActor | { role: 'system'; subjectId: string; fullName?: string }) {
  const supabase = requireServiceSupabaseClient();
  const [employees, students, auditLogs] = await Promise.all([
    supabase.from('employees').select('*').order('created_at', { ascending: false }),
    supabase.from('student_records').select('*').order('created_at', { ascending: false }),
    supabase.from('audit_logs').select('*').order('created_at', { ascending: false }).limit(200),
  ]);

  if (employees.error || students.error || auditLogs.error) {
    throw new Error(
      employees.error?.message ?? students.error?.message ?? auditLogs.error?.message ?? 'تعذر إنشاء النسخة الاحتياطية',
    );
  }

  const summary = {
    employeeCount: employees.data?.length ?? 0,
    studentCount: students.data?.length ?? 0,
    auditLogCount: auditLogs.data?.length ?? 0,
  };

  const { data, error } = await supabase
    .from('backup_snapshots')
    .insert([
      {
        backup_type: 'scheduled',
        summary,
        payload: {
          employees: employees.data,
          students: students.data,
          auditLogs: auditLogs.data,
        },
        created_by: actor.fullName ?? actor.subjectId,
      },
    ])
    .select('id, backup_type, summary, created_at, created_by')
    .single<BackupRow>();

  if (error || !data) {
    throw new Error(error?.message ?? 'تعذر حفظ النسخة الاحتياطية');
  }

  await logAudit(actor, 'create_backup', 'backup_snapshots', data.id, summary);
  return mapBackup(data);
}

export async function getAdminOverview(): Promise<AdminOverview> {
  const [employees, students, registrations, auditLogs, backups] = await Promise.all([
    listEmployees(),
    listStudents({ role: 'admin', subjectId: 'admin' }),
    listRegistrations(),
    listAuditLogs(),
    listBackups(),
  ]);

  return {
    employees,
    students,
    registrations,
    auditLogs,
    backups,
    stats: {
      registrationCount: registrations.length,
      studentCount: students.length,
      employeeCount: employees.length,
      whatsappCount: students.filter((student) => Boolean(student.whatsappSentAt)).length,
      activeCodes: students.filter((student) => new Date(student.codeExpiresAt).getTime() > Date.now()).length,
      totalRevenue: students.reduce((sum, student) => sum + student.totalAmount, 0),
    },
  };
}

type ReferralCodeRow = {
  id: string;
  code: string;
  owner_registration_id: string;
  root_referral_code: string;
  root_grant_code_used: string;
  root_whatsapp_number: string;
  is_active: boolean;
  created_at: string;
};

type ReferralBenefitRow = {
  id: string;
  owner_registration_id: string;
  milestone: number;
  benefit_type: 'discount_total' | 'free_course';
  benefit_value: number | string;
  is_consumed: boolean;
  created_at: string;
  consumed_at: string | null;
};

type ReferralRequestRow = {
  id: string;
  owner_registration_id: string;
  milestone: number;
  target_whatsapp_number: string;
  message: string;
  status: 'requested' | 'sent' | 'cancelled';
  created_at: string;
};

type RegistrationAccessRow = {
  id: string;
  full_name: string;
  phone: string;
  grant_code_used: string | null;
  referral_code_used: string | null;
};

export type ReferralMilestoneStatus = {
  milestone: 1 | 3 | 5;
  achieved: boolean;
  claimable: boolean;
  benefit?: {
    id: string;
    type: 'discount_total' | 'free_course';
    value: number;
    isConsumed: boolean;
  } | null;
};

export type ReferralDashboard = {
  referralCode: string;
  shareTextAr: string;
  shareTextEn: string;
  directCount: number;
  tierProgressCount: number;
  milestones: ReferralMilestoneStatus[];
  grantOwnerWhatsapp: string;
  grantCodeUsed: string;
};

function sanitizeReferralCodeCandidate(value: string) {
  return value.toUpperCase().replace(/[^A-Z0-9]/g, '');
}

async function getGrantOwnerWhatsappByCode(code: string) {
  const supabase = requireServiceSupabaseClient();
  const { data, error } = await supabase
    .from('grant_codes')
    .select('whatsapp_number')
    .eq('code', code)
    .limit(1);

  if (error) {
    throw new Error(error.message);
  }

  const row = (data?.[0] ?? null) as { whatsapp_number?: string } | null;
  return row?.whatsapp_number ?? null;
}

async function getRegistrationAccessRow(registrationId: string) {
  const supabase = requireServiceSupabaseClient();
  const { data, error } = await supabase
    .from('registrations')
    .select('id, full_name, phone, grant_code_used, referral_code_used')
    .eq('id', registrationId)
    .maybeSingle<RegistrationAccessRow>();

  if (error) {
    throw new Error(error.message);
  }

  if (!data) {
    throw new Error('NOT_FOUND');
  }

  if (!data.grant_code_used) {
    throw new Error('FORBIDDEN');
  }

  return data;
}

async function getReferralCodeRowByCode(code: string) {
  const supabase = requireServiceSupabaseClient();
  const { data, error } = await supabase
    .from('referral_codes')
    .select('id, code, owner_registration_id, root_referral_code, root_grant_code_used, root_whatsapp_number, is_active, created_at')
    .eq('code', code)
    .eq('is_active', true)
    .maybeSingle<ReferralCodeRow>();

  if (error) {
    throw new Error(error.message);
  }

  return data ?? null;
}

async function getReferralCodeRowByOwner(registrationId: string) {
  const supabase = requireServiceSupabaseClient();
  const { data, error } = await supabase
    .from('referral_codes')
    .select('id, code, owner_registration_id, root_referral_code, root_grant_code_used, root_whatsapp_number, is_active, created_at')
    .eq('owner_registration_id', registrationId)
    .limit(1);

  if (error) {
    throw new Error(error.message);
  }

  return ((data?.[0] ?? null) as ReferralCodeRow | null) ?? null;
}

function createReferralCodeCandidate() {
  const seed = sanitizeReferralCodeCandidate(randomToken(6)).slice(0, 8);
  return `ZAT${seed}`;
}

export async function getOrCreateReferralCode(registrationId: string) {
  const existing = await getReferralCodeRowByOwner(registrationId);
  if (existing) {
    return existing;
  }

  const registration = await getRegistrationAccessRow(registrationId);
  const grantCodeUsed = registration.grant_code_used ?? '';
  const grantOwnerWhatsapp = (await getGrantOwnerWhatsappByCode(grantCodeUsed)) ?? '';
  const referredByCode = registration.referral_code_used?.trim().toUpperCase() ?? '';
  const referredByRow = referredByCode ? await getReferralCodeRowByCode(referredByCode) : null;
  const inheritedRoot = referredByRow?.root_referral_code ?? (referredByCode || null);
  const supabase = requireServiceSupabaseClient();

  for (let attempt = 0; attempt < 18; attempt += 1) {
    const candidate = createReferralCodeCandidate();
    const rootReferral = inheritedRoot ?? candidate;
    const { data, error } = await supabase
      .from('referral_codes')
      .insert([{
        code: candidate,
        owner_registration_id: registrationId,
        root_referral_code: rootReferral,
        root_grant_code_used: grantCodeUsed,
        root_whatsapp_number: grantOwnerWhatsapp,
        is_active: true,
      }])
      .select('id, code, owner_registration_id, root_referral_code, root_grant_code_used, root_whatsapp_number, is_active, created_at')
      .single<ReferralCodeRow>();

    if (!error && data) {
      return data;
    }
  }

  throw new Error('تعذر إنشاء كود إحالة فريد');
}

async function countReferralEvents(filter: { referralCodeUsed?: string; rootReferralCode?: string }) {
  const supabase = requireServiceSupabaseClient();
  let query = supabase
    .from('referral_events')
    .select('id', { count: 'exact', head: true });

  if (filter.referralCodeUsed) {
    query = query.eq('referral_code_used', filter.referralCodeUsed);
  }

  if (filter.rootReferralCode) {
    query = query.eq('root_referral_code', filter.rootReferralCode);
  }

  const { count, error } = await query;

  if (error) {
    throw new Error(error.message);
  }

  return count ?? 0;
}

async function getBenefitsForOwner(registrationId: string) {
  const supabase = requireServiceSupabaseClient();
  const { data, error } = await supabase
    .from('referral_benefits')
    .select('id, owner_registration_id, milestone, benefit_type, benefit_value, is_consumed, created_at, consumed_at')
    .eq('owner_registration_id', registrationId)
    .order('created_at', { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  return (data ?? []) as ReferralBenefitRow[];
}

const referralMilestones: Array<{
  milestone: 1 | 3 | 5;
  benefitType: 'discount_total' | 'free_course';
  benefitValue: number;
}> = [
  { milestone: 1, benefitType: 'discount_total', benefitValue: 50 },
  { milestone: 3, benefitType: 'discount_total', benefitValue: 200 },
  { milestone: 5, benefitType: 'free_course', benefitValue: 0 },
];

export async function getReferralDashboardForRegistrant(registrationId: string): Promise<ReferralDashboard> {
  const referralCodeRow = await getOrCreateReferralCode(registrationId);
  const registration = await getRegistrationAccessRow(registrationId);
  const directCount = await countReferralEvents({ referralCodeUsed: referralCodeRow.code });
  const rootCount = referralCodeRow.root_referral_code === referralCodeRow.code
    ? await countReferralEvents({ rootReferralCode: referralCodeRow.code })
    : 0;
  const tierProgressCount = referralCodeRow.root_referral_code === referralCodeRow.code ? rootCount : directCount;
  const benefits = await getBenefitsForOwner(registrationId);
  const grantCodeUsed = registration.grant_code_used ?? '';
  const grantOwnerWhatsapp = (await getGrantOwnerWhatsappByCode(grantCodeUsed)) ?? referralCodeRow.root_whatsapp_number;

  const milestones = referralMilestones.map((config) => {
    const existingBenefit = benefits.find((benefit) => benefit.milestone === config.milestone) ?? null;
    const achieved = tierProgressCount >= config.milestone;
    const claimable = achieved && !existingBenefit;

    return {
      milestone: config.milestone,
      achieved,
      claimable,
      benefit: existingBenefit
        ? {
          id: existingBenefit.id,
          type: existingBenefit.benefit_type,
          value: Number(existingBenefit.benefit_value ?? 0),
          isConsumed: existingBenefit.is_consumed,
        }
        : null,
    };
  });

  return {
    referralCode: referralCodeRow.code,
    shareTextAr: 'شارك المنحة واحصل على خصم 50 جنيهًا أنت وصديقك على إجمالي سعر أي كورس',
    shareTextEn: 'Share the grant and get 50 EGP off the total price for you and your friend on any course order.',
    directCount,
    tierProgressCount,
    milestones,
    grantOwnerWhatsapp,
    grantCodeUsed,
  };
}

export async function verifyReferralCodeForGrant(accessCode: string) {
  const normalized = accessCode.trim().toUpperCase();
  const row = await getReferralCodeRowByCode(normalized);
  if (!row) {
    return null;
  }

  return {
    referralCodeUsed: row.code,
    ownerRegistrationId: row.owner_registration_id,
    rootReferralCode: row.root_referral_code,
    rootGrantCodeUsed: row.root_grant_code_used,
    rootWhatsappNumber: row.root_whatsapp_number,
  };
}

export async function requestReferralMilestoneRedemption(
  registrationId: string,
  milestone: 1 | 3 | 5,
) {
  const dashboard = await getReferralDashboardForRegistrant(registrationId);
  const milestoneStatus = dashboard.milestones.find((item) => item.milestone === milestone);
  if (!milestoneStatus?.claimable) {
    throw new Error('غير مؤهل لاسترداد هذه المكافأة');
  }

  const registration = await getRegistrationAccessRow(registrationId);
  const supabase = requireServiceSupabaseClient();
  const existingRequests = await supabase
    .from('referral_redemption_requests')
    .select('id')
    .eq('owner_registration_id', registrationId)
    .eq('milestone', milestone)
    .limit(1);

  if (existingRequests.error) {
    throw new Error(existingRequests.error.message);
  }

  if ((existingRequests.data ?? []).length > 0) {
    throw new Error('تم إرسال طلب الاسترداد لهذه المرحلة مسبقًا');
  }

  const benefitConfig = referralMilestones.find((item) => item.milestone === milestone);
  if (!benefitConfig) {
    throw new Error('مرحلة غير مدعومة');
  }

  let targetWhatsapp = dashboard.grantOwnerWhatsapp;
  if (registration.referral_code_used) {
    const referralOwner = await getReferralCodeRowByCode(registration.referral_code_used.trim().toUpperCase());
    if (referralOwner) {
      const { data: ownerRegistration, error: ownerError } = await supabase
        .from('registrations')
        .select('phone')
        .eq('id', referralOwner.owner_registration_id)
        .maybeSingle<{ phone: string }>();

      if (ownerError) {
        throw new Error(ownerError.message);
      }

      if (ownerRegistration?.phone) {
        targetWhatsapp = ownerRegistration.phone;
      }
    }
  }

  const message = `مرحباً، أريد استرداد مكافأة الإحالة:
الاسم: ${registration.full_name}
الهاتف: ${registration.phone}
كود التسجيل: ${dashboard.referralCode}
عدد الإحالات المحتسبة: ${dashboard.tierProgressCount}
المرحلة: ${milestone}
المكافأة: ${
    milestone === 1
      ? 'خصم 50 جنيه على إجمالي سعر الطلب'
      : milestone === 3
        ? 'خصم 200 جنيه على إجمالي سعر الطلب'
        : 'كورس مجاني (يُخصم قيمة كورس واحد من إجمالي الطلب)'
  }
`;

  const { data: requestRow, error: requestError } = await supabase
    .from('referral_redemption_requests')
    .insert([{
      owner_registration_id: registrationId,
      milestone,
      target_whatsapp_number: targetWhatsapp,
      message,
      status: 'requested',
    }])
    .select('id, owner_registration_id, milestone, target_whatsapp_number, message, status, created_at')
    .single<ReferralRequestRow>();

  if (requestError || !requestRow) {
    throw new Error(requestError?.message ?? 'تعذر إنشاء طلب الاسترداد');
  }

  const { error: benefitError } = await supabase
    .from('referral_benefits')
    .insert([{
      owner_registration_id: registrationId,
      milestone,
      benefit_type: benefitConfig.benefitType,
      benefit_value: benefitConfig.benefitValue,
      is_consumed: false,
    }]);

  if (benefitError) {
    throw new Error(benefitError.message);
  }

  await logAudit({ role: 'system', subjectId: registrationId, fullName: registration.full_name }, 'request_referral_reward', 'referral_redemption_requests', requestRow.id, {
    milestone,
    referralCode: dashboard.referralCode,
  });

  return {
    targetWhatsapp,
    message,
  };
}

export async function applyReferralBenefitsToTotal(ownerRegistrationId: string, courseIds: number[], total: number) {
  const supabase = requireServiceSupabaseClient();
  const { data, error } = await supabase
    .from('referral_benefits')
    .select('id, milestone, benefit_type, benefit_value, is_consumed')
    .eq('owner_registration_id', ownerRegistrationId)
    .eq('is_consumed', false)
    .order('milestone', { ascending: false })
    .limit(1);

  if (error) {
    throw new Error(error.message);
  }

  const benefit = (data?.[0] ?? null) as {
    id: string;
    milestone: number;
    benefit_type: 'discount_total' | 'free_course';
    benefit_value: number | string;
    is_consumed: boolean;
  } | null;

  if (!benefit) {
    return { total, benefitId: null, discountApplied: 0 };
  }

  let discount = 0;
  if (benefit.benefit_type === 'discount_total') {
    discount = Number(benefit.benefit_value ?? 0);
  } else {
    const selectedCourses = await resolveSelectedCourses(courseIds);
    discount = selectedCourses.reduce((max, course) => Math.max(max, course.price), 0);
  }

  const nextTotal = Math.max(total - discount, 0);
  const { error: consumeError } = await supabase
    .from('referral_benefits')
    .update({
      is_consumed: true,
      consumed_registration_id: ownerRegistrationId,
      consumed_at: new Date().toISOString(),
    })
    .eq('id', benefit.id);

  if (consumeError) {
    throw new Error(consumeError.message);
  }

  await logAudit({ role: 'system', subjectId: ownerRegistrationId }, 'consume_referral_reward', 'referral_benefits', benefit.id, {
    benefitType: benefit.benefit_type,
    discount,
    totalBefore: total,
    totalAfter: nextTotal,
  });

  return { total: nextTotal, benefitId: benefit.id, discountApplied: discount };
}
