'use client';

import { MessageCircle, Copy, RefreshCw, Home, ShieldCheck } from 'lucide-react';
import { Course } from '@/lib/types';
import { buildWhatsappLink, formatPrice } from '@/lib/utils';
import { motion } from 'framer-motion';

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
    ? buildWhatsappLink(grantData.whatsappNumber, decodeURIComponent(whatsappMessage))
    : `https://wa.me/?text=${whatsappMessage}`;

  const copyCode = () => {
    navigator.clipboard.writeText(registrationData.registrationCode);
  };

  return (
    <section className="min-h-screen px-4 py-20 bg-background relative overflow-hidden flex items-center justify-center">
      <div className="container mx-auto max-w-2xl">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="hero-panel relative space-y-8 rounded-[2rem] p-6 text-center md:p-8"
        >
          <div className="absolute -top-10 left-1/2 flex h-20 w-20 -translate-x-1/2 items-center justify-center rounded-full border-[6px] border-background bg-success shadow-xl shadow-success/30">
            <ShieldCheck className="w-10 h-10 text-white" />
          </div>

          <div className="space-y-6 pt-8">
            <h1 className="section-title font-black title-font text-success">
              {isAr ? 'تم التسجيل بنجاح!' : 'Success!'}
            </h1>
            <p className="section-subtitle font-bold">
              {isAr 
                ? 'شكراً لتسجيلك في مبادرة ذات. يرجى إرسال الكود أدناه عبر واتساب فوراً لتأكيد مكانك قبل انتهاء الصلاحية.'
                : 'Thank you for registering. Please send the code via WhatsApp immediately to confirm your spot.'}
            </p>
          </div>
          
          <div className="metric-card relative group rounded-[1.75rem] p-6 space-y-4">
            <p className="text-sm font-black text-primary uppercase tracking-widest">
              {isAr ? 'كود التسجيل الخاص بك' : 'Your Registration Code'}
            </p>
            <div className="flex items-center justify-center gap-4">
              <span className="text-4xl md:text-5xl font-black font-mono text-primary tracking-tight">
                {registrationData.registrationCode}
              </span>
              <button
                onClick={copyCode}
                className="action-secondary rounded-2xl p-3 hover:bg-primary hover:text-white group-active:scale-95"
                title={isAr ? 'نسخ الكود' : 'Copy Code'}
              >
                <Copy className="w-5 h-5" />
              </button>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-right">
            <div className="metric-card space-y-4 rounded-[1.6rem] p-5">
              <h3 className="mb-4 border-b border-dashed border-primary/20 pb-2 text-base md:text-lg font-black title-font text-primary">
                {isAr ? 'بيانات المسجل' : 'Registrant Data'}
              </h3>
              <div className="space-y-3 text-sm md:text-base font-bold text-muted-foreground">
                <p className="flex justify-between">
                  <span>{isAr ? 'الاسم:' : 'Name:'}</span>
                  <span className="text-foreground">{registrationData.fullName}</span>
                </p>
                <p className="flex justify-between">
                  <span>{isAr ? 'الهاتف:' : 'Phone:'}</span>
                  <span className="text-foreground">{registrationData.phone}</span>
                </p>
                <p className="flex justify-between">
                  <span>{isAr ? 'العمر:' : 'Age:'}</span>
                  <span className="text-foreground">{registrationData.age} {isAr ? 'عام' : 'years'}</span>
                </p>
              </div>
            </div>

            <div className="metric-card space-y-4 rounded-[1.6rem] p-5">
              <h3 className="mb-4 border-b border-dashed border-primary/20 pb-2 text-base md:text-lg font-black title-font text-primary">
                {isAr ? 'الدفع والأقساط' : 'Payment & Installments'}
              </h3>
              <div className="space-y-3 text-sm md:text-base font-bold">
                <div className="flex justify-between text-lg md:text-xl text-primary">
                  <span>{isAr ? 'الإجمالي:' : 'Total:'}</span>
                  <span className="font-black">{formatPrice(calculations.total)} {isAr ? 'ج' : 'EGP'}</span>
                </div>
                <div className="flex justify-between text-success">
                  <span>{isAr ? 'القسط 1:' : 'Inst. 1:'}</span>
                  <span>{formatPrice(calculations.firstInstallment)} {isAr ? 'ج' : 'EGP'}</span>
                </div>
                <div className="flex justify-between text-muted-foreground">
                  <span>{isAr ? 'القسط 2:' : 'Inst. 2:'}</span>
                  <span>{formatPrice(calculations.secondInstallment)} {isAr ? 'ج' : 'EGP'}</span>
                </div>
              </div>
            </div>
          </div>
          
          <div className="rounded-[1.5rem] border border-destructive/25 bg-destructive/10 p-5">
            <p className="text-sm md:text-base font-black text-destructive leading-relaxed">
              ⚠️ {isAr 
                ? `تنبيه: الكود صالح لـ 3 أيام فقط! ينتهي يوم ${expiryDay} الموافق ${expiryDateStr}`
                : `Alert: Code valid for 3 days! Expires on ${expiryDay}, ${expiryDateStr}`}
            </p>
          </div>
          
          <div className="space-y-6 pt-4">
            <a
              href={whatsappLink}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex w-full items-center justify-center gap-4 rounded-[1.5rem] bg-[#25D366] py-5 text-lg md:text-xl font-black text-white shadow-xl shadow-[#25D366]/30 transition-all hover:scale-[1.02] hover:bg-[#25D366]/90"
            >
              <MessageCircle className="w-6 h-6" />
              {isAr ? 'تأكيد الحجز عبر واتساب' : 'Confirm via WhatsApp'}
            </a>
            
            <div className="flex flex-col sm:flex-row gap-4">
              <button
                onClick={onReset}
                className="action-secondary flex flex-1 items-center justify-center gap-2 rounded-2xl py-4 text-base md:text-lg font-black"
              >
                <Home className="w-5 h-5" />
                {isAr ? 'العودة للرئيسية' : 'Back to Home'}
              </button>
              <button
                onClick={onReset}
                className="action-secondary flex flex-1 items-center justify-center gap-2 rounded-2xl py-4 text-base md:text-lg font-black"
              >
                <RefreshCw className="w-5 h-5" />
                {isAr ? 'تسجيل جديد' : 'New Registration'}
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
