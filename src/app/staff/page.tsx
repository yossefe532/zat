'use client';

import dynamic from 'next/dynamic';
import { type CSSProperties, useCallback, useEffect, useMemo, useState } from 'react';
import { BookOpenCheck, KeyRound, LogOut, UserPlus2, Users2, WalletCards } from 'lucide-react';
import { LoginPanel } from '@/components/console/LoginPanel';
import { MetricCard } from '@/components/console/MetricCard';
import { StatusBadge } from '@/components/console/StatusBadge';
import type { CourseSnapshot, EmployeeSummary, StudentSummary } from '@/lib/portal';

const StudentRecordsTable = dynamic(
  () => import('@/components/console/StudentRecordsTable').then((module) => module.StudentRecordsTable),
  {
    loading: () => (
      <section className="hero-panel rounded-[2rem] p-6">
        <p className="text-sm font-black text-muted-foreground">جارٍ تحميل سجلات الطلاب...</p>
      </section>
    ),
  }
);

const deferredSectionStyle: CSSProperties = {
  contentVisibility: 'auto',
  containIntrinsicSize: '820px',
};

type SessionActor = {
  role: 'admin' | 'employee';
  fullName?: string;
  employeeNumber?: string;
  staffCode?: string;
  parentEmployeeId?: string | null;
  rootEmployeeId?: string | null;
};

async function parseResponse<T>(response: Response): Promise<T> {
  const payload = (await response.json().catch(() => ({}))) as T & { message?: string };

  if (!response.ok) {
    throw new Error(payload.message ?? 'تعذر تنفيذ الطلب');
  }

  return payload;
}

export default function StaffPage() {
  const [actor, setActor] = useState<SessionActor | null>(null);
  const [courses, setCourses] = useState<CourseSnapshot[]>([]);
  const [students, setStudents] = useState<StudentSummary[]>([]);
  const [subEmployees, setSubEmployees] = useState<EmployeeSummary[]>([]);
  const [loginIdentifier, setLoginIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [busyStudentId, setBusyStudentId] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [latestSubCredentials, setLatestSubCredentials] = useState<{
    employeeNumber: string;
    loginIdentifier: string;
    staffCode: string;
    tempPassword: string;
  } | null>(null);
  const [currentTimestamp] = useState(() => Date.now());

  const totalRevenue = useMemo(
    () => students.reduce((sum, student) => sum + student.totalAmount, 0),
    [students],
  );

  const activeCodesCount = useMemo(
    () =>
      students.filter(
        (student) => new Date(student.codeExpiresAt).getTime() > currentTimestamp,
      ).length,
    [currentTimestamp, students],
  );

  const subordinateRevenue = useMemo(
    () => subEmployees.length,
    [subEmployees.length],
  );

  const loadStudents = useCallback(async () => {
    const response = await fetch('/api/students', { cache: 'no-store' });
    const payload = await parseResponse<{ success: boolean; data: StudentSummary[] }>(response);
    setStudents(payload.data);
  }, []);

  const loadSubEmployees = useCallback(async () => {
    const response = await fetch('/api/employees', { cache: 'no-store' });
    const payload = await parseResponse<{ success: boolean; data: EmployeeSummary[] }>(response);
    setSubEmployees(payload.data);
  }, []);

  const loadInitialData = useCallback(async () => {
    const [sessionResponse, coursesResponse] = await Promise.all([
      fetch('/api/auth/me', { cache: 'no-store' }),
      fetch('/api/courses', { cache: 'no-store' }),
    ]);

    const sessionPayload = await parseResponse<{
      authenticated: boolean;
      actor?: SessionActor;
    }>(sessionResponse);

    const coursesPayload = await parseResponse<{
      success: boolean;
      data: CourseSnapshot[];
    }>(coursesResponse);

    setCourses(coursesPayload.data);

    if (sessionPayload.authenticated && sessionPayload.actor?.role === 'employee') {
      setActor(sessionPayload.actor);
      await Promise.all([loadStudents(), loadSubEmployees()]);
    }
  }, [loadStudents, loadSubEmployees]);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      void loadInitialData().catch((loadError: Error) => setError(loadError.message));
    }, 0);

    return () => window.clearTimeout(timeoutId);
  }, [loadInitialData]);

  async function handleLogin() {
    try {
      setSaving(true);
      setError(null);
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          role: 'employee',
          loginIdentifier,
          password,
        }),
      });

      await parseResponse(response);
      setPassword('');
      await loadInitialData();
    } catch (loginError) {
      setError(loginError instanceof Error ? loginError.message : 'تعذر تسجيل الدخول');
    } finally {
      setSaving(false);
    }
  }

  async function handleLogout() {
    await fetch('/api/auth/logout', { method: 'POST' });
    setActor(null);
    setStudents([]);
    setSuccessMessage(null);
  }

  async function handleCreateStudent(formData: FormData) {
    try {
      setSaving(true);
      setError(null);
      const selectedCourseIds = formData
        .getAll('courseIds')
        .map((value) => Number(value))
        .filter((value) => Number.isFinite(value));

      const response = await fetch('/api/students', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fullName: String(formData.get('fullName') ?? ''),
          phone: String(formData.get('phone') ?? ''),
          studyLevel: String(formData.get('studyLevel') ?? ''),
          age: Number(formData.get('age') ?? 0),
          courseIds: selectedCourseIds,
          codeValidityDays: Number(formData.get('codeValidityDays') ?? 7),
        }),
      });

      const payload = await parseResponse<{ success: boolean; data: StudentSummary }>(response);
      setStudents((previous) => [payload.data, ...previous]);
      setSuccessMessage(`تم إنشاء الكود ${payload.data.finalCode} وربطه بالموظف الحالي.`);
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : 'تعذر حفظ الطالب');
    } finally {
      setSaving(false);
    }
  }

  async function handleCreateSubEmployee(formData: FormData) {
    try {
      setSaving(true);
      setError(null);
      const response = await fetch('/api/employees', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fullName: String(formData.get('fullName') ?? ''),
          whatsappNumber: String(formData.get('whatsappNumber') ?? ''),
          defaultCodeValidityDays: Number(formData.get('defaultCodeValidityDays') ?? 7),
        }),
      });

      const payload = await parseResponse<{
        success: boolean;
        data: {
          employee: EmployeeSummary;
          tempPassword: string;
        };
      }>(response);
      setLatestSubCredentials({
        employeeNumber: payload.data.employee.employeeNumber,
        loginIdentifier: payload.data.employee.loginIdentifier,
        staffCode: payload.data.employee.staffCode,
        tempPassword: payload.data.tempPassword,
      });
      setSuccessMessage(`تم إنشاء كود فرعي جديد للموظف ${payload.data.employee.fullName}.`);
      await loadSubEmployees();
    } catch (createError) {
      setError(createError instanceof Error ? createError.message : 'تعذر إنشاء الكود الفرعي');
    } finally {
      setSaving(false);
    }
  }

  async function handleUpdateValidity(studentId: string, codeValidityDays: number) {
    try {
      setBusyStudentId(studentId);
      const response = await fetch(`/api/students/${studentId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ codeValidityDays }),
      });

      const payload = await parseResponse<{ success: boolean; data: StudentSummary }>(response);
      setStudents((previous) =>
        previous.map((student) => (student.id === studentId ? payload.data : student)),
      );
    } catch (updateError) {
      setError(updateError instanceof Error ? updateError.message : 'تعذر تحديث الصلاحية');
    } finally {
      setBusyStudentId(null);
    }
  }

  async function handleSendWhatsapp(studentId: string) {
    try {
      setBusyStudentId(studentId);
      const response = await fetch(`/api/students/${studentId}/send-whatsapp`, {
        method: 'POST',
      });

      const payload = await parseResponse<{ success: boolean; data: StudentSummary }>(response);
      setStudents((previous) =>
        previous.map((student) => (student.id === studentId ? payload.data : student)),
      );
      setSuccessMessage('تم إرسال الرسالة عبر الواتساب بنجاح.');
    } catch (sendError) {
      setError(sendError instanceof Error ? sendError.message : 'تعذر إرسال الرسالة');
    } finally {
      setBusyStudentId(null);
    }
  }

  if (!actor) {
    return (
      <main className="page-shell flex min-h-screen items-center justify-center px-4 py-10">
        <LoginPanel
          title="بوابة موظفي خدمة العملاء"
          subtitle="سجّل الدخول برقم الموظف وكلمة المرور المؤقتة أو الحالية."
          error={error}
          actionLabel={saving ? 'جارٍ الدخول' : 'دخول الموظف'}
          onSubmit={() => void handleLogin()}
          fields={
            <>
              <input
                value={loginIdentifier}
                onChange={(event) => setLoginIdentifier(event.target.value)}
                placeholder="رقم الموظف أو معرّف الدخول"
                className="field-shell w-full rounded-2xl px-4 py-3"
              />
              <input
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="كلمة المرور"
                className="field-shell w-full rounded-2xl px-4 py-3"
                onKeyDown={(event) => {
                  if (event.key === 'Enter') {
                    void handleLogin();
                  }
                }}
              />
            </>
          }
        />
      </main>
    );
  }

  return (
    <main className="page-shell min-h-screen px-4 py-6 md:px-6">
      <div className="mx-auto max-w-7xl space-y-6">
        <section className="hero-panel rounded-[2.2rem] p-6 md:p-8">
          <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
            <div>
              <div className="mb-3 flex items-center gap-3">
                <StatusBadge tone="success">موظف نشط</StatusBadge>
                <StatusBadge>{actor.employeeNumber ?? '-'}</StatusBadge>
                <StatusBadge>{actor.staffCode ?? '-'}</StatusBadge>
              </div>
              <h1 className="section-title text-foreground">واجهة تسجيل الطلاب وخدمة المتابعة</h1>
              <p className="section-subtitle mt-3 max-w-3xl">
                أدخل بيانات الطالب، أنشئ الكود النهائي، وعدّل مدة الصلاحية ثم أرسل رسالة التأكيد من نفس اللوحة.
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
        </section>

        <section className="grid gap-4 md:grid-cols-3">
          <MetricCard title="الطلاب" value={`${students.length}`} hint="إجمالي ما قمت بتسجيله" icon={BookOpenCheck} />
          <MetricCard title="الإيراد" value={`${totalRevenue.toLocaleString('ar-EG')} ج`} hint="إجمالي مبالغ الدورات" icon={WalletCards} />
          <MetricCard title="الأكواد" value={`${activeCodesCount}`} hint="الأكواد السارية حاليًا" icon={KeyRound} />
        </section>

        <section className="grid gap-4 md:grid-cols-3">
          <MetricCard title="الأكواد الفرعية" value={`${subEmployees.length}`} hint="الموظفون العاملون تحت إدارتك" icon={Users2} />
          <MetricCard title="كودك الأساسي" value={`${actor.staffCode ?? '-'}`} hint="الكود الذي تتفرع منه الأكواد الجديدة" icon={UserPlus2} />
          <MetricCard title="الوضع الإداري" value={actor.parentEmployeeId ? 'فرعي' : 'رئيسي'} hint={actor.parentEmployeeId ? 'يرتبط بموظف رئيسي أعلى' : 'يمكنه إنشاء أكواد فرعية'} icon={Users2} />
        </section>

        <section className="grid gap-6 xl:grid-cols-[0.95fr,1.05fr]" style={deferredSectionStyle}>
          <form
            className="hero-panel rounded-[2rem] p-5 md:p-6"
            onSubmit={(event) => {
              event.preventDefault();
              const formData = new FormData(event.currentTarget);
              void handleCreateStudent(formData);
              event.currentTarget.reset();
            }}
          >
            <h2 className="text-2xl font-black text-foreground">تسجيل طالب جديد</h2>
            <p className="mt-2 text-sm text-muted-foreground">كل سجل ينتج كودًا نهائيًا مرتبطًا بك مباشرة.</p>
            <div className="mt-5 grid gap-4">
              <input name="fullName" placeholder="اسم الطالب الكامل" className="field-shell rounded-2xl px-4 py-3" required />
              <input name="phone" placeholder="رقم هاتف الطالب" className="field-shell rounded-2xl px-4 py-3" required />
              <input name="studyLevel" placeholder="المستوى الدراسي الحالي" className="field-shell rounded-2xl px-4 py-3" required />
              <input name="age" type="number" min={5} max={100} placeholder="عمر الطالب" className="field-shell rounded-2xl px-4 py-3" required />
              <input name="codeValidityDays" type="number" min={1} defaultValue={7} className="field-shell rounded-2xl px-4 py-3" required />
              <div className="rounded-[1.6rem] bg-card/70 p-4">
                <p className="mb-3 text-sm font-black text-foreground">الدورات المتاحة</p>
                <div className="grid gap-3 md:grid-cols-2">
                  {courses.map((course) => (
                    <label
                      key={course.id}
                      className="flex cursor-pointer items-start gap-3 rounded-2xl border border-border/70 bg-background/45 p-3"
                    >
                      <input type="checkbox" name="courseIds" value={course.id} className="mt-1" />
                      <span>
                        <span className="block font-black text-foreground">{course.name}</span>
                        <span className="text-xs text-muted-foreground">
                          {course.level} | {course.price.toLocaleString('ar-EG')} جنيه
                        </span>
                      </span>
                    </label>
                  ))}
                </div>
              </div>
              <button className="action-primary rounded-2xl px-4 py-3 text-sm font-black">
                {saving ? 'جارٍ الحفظ' : 'إنشاء الكود النهائي'}
              </button>
            </div>
            {successMessage ? <p className="mt-4 text-sm font-black text-success">{successMessage}</p> : null}
            {error ? <p className="mt-2 text-sm text-destructive">{error}</p> : null}
          </form>

          <StudentRecordsTable
            title="سجلات طلابي"
            subtitle="يمكنك تعديل مدة الصلاحية لكل كود وإرسال الرسالة مباشرة."
            records={students}
            editable
            onUpdateValidity={(studentId, codeValidityDays) =>
              void handleUpdateValidity(studentId, codeValidityDays)
            }
            onSendWhatsapp={(studentId) => void handleSendWhatsapp(studentId)}
            busyStudentId={busyStudentId}
          />
        </section>

        <section className="grid gap-6 xl:grid-cols-[0.9fr,1.1fr]" style={deferredSectionStyle}>
          <form
            className="hero-panel rounded-[2rem] p-5 md:p-6"
            onSubmit={(event) => {
              event.preventDefault();
              const formData = new FormData(event.currentTarget);
              void handleCreateSubEmployee(formData);
              event.currentTarget.reset();
            }}
          >
            <h2 className="text-2xl font-black text-foreground">إنشاء كود فرعي جديد</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              كل كود يتم إنشاؤه هنا يرتبط تلقائيًا بكودك الأساسي الحالي ليعمل تحت إدارتك المباشرة.
            </p>
            <div className="mt-5 grid gap-4">
              <input name="fullName" placeholder="اسم الموظف الفرعي" className="field-shell rounded-2xl px-4 py-3" required />
              <input name="whatsappNumber" placeholder="رقم واتساب الموظف الفرعي" className="field-shell rounded-2xl px-4 py-3" required />
              <input name="defaultCodeValidityDays" type="number" min={1} defaultValue={7} className="field-shell rounded-2xl px-4 py-3" required />
              <button className="action-primary rounded-2xl px-4 py-3 text-sm font-black">
                {saving ? 'جارٍ الإنشاء' : 'إنشاء الكود الفرعي'}
              </button>
            </div>

            {latestSubCredentials ? (
              <div className="mt-5 rounded-[1.6rem] bg-card/75 p-4">
                <p className="text-sm font-black text-foreground">بيانات الدخول التي تم إنشاؤها الآن</p>
                <div className="mt-3 grid gap-2 text-sm text-muted-foreground">
                  <p>رقم الموظف: {latestSubCredentials.employeeNumber}</p>
                  <p>معرّف الدخول: {latestSubCredentials.loginIdentifier}</p>
                  <p>الكود: {latestSubCredentials.staffCode}</p>
                  <p className="font-black text-primary">كلمة المرور المؤقتة: {latestSubCredentials.tempPassword}</p>
                </div>
              </div>
            ) : null}
          </form>

          <section className="table-shell rounded-[2rem] p-5 md:p-6">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-black text-foreground">الأكواد الفرعية التابعة لك</h2>
                <p className="text-sm text-muted-foreground">
                  هذه الأكواد مرتبطة بكودك الأساسي ويمكن للإدارة تعديلها أو حذفها لاحقًا من لوحة المشرف.
                </p>
              </div>
              <StatusBadge>{subordinateRevenue} كود</StatusBadge>
            </div>

            <div className="space-y-3">
              {subEmployees.map((employee) => (
                <div key={employee.id} className="rounded-[1.4rem] border border-border/70 bg-card/55 p-4">
                  <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                    <div>
                      <p className="font-black text-foreground">{employee.fullName}</p>
                      <p className="text-sm text-muted-foreground">
                        {employee.staffCode} | {employee.loginIdentifier} | {employee.employeeNumber}
                      </p>
                      <p className="text-xs text-muted-foreground">واتساب: {employee.whatsappNumber}</p>
                    </div>
                    <div className="text-right">
                      <StatusBadge tone={employee.isActive ? 'success' : 'danger'}>
                        {employee.isActive ? 'نشط' : 'معطل'}
                      </StatusBadge>
                      <p className="mt-2 text-xs text-muted-foreground">
                        صلاحية افتراضية: {employee.defaultCodeValidityDays} يوم
                      </p>
                    </div>
                  </div>
                </div>
              ))}
              {subEmployees.length === 0 ? (
                <p className="rounded-[1.4rem] bg-card/55 p-6 text-center text-sm text-muted-foreground">
                  لم يتم إنشاء أكواد فرعية تحت إدارتك حتى الآن.
                </p>
              ) : null}
            </div>
          </section>
        </section>
      </div>
    </main>
  );
}
