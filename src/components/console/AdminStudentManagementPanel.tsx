import type { CourseCatalogItem, StudentSummary } from '@/lib/portal';
import { MessageSquareShare, Save, Trash2 } from 'lucide-react';
import { StatusBadge } from '@/components/console/StatusBadge';

type AdminStudentManagementPanelProps = {
  records: StudentSummary[];
  courses: CourseCatalogItem[];
  busyStudentId?: string | null;
  onSave: (
    studentId: string,
    payload: {
      fullName: string;
      phone: string;
      studyLevel: string;
      age: number;
      courseIds: number[];
      codeValidityDays: number;
    },
  ) => void;
  onDelete: (studentId: string) => void;
  onSendWhatsapp: (studentId: string) => void;
};

function studentFormKey(student: StudentSummary) {
  return [
    student.id,
    student.fullName,
    student.phone,
    student.studyLevel,
    student.age,
    student.codeValidityDays,
    student.courses.map((course) => course.id).join('-'),
  ].join('|');
}

export function AdminStudentManagementPanel({
  records,
  courses,
  busyStudentId,
  onSave,
  onDelete,
  onSendWhatsapp,
}: AdminStudentManagementPanelProps) {
  return (
    <section className="space-y-4">
      <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
        <div>
          <h2 className="text-2xl font-black text-foreground">إدارة سجلات الطلاب</h2>
          <p className="text-sm text-muted-foreground">
            تعديل الاسم والهاتف والمستوى والعمر والكورسات والصلاحية مع إمكانية إعادة الإرسال أو الحذف.
          </p>
        </div>
        <StatusBadge tone="neutral">{records.length} سجل</StatusBadge>
      </div>

      <div className="space-y-4">
        {records.map((student) => {
          const selectedCourseIds = new Set(student.courses.map((course) => course.id));
          const isBusy = busyStudentId === student.id;

          return (
            <form
              key={studentFormKey(student)}
              className="hero-panel rounded-[1.8rem] p-5"
              onSubmit={(event) => {
                event.preventDefault();
                const formData = new FormData(event.currentTarget);
                const courseIds = formData
                  .getAll('courseIds')
                  .map((value) => Number(value))
                  .filter((value) => Number.isFinite(value));

                onSave(student.id, {
                  fullName: String(formData.get('fullName') ?? ''),
                  phone: String(formData.get('phone') ?? ''),
                  studyLevel: String(formData.get('studyLevel') ?? ''),
                  age: Number(formData.get('age') ?? 0),
                  courseIds,
                  codeValidityDays: Number(formData.get('codeValidityDays') ?? 7),
                });
              }}
            >
              <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="text-lg font-black text-foreground">{student.fullName}</h3>
                    <StatusBadge tone={student.whatsappSentAt ? 'success' : 'warning'}>
                      {student.whatsappSentAt ? 'تم الإرسال' : 'لم يرسل بعد'}
                    </StatusBadge>
                  </div>
                  <p className="mt-2 text-sm text-muted-foreground">
                    الكود: {student.finalCode} | الموظف: {student.employeeName} - {student.employeeNumber}
                  </p>
                </div>
                <p className="text-sm font-black text-primary">
                  {student.totalAmount.toLocaleString('ar-EG')} جنيه
                </p>
              </div>

              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
                <input
                  name="fullName"
                  defaultValue={student.fullName}
                  placeholder="اسم الطالب"
                  className="field-shell rounded-2xl px-4 py-3"
                  required
                />
                <input
                  name="phone"
                  defaultValue={student.phone}
                  placeholder="رقم الهاتف"
                  className="field-shell rounded-2xl px-4 py-3"
                  required
                />
                <input
                  name="studyLevel"
                  defaultValue={student.studyLevel}
                  placeholder="المستوى الدراسي"
                  className="field-shell rounded-2xl px-4 py-3"
                  required
                />
                <input
                  name="age"
                  type="number"
                  min={5}
                  max={100}
                  defaultValue={student.age}
                  placeholder="العمر"
                  className="field-shell rounded-2xl px-4 py-3"
                  required
                />
                <input
                  name="codeValidityDays"
                  type="number"
                  min={1}
                  max={365}
                  defaultValue={student.codeValidityDays}
                  placeholder="صلاحية الكود"
                  className="field-shell rounded-2xl px-4 py-3"
                  required
                />
              </div>

              <div className="mt-4 rounded-[1.5rem] bg-card/65 p-4">
                <p className="mb-3 text-sm font-black text-foreground">الكورسات المسجلة</p>
                <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                  {courses.map((course) => (
                    <label
                      key={`${student.id}-${course.id}`}
                      className="flex items-start gap-3 rounded-2xl border border-border/70 bg-background/45 p-3"
                    >
                      <input
                        type="checkbox"
                        name="courseIds"
                        value={course.id}
                        defaultChecked={selectedCourseIds.has(course.id)}
                        className="mt-1"
                      />
                      <span>
                        <span className="block font-black text-foreground">
                          {course.icon} {course.nameAr}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {course.level} | {course.grantPrice.toLocaleString('ar-EG')} جنيه
                          {!course.isActive ? ' | غير نشط' : ''}
                        </span>
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="mt-4 flex flex-wrap gap-3">
                <button
                  type="submit"
                  disabled={isBusy}
                  className="action-primary inline-flex items-center gap-2 rounded-2xl px-4 py-3 text-sm font-black disabled:opacity-60"
                >
                  <Save className="h-4 w-4" />
                  {isBusy ? 'جارٍ الحفظ' : 'حفظ التعديلات'}
                </button>
                <button
                  type="button"
                  disabled={isBusy}
                  onClick={() => onSendWhatsapp(student.id)}
                  className="action-secondary inline-flex items-center gap-2 rounded-2xl px-4 py-3 text-sm font-black text-primary disabled:opacity-60"
                >
                  <MessageSquareShare className="h-4 w-4" />
                  إعادة إرسال واتساب
                </button>
                <button
                  type="button"
                  disabled={isBusy}
                  onClick={() => onDelete(student.id)}
                  className="inline-flex items-center gap-2 rounded-2xl bg-destructive px-4 py-3 text-sm font-black text-white disabled:opacity-60"
                >
                  <Trash2 className="h-4 w-4" />
                  حذف السجل
                </button>
              </div>
            </form>
          );
        })}

        {records.length === 0 ? (
          <p className="hero-panel rounded-[1.6rem] p-6 text-center text-sm text-muted-foreground">
            لا توجد سجلات طلاب لعرضها الآن.
          </p>
        ) : null}
      </div>
    </section>
  );
}
