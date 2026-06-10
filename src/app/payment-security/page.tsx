import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'الدفع والأمان | مبادرة ZAT',
};

export default function PaymentSecurityPage() {
  return (
    <main className="page-shell min-h-screen px-4 py-16 text-foreground">
      <div className="container mx-auto max-w-4xl">
        <div className="hero-panel rounded-[2rem] p-6 text-right md:p-8">
          <h1 className="section-title font-black text-primary">الدفع والأمان</h1>
          <div className="mt-6 space-y-6 text-sm font-bold leading-8 text-muted-foreground md:text-base">
            <p>يعرض الموقع تفاصيل الحجز والأقساط بوضوح قبل التأكيد النهائي حتى يتمكن المستخدم من مراجعة السعر الكامل قبل اتخاذ القرار.</p>
            <p>لا يخزن هذا الموقع بيانات بطاقات دفع حساسة، ويقتصر دوره على توضيح تفاصيل الحجز، ثم متابعة التأكيد النهائي عبر القنوات المحددة.</p>
            <p>إذا ظهرت لك أي ملاحظة تخص المبلغ أو القسط أو تأكيد الحجز، يمكنك الرجوع إلى صفحة التسجيل أو التواصل مع الدعم مباشرة.</p>
            <p>نوصي دائمًا بمراجعة تفاصيل الحجز كاملة قبل الإرسال النهائي والتأكد من رقم الهاتف والكورسات المختارة لتفادي أي تعارض.</p>
          </div>
        </div>
      </div>
    </main>
  );
}
