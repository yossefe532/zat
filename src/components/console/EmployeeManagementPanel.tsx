import type { EmployeeSummary } from '@/lib/portal';
import { StatusBadge } from '@/components/console/StatusBadge';

type EmployeeManagementPanelProps = {
  employees: EmployeeSummary[];
  onCreate: (payload: {
    fullName: string;
    whatsappNumber: string;
    defaultCodeValidityDays: number;
  }) => void;
  onToggleStatus: (employeeId: string, isActive: boolean) => void;
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
  onCreate,
  onToggleStatus,
  latestCredentials,
  busyEmployeeId,
}: EmployeeManagementPanelProps) {
  return (
    <section className="grid gap-6 xl:grid-cols-[0.95fr,1.05fr]">
      <div className="hero-panel rounded-[2rem] p-5 md:p-6">
        <h2 className="text-2xl font-black text-foreground">إضافة موظف جديد</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          يتم إنشاء رقم موظف وكود ربط وبيانات دخول مؤقتة تلقائيًا.
        </p>

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

      <div className="table-shell rounded-[2rem] p-5 md:p-6">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-black text-foreground">فريق العمل</h2>
            <p className="text-sm text-muted-foreground">إدارة الحسابات وتفعيلها أو إيقافها</p>
          </div>
          <StatusBadge>{employees.length} موظف</StatusBadge>
        </div>

        <div className="space-y-3">
          {employees.map((employee) => (
            <div
              key={employee.id}
              className="rounded-[1.5rem] border border-border/70 bg-card/55 p-4"
            >
              <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div>
                  <p className="text-lg font-black text-foreground">{employee.fullName}</p>
                  <p className="text-sm text-muted-foreground">
                    {employee.employeeNumber} | {employee.loginIdentifier} | {employee.staffCode}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    واتساب: {employee.whatsappNumber} | الصلاحية الافتراضية {employee.defaultCodeValidityDays} يوم
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <StatusBadge tone={employee.isActive ? 'success' : 'danger'}>
                    {employee.isActive ? 'نشط' : 'موقوف'}
                  </StatusBadge>
                  <button
                    type="button"
                    disabled={busyEmployeeId === employee.id}
                    onClick={() => onToggleStatus(employee.id, !employee.isActive)}
                    className="action-secondary rounded-2xl px-4 py-2 text-sm font-black text-primary disabled:opacity-60"
                  >
                    {busyEmployeeId === employee.id
                      ? 'جارٍ التحديث'
                      : employee.isActive
                        ? 'إيقاف'
                        : 'تفعيل'}
                  </button>
                </div>
              </div>
            </div>
          ))}
          {employees.length === 0 ? (
            <p className="rounded-[1.5rem] bg-card/55 p-6 text-center text-sm text-muted-foreground">
              لا يوجد موظفون مضافون بعد.
            </p>
          ) : null}
        </div>
      </div>
    </section>
  );
}
