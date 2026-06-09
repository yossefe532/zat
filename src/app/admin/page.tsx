'use client';

import { useEffect, useState } from 'react';
import { BookOpenCheck, DatabaseBackup, LogOut, MessageCircleMore, Users, WalletCards } from 'lucide-react';
import { AuditPanels } from '@/components/console/AuditPanels';
import { EmployeeManagementPanel } from '@/components/console/EmployeeManagementPanel';
import { LoginPanel } from '@/components/console/LoginPanel';
import { MetricCard } from '@/components/console/MetricCard';
import { StudentRecordsTable } from '@/components/console/StudentRecordsTable';
import { StatusBadge } from '@/components/console/StatusBadge';
import type { AdminOverview } from '@/lib/portal';

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
  auditLogs: [],
  backups: [],
  stats: {
    studentCount: 0,
    employeeCount: 0,
    whatsappCount: 0,
    activeCodes: 0,
    totalRevenue: 0,
  },
};

export default function AdminPage() {
  const [authenticated, setAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [backupBusy, setBackupBusy] = useState(false);
  const [busyEmployeeId, setBusyEmployeeId] = useState<string | null>(null);
  const [overview, setOverview] = useState<AdminOverview>(emptyOverview);
  const [latestCredentials, setLatestCredentials] = useState<{
    employeeNumber: string;
    loginIdentifier: string;
    staffCode: string;
    tempPassword: string;
  } | null>(null);

  async function loadOverview() {
    const response = await fetch('/api/admin/overview', { cache: 'no-store' });
    const payload = await parseResponse<{ success: boolean; data: AdminOverview }>(response);
    setOverview(payload.data);
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
          await loadOverview();
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
      await loadOverview();
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
      await loadOverview();
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
      await loadOverview();
    } catch (toggleError) {
      setError(toggleError instanceof Error ? toggleError.message : 'تعذر تحديث حالة الموظف');
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
      await loadOverview();
    } catch (backupError) {
      setError(backupError instanceof Error ? backupError.message : 'تعذر إنشاء النسخة الاحتياطية');
    } finally {
      setBackupBusy(false);
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

        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
          <MetricCard title="الطلاب" value={`${overview.stats.studentCount}`} hint="إجمالي السجلات المحفوظة" icon={BookOpenCheck} />
          <MetricCard title="الموظفون" value={`${overview.stats.employeeCount}`} hint="عدد الحسابات العاملة" icon={Users} />
          <MetricCard title="الرسائل" value={`${overview.stats.whatsappCount}`} hint="تم إرسالها للطلاب" icon={MessageCircleMore} />
          <MetricCard title="الأكواد" value={`${overview.stats.activeCodes}`} hint="الأكواد السارية حاليًا" icon={DatabaseBackup} />
          <MetricCard title="الإيراد" value={`${overview.stats.totalRevenue.toLocaleString('ar-EG')} ج`} hint="إجمالي المبالغ المستحقة" icon={WalletCards} />
        </section>

        <EmployeeManagementPanel
          employees={overview.employees}
          latestCredentials={latestCredentials}
          onCreate={(payload) => void handleCreateEmployee(payload)}
          onToggleStatus={(employeeId, isActive) => void handleToggleEmployee(employeeId, isActive)}
          busyEmployeeId={busyEmployeeId}
        />

        <StudentRecordsTable
          title="سجل الطلاب الكامل"
          subtitle="يعرض جميع الطلاب مع الموظف المسؤول وحالة الرسالة وصلاحية الكود."
          records={overview.students}
          editable={false}
        />

        <AuditPanels
          auditLogs={overview.auditLogs}
          backups={overview.backups}
          onRunBackup={() => void handleRunBackup()}
          backupBusy={backupBusy}
        />
      </div>
    </main>
  );
}
