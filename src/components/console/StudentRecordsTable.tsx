import type { StudentSummary } from '@/lib/portal';
import { MessageSquareShare, RefreshCcw } from 'lucide-react';
import { StatusBadge } from '@/components/console/StatusBadge';

type StudentRecordsTableProps = {
  title: string;
  subtitle: string;
  records: StudentSummary[];
  editable: boolean;
  onUpdateValidity?: (studentId: string, codeValidityDays: number) => void;
  onSendWhatsapp?: (studentId: string) => void;
  busyStudentId?: string | null;
};

export function StudentRecordsTable({
  title,
  subtitle,
  records,
  editable,
  onUpdateValidity,
  onSendWhatsapp,
  busyStudentId,
}: StudentRecordsTableProps) {
  return (
    <section className="space-y-4">
      <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
        <div>
          <h2 className="text-2xl font-black text-foreground">{title}</h2>
          <p className="text-sm text-muted-foreground">{subtitle}</p>
        </div>
        <StatusBadge tone="neutral">{records.length} سجل</StatusBadge>
      </div>

      <div className="table-shell overflow-x-auto rounded-[2rem]">
        <table className="min-w-full text-right">
          <thead>
            <tr className="text-sm">
              <th className="px-4 py-3">الطالب</th>
              <th className="px-4 py-3">الدورات</th>
              <th className="px-4 py-3">الكود</th>
              <th className="px-4 py-3">الصلاحية</th>
              <th className="px-4 py-3">المبلغ</th>
              <th className="px-4 py-3">الحالة</th>
              <th className="px-4 py-3">الإجراء</th>
            </tr>
          </thead>
          <tbody>
            {records.map((student) => (
              <tr key={student.id} className="border-t border-border/70 align-top text-sm">
                <td className="px-4 py-4">
                  <p className="font-black text-foreground">{student.fullName}</p>
                  <p className="text-muted-foreground">{student.phone}</p>
                  <p className="text-xs text-muted-foreground">
                    {student.studyLevel} | عمر {student.age}
                  </p>
                  <p className="mt-2 text-xs text-muted-foreground">
                    المسؤول: {student.employeeName} - {student.employeeNumber}
                  </p>
                </td>
                <td className="px-4 py-4">
                  <div className="space-y-2">
                    {student.courses.map((course) => (
                      <div key={`${student.id}-${course.id}`} className="rounded-2xl bg-card/60 px-3 py-2">
                        <p className="font-bold">{course.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {course.level} | {course.price.toLocaleString('ar-EG')} جنيه
                        </p>
                      </div>
                    ))}
                  </div>
                </td>
                <td className="px-4 py-4">
                  <p className="font-black text-primary">{student.finalCode}</p>
                  <p className="text-xs text-muted-foreground">
                    {new Date(student.createdAt).toLocaleString('ar-EG')}
                  </p>
                </td>
                <td className="px-4 py-4">
                  <div className="space-y-2">
                    <p className="text-xs text-muted-foreground">
                      حتى {new Date(student.codeExpiresAt).toLocaleDateString('ar-EG')}
                    </p>
                    {editable ? (
                      <div className="flex items-center gap-2">
                        <input
                          type="number"
                          min={1}
                          defaultValue={student.codeValidityDays}
                          className="field-shell w-24 rounded-2xl px-3 py-2 text-sm"
                          onBlur={(event) => {
                            const nextValue = Number(event.target.value);
                            if (nextValue > 0 && nextValue !== student.codeValidityDays) {
                              onUpdateValidity?.(student.id, nextValue);
                            }
                          }}
                        />
                        <button
                          type="button"
                          onClick={() => onUpdateValidity?.(student.id, student.codeValidityDays)}
                          className="action-secondary rounded-2xl p-2 text-primary"
                        >
                          <RefreshCcw className="h-4 w-4" />
                        </button>
                      </div>
                    ) : (
                      <StatusBadge tone="warning">{student.codeValidityDays} يوم</StatusBadge>
                    )}
                  </div>
                </td>
                <td className="px-4 py-4 font-black">
                  {student.totalAmount.toLocaleString('ar-EG')} جنيه
                </td>
                <td className="px-4 py-4">
                  {student.whatsappSentAt ? (
                    <StatusBadge tone="success">تم الإرسال</StatusBadge>
                  ) : (
                    <StatusBadge tone="warning">قيد المتابعة</StatusBadge>
                  )}
                </td>
                <td className="px-4 py-4">
                  {onSendWhatsapp ? (
                    <button
                      type="button"
                      onClick={() => onSendWhatsapp(student.id)}
                      disabled={busyStudentId === student.id}
                      className="action-primary inline-flex items-center gap-2 rounded-2xl px-4 py-2 text-xs font-black disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      <MessageSquareShare className="h-4 w-4" />
                      {busyStudentId === student.id ? 'جارٍ الإرسال' : 'إرسال عبر الواتساب'}
                    </button>
                  ) : (
                    <span className="text-xs text-muted-foreground">عرض فقط</span>
                  )}
                </td>
              </tr>
            ))}
            {records.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-4 py-12 text-center text-sm text-muted-foreground">
                  لا توجد سجلات بعد.
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>
    </section>
  );
}
