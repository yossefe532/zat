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
  level?: string | null;
  grant_price: number | string;
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
  auditLogs: AuditLogSummary[];
  backups: BackupSummary[];
  stats: {
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

function toFallbackCourse(id: number): CourseSnapshot | null {
  const course = COURSES.find((item) => item.id === id);

  if (!course) {
    return null;
  }

  return {
    id: course.id,
    name: course.nameAr,
    price: course.grantPrice,
    level: course.level,
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

export async function getCourseCatalog() {
  const supabase = requireServiceSupabaseClient();
  const { data, error } = await supabase
    .from('courses')
    .select('id, name_ar, name_en, grant_price')
    .eq('is_active', true)
    .order('id');

  if (error || !data || data.length === 0) {
    return COURSES.map((course) => ({
      id: course.id,
      name: course.nameAr,
      price: course.grantPrice,
      level: course.level,
    }));
  }

  return (data as CourseRow[]).map((row) => ({
    id: row.id,
    name: row.name_ar,
    price: Number(row.grant_price),
    level: 'عام',
  }));
}

export async function listEmployees() {
  const supabase = requireServiceSupabaseClient();
  const { data, error } = await supabase
    .from('employees')
    .select('id, employee_number, full_name, whatsapp_encrypted, whatsapp_last4, staff_code, login_identifier, default_code_validity_days, is_active, created_at')
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
    .select('id, employee_number, full_name, whatsapp_encrypted, whatsapp_last4, staff_code, login_identifier, default_code_validity_days, is_active, created_at')
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
    .select('id, employee_number, full_name, whatsapp_encrypted, whatsapp_last4, staff_code, login_identifier, default_code_validity_days, is_active, created_at')
    .single<EmployeeRow>();

  if (error || !data) {
    throw new Error(error?.message ?? 'تعذر تحديث حالة الموظف');
  }

  await logAudit(actor, 'toggle_employee_status', 'employees', employeeId, { isActive });
  return mapEmployee(data);
}

async function resolveSelectedCourses(courseIds: number[]) {
  const courseCatalog = await getCourseCatalog();
  const selectedCourses = courseIds
    .map((id) => courseCatalog.find((course) => course.id === id) ?? toFallbackCourse(id))
    .filter((course): course is CourseSnapshot => Boolean(course));

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
  const [employees, students, auditLogs, backups] = await Promise.all([
    listEmployees(),
    listStudents({ role: 'admin', subjectId: 'admin' }),
    listAuditLogs(),
    listBackups(),
  ]);

  return {
    employees,
    students,
    auditLogs,
    backups,
    stats: {
      studentCount: students.length,
      employeeCount: employees.length,
      whatsappCount: students.filter((student) => Boolean(student.whatsappSentAt)).length,
      activeCodes: students.filter((student) => new Date(student.codeExpiresAt).getTime() > Date.now()).length,
      totalRevenue: students.reduce((sum, student) => sum + student.totalAmount, 0),
    },
  };
}
