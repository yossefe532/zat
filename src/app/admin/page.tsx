'use client';

import dynamic from 'next/dynamic';
import { type CSSProperties, useEffect, useState } from 'react';
import { BookOpenCheck, DatabaseBackup, LogOut, MessageCircleMore, Users, WalletCards } from 'lucide-react';
import { LoginPanel } from '@/components/console/LoginPanel';
import { MetricCard } from '@/components/console/MetricCard';
import { StatusBadge } from '@/components/console/StatusBadge';
import type { AdminOverview, CourseCatalogItem, StudentSummary } from '@/lib/portal';

const DeferredPanelFallback = ({ label }: { label: string }) => (
  <section className="hero-panel rounded-[2rem] p-6">
    <p className="text-sm font-black text-muted-foreground">جارٍ تحميل قسم {label}...</p>
  </section>
);

const EmployeeManagementPanel = dynamic(
  () => import('@/components/console/EmployeeManagementPanel').then((module) => module.EmployeeManagementPanel),
  { loading: () => <DeferredPanelFallback label="الموظفين" /> },
);
const AdminStudentManagementPanel = dynamic(
  () => import('@/components/console/AdminStudentManagementPanel').then((module) => module.AdminStudentManagementPanel),
  { loading: () => <DeferredPanelFallback label="الطلاب" /> },
);
const AdminRegistrationsPanel = dynamic(
  () => import('@/components/console/AdminRegistrationsPanel').then((module) => module.AdminRegistrationsPanel),
  { loading: () => <DeferredPanelFallback label="طلبات التسجيل" /> },
);
const CourseManagementPanel = dynamic(
  () => import('@/components/console/CourseManagementPanel').then((module) => module.CourseManagementPanel),
  { loading: () => <DeferredPanelFallback label="الكورسات" /> },
);
const AuditPanels = dynamic(
  () => import('@/components/console/AuditPanels').then((module) => module.AuditPanels),
  { loading: () => <DeferredPanelFallback label="السجلات والنسخ الاحتياطية" /> },
);

async function parseResponse<T>(response: Response): Promise<T> {
  const payload = (await response.json().catch(() => ({}))) as T & { message?: string };

  if (!response.ok) {
    throw new Error(payload.message ?? 'تعذر تنفيذ الطلب');
  }

  return payload;
}

const emptyOverview: AdminOverview = {
  employees: [],
  students: [],
  registrations: [],
  auditLogs: [],
  backups: [],
  stats: {
    registrationCount: 0,
    studentCount: 0,
    employeeCount: 0,
    whatsappCount: 0,
    activeCodes: 0,
    totalRevenue: 0,
  },
};

const deferredSectionStyle: CSSProperties = {
  contentVisibility: 'auto',
  containIntrinsicSize: '960px',
};

export default function AdminPage() {
  const [authenticated, setAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [backupBusy, setBackupBusy] = useState(false);
  const [busyEmployeeId, setBusyEmployeeId] = useState<string | null>(null);
  const [busyStudentId, setBusyStudentId] = useState<string | null>(null);
  const [busyCourseId, setBusyCourseId] = useState<number | null>(null);
  const [creatingCourse, setCreatingCourse] = useState(false);
  const [overview, setOverview] = useState<AdminOverview>(emptyOverview);
  const [courses, setCourses] = useState<CourseCatalogItem[]>([]);
  const [latestCredentials, setLatestCredentials] = useState<{
    employeeNumber: string;
    loginIdentifier: string;
    staffCode: string;
    tempPassword: string;
  } | null>(null);

  async function loadDashboard() {
    const [overviewResponse, coursesResponse] = await Promise.all([
      fetch('/api/admin/overview', { cache: 'no-store' }),
      fetch('/api/courses?includeInactive=1', { cache: 'no-store' }),
    ]);

    const overviewPayload = await parseResponse<{ success: boolean; data: AdminOverview }>(overviewResponse);
    const coursesPayload = await parseResponse<{ success: boolean; data: CourseCatalogItem[] }>(coursesResponse);

    setOverview(overviewPayload.data);
    setCourses(coursesPayload.data);
  }

  useEffect(() => {
    void (async () => {
      try {
        const response = await fetch('/api/auth/me', { cache: 'no-store' });
        const payload = await parseResponse<{
          authenticated: boolean;
          actor?: { role?: 'admin' | 'employee' };
        }>(response);

        if (payload.authenticated && payload.actor?.role === 'admin') {
          setAuthenticated(true);
          await loadDashboard();
        }
      } catch {
        setAuthenticated(false);
      }
    })();
  }, []);

  async function handleLogin() {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role: 'admin', password }),
      });

      await parseResponse(response);
      setAuthenticated(true);
      setPassword('');
      await loadDashboard();
    } catch (loginError) {
      setError(loginError instanceof Error ? loginError.message : 'تعذر تسجيل الدخول');
    } finally {
      setLoading(false);
    }
  }

  async function handleLogout() {
    await fetch('/api/auth/logout', { method: 'POST' });
    setAuthenticated(false);
    setOverview(emptyOverview);
    setCourses([]);
  }

  async function handleCreateEmployee(payload: {
    fullName: string;
    whatsappNumber: string;
    defaultCodeValidityDays: number;
  }) {
    try {
      setError(null);
      const response = await fetch('/api/employees', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const result = await parseResponse<{
        success: boolean;
        data: {
          employee: AdminOverview['employees'][number];
          tempPassword: string;
        };
      }>(response);

      setLatestCredentials({
        employeeNumber: result.data.employee.employeeNumber,
        loginIdentifier: result.data.employee.loginIdentifier,
        staffCode: result.data.employee.staffCode,
        tempPassword: result.data.tempPassword,
      });
      await loadDashboard();
    } catch (createError) {
      setError(createError instanceof Error ? createError.message : 'تعذر إنشاء الموظف');
    }
  }

  async function handleToggleEmployee(employeeId: string, isActive: boolean) {
    try {
      setBusyEmployeeId(employeeId);
      const response = await fetch(`/api/employees/${employeeId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive }),
      });

      await parseResponse(response);
      await loadDashboard();
    } catch (toggleError) {
      setError(toggleError instanceof Error ? toggleError.message : 'تعذر تحديث حالة الموظف');
    } finally {
      setBusyEmployeeId(null);
    }
  }

  async function handleUpdateEmployee(
    employeeId: string,
    payload: {
      fullName: string;
      whatsappNumber: string;
      defaultCodeValidityDays: number;
      staffCode: string;
      loginIdentifier: string;
      isActive: boolean;
    },
  ) {
    try {
      setBusyEmployeeId(employeeId);
      setError(null);
      const response = await fetch(`/api/employees/${employeeId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      await parseResponse(response);
      await loadDashboard();
    } catch (updateError) {
      setError(updateError instanceof Error ? updateError.message : 'تعذر تحديث الكود');
    } finally {
      setBusyEmployeeId(null);
    }
  }

  async function handleDeleteEmployee(employeeId: string) {
    if (!window.confirm('هل تريد حذف هذا الكود نهائيًا؟ سيتم منعه من الاستخدام إن لم يكن مرتبطًا بسجلات.')) {
      return;
    }

    try {
      setBusyEmployeeId(employeeId);
      setError(null);
      const response = await fetch(`/api/employees/${employeeId}`, {
        method: 'DELETE',
      });

      await parseResponse(response);
      await loadDashboard();
    } catch (deleteError) {
      setError(deleteError instanceof Error ? deleteError.message : 'تعذر حذف الكود');
    } finally {
      setBusyEmployeeId(null);
    }
  }

  async function handleRunBackup() {
    try {
      setBackupBusy(true);
      setError(null);
      const response = await fetch('/api/system/backup', { method: 'POST' });
      await parseResponse(response);
      await loadDashboard();
    } catch (backupError) {
      setError(backupError instanceof Error ? backupError.message : 'تعذر إنشاء النسخة الاحتياطية');
    } finally {
      setBackupBusy(false);
    }
  }

  async function handleUpdateStudent(
    studentId: string,
    payload: {
      fullName: string;
      phone: string;
      studyLevel: string;
      age: number;
      courseIds: number[];
      codeValidityDays: number;
    },
  ) {
    try {
      setBusyStudentId(studentId);
      setError(null);
      const response = await fetch(`/api/students/${studentId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const result = await parseResponse<{ success: boolean; data: StudentSummary }>(response);
      setOverview((previous) => ({
        ...previous,
        students: previous.students.map((student) =>
          student.id === studentId ? result.data : student,
        ),
      }));
    } catch (updateError) {
      setError(updateError instanceof Error ? updateError.message : 'تعذر تحديث السجل');
    } finally {
      setBusyStudentId(null);
    }
  }

  async function handleDeleteStudent(studentId: string) {
    if (!window.confirm('هل تريد حذف سجل الطالب نهائيًا؟')) {
      return;
    }

    try {
      setBusyStudentId(studentId);
      setError(null);
      const response = await fetch(`/api/students/${studentId}`, {
        method: 'DELETE',
      });
      await parseResponse(response);
      setOverview((previous) => ({
        ...previous,
        students: previous.students.filter((student) => student.id !== studentId),
        stats: {
          ...previous.stats,
          studentCount: Math.max(previous.stats.studentCount - 1, 0),
        },
      }));
    } catch (deleteError) {
      setError(deleteError instanceof Error ? deleteError.message : 'تعذر حذف السجل');
    } finally {
      setBusyStudentId(null);
    }
  }

  async function handleSendWhatsapp(studentId: string) {
    try {
      setBusyStudentId(studentId);
      setError(null);
      const response = await fetch(`/api/students/${studentId}/send-whatsapp`, {
        method: 'POST',
      });

      const payload = await parseResponse<{ success: boolean; data: StudentSummary }>(response);
      setOverview((previous) => ({
        ...previous,
        students: previous.students.map((student) =>
          student.id === studentId ? payload.data : student,
        ),
      }));
    } catch (sendError) {
      setError(sendError instanceof Error ? sendError.message : 'تعذر إرسال الرسالة');
    } finally {
      setBusyStudentId(null);
    }
  }

  async function handleCreateCourse(payload: CourseCatalogItem | Omit<CourseCatalogItem, 'id' | 'name' | 'price'> & { nameAr: string; nameEn: string; level: string; icon: string; benefitAr: string; benefitEn: string; detailsAr: string[]; detailsEn: string[]; originalPrice: number; grantPrice: number; isActive: boolean; }) {
    try {
      setCreatingCourse(true);
      setError(null);
      const response = await fetch('/api/courses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const result = await parseResponse<{ success: boolean; data: CourseCatalogItem }>(response);
      setCourses((previous) => [...previous, result.data].sort((a, b) => a.id - b.id));
    } catch (createError) {
      setError(createError instanceof Error ? createError.message : 'تعذر إضافة الكورس');
    } finally {
      setCreatingCourse(false);
    }
  }

  async function handleUpdateCourse(courseId: number, payload: {
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
    try {
      setBusyCourseId(courseId);
      setError(null);
      const response = await fetch(`/api/courses/${courseId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const result = await parseResponse<{ success: boolean; data: CourseCatalogItem }>(response);
      setCourses((previous) => previous.map((course) => (course.id === courseId ? result.data : course)));
    } catch (updateError) {
      setError(updateError instanceof Error ? updateError.message : 'تعذر تحديث الكورس');
    } finally {
      setBusyCourseId(null);
    }
  }

  async function handleDeleteCourse(courseId: number) {
    if (!window.confirm('هل تريد حذف هذا الكورس نهائيًا؟')) {
      return;
    }

    try {
      setBusyCourseId(courseId);
      setError(null);
      const response = await fetch(`/api/courses/${courseId}`, {
        method: 'DELETE',
      });
      await parseResponse(response);
      setCourses((previous) => previous.filter((course) => course.id !== courseId));
    } catch (deleteError) {
      setError(deleteError instanceof Error ? deleteError.message : 'تعذر حذف الكورس');
    } finally {
      setBusyCourseId(null);
    }
  }

  if (!authenticated) {
    return (
      <main className="page-shell flex min-h-screen items-center justify-center px-4 py-10">
        <LoginPanel
          title="لوحة المشرف"
          subtitle="مصادقة آمنة لإدارة الموظفين والطلاب وسجل العمليات والنسخ الاحتياطية."
          error={error}
          actionLabel={loading ? 'جارٍ الدخول' : 'دخول المشرف'}
          onSubmit={() => void handleLogin()}
          fields={
            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="كلمة مرور المشرف"
              className="field-shell w-full rounded-2xl px-4 py-3"
              onKeyDown={(event) => {
                if (event.key === 'Enter') {
                  void handleLogin();
                }
              }}
            />
          }
        />
      </main>
    );
  }

  return (
    <main className="admin-shell page-shell min-h-screen px-4 py-6 md:px-6">
      <div className="mx-auto max-w-7xl space-y-6">
        <section className="hero-panel rounded-[2.2rem] p-6 md:p-8">
          <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
            <div>
              <div className="mb-3 flex items-center gap-3">
                <StatusBadge tone="success">وضع مشرف</StatusBadge>
                <StatusBadge>تشفير بيانات</StatusBadge>
                <StatusBadge>تدقيق ونسخ احتياطي</StatusBadge>
              </div>
              <h1 className="section-title text-foreground">نظام الإدارة المركزي لمبادرة ذات</h1>
              <p className="section-subtitle mt-3 max-w-3xl">
                مصدر واحد موحد لبيانات الطلاب، إنشاء الموظفين، تتبع صلاحيات الأكواد، وسجل رقابي كامل لكل عملية.
              </p>
            </div>
            <button
              type="button"
              onClick={() => void handleLogout()}
              className="action-secondary inline-flex items-center gap-2 self-start rounded-2xl px-4 py-3 text-sm font-black text-destructive"
            >
              <LogOut className="h-4 w-4" />
              تسجيل الخروج
            </button>
          </div>
          {error ? <p className="mt-4 text-sm text-destructive">{error}</p> : null}
        </section>

        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-6">
          <MetricCard title="طلبات التسجيل" value={`${overview.stats.registrationCount}`} hint="القادمة من الموقع الرئيسي" icon={BookOpenCheck} />
          <MetricCard title="الطلاب" value={`${overview.stats.studentCount}`} hint="سجلات الكونسول المحفوظة" icon={BookOpenCheck} />
          <MetricCard title="الموظفون" value={`${overview.stats.employeeCount}`} hint="عدد الحسابات العاملة" icon={Users} />
          <MetricCard title="الرسائل" value={`${overview.stats.whatsappCount}`} hint="تم إرسالها للطلاب" icon={MessageCircleMore} />
          <MetricCard title="الأكواد" value={`${overview.stats.activeCodes}`} hint="الأكواد السارية حاليًا" icon={DatabaseBackup} />
          <MetricCard title="الإيراد" value={`${overview.stats.totalRevenue.toLocaleString('ar-EG')} ج`} hint="إجمالي المبالغ المستحقة" icon={WalletCards} />
        </section>

        <section style={deferredSectionStyle}>
          <EmployeeManagementPanel
            employees={overview.employees}
            auditLogs={overview.auditLogs}
            students={overview.students}
            latestCredentials={latestCredentials}
            onCreate={(payload) => void handleCreateEmployee(payload)}
            onToggleStatus={(employeeId, isActive) => void handleToggleEmployee(employeeId, isActive)}
            onUpdate={(employeeId, payload) => void handleUpdateEmployee(employeeId, payload)}
            onDelete={(employeeId) => void handleDeleteEmployee(employeeId)}
            busyEmployeeId={busyEmployeeId}
          />
        </section>

        <section style={deferredSectionStyle}>
          <AdminRegistrationsPanel
            records={overview.registrations}
            courses={courses}
          />
        </section>

        <section style={deferredSectionStyle}>
          <AdminStudentManagementPanel
            records={overview.students}
            courses={courses}
            busyStudentId={busyStudentId}
            onSave={(studentId, payload) => void handleUpdateStudent(studentId, payload)}
            onDelete={(studentId) => void handleDeleteStudent(studentId)}
            onSendWhatsapp={(studentId) => void handleSendWhatsapp(studentId)}
          />
        </section>

        <section style={deferredSectionStyle}>
          <CourseManagementPanel
            courses={courses}
            creating={creatingCourse}
            busyCourseId={busyCourseId}
            onCreate={(payload) => void handleCreateCourse(payload)}
            onUpdate={(courseId, payload) => void handleUpdateCourse(courseId, payload)}
            onDelete={(courseId) => void handleDeleteCourse(courseId)}
          />
        </section>

        <section style={deferredSectionStyle}>
          <AuditPanels
            auditLogs={overview.auditLogs}
            backups={overview.backups}
            onRunBackup={() => void handleRunBackup()}
            backupBusy={backupBusy}
          />
        </section>
      </div>
    </main>
  );
}
