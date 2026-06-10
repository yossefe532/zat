 'use client';

import { useMemo, useState } from 'react';
import { Eye, PencilLine, Plus, Search, ShieldCheck, Trash2 } from 'lucide-react';
import type { AuditLogSummary, EmployeeSummary, StudentSummary } from '@/lib/portal';
import { StatusBadge } from '@/components/console/StatusBadge';

type EmployeeManagementPanelProps = {
  employees: EmployeeSummary[];
  auditLogs: AuditLogSummary[];
  students: StudentSummary[];
  onCreate: (payload: {
    fullName: string;
    whatsappNumber: string;
    defaultCodeValidityDays: number;
  }) => void;
  onToggleStatus: (employeeId: string, isActive: boolean) => void;
  onUpdate: (
    employeeId: string,
    payload: {
      fullName: string;
      whatsappNumber: string;
      defaultCodeValidityDays: number;
      staffCode: string;
      loginIdentifier: string;
      isActive: boolean;
    },
  ) => void;
  onDelete: (employeeId: string) => void;
  latestCredentials: {
    employeeNumber: string;
    loginIdentifier: string;
    staffCode: string;
    tempPassword: string;
  } | null;
  busyEmployeeId?: string | null;
};

export function EmployeeManagementPanel({
  employees,
  auditLogs,
  students,
  onCreate,
  onToggleStatus,
  onUpdate,
  onDelete,
  latestCredentials,
  busyEmployeeId,
}: EmployeeManagementPanelProps) {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'name' | 'code'>('newest');
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<string | null>(employees[0]?.id ?? null);

  const filteredEmployees = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();
    const result = employees.filter((employee) => {
      const matchesSearch =
        !normalizedSearch ||
        [
          employee.fullName,
          employee.staffCode,
          employee.employeeNumber,
          employee.loginIdentifier,
          employee.whatsappNumber,
          employee.createdBy ?? '',
        ]
          .join(' ')
          .toLowerCase()
          .includes(normalizedSearch);

      const matchesStatus =
        statusFilter === 'all' ||
        (statusFilter === 'active' && employee.isActive) ||
        (statusFilter === 'inactive' && !employee.isActive);

      return matchesSearch && matchesStatus;
    });

    result.sort((a, b) => {
      if (sortBy === 'name') return a.fullName.localeCompare(b.fullName, 'ar');
      if (sortBy === 'code') return a.staffCode.localeCompare(b.staffCode, 'en');
      if (sortBy === 'oldest') return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });

    return result;
  }, [employees, search, sortBy, statusFilter]);

  const selectedEmployee =
    filteredEmployees.find((employee) => employee.id === selectedEmployeeId) ??
    filteredEmployees[0] ??
    null;

  const selectedEmployeeAuditLogs = useMemo(
    () =>
      selectedEmployee
        ? auditLogs.filter((log) => log.targetTable === 'employees' && log.targetId === selectedEmployee.id)
        : [],
    [auditLogs, selectedEmployee],
  );

  const linkedStudentsCount = selectedEmployee
    ? students.filter((student) => student.employeeId === selectedEmployee.id).length
    : 0;

  return (
    <section className="grid gap-6 xl:grid-cols-[0.88fr,1.12fr]">
      <div className="hero-panel rounded-[2rem] p-5 md:p-6">
        <div className="flex items-center gap-3">
          <div className="rounded-2xl bg-primary/10 p-3 text-primary">
            <Plus className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-2xl font-black text-foreground">إضافة كود جديد</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              يتم إنشاء اسم مستخدم وكود ربط وبيانات دخول مؤقتة مع حفظها في سجل التتبع.
            </p>
          </div>
        </div>

        <form
          className="mt-5 space-y-4"
          onSubmit={(event) => {
            event.preventDefault();
            const formData = new FormData(event.currentTarget);
            onCreate({
              fullName: String(formData.get('fullName') ?? ''),
              whatsappNumber: String(formData.get('whatsappNumber') ?? ''),
              defaultCodeValidityDays: Number(formData.get('defaultCodeValidityDays') ?? 7),
            });
            event.currentTarget.reset();
          }}
        >
          <input
            name="fullName"
            placeholder="اسم الموظف"
            className="field-shell w-full rounded-2xl px-4 py-3"
            required
          />
          <input
            name="whatsappNumber"
            placeholder="رقم الواتساب"
            className="field-shell w-full rounded-2xl px-4 py-3"
            required
          />
          <input
            name="defaultCodeValidityDays"
            type="number"
            min={1}
            defaultValue={7}
            placeholder="الصلاحية الافتراضية بالأيام"
            className="field-shell w-full rounded-2xl px-4 py-3"
            required
          />
          <button className="action-primary w-full rounded-2xl px-4 py-3 text-sm font-black">
            إنشاء بيانات الاعتماد
          </button>
        </form>

        {latestCredentials ? (
          <div className="mt-5 rounded-[1.6rem] bg-card/75 p-4">
            <p className="text-sm font-black text-foreground">بيانات الاعتماد التي تم إنشاؤها الآن</p>
            <div className="mt-3 grid gap-2 text-sm text-muted-foreground">
              <p>رقم الموظف: {latestCredentials.employeeNumber}</p>
              <p>معرّف الدخول: {latestCredentials.loginIdentifier}</p>
              <p>كود الربط: {latestCredentials.staffCode}</p>
              <p className="font-black text-primary">كلمة المرور المؤقتة: {latestCredentials.tempPassword}</p>
            </div>
          </div>
        ) : null}
      </div>

      <div className="space-y-6">
        <div className="table-shell rounded-[2rem] p-5 md:p-6">
          <div className="mb-5 flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
            <div>
              <h2 className="text-2xl font-black text-foreground">لوحة إدارة الأكواد</h2>
              <p className="text-sm text-muted-foreground">
                عرض كل الأكواد المرتبطة بالمستخدمين مع الحالة الفعلية، البحث، التصفية، الفرز، والتعديل الكامل.
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <StatusBadge>{employees.length} كود</StatusBadge>
              <StatusBadge tone="success">
                {employees.filter((employee) => employee.isActive).length} نشط
              </StatusBadge>
              <StatusBadge tone="warning">
                {employees.filter((employee) => !employee.isActive).length} موقوف
              </StatusBadge>
            </div>
          </div>

          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-[1.3fr,0.7fr,0.7fr]">
            <label className="field-shell flex items-center gap-3 rounded-2xl px-4 py-3">
              <Search className="h-4 w-4 text-muted-foreground" />
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="ابحث بالاسم أو الكود أو الرقم أو معرّف الدخول"
                className="w-full bg-transparent text-sm font-bold outline-none placeholder:text-muted-foreground"
              />
            </label>
            <select
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value as typeof statusFilter)}
              className="field-shell rounded-2xl px-4 py-3 text-sm font-bold"
            >
              <option value="all">كل الحالات</option>
              <option value="active">الأكواد النشطة</option>
              <option value="inactive">الأكواد المعطلة</option>
            </select>
            <select
              value={sortBy}
              onChange={(event) => setSortBy(event.target.value as typeof sortBy)}
              className="field-shell rounded-2xl px-4 py-3 text-sm font-bold"
            >
              <option value="newest">الأحدث</option>
              <option value="oldest">الأقدم</option>
              <option value="name">الاسم</option>
              <option value="code">الكود</option>
            </select>
          </div>

          <div className="mt-5 overflow-hidden rounded-[1.6rem] border border-border/70">
            <div className="hidden grid-cols-[1.3fr,1fr,0.9fr,0.8fr,0.8fr] gap-3 bg-card/80 px-4 py-3 text-xs font-black text-muted-foreground md:grid">
              <span>المستخدم / الكود</span>
              <span>الأرقام المرتبطة</span>
              <span>المنشئ</span>
              <span>الحالة</span>
              <span>الإجراءات</span>
            </div>
            <div className="divide-y divide-border/70">
              {filteredEmployees.map((employee) => {
                const linkedCount = students.filter((student) => student.employeeId === employee.id).length;
                const isBusy = busyEmployeeId === employee.id;
                return (
                  <div
                    key={employee.id}
                    className={`grid gap-4 px-4 py-4 transition-colors md:grid-cols-[1.3fr,1fr,0.9fr,0.8fr,0.8fr] ${
                      selectedEmployee?.id === employee.id ? 'bg-primary/5' : 'bg-transparent'
                    }`}
                  >
                    <div>
                      <p className="text-base font-black text-foreground">{employee.fullName}</p>
                      <p className="text-sm text-muted-foreground">
                        {employee.staffCode} | {employee.loginIdentifier}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        رقم الموظف: {employee.employeeNumber}
                      </p>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      <p>واتساب: {employee.whatsappNumber}</p>
                      <p>طلبات مرتبطة: {linkedCount}</p>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      <p>{employee.createdBy ?? 'غير محدد'}</p>
                      <p>{new Date(employee.createdAt).toLocaleString('ar-EG')}</p>
                    </div>
                    <div className="flex items-start">
                      <StatusBadge tone={employee.isActive ? 'success' : 'danger'}>
                        {employee.isActive ? 'مفعّل' : 'معطّل'}
                      </StatusBadge>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={() => setSelectedEmployeeId(employee.id)}
                        className="action-secondary inline-flex items-center gap-2 rounded-2xl px-3 py-2 text-xs font-black text-primary"
                      >
                        <Eye className="h-4 w-4" />
                        عرض
                      </button>
                      <button
                        type="button"
                        disabled={isBusy}
                        onClick={() => onToggleStatus(employee.id, !employee.isActive)}
                        className="action-secondary inline-flex items-center gap-2 rounded-2xl px-3 py-2 text-xs font-black text-primary disabled:opacity-60"
                      >
                        <ShieldCheck className="h-4 w-4" />
                        {employee.isActive ? 'تعطيل' : 'تفعيل'}
                      </button>
                    </div>
                  </div>
                );
              })}
              {filteredEmployees.length === 0 ? (
                <p className="bg-card/55 p-6 text-center text-sm text-muted-foreground">
                  لا توجد أكواد مطابقة لنتائج البحث الحالية.
                </p>
              ) : null}
            </div>
          </div>
        </div>

        {selectedEmployee ? (
          <div className="grid gap-6 xl:grid-cols-[1fr,0.9fr]">
            <form
              key={[
                selectedEmployee.id,
                selectedEmployee.fullName,
                selectedEmployee.whatsappNumber,
                selectedEmployee.staffCode,
                selectedEmployee.loginIdentifier,
                selectedEmployee.defaultCodeValidityDays,
                selectedEmployee.isActive,
              ].join('|')}
              className="hero-panel rounded-[2rem] p-5 md:p-6"
              onSubmit={(event) => {
                event.preventDefault();
                const formData = new FormData(event.currentTarget);
                onUpdate(selectedEmployee.id, {
                  fullName: String(formData.get('fullName') ?? ''),
                  whatsappNumber: String(formData.get('whatsappNumber') ?? ''),
                  defaultCodeValidityDays: Number(formData.get('defaultCodeValidityDays') ?? 7),
                  staffCode: String(formData.get('staffCode') ?? ''),
                  loginIdentifier: String(formData.get('loginIdentifier') ?? ''),
                  isActive: formData.get('isActive') === 'on',
                });
              }}
            >
              <div className="mb-5 flex items-center justify-between">
                <div>
                  <h3 className="text-2xl font-black text-foreground">عرض تفصيلي وتعديل الكود</h3>
                  <p className="text-sm text-muted-foreground">
                    تعديل الاسم، الرقم، الكود، معرّف الدخول، الصلاحية، والحالة من شاشة واحدة.
                  </p>
                </div>
                <StatusBadge tone={selectedEmployee.isActive ? 'success' : 'danger'}>
                  {selectedEmployee.isActive ? 'نشط الآن' : 'متوقف الآن'}
                </StatusBadge>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <input
                  name="fullName"
                  defaultValue={selectedEmployee.fullName}
                  placeholder="اسم المستخدم"
                  className="field-shell rounded-2xl px-4 py-3"
                  required
                />
                <input
                  name="whatsappNumber"
                  defaultValue={selectedEmployee.whatsappNumber}
                  placeholder="الرقم المرتبط"
                  className="field-shell rounded-2xl px-4 py-3"
                  required
                />
                <input
                  name="staffCode"
                  defaultValue={selectedEmployee.staffCode}
                  placeholder="الكود"
                  className="field-shell rounded-2xl px-4 py-3"
                  required
                />
                <input
                  name="loginIdentifier"
                  defaultValue={selectedEmployee.loginIdentifier}
                  placeholder="معرّف الدخول"
                  className="field-shell rounded-2xl px-4 py-3"
                  required
                />
                <input
                  name="defaultCodeValidityDays"
                  type="number"
                  min={1}
                  max={365}
                  defaultValue={selectedEmployee.defaultCodeValidityDays}
                  placeholder="الصلاحية الافتراضية"
                  className="field-shell rounded-2xl px-4 py-3"
                  required
                />
                <label className="field-shell flex items-center justify-between rounded-2xl px-4 py-3 text-sm font-black">
                  <span>الحالة الفعلية للكود</span>
                  <input
                    name="isActive"
                    type="checkbox"
                    defaultChecked={selectedEmployee.isActive}
                    className="h-5 w-5"
                  />
                </label>
              </div>

              <div className="mt-5 grid gap-3 md:grid-cols-4">
                <div className="rounded-[1.4rem] bg-card/60 p-4 text-sm">
                  <p className="text-muted-foreground">المنشئ</p>
                  <p className="mt-1 font-black text-foreground">{selectedEmployee.createdBy ?? 'غير محدد'}</p>
                </div>
                <div className="rounded-[1.4rem] bg-card/60 p-4 text-sm">
                  <p className="text-muted-foreground">رقم الموظف</p>
                  <p className="mt-1 font-black text-foreground">{selectedEmployee.employeeNumber}</p>
                </div>
                <div className="rounded-[1.4rem] bg-card/60 p-4 text-sm">
                  <p className="text-muted-foreground">سجلات مرتبطة</p>
                  <p className="mt-1 font-black text-foreground">{linkedStudentsCount}</p>
                </div>
                <div className="rounded-[1.4rem] bg-card/60 p-4 text-sm">
                  <p className="text-muted-foreground">تاريخ الإنشاء</p>
                  <p className="mt-1 font-black text-foreground">
                    {new Date(selectedEmployee.createdAt).toLocaleDateString('ar-EG')}
                  </p>
                </div>
              </div>

              <div className="mt-5 flex flex-wrap gap-3">
                <button
                  type="submit"
                  disabled={busyEmployeeId === selectedEmployee.id}
                  className="action-primary inline-flex items-center gap-2 rounded-2xl px-4 py-3 text-sm font-black disabled:opacity-60"
                >
                  <PencilLine className="h-4 w-4" />
                  {busyEmployeeId === selectedEmployee.id ? 'جارٍ الحفظ' : 'حفظ التعديلات'}
                </button>
                <button
                  type="button"
                  disabled={busyEmployeeId === selectedEmployee.id}
                  onClick={() => onToggleStatus(selectedEmployee.id, !selectedEmployee.isActive)}
                  className="action-secondary inline-flex items-center gap-2 rounded-2xl px-4 py-3 text-sm font-black text-primary disabled:opacity-60"
                >
                  <ShieldCheck className="h-4 w-4" />
                  {selectedEmployee.isActive ? 'تعطيل الكود' : 'تفعيل الكود'}
                </button>
                <button
                  type="button"
                  disabled={busyEmployeeId === selectedEmployee.id}
                  onClick={() => onDelete(selectedEmployee.id)}
                  className="inline-flex items-center gap-2 rounded-2xl bg-destructive px-4 py-3 text-sm font-black text-white disabled:opacity-60"
                >
                  <Trash2 className="h-4 w-4" />
                  حذف الكود
                </button>
              </div>
            </form>

            <div className="table-shell rounded-[2rem] p-5 md:p-6">
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <h3 className="text-2xl font-black text-foreground">سجل تغييرات الكود</h3>
                  <p className="text-sm text-muted-foreground">
                    جميع عمليات الإنشاء والتعديل والتفعيل والحذف المرتبطة بهذا الكود.
                  </p>
                </div>
                <StatusBadge>{selectedEmployeeAuditLogs.length} عملية</StatusBadge>
              </div>
              <div className="space-y-3">
                {selectedEmployeeAuditLogs.map((log) => (
                  <div key={log.id} className="rounded-[1.4rem] border border-border/70 bg-card/55 p-4">
                    <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                      <div>
                        <p className="font-black text-foreground">{log.action}</p>
                        <p className="text-sm text-muted-foreground">
                          بواسطة: {log.actorName} | {log.actorRole}
                        </p>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {new Date(log.createdAt).toLocaleString('ar-EG')}
                      </p>
                    </div>
                    {log.metadata ? (
                      <pre className="mt-3 overflow-x-auto rounded-2xl bg-background/60 p-3 text-xs text-muted-foreground">
                        {JSON.stringify(log.metadata, null, 2)}
                      </pre>
                    ) : null}
                  </div>
                ))}
                {selectedEmployeeAuditLogs.length === 0 ? (
                  <p className="rounded-[1.4rem] bg-card/55 p-6 text-center text-sm text-muted-foreground">
                    لا توجد عمليات مسجلة لهذا الكود حتى الآن.
                  </p>
                ) : null}
              </div>
            </div>
          </div>
        ) : (
          <div className="hero-panel rounded-[2rem] p-6 text-center text-sm text-muted-foreground">
            اختر كودًا من القائمة لعرض تفاصيله الكاملة وإجراء التعديلات المطلوبة.
          </div>
        )}
      </div>
    </section>
  );
}
