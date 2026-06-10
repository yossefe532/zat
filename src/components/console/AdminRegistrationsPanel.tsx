import type { CourseCatalogItem, RegistrationSummary } from '@/lib/portal';
import { StatusBadge } from '@/components/console/StatusBadge';

type AdminRegistrationsPanelProps = {
  records: RegistrationSummary[];
  courses: CourseCatalogItem[];
};

function formatDate(value: string | null) {
  if (!value) {
    return 'غير متاح';
  }

  return new Date(value).toLocaleString('ar-EG');
}

export function AdminRegistrationsPanel({
  records,
  courses,
}: AdminRegistrationsPanelProps) {
  const courseMap = new Map(courses.map((course) => [course.id, course]));

  return (
    <section className="space-y-4">
      <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
        <div>
          <h2 className="text-2xl font-black text-foreground">طلبات التسجيل من الموقع</h2>
          <p className="text-sm text-muted-foreground">
            هنا تظهر كل الطلبات المسجلة فعليًا من رحلة التسجيل الرئيسية حتى لو لم تتحول بعد إلى سجلات كونسول.
          </p>
        </div>
        <StatusBadge tone="neutral">{records.length} طلب</StatusBadge>
      </div>

      <div className="table-shell overflow-x-auto rounded-[2rem]">
        <table className="min-w-full text-right">
          <thead>
            <tr className="text-sm">
              <th className="px-4 py-3">الاسم</th>
              <th className="px-4 py-3">الكورسات</th>
              <th className="px-4 py-3">كود التسجيل</th>
              <th className="px-4 py-3">كود المنحة</th>
              <th className="px-4 py-3">المبلغ</th>
              <th className="px-4 py-3">الأقساط</th>
              <th className="px-4 py-3">الحالة</th>
              <th className="px-4 py-3">التاريخ</th>
            </tr>
          </thead>
          <tbody>
            {records.map((record) => (
              <tr key={record.id} className="border-t border-border/70 align-top text-sm">
                <td className="px-4 py-4">
                  <p className="font-black text-foreground">{record.fullName}</p>
                  <p className="text-muted-foreground">{record.phone}</p>
                  <p className="text-xs text-muted-foreground">
                    {record.age ? `العمر ${record.age}` : 'العمر غير مسجل'}
                  </p>
                </td>
                <td className="px-4 py-4">
                  <div className="space-y-2">
                    {record.courseIds.length > 0 ? (
                      record.courseIds.map((courseId) => {
                        const course = courseMap.get(courseId);
                        return (
                          <div key={`${record.id}-${courseId}`} className="rounded-2xl bg-card/60 px-3 py-2">
                            <p className="font-bold text-foreground">
                              {course ? `${course.icon} ${course.nameAr}` : `كورس #${courseId}`}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {course ? `${course.level} | ${course.grantPrice.toLocaleString('ar-EG')} جنيه` : 'غير متاح في الكتالوج الحالي'}
                            </p>
                          </div>
                        );
                      })
                    ) : (
                      <span className="text-xs text-muted-foreground">لا توجد كورسات مرتبطة</span>
                    )}
                  </div>
                </td>
                <td className="px-4 py-4">
                  <p className="font-black text-primary">{record.registrationCode}</p>
                </td>
                <td className="px-4 py-4">
                  <StatusBadge tone={record.grantCodeUsed ? 'success' : 'neutral'}>
                    {record.grantCodeUsed ?? 'بدون كود'}
                  </StatusBadge>
                </td>
                <td className="px-4 py-4 font-black">
                  {record.totalPrice.toLocaleString('ar-EG')} جنيه
                </td>
                <td className="px-4 py-4">
                  <p className="text-xs text-muted-foreground">
                    أولى: {record.firstInstallment.toLocaleString('ar-EG')} جنيه
                  </p>
                  <p className="text-xs text-muted-foreground">
                    ثانية: {record.secondInstallment.toLocaleString('ar-EG')} جنيه
                  </p>
                </td>
                <td className="px-4 py-4">
                  {record.whatsappSent ? (
                    <StatusBadge tone="success">تم الإرسال</StatusBadge>
                  ) : (
                    <StatusBadge tone="warning">بانتظار المتابعة</StatusBadge>
                  )}
                </td>
                <td className="px-4 py-4">
                  <p className="text-xs text-muted-foreground">{formatDate(record.createdAt)}</p>
                </td>
              </tr>
            ))}
            {records.length === 0 ? (
              <tr>
                <td colSpan={8} className="px-4 py-12 text-center text-sm text-muted-foreground">
                  لا توجد طلبات تسجيل معروضة حاليًا.
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>
    </section>
  );
}
