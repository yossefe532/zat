import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'دليل الإحالات | مبادرة ZAT',
};

export default function ReferralGuidePage() {
  return (
    <main className="page-shell min-h-screen px-4 py-16 text-foreground">
      <div className="container mx-auto max-w-4xl space-y-6">
        <div className="hero-panel rounded-[2rem] p-6 text-right md:p-8">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <h1 className="section-title font-black text-primary">دليل نظام الإحالات</h1>
            <Link
              href="/referrals"
              className="action-secondary inline-flex items-center justify-center rounded-2xl px-5 py-3 text-sm font-black text-primary hover:border-primary/35 hover:bg-primary/5"
            >
              الرجوع للوحة الإحالات
            </Link>
          </div>

          <div className="mt-6 space-y-6 text-sm font-bold leading-8 text-muted-foreground md:text-base">
            <div>
              <p className="text-foreground font-black">الفكرة الأساسية</p>
              <p className="mt-2">
                كل مستخدم مسجل يحصل على كود إحالة خاص به. عندما يسجل صديق جديد باستخدام كودك، يتم احتساب إحالة جديدة لك بشكل تلقائي، ويمكنك استرداد مكافآت على مراحل.
              </p>
            </div>

            <div>
              <p className="text-foreground font-black">كيف يستخدم صديقك الكود؟</p>
              <ul className="mt-3 list-disc space-y-2 ps-5">
                <li>صديقك يدخل كود الإحالة في خطوة “كود المنحة/الإحالة”.</li>
                <li>بعد إتمام التسجيل بنجاح، يتم تسجيل الإحالة تلقائيًا في النظام.</li>
                <li>خصم الصديق يظهر كبند مستقل داخل الفاتورة باسم “خصم الإحالة”.</li>
              </ul>
            </div>

            <div>
              <p className="text-foreground font-black">المراحل والمكافآت</p>
              <ul className="mt-3 list-disc space-y-2 ps-5">
                <li>عند 1 إحالة: خصم 50 جنيه على إجمالي سعر الطلب.</li>
                <li>عند 3 إحالات: خصم 200 جنيه على إجمالي سعر الطلب.</li>
                <li>عند 5 إحالات: كورس مجاني (يُخصم قيمة كورس واحد من إجمالي الطلب).</li>
                <li>عند 7 إحالات: اشتراك Canva Pro مجانًا (يتم استرداده عبر رسالة واتساب).</li>
                <li>عند 10 إحالات: كورسين مجانًا (يُخصم قيمة كورسين من إجمالي الطلب).</li>
              </ul>
            </div>

            <div>
              <p className="text-foreground font-black">استرداد المكافأة</p>
              <ul className="mt-3 list-disc space-y-2 ps-5">
                <li>عندما تصل لأي مرحلة، يظهر زر “استرداد المكافأة” داخل لوحة الإحالات.</li>
                <li>بالضغط عليه يتم فتح واتساب برسالة جاهزة تحتوي على تفاصيل الفاتورة قبل وبعد الخصم لتأكيد الاستحقاق سريعًا.</li>
                <li>بعد الاسترداد، يتم تجهيز المكافأة لتطبيقها على طلبك القادم.</li>
              </ul>
            </div>

            <div>
              <p className="text-foreground font-black">الخصومات المتعددة</p>
              <p className="mt-2">
                إذا كنت قد حصلت على خصم 50 جنيه عند تسجيلك باستخدام كود إحالة شخص آخر، لا يمنعك ذلك من الحصول على خصم 50 جنيه إضافي عندما تحقق أنت أول إحالة لك وتسترد مكافأتك.
              </p>
            </div>

            <div>
              <p className="text-foreground font-black">النظام الهرمي</p>
              <p className="mt-2">
                إذا سجّل صديقك بكودك، ثم قام هو بدوره بدعوة أشخاص آخرين عبر كوده، يتم احتساب هؤلاء أيضًا ضمن المسار الإحالي للكود “الأول” (الجذر) تلقائيًا.
              </p>
            </div>

            <div className="rounded-[1.6rem] border border-primary/15 bg-primary/5 p-5 text-right">
              <p className="text-primary font-black">ملاحظة</p>
              <p className="mt-2">
                جميع الخصومات تُحسب على إجمالي سعر الطلب (وليس على كورس واحد منفرد).
              </p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

