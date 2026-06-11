'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { MessageCircle, Copy, RefreshCw, Home, ShieldCheck, Sparkles } from 'lucide-react';
import { Course } from '@/lib/types';
import { buildWhatsappLink, formatPrice } from '@/lib/utils';
import { motion, useReducedMotion } from 'framer-motion';

interface SuccessPageProps {
  lang: 'ar' | 'en';
  registrationData: {
    fullName: string;
    phone: string;
    age: number | null;
    registrationCode: string;
    mode: 'created' | 'updated' | 'resent';
  };
  selectedCourses: Course[];
  grantData: { nameAr: string; nameEn: string; whatsappNumber: string } | null;
  calculations: {
    total: number;
    firstInstallment: number;
    secondInstallment: number;
  };
  suggestedNextCourse?: Course | null;
  supportWhatsappUrl: string;
  onReset: () => void;
}

export function SuccessPage({
  lang,
  registrationData,
  selectedCourses,
  grantData,
  calculations,
  suggestedNextCourse,
  supportWhatsappUrl,
  onReset
}: SuccessPageProps) {
  const isAr = lang === 'ar';
  const shouldReduceMotion = useReducedMotion();
  const [countdown, setCountdown] = useState(30);
  const [autoOpened, setAutoOpened] = useState(false);
  const openedRef = useRef(false);
  const successTitle = registrationData.mode === 'created'
    ? (isAr ? 'تم التسجيل بنجاح!' : 'Registration completed!')
    : registrationData.mode === 'updated'
      ? (isAr ? 'تم تحديث حجزك الحالي' : 'Your existing booking was updated')
      : (isAr ? 'تم استرجاع حجزك الحالي' : 'Your current booking is ready again');
  const successSubtitle = registrationData.mode === 'created'
    ? (isAr
      ? 'شكراً لتسجيلك في مبادرة ذات. سيتم فتح واتساب تلقائيًا لإرسال رسالة تأكيد الحجز، ويجب إرسالها فورًا حتى يتم تثبيت مكانك بشكل نهائي.'
      : 'Thank you for registering. WhatsApp will open automatically to send the booking confirmation message, and it must be sent immediately to secure your spot.')
    : registrationData.mode === 'updated'
      ? (isAr
        ? 'تم تحديث نفس الحجز السابق بالكورسات الحالية دون إنشاء سجل جديد، وسيتم فتح واتساب لإعادة إرسال التفاصيل المحدثة.'
        : 'The same previous booking has been updated with your current courses without creating a new record. WhatsApp will open to resend the updated details.')
      : (isAr
        ? 'تم العثور على حجزك السابق دون إنشاء سجل جديد، وسيتم فتح واتساب لإعادة إرسال نفس التفاصيل الحالية.'
        : 'Your previous booking was found without creating a new record, and WhatsApp will open to resend the same details.');
  
  const { expiryDay, expiryDateStr } = useMemo(() => {
    const expiryDate = new Date();
    expiryDate.setDate(expiryDate.getDate() + 2);

    return {
      expiryDay: expiryDate.toLocaleDateString(isAr ? 'ar-EG' : 'en-US', { weekday: 'long' }),
      expiryDateStr: expiryDate.toLocaleDateString(isAr ? 'ar-EG' : 'en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      }),
    };
  }, [isAr]);

  const whatsappMessage = useMemo(() => encodeURIComponent(
    isAr
      ? `مرحباً، أرغب في تأكيد الحجز:
الاسم: ${registrationData.fullName}
الهاتف: ${registrationData.phone}
العمر: ${registrationData.age ?? '-'}
الكود: ${registrationData.registrationCode}
الكورسات: ${selectedCourses.map(c => isAr ? c.nameAr : c.nameEn).join(', ')}

التفاصيل الحسابية:
- الإجمالي النهائي: ${formatPrice(calculations.total)} جنيه
- القسط الأول (يُدفع الآن): ${formatPrice(calculations.firstInstallment)} جنيه
- القسط الثاني (المتبقي): ${formatPrice(calculations.secondInstallment)} جنيه

⚠️ صلاحية الكود: هذا الكود صالح لمدة يومين فقط، وينتهي بحلول يوم ${expiryDay} الموافق ${expiryDateStr}.`
      : `Hello, I'd like to confirm my registration:
Name: ${registrationData.fullName}
Phone: ${registrationData.phone}
Age: ${registrationData.age ?? '-'}
Code: ${registrationData.registrationCode}
Courses: ${selectedCourses.map(c => isAr ? c.nameAr : c.nameEn).join(', ')}

Payment Details:
- Final Total: ${formatPrice(calculations.total)} EGP
- 1st Installment (Pay Now): ${formatPrice(calculations.firstInstallment)} EGP
- 2nd Installment (Remaining): ${formatPrice(calculations.secondInstallment)} EGP

⚠️ Code Validity: This code is valid for 2 days only, expiring on ${expiryDay}, ${expiryDateStr}.`
  ), [calculations.firstInstallment, calculations.secondInstallment, calculations.total, expiryDateStr, expiryDay, isAr, registrationData.age, registrationData.fullName, registrationData.phone, registrationData.registrationCode, selectedCourses]);

  const whatsappLink = useMemo(
    () => (grantData
      ? buildWhatsappLink(grantData.whatsappNumber, decodeURIComponent(whatsappMessage))
      : `https://wa.me/?text=${whatsappMessage}`),
    [grantData, whatsappMessage]
  );

  const copyCode = () => {
    navigator.clipboard.writeText(registrationData.registrationCode);
  };

  useEffect(() => {
    openedRef.current = false;

    const countdownInterval = window.setInterval(() => {
      setCountdown((current) => {
        if (current <= 1) {
          window.clearInterval(countdownInterval);
          return 0;
        }
        return current - 1;
      });
    }, 1000);

    const openTimeout = window.setTimeout(() => {
      if (!openedRef.current) {
        openedRef.current = true;
        setAutoOpened(true);
        window.location.href = whatsappLink;
      }
    }, 30000);

    return () => {
      window.clearInterval(countdownInterval);
      window.clearTimeout(openTimeout);
    };
  }, [whatsappLink]);

  return (
    <section className="min-h-screen px-4 py-20 bg-background relative overflow-hidden flex items-center justify-center">
      <div className="container mx-auto max-w-2xl">
        <motion.div 
          initial={shouldReduceMotion ? { opacity: 0.98 } : { opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={shouldReduceMotion ? { duration: 0.12 } : { duration: 0.3, ease: 'easeOut' }}
          className="hero-panel relative space-y-8 rounded-[2rem] p-6 text-center md:p-8"
        >
          <div className="absolute -top-10 left-1/2 flex h-20 w-20 -translate-x-1/2 items-center justify-center rounded-full border-[6px] border-background bg-success shadow-xl shadow-success/30">
            <ShieldCheck className="w-10 h-10 text-white" />
          </div>

          <div className="space-y-6 pt-8">
            <h1 className="section-title font-black title-font text-success">
              {successTitle}
            </h1>
            <p className="section-subtitle font-bold">
              {successSubtitle}
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
                  <span className="text-foreground">
                    {registrationData.age
                      ? `${registrationData.age} ${isAr ? 'عام' : 'years'}`
                      : (isAr ? 'غير مسجل' : 'Not provided')}
                  </span>
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
          
          <div className="rounded-[1.5rem] border border-destructive/25 bg-destructive/10 p-5 space-y-3">
            <p className="text-sm md:text-base font-black text-destructive leading-relaxed">
              ⚠️ {isAr 
                ? `تنبيه: الكود صالح ليومين فقط! ينتهي يوم ${expiryDay} الموافق ${expiryDateStr}`
                : `Alert: Code valid for 2 days! Expires on ${expiryDay}, ${expiryDateStr}`}
            </p>
            <p className="text-sm md:text-base font-black text-destructive leading-relaxed">
              {isAr
                ? 'إرسال رسالة واتساب الآن خطوة أساسية وإلزامية لتأكيد الحجز. في حال عدم الإرسال السريع قد لا يتم اعتماد الطلب أو تثبيت المكان.'
                : 'Sending the WhatsApp confirmation now is mandatory. Without sending it quickly, your booking may not be approved or reserved.'}
            </p>
          </div>

          {suggestedNextCourse && (
            <div className="metric-card rounded-[1.6rem] p-5 text-right">
              <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div className="space-y-2">
                  <div className="inline-flex items-center gap-2 rounded-full border border-primary/15 bg-card/70 px-4 py-2 text-xs font-black text-primary shadow-sm backdrop-blur-md md:text-sm">
                    <Sparkles className="h-4 w-4" />
                    {isAr ? 'الخطوة التالية المقترحة لك' : 'Your recommended next step'}
                  </div>
                  <h3 className="text-lg font-black text-primary md:text-xl">
                    {isAr
                      ? `بعد تأكيد الحجز، ${suggestedNextCourse.nameAr} هو أقرب كورس يكمل مسارك`
                      : `After confirming, ${suggestedNextCourse.nameEn} is the best course to complete your path`}
                  </h3>
                  <p className="text-sm font-bold leading-7 text-muted-foreground md:text-base">
                    {isAr
                      ? 'هذه ليست خطوة إجبارية الآن، لكنها أفضل ترشيح لاحق إذا أردت توسيع المسار بعد إنهاء الحجز الحالي.'
                      : 'This is not required now, but it is the best follow-up recommendation if you want to expand your path after confirming your current booking.'}
                  </p>
                </div>
                <div className="rounded-[1.4rem] border border-primary/15 bg-primary/8 px-5 py-4 text-center md:min-w-[15rem]">
                  <p className="text-2xl">{suggestedNextCourse.icon}</p>
                  <p className="mt-2 text-base font-black text-foreground md:text-lg">
                    {isAr ? suggestedNextCourse.nameAr : suggestedNextCourse.nameEn}
                  </p>
                </div>
              </div>
            </div>
          )}
          
          <div className="space-y-6 pt-4">
            <div className="rounded-[1.5rem] border border-[#25D366]/20 bg-[#25D366]/10 p-5 text-center">
              <p className="text-sm md:text-base font-black text-[#128C7E]">
                {autoOpened
                  ? isAr
                    ? 'تم الآن توجيهك إلى واتساب. إذا لم تُفتح الصفحة تلقائيًا، استخدم الزر الأخضر بالأسفل فورًا.'
                    : 'You are now being redirected to WhatsApp. If it did not open automatically, use the green button below immediately.'
                  : isAr
                    ? `سيتم فتح واتساب تلقائيًا خلال ${countdown} ثوانٍ لإرسال رسالة تأكيد الحجز.`
                    : `WhatsApp will open automatically in ${countdown} seconds to send your booking confirmation.`}
              </p>
            </div>

            <a
              href={whatsappLink}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex w-full items-center justify-center gap-4 rounded-[1.5rem] bg-[#25D366] py-5 text-lg md:text-xl font-black text-white shadow-xl shadow-[#25D366]/30 transition-all hover:scale-[1.02] hover:bg-[#25D366]/90"
            >
              <MessageCircle className="w-6 h-6" />
              {autoOpened
                ? isAr
                  ? 'فتح واتساب مرة أخرى'
                  : 'Open WhatsApp Again'
                : isAr
                  ? `تأكيد الحجز عبر واتساب خلال ${countdown} ثوانٍ`
                  : `Confirm via WhatsApp in ${countdown}s`}
            </a>

            {suggestedNextCourse && (
              <a
                href={supportWhatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="action-secondary inline-flex w-full items-center justify-center gap-3 rounded-[1.5rem] py-4 text-base font-black text-primary hover:border-primary/35 hover:bg-primary/5"
              >
                <Sparkles className="h-5 w-5" />
                {isAr ? 'اسأل عن إضافة هذا الكورس لاحقًا' : 'Ask about adding this course later'}
              </a>
            )}
            
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
