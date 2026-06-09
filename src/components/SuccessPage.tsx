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
      {/* Legacy background effect */}
      <div className="fixed inset-0 pointer-events-none -z-10 opacity-10 bg-[url('https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=1920&q=90')] bg-cover bg-center" />

      <div className="container mx-auto max-w-2xl">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-card rounded-[3rem] border-4 border-primary/20 shadow-2xl p-8 md:p-12 space-y-10 text-center relative"
        >
          <div className="absolute -top-12 left-1/2 -translate-x-1/2 w-24 h-24 rounded-full bg-success flex items-center justify-center shadow-xl shadow-success/30 border-8 border-background">
            <ShieldCheck className="w-12 h-12 text-white" />
          </div>

          <div className="space-y-6 pt-8">
            <h1 className="text-4xl md:text-5xl font-black title-font text-success">
              {isAr ? 'تم التسجيل بنجاح!' : 'Success!'}
            </h1>
            <p className="text-lg md:text-xl font-bold text-muted-foreground leading-relaxed">
              {isAr 
                ? 'شكراً لتسجيلك في مبادرة ذات. يرجى إرسال الكود أدناه عبر واتساب فوراً لتأكيد مكانك قبل انتهاء الصلاحية.'
                : 'Thank you for registering. Please send the code via WhatsApp immediately to confirm your spot.'}
            </p>
          </div>
          
          <div className="bg-primary/5 rounded-3xl p-8 space-y-4 border-2 border-primary/10 relative group">
            <p className="text-sm font-black text-primary uppercase tracking-widest">
              {isAr ? 'كود التسجيل الخاص بك' : 'Your Registration Code'}
            </p>
            <div className="flex items-center justify-center gap-4">
              <span className="text-5xl md:text-6xl font-black font-mono text-primary tracking-tighter">
                {registrationData.registrationCode}
              </span>
              <button
                onClick={copyCode}
                className="p-3 rounded-2xl bg-white shadow-md hover:bg-primary hover:text-white transition-all group-active:scale-95"
                title={isAr ? 'نسخ الكود' : 'Copy Code'}
              >
                <Copy className="w-6 h-6" />
              </button>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-right">
            <div className="space-y-4 p-6 rounded-2xl bg-muted/30 border border-border/50">
              <h3 className="font-black text-lg title-font text-primary border-b border-dashed border-primary/20 pb-2 mb-4">
                {isAr ? 'بيانات المسجل' : 'Registrant Data'}
              </h3>
              <div className="space-y-3 font-bold text-muted-foreground">
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

            <div className="space-y-4 p-6 rounded-2xl bg-primary/5 border border-primary/10">
              <h3 className="font-black text-lg title-font text-primary border-b border-dashed border-primary/20 pb-2 mb-4">
                {isAr ? 'الدفع والأقساط' : 'Payment & Installments'}
              </h3>
              <div className="space-y-3 font-bold">
                <div className="flex justify-between text-xl text-primary">
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
          
          <div className="bg-destructive/10 rounded-2xl p-6 border-2 border-destructive/20 animate-pulse">
            <p className="text-base font-black text-destructive leading-relaxed">
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
              className="inline-flex items-center justify-center gap-4 w-full py-6 rounded-2xl bg-[#25D366] text-white font-black text-2xl hover:bg-[#25D366]/90 transition-all shadow-xl shadow-[#25D366]/30 hover:scale-[1.02]"
            >
              <MessageCircle className="w-8 h-8" />
              {isAr ? 'تأكيد الحجز عبر واتساب' : 'Confirm via WhatsApp'}
            </a>
            
            <div className="flex flex-col sm:flex-row gap-4">
              <button
                onClick={onReset}
                className="flex-1 py-4 rounded-2xl border-2 border-border bg-card text-foreground font-black text-lg hover:bg-muted/50 transition-all flex items-center justify-center gap-2"
              >
                <Home className="w-6 h-6" />
                {isAr ? 'العودة للرئيسية' : 'Back to Home'}
              </button>
              <button
                onClick={onReset}
                className="flex-1 py-4 rounded-2xl border-2 border-border bg-card text-foreground font-black text-lg hover:bg-muted/50 transition-all flex items-center justify-center gap-2"
              >
                <RefreshCw className="w-6 h-6" />
                {isAr ? 'تسجيل جديد' : 'New Registration'}
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
