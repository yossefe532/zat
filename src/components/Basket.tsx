'use client';

import { useMemo } from 'react';
import { ArrowRight, ArrowLeft, CheckCircle2, MessageCircle, ShoppingCart, Sparkles, Tag, ReceiptText } from 'lucide-react';
import { DISCOUNT_RULES, SMART_BUNDLES } from '@/lib/data';
import { Course } from '@/lib/types';
import { formatPrice } from '@/lib/utils';
import { motion, useReducedMotion } from 'framer-motion';
import type { QuizResult } from '@/components/PathQuiz';

interface BasketProps {
  lang: 'ar' | 'en';
  allCourses: Course[];
  selectedCourses: Course[];
  grantData: { nameAr: string; nameEn: string } | null;
  quizResult?: QuizResult | null;
  calculations: {
    subtotal: number;
    discount: number;
    referralDiscount?: number;
    totalBeforeReferral?: number;
    total: number;
    firstInstallment: number;
    secondInstallment: number;
  };
  onBack: () => void;
  onContinue: () => void;
  onAddSuggestedCourse: (course: Course) => void;
  supportWhatsappUrl: string;
}

export function Basket({
  lang,
  allCourses,
  selectedCourses,
  grantData,
  quizResult,
  calculations,
  onBack,
  onContinue,
  onAddSuggestedCourse,
  supportWhatsappUrl,
}: BasketProps) {
  const isAr = lang === 'ar';
  const shouldReduceMotion = useReducedMotion();
  const selectedIds = useMemo(() => selectedCourses.map((course) => course.id), [selectedCourses]);
  const selectedIdSet = useMemo(() => new Set(selectedIds), [selectedIds]);
  const displayedCoursePrice = useMemo(
    () => (selectedCourses.length === 0
      ? 0
      : (grantData ? selectedCourses[0].grantPrice : selectedCourses[0].originalPrice)),
    [grantData, selectedCourses]
  );

  const applicableDiscount = useMemo(
    () => DISCOUNT_RULES.find((rule) => selectedCourses.length >= rule.count),
    [selectedCourses.length]
  );

  const suggestedBundle = useMemo(
    () =>
      SMART_BUNDLES
        .map((bundle) => {
          const missingCourseIds = bundle.courseIds.filter((courseId) => !selectedIdSet.has(courseId));
          const matchedCount = bundle.courseIds.length - missingCourseIds.length;

          return {
            bundle,
            matchedCount,
            missingCourseIds,
          };
        })
        .filter((entry) => entry.matchedCount > 0 && entry.missingCourseIds.length > 0)
        .sort((a, b) => b.matchedCount - a.matchedCount)[0],
    [selectedIdSet]
  );

  const quizSuggestedCourseId = useMemo(
    () => quizResult?.recommendedCourseIds.find((courseId) => !selectedIdSet.has(courseId)),
    [quizResult, selectedIdSet]
  );

  const suggestedCourse = useMemo(
    () => (quizSuggestedCourseId
      ? allCourses.find((course) => course.id === quizSuggestedCourseId) ?? null
      : suggestedBundle
        ? allCourses.find((course) => course.id === suggestedBundle.missingCourseIds[0]) ?? null
        : null),
    [allCourses, quizSuggestedCourseId, suggestedBundle]
  );

  const suggestedCoursePrice = useMemo(
    () => (suggestedCourse ? (grantData ? suggestedCourse.grantPrice : suggestedCourse.originalPrice) : 0),
    [grantData, suggestedCourse]
  );

  return (
    <section className="min-h-screen px-4 py-20 bg-background relative overflow-hidden">
      <div className="container mx-auto max-w-2xl">
        <button
          onClick={onBack}
          className="mb-10 inline-flex items-center gap-2 text-sm font-black text-primary transition-transform hover:scale-105"
        >
          <ArrowRight className="w-5 h-5 rtl:rotate-180" />
          {isAr ? 'العودة لاختيار الكورسات' : 'Back to Courses'}
        </button>
        
        <div className="text-center mb-12 space-y-4">
          <div className="mb-4 inline-flex h-18 w-18 items-center justify-center rounded-full border border-primary/15 bg-primary/10">
            <ShoppingCart className="w-8 h-8 text-primary" />
          </div>
          <h2 className="section-title font-black title-font text-primary">
            {isAr ? 'سلة المشتريات الذكية' : 'Smart Shopping Cart'}
          </h2>
          <p className="section-subtitle font-bold">
            {isAr ? 'راجع طلبك واستمتع بخصومات المنحة' : 'Review your order & enjoy grant discounts'}
          </p>
        </div>
        
        <div className="space-y-4 mb-10">
          {selectedCourses.map((course, index) => (
            <motion.div 
              key={course.id}
              initial={shouldReduceMotion ? false : { opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={shouldReduceMotion ? { duration: 0 } : { delay: index * 0.1 }}
              className="glass-panel flex items-center justify-between rounded-[1.75rem] p-5 transition-all group hover:border-primary/40"
            >
              <div className="flex items-center gap-5">
                <span className="text-3xl md:text-4xl group-hover:scale-110 transition-transform">{course.icon}</span>
                <div>
                  <p className="text-lg md:text-xl font-black title-font">{isAr ? course.nameAr : course.nameEn}</p>
                  <p className="text-xs md:text-sm font-bold text-muted-foreground">{isAr ? 'دورة تدريبية معتمدة' : 'Accredited Course'}</p>
                </div>
              </div>
              <div className="text-left">
                <p className="text-xl md:text-2xl font-black text-primary">{formatPrice(grantData ? course.grantPrice : course.originalPrice)}</p>
                <p className="text-xs font-black text-muted-foreground uppercase">{isAr ? 'جنيه' : 'EGP'}</p>
              </div>
            </motion.div>
          ))}
        </div>

        {suggestedCourse && suggestedBundle && (
          <div className="hero-panel mb-10 rounded-[1.8rem] p-5 text-right md:p-6">
            <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
              <div className="space-y-3 md:max-w-xl">
                <div className="inline-flex items-center gap-2 rounded-full border border-primary/15 bg-card/70 px-4 py-2 text-xs font-black text-primary shadow-sm backdrop-blur-md md:text-sm">
                  <Sparkles className="h-4 w-4" />
                  {quizSuggestedCourseId
                    ? (isAr ? 'اقتراح مخصص حسب نتيجة الاختبار' : 'Personalized suggestion from your quiz')
                    : (isAr ? 'اقتراح ذكي لرفع قيمة اختيارك' : 'Smart suggestion to improve your selection')}
                </div>
                <h3 className="text-lg font-black text-primary md:text-xl">
                  {quizSuggestedCourseId
                    ? (isAr
                      ? `أضف ${suggestedCourse.nameAr} لأنه الأقرب لنتيجة مسارك الحالية`
                      : `Add ${suggestedCourse.nameEn} because it best matches your recommended path`)
                    : (isAr
                      ? `أضف ${suggestedCourse.nameAr} لتقترب من ${suggestedBundle.bundle.nameAr}`
                      : `Add ${suggestedCourse.nameEn} to move closer to ${suggestedBundle.bundle.nameEn}`)}
                </h3>
                <p className="text-sm font-bold leading-7 text-muted-foreground md:text-base">
                  {quizSuggestedCourseId
                    ? (isAr
                      ? 'هذا الاقتراح مبني على هدفك ووقتك وطريقة التعلم التي اخترتها في الاختبار، لذلك هو الأنسب لتقوية اختيارك الحالي.'
                      : 'This suggestion is based on your goal, time, and learning style from the quiz, making it the strongest next addition.')
                    : (isAr
                      ? `بمجرد إضافة هذا الكورس سترفع قيمة المسار الحالي وتقترب من خصم يصل إلى ${suggestedBundle.bundle.extraDiscount} جنيه داخل هذه الباقة.`
                      : `Adding this course strengthens your current path and moves you toward a bundle discount of up to ${suggestedBundle.bundle.extraDiscount} EGP.`)}
                </p>
              </div>
              <div className="metric-card rounded-[1.4rem] p-4 text-center md:min-w-[15rem]">
                <p className="text-[11px] font-black uppercase tracking-wide text-muted-foreground">
                  {isAr ? 'الكورس المقترح' : 'Suggested course'}
                </p>
                <p className="mt-2 text-lg font-black text-foreground">
                  {suggestedCourse.icon} {isAr ? suggestedCourse.nameAr : suggestedCourse.nameEn}
                </p>
                <p className="mt-1 text-base font-black text-primary">
                  {formatPrice(suggestedCoursePrice)} {isAr ? 'ج' : 'EGP'}
                </p>
                <button
                  onClick={() => onAddSuggestedCourse(suggestedCourse)}
                  className="action-primary mt-4 inline-flex items-center justify-center gap-2 rounded-2xl px-5 py-3 text-sm font-black"
                >
                  <CheckCircle2 className="h-4 w-4" />
                  {isAr ? 'أضف الكورس المقترح' : 'Add suggested course'}
                </button>
              </div>
            </div>
          </div>
        )}
        
        <div className="hero-panel overflow-hidden rounded-[2rem]">
          <div className="flex items-center gap-3 border-b border-border/80 bg-primary/6 p-5">
            <ReceiptText className="w-5 h-5 text-primary" />
            <h3 className="text-lg md:text-xl font-black title-font text-primary">{isAr ? 'تفاصيل الحساب النهائي' : 'Final Billing Details'}</h3>
          </div>
          
          <div className="space-y-6 p-6 md:p-7">
            <div className="space-y-4 text-sm md:text-base font-bold">
              <div className="flex justify-between text-muted-foreground">
                <span>
                  {isAr ? 'سعر الدورات' : 'Courses Price'} ({selectedCourses.length} × {formatPrice(displayedCoursePrice)})
                </span>
                <span className="text-foreground">{formatPrice(calculations.subtotal)} {isAr ? 'ج' : 'EGP'}</span>
              </div>
              
              {applicableDiscount && (
                <div className="flex justify-between text-success bg-success/5 p-4 rounded-2xl border border-success/20">
                  <span className="flex items-center gap-2">
                    <Tag className="w-5 h-5" />
                    {isAr ? `خصم التجميع (${applicableDiscount.count}+ دورات)` : `Bundle Discount (${applicableDiscount.count}+ courses)`}
                  </span>
                  <span className="font-black">-{formatPrice(applicableDiscount.discount)} {isAr ? 'ج' : 'EGP'}</span>
                </div>
              )}

              {(calculations.referralDiscount ?? 0) > 0 && (
                <div className="flex justify-between text-success bg-success/5 p-4 rounded-2xl border border-success/20">
                  <span className="flex items-center gap-2">
                    <Tag className="w-5 h-5" />
                    {isAr ? 'خصم الإحالة' : 'Referral Discount'}
                  </span>
                  <span className="font-black">-{formatPrice(calculations.referralDiscount ?? 0)} {isAr ? 'ج' : 'EGP'}</span>
                </div>
              )}
              
              <div className="pt-6 border-t-2 border-dashed border-border">
                <div className="flex justify-between items-center">
                  <span className="text-xl md:text-2xl font-black title-font">{isAr ? 'الإجمالي المطلوب' : 'Total Amount'}</span>
                  <div className="text-right">
                    <span className="text-3xl md:text-4xl font-black text-primary">{formatPrice(calculations.total)}</span>
                    <span className="mr-1 text-base md:text-lg font-black text-primary">{isAr ? 'جنيه' : 'EGP'}</span>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="metric-card rounded-[1.6rem] p-5 space-y-4">
              <p className="flex items-center gap-2 text-sm md:text-base font-black">
                <div className="w-2 h-6 bg-primary rounded-full" />
                {isAr ? 'نظام التقسيط المتاح:' : 'Available Installment Plan:'}
              </p>
              <div className="grid grid-cols-2 gap-4">
                <div className="rounded-2xl border border-border bg-card/80 p-4 shadow-sm backdrop-blur-sm">
                  <span className="text-xs font-bold text-muted-foreground block mb-1">
                    {isAr ? 'القسط 1 (الآن)' : '1st Inst. (Now)'}
                  </span>
                  <span className="text-lg md:text-xl font-black text-success">{formatPrice(calculations.firstInstallment)} {isAr ? 'ج' : 'EGP'}</span>
                </div>
                <div className="rounded-2xl border border-border bg-card/80 p-4 shadow-sm backdrop-blur-sm">
                  <span className="text-xs font-bold text-muted-foreground block mb-1">
                    {isAr ? 'القسط 2 (لاحقاً)' : '2nd Inst. (Later)'}
                  </span>
                  <span className="text-lg md:text-xl font-black text-primary/70">{formatPrice(calculations.secondInstallment)} {isAr ? 'ج' : 'EGP'}</span>
                </div>
              </div>
            </div>

            <div className="metric-card rounded-[1.6rem] p-5 space-y-4">
              <p className="text-sm md:text-base font-black text-primary">
                {isAr ? 'لو محتاج مساعدة قبل الإكمال' : 'Need help before completion?'}
              </p>
              <p className="text-sm font-bold leading-7 text-muted-foreground">
                {isAr
                  ? 'تواصل مع واتساب الدعم إذا كنت محتارًا بين باقة وكورس، أو تريد تأكيدًا سريعًا قبل المتابعة.'
                  : 'Contact support on WhatsApp if you need help choosing between a course and a bundle before continuing.'}
              </p>
              <a
                href={supportWhatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="action-secondary inline-flex items-center justify-center gap-2 rounded-2xl px-5 py-3 text-sm font-black text-primary hover:border-primary/35 hover:bg-primary/5"
              >
                <MessageCircle className="h-4 w-4" />
                {isAr ? 'مراسلة واتساب الدعم' : 'Message support on WhatsApp'}
              </a>
            </div>
          </div>
        </div>
        
        <button
          onClick={onContinue}
          className="action-primary mt-10 flex w-full items-center justify-center gap-3 rounded-[1.6rem] py-5 text-lg md:text-xl font-black"
        >
          {isAr ? 'متابعة لتأكيد البيانات' : 'Continue to Confirmation'}
          <ArrowLeft className="w-6 h-6 transition-transform group-hover:-translate-x-2 rtl:rotate-180" />
        </button>
      </div>
    </section>
  );
}
