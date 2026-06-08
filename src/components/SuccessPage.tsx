'use client';

import { Check, MessageCircle, Copy, RefreshCw, Home } from 'lucide-react';
import { Course } from '@/lib/types';
import { formatPrice } from '@/lib/utils';

interface SuccessPageProps {
  lang: 'ar' | 'en';
  registrationData: {
    fullName: string;
    phone: string;
    age: number;
    registrationCode: string;
  };
  selectedCourses: Course[];
  grantData: { nameAr: string; nameEn: string; whatsappNumber: string } | null;
  calculations: {
    total: number;
    firstInstallment: number;
    secondInstallment: number;
  };
  onReset: () => void;
}

export function SuccessPage({
  lang,
  registrationData,
  selectedCourses,
  grantData,
  calculations,
  onReset
}: SuccessPageProps) {
  const isAr = lang === 'ar';
  
  const expiryDate = new Date();
  expiryDate.setDate(expiryDate.getDate() + 3);
  const expiryDay = expiryDate.toLocaleDateString(isAr ? 'ar-EG' : 'en-US', { weekday: 'long' });
  const expiryDateStr = expiryDate.toLocaleDateString(isAr ? 'ar-EG' : 'en-US', { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });

  const whatsappMessage = encodeURIComponent(
    isAr 
      ? `مرحباً، أرغب في تأكيد الحجز:
الاسم: ${registrationData.fullName}
الهاتف: ${registrationData.phone}
العمر: ${registrationData.age}
الكود: ${registrationData.registrationCode}
الكورسات: ${selectedCourses.map(c => isAr ? c.nameAr : c.nameEn).join(', ')}

التفاصيل الحسابية:
- الإجمالي النهائي: ${formatPrice(calculations.total)} جنيه
- القسط الأول (يُدفع الآن): ${formatPrice(calculations.firstInstallment)} جنيه
- القسط الثاني (المتبقي): ${formatPrice(calculations.secondInstallment)} جنيه

⚠️ صلاحية الكود: هذا الكود صالح لمدة 3 أيام فقط، وينتهي بحلول يوم ${expiryDay} الموافق ${expiryDateStr}.`
      : `Hello, I'd like to confirm my registration:
Name: ${registrationData.fullName}
Phone: ${registrationData.phone}
Age: ${registrationData.age}
Code: ${registrationData.registrationCode}
Courses: ${selectedCourses.map(c => isAr ? c.nameAr : c.nameEn).join(', ')}

Payment Details:
- Final Total: ${formatPrice(calculations.total)} EGP
- 1st Installment (Pay Now): ${formatPrice(calculations.firstInstallment)} EGP
- 2nd Installment (Remaining): ${formatPrice(calculations.secondInstallment)} EGP

⚠️ Code Validity: This code is valid for 3 days only, expiring on ${expiryDay}, ${expiryDateStr}.`
  );

  const whatsappLink = grantData 
    ? `https://wa.me/${grantData.whatsappNumber.replace(/^0/, '2')}${grantData.whatsappNumber.startsWith('20') ? '' : '20'}${grantData.whatsappNumber.replace(/^20/, '')}?text=${whatsappMessage}`
    : `https://wa.me/?text=${whatsappMessage}`;

  const copyCode = () => {
    navigator.clipboard.writeText(registrationData.registrationCode);
  };

  return (
    <section className="min-h-[80vh] px-4 py-16 flex items-center justify-center">
      <div className="container mx-auto max-w-xl text-center space-y-8">
        <div className="space-y-4">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-success/10 animate-fadeIn">
            <Check className="w-10 h-10 text-success" />
          </div>
          
          <h1 className="text-3xl md:text-4xl font-bold animate-fadeIn stagger-1" style={{ opacity: 0 }}>
            {isAr ? 'تم التسجيل بنجاح!' : 'Registration Successful!'}
          </h1>
          
          <p className="text-muted-foreground animate-fadeIn stagger-2" style={{ opacity: 0 }}>
            {isAr 
              ? 'شكراً لتسجيلك في مبادرة ذات. يرجى إرسال الكود أدناه عبر واتساب لإتمام الحجز.'
              : 'Thank you for registering with ZAT Initiative. Please send the code below via WhatsApp to complete your booking.'}
          </p>
        </div>
        
        <div className="rounded-2xl border bg-card p-6 space-y-6 animate-fadeIn stagger-3" style={{ opacity: 0 }}>
          <div>
            <p className="text-sm text-muted-foreground mb-2">
              {isAr ? 'كود التسجيل الخاص بك' : 'Your Registration Code'}
            </p>
            <div className="flex items-center justify-center gap-2">
              <span className="text-3xl font-mono font-bold text-primary tracking-wider">
                {registrationData.registrationCode}
              </span>
              <button
                onClick={copyCode}
                className="p-2 rounded-lg hover:bg-muted transition-colors"
                title={isAr ? 'نسخ الكود' : 'Copy Code'}
              >
                <Copy className="w-5 h-5 text-muted-foreground" />
              </button>
            </div>
          </div>
          
          <div className="border-t pt-6 space-y-3">
            <h3 className="font-semibold text-right">
              {isAr ? 'تفاصيل التسجيل' : 'Registration Details'}
            </h3>
            
            <div className="text-right space-y-2 text-sm">
              <p>
                <span className="text-muted-foreground ml-2">{isAr ? 'الاسم:' : 'Name:'}</span>
                <span className="font-medium">{registrationData.fullName}</span>
              </p>
              <p>
                <span className="text-muted-foreground ml-2">{isAr ? 'الهاتف:' : 'Phone:'}</span>
                <span className="font-medium">{registrationData.phone}</span>
              </p>
              <p>
                <span className="text-muted-foreground ml-2">{isAr ? 'الكورسات:' : 'Courses:'}</span>
                <span className="font-medium">
                  {selectedCourses.map(c => isAr ? c.nameAr : c.nameEn).join(', ')}
                </span>
              </p>
            </div>
          </div>
          
          <div className="bg-muted rounded-xl p-4 space-y-2">
            <p className="text-sm font-medium">{isAr ? 'الدفع' : 'Payment'}</p>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">{isAr ? 'الإجمالي' : 'Total'}</span>
              <span className="font-bold text-primary">{formatPrice(calculations.total)} {isAr ? 'جنيه' : 'EGP'}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">{isAr ? 'القسط الأول' : '1st Installment'}</span>
              <span>{formatPrice(calculations.firstInstallment)} {isAr ? 'جنيه' : 'EGP'}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">{isAr ? 'القسط الثاني' : '2nd Installment'}</span>
              <span>{formatPrice(calculations.secondInstallment)} {isAr ? 'جنيه' : 'EGP'}</span>
            </div>
          </div>
          
          <div className="bg-warning/10 rounded-xl p-4">
            <p className="text-sm text-warning-foreground">
              ⚠️ {isAr 
                ? `صلاحية الكود 3 أيام، ينتهي في ${expiryDay} ${expiryDateStr}`
                : `Code valid for 3 days, expires on ${expiryDay}, ${expiryDateStr}`}
            </p>
          </div>
        </div>
        
        <div className="space-y-4 animate-fadeIn stagger-4" style={{ opacity: 0 }}>
          <a
            href={whatsappLink}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-3 w-full py-4 rounded-xl bg-[#25D366] text-white font-semibold hover:bg-[#25D366]/90 transition-colors"
          >
            <MessageCircle className="w-6 h-6" />
            {isAr ? 'إرسال عبر واتساب' : 'Send via WhatsApp'}
          </a>
          
          <div className="flex gap-4">
            <button
              onClick={onReset}
              className="flex-1 py-3 rounded-xl border border-border bg-card text-foreground font-medium hover:bg-accent transition-colors flex items-center justify-center gap-2"
            >
              <Home className="w-5 h-5" />
              {isAr ? 'الرئيسية' : 'Home'}
            </button>
            <button
              onClick={onReset}
              className="flex-1 py-3 rounded-xl border border-border bg-card text-foreground font-medium hover:bg-accent transition-colors flex items-center justify-center gap-2"
            >
              <RefreshCw className="w-5 h-5" />
              {isAr ? 'تسجيل جديد' : 'New Registration'}
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
