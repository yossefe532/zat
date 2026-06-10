import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'الاسترجاع والدعم | مبادرة ZAT',
};

export default function RefundSupportPage() {
  return (
    <main className="page-shell min-h-screen px-4 py-16 text-foreground">
      <div className="container mx-auto max-w-4xl">
        <div className="hero-panel rounded-[2rem] p-6 text-right md:p-8">
          <h1 className="section-title font-black text-primary">سياسة الاسترجاع والدعم</h1>
          <div className="mt-6 space-y-6 text-sm font-bold leading-8 text-muted-foreground md:text-base">
            <p>في حال وجود استفسار بخصوص الحجز أو الأقساط أو تفعيل المنحة، يمكنك التواصل معنا مباشرة عبر واتساب الدعم الموضح داخل الموقع.</p>
            <p>أي مراجعة تخص تأكيد الحجز أو تعديل البيانات أو متابعة حالة التسجيل تتم من خلال فريق المبادرة بعد التحقق من بياناتك الأساسية.</p>
            <p>طلبات الاسترجاع أو تعديل الحجز أو تغيير الكورس تخضع لمراجعة إدارية حسب حالة التسجيل وموعد بدء التدريب ونظام الدفعة.</p>
            <p>نوصي دائمًا بالتواصل السريع قبل موعد بدء التدريب إذا كنت تحتاج أي تعديل أو مساعدة لضمان أفضل استجابة ممكنة.</p>
          </div>
        </div>
      </div>
    </main>
  );
}
