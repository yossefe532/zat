import type { CourseCatalogItem } from '@/lib/portal';
import { Save, Trash2 } from 'lucide-react';
import { StatusBadge } from '@/components/console/StatusBadge';

type CoursePayload = {
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
};

type CourseManagementPanelProps = {
  courses: CourseCatalogItem[];
  busyCourseId?: number | null;
  creating?: boolean;
  onCreate: (payload: CoursePayload) => void;
  onUpdate: (courseId: number, payload: CoursePayload) => void;
  onDelete: (courseId: number) => void;
};

function buildCoursePayload(formData: FormData): CoursePayload {
  return {
    nameAr: String(formData.get('nameAr') ?? ''),
    nameEn: String(formData.get('nameEn') ?? ''),
    level: String(formData.get('level') ?? ''),
    icon: String(formData.get('icon') ?? ''),
    benefitAr: String(formData.get('benefitAr') ?? ''),
    benefitEn: String(formData.get('benefitEn') ?? ''),
    detailsAr: String(formData.get('detailsAr') ?? '')
      .split('\n')
      .map((item) => item.trim())
      .filter(Boolean),
    detailsEn: String(formData.get('detailsEn') ?? '')
      .split('\n')
      .map((item) => item.trim())
      .filter(Boolean),
    originalPrice: Number(formData.get('originalPrice') ?? 0),
    grantPrice: Number(formData.get('grantPrice') ?? 0),
    isActive: formData.get('isActive') === 'on',
  };
}

export function CourseManagementPanel({
  courses,
  busyCourseId,
  creating,
  onCreate,
  onUpdate,
  onDelete,
}: CourseManagementPanelProps) {
  return (
    <section className="grid gap-6 xl:grid-cols-[0.92fr,1.08fr]">
      <form
        className="hero-panel rounded-[2rem] p-5 md:p-6"
        onSubmit={(event) => {
          event.preventDefault();
          const formData = new FormData(event.currentTarget);
          onCreate(buildCoursePayload(formData));
          event.currentTarget.reset();
        }}
      >
        <h2 className="text-2xl font-black text-foreground">إضافة كورس جديد</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          أضف أي كورس جديد ليظهر في صفحات الاختيار والتسجيل ولوحة الموظفين.
        </p>

        <div className="mt-5 grid gap-4">
          <div className="grid gap-4 md:grid-cols-2">
            <input name="nameAr" placeholder="الاسم العربي" className="field-shell rounded-2xl px-4 py-3" required />
            <input name="nameEn" placeholder="الاسم الإنجليزي" className="field-shell rounded-2xl px-4 py-3" required />
            <input name="level" placeholder="المستوى" className="field-shell rounded-2xl px-4 py-3" required />
            <input name="icon" placeholder="الأيقونة مثل 📚" defaultValue="📚" className="field-shell rounded-2xl px-4 py-3" required />
            <input name="originalPrice" type="number" min={0} defaultValue={3000} placeholder="السعر الأصلي" className="field-shell rounded-2xl px-4 py-3" required />
            <input name="grantPrice" type="number" min={0} defaultValue={650} placeholder="سعر المنحة" className="field-shell rounded-2xl px-4 py-3" required />
          </div>
          <textarea name="benefitAr" placeholder="الوصف العربي المختصر" className="field-shell min-h-24 rounded-2xl px-4 py-3" required />
          <textarea name="benefitEn" placeholder="الوصف الإنجليزي المختصر" className="field-shell min-h-24 rounded-2xl px-4 py-3" required />
          <textarea name="detailsAr" placeholder="تفاصيل عربية، كل سطر نقطة" className="field-shell min-h-28 rounded-2xl px-4 py-3" />
          <textarea name="detailsEn" placeholder="English details, one item per line" className="field-shell min-h-28 rounded-2xl px-4 py-3" />
          <label className="flex items-center gap-3 text-sm font-black text-foreground">
            <input type="checkbox" name="isActive" defaultChecked />
            الكورس نشط ويظهر للمستخدمين
          </label>
          <button className="action-primary rounded-2xl px-4 py-3 text-sm font-black">
            {creating ? 'جارٍ الإضافة' : 'إضافة الكورس'}
          </button>
        </div>
      </form>

      <div className="table-shell rounded-[2rem] p-5 md:p-6">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-black text-foreground">إدارة الكورسات</h2>
            <p className="text-sm text-muted-foreground">تعديل التفاصيل أو الحذف أو التحكم في الظهور</p>
          </div>
          <StatusBadge>{courses.length} كورس</StatusBadge>
        </div>

        <div className="space-y-4">
          {courses.map((course) => {
            const isBusy = busyCourseId === course.id;

            return (
              <form
                key={`${course.id}-${course.nameAr}-${course.grantPrice}-${course.isActive}`}
                className="rounded-[1.6rem] border border-border/70 bg-card/55 p-4"
                onSubmit={(event) => {
                  event.preventDefault();
                  const formData = new FormData(event.currentTarget);
                  onUpdate(course.id, buildCoursePayload(formData));
                }}
              >
                <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <span className="text-3xl">{course.icon}</span>
                    <div>
                      <p className="font-black text-foreground">{course.nameAr}</p>
                      <p className="text-xs text-muted-foreground">{course.nameEn}</p>
                    </div>
                  </div>
                  <StatusBadge tone={course.isActive ? 'success' : 'danger'}>
                    {course.isActive ? 'نشط' : 'مخفي'}
                  </StatusBadge>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <input name="nameAr" defaultValue={course.nameAr} className="field-shell rounded-2xl px-4 py-3" required />
                  <input name="nameEn" defaultValue={course.nameEn} className="field-shell rounded-2xl px-4 py-3" required />
                  <input name="level" defaultValue={course.level} className="field-shell rounded-2xl px-4 py-3" required />
                  <input name="icon" defaultValue={course.icon} className="field-shell rounded-2xl px-4 py-3" required />
                  <input name="originalPrice" type="number" min={0} defaultValue={course.originalPrice} className="field-shell rounded-2xl px-4 py-3" required />
                  <input name="grantPrice" type="number" min={0} defaultValue={course.grantPrice} className="field-shell rounded-2xl px-4 py-3" required />
                </div>

                <div className="mt-4 grid gap-4">
                  <textarea name="benefitAr" defaultValue={course.benefitAr} className="field-shell min-h-24 rounded-2xl px-4 py-3" required />
                  <textarea name="benefitEn" defaultValue={course.benefitEn} className="field-shell min-h-24 rounded-2xl px-4 py-3" required />
                  <textarea
                    name="detailsAr"
                    defaultValue={course.detailsAr.join('\n')}
                    className="field-shell min-h-28 rounded-2xl px-4 py-3"
                  />
                  <textarea
                    name="detailsEn"
                    defaultValue={course.detailsEn.join('\n')}
                    className="field-shell min-h-28 rounded-2xl px-4 py-3"
                  />
                </div>

                <div className="mt-4 flex flex-wrap items-center gap-3">
                  <label className="flex items-center gap-3 text-sm font-black text-foreground">
                    <input type="checkbox" name="isActive" defaultChecked={course.isActive} />
                    يظهر للمستخدمين
                  </label>
                  <button
                    type="submit"
                    disabled={isBusy}
                    className="action-primary inline-flex items-center gap-2 rounded-2xl px-4 py-3 text-sm font-black disabled:opacity-60"
                  >
                    <Save className="h-4 w-4" />
                    {isBusy ? 'جارٍ الحفظ' : 'حفظ الكورس'}
                  </button>
                  <button
                    type="button"
                    disabled={isBusy}
                    onClick={() => onDelete(course.id)}
                    className="inline-flex items-center gap-2 rounded-2xl bg-destructive px-4 py-3 text-sm font-black text-white disabled:opacity-60"
                  >
                    <Trash2 className="h-4 w-4" />
                    حذف الكورس
                  </button>
                </div>
              </form>
            );
          })}

          {courses.length === 0 ? (
            <p className="rounded-[1.5rem] bg-card/55 p-6 text-center text-sm text-muted-foreground">
              لا توجد كورسات مضافة بعد.
            </p>
          ) : null}
        </div>
      </div>
    </section>
  );
}
