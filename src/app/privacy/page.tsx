import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'سياسة الخصوصية | مبادرة ZAT',
};

export default function PrivacyPage() {
  return (
    <main className="page-shell min-h-screen px-4 py-16 text-foreground">
      <div className="container mx-auto max-w-4xl">
        <div className="hero-panel rounded-[2rem] p-6 text-right md:p-8">
          <h1 className="section-title font-black text-primary">سياسة الخصوصية</h1>
          <div className="mt-6 space-y-6 text-sm font-bold leading-8 text-muted-foreground md:text-base">
            <p>نحن نجمع البيانات الأساسية اللازمة لإتمام التسجيل مثل الاسم ورقم الهاتف والعمر، وقد نجمع البريد الإلكتروني عند طلب كود جديد.</p>
            <p>تُستخدم هذه البيانات فقط لإدارة التسجيل، وتأكيد الحجز، والرد على طلبات الدعم، وتنظيم الرحلة التعليمية داخل المبادرة.</p>
            <p>لا نطلب بيانات بطاقات الدفع داخل هذا الموقع، وأي تواصل عبر واتساب أو مزود خارجي يخضع أيضًا لسياسات ذلك الطرف الخارجي.</p>
            <p>إذا رغبت في تعديل بياناتك أو طلب حذفها أو الاستفسار عنها، يمكنك التواصل معنا عبر قنوات الدعم الموضحة داخل الموقع.</p>
          </div>
        </div>
      </div>
    </main>
  );
}
