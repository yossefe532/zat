import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'شروط الاستخدام | مبادرة ZAT',
};

export default function TermsPage() {
  return (
    <main className="page-shell min-h-screen px-4 py-16 text-foreground">
      <div className="container mx-auto max-w-4xl">
        <div className="hero-panel rounded-[2rem] p-6 text-right md:p-8">
          <h1 className="section-title font-black text-primary">شروط الاستخدام</h1>
          <div className="mt-6 space-y-6 text-sm font-bold leading-8 text-muted-foreground md:text-base">
            <p>باستخدامك هذا الموقع وإرسالك لطلب التسجيل، فأنت تقر بصحة البيانات التي تقدمها وأنها تخصك أو لديك صلاحية استخدامها.</p>
            <p>تخص أكواد المنح والعروض المسجلة أصحابها أو الفئات المصرح لها فقط، ولا يجوز إساءة استخدامها أو إعادة توظيفها بشكل مخالف.</p>
            <p>تحتفظ المبادرة بحق مراجعة أي تسجيل أو منحة أو طلب دعم في حال وجود بيانات غير مكتملة أو استخدام غير صحيح للتدفق.</p>
            <p>استمرارك داخل الموقع أو إتمام التسجيل يعني موافقتك على الشروط الحالية وأي تحديثات تشغيلية مرتبطة بتنظيم التدريب والتواصل.</p>
          </div>
        </div>
      </div>
    </main>
  );
}
