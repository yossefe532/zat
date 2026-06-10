'use client';

import { ArrowRight, ArrowLeft, Check, Layers3, ShoppingCart, Sparkles, Tag } from 'lucide-react';
import { DISCOUNT_RULES } from '@/lib/data';
import { Course, LearningBundle } from '@/lib/types';
import { motion } from 'framer-motion';
import type { QuizResult } from '@/components/PathQuiz';

interface CourseSelectionProps {
  lang: 'ar' | 'en';
  courses: Course[];
  selectedCourses: Course[];
  onToggle: (course: Course) => void;
  onBack: () => void;
  onContinue: () => void;
  grantData: { nameAr: string; nameEn: string } | null;
  quizResult?: QuizResult | null;
  bundles: LearningBundle[];
  onApplyBundle: (bundle: LearningBundle) => void;
  calculations: {
    subtotal: number;
    discount: number;
    total: number;
    firstInstallment: number;
    secondInstallment: number;
  };
}

export function CourseSelection({
  lang,
  courses,
  selectedCourses,
  onToggle,
  onBack,
  onContinue,
  grantData,
  quizResult,
  bundles,
  onApplyBundle,
  calculations,
}: CourseSelectionProps) {
  const isAr = lang === 'ar';
  const selectedCourseIds = selectedCourses.map((course) => course.id);

  const getBundlePricing = (bundle: LearningBundle) => {
    const bundleCourses = courses.filter((course) => bundle.courseIds.includes(course.id));
    const subtotal = bundleCourses.reduce((sum, course) => {
      return sum + (grantData ? course.grantPrice : course.originalPrice);
    }, 0);

    let countDiscount = 0;
    for (const rule of DISCOUNT_RULES) {
      if (bundle.courseIds.length >= rule.count) {
        countDiscount = rule.discount;
      }
    }

    const effectiveDiscount = Math.max(countDiscount, bundle.extraDiscount);
    const total = Math.max(subtotal - effectiveDiscount, 0);

    return {
      bundleCourses,
      subtotal,
      total,
      effectiveDiscount,
      savings: subtotal - total,
      isActive:
        bundle.courseIds.length === selectedCourseIds.length &&
        bundle.courseIds.every((courseId) => selectedCourseIds.includes(courseId)),
      isRecommended:
        !!quizResult && bundle.courseIds.some((courseId) => quizResult.recommendedCourseIds.includes(courseId)),
    };
  };

  return (
    <section className="min-h-screen px-4 py-20 bg-background relative overflow-hidden">
      <div className="container mx-auto max-w-6xl relative z-10">
        <button
          onClick={onBack}
          className="mb-10 inline-flex items-center gap-2 text-sm font-black text-primary transition-transform hover:scale-105"
        >
          <ArrowRight className="w-5 h-5 rtl:rotate-180" />
          {isAr ? 'العودة للرئيسية' : 'Back to Home'}
        </button>
        
        <div className="text-center mb-16 space-y-6">
          <h2 className="section-title font-black title-font text-primary">
            {isAr ? 'اختر دوراتك التعليمية' : 'Choose Your Courses'}
          </h2>
          <p className="section-subtitle max-w-2xl mx-auto font-bold">
            {isAr 
              ? 'اختر الدورة أو الدورات التي تناسبك. يمكنك اختيار أكثر من دورة والاستفادة من خصومات التجميع.'
              : 'Choose the course or courses that suit you. You can select multiple courses and benefit from package discounts.'}
          </p>
          
          {grantData && (
            <div className="inline-flex items-center gap-3 rounded-full border border-success/20 bg-success/10 px-5 py-3 text-sm font-black text-success md:text-base">
              <Check className="w-5 h-5" />
              {isAr ? `تفعيل منحة ${grantData.nameAr} بنجاح` : `${grantData.nameEn} Grant activated successfully`}
            </div>
          )}
        </div>

        {quizResult && (
          <div className="hero-panel mb-10 rounded-[1.75rem] p-5 text-right md:p-6">
            <div className="flex flex-col gap-5 md:flex-row md:items-start md:justify-between">
              <div className="space-y-3 md:max-w-2xl">
                <div className="inline-flex items-center gap-2 rounded-full border border-primary/15 bg-card/70 px-4 py-2 text-xs font-black text-primary shadow-sm backdrop-blur-md md:text-sm">
                  <Sparkles className="h-4 w-4" />
                  {isAr ? 'نتيجة اختبار تحديد المسار' : 'Your path quiz recommendation'}
                </div>
                <h3 className="text-xl font-black text-primary md:text-2xl">
                  {isAr ? quizResult.titleAr : quizResult.titleEn}
                </h3>
                <p className="text-sm font-bold leading-7 text-muted-foreground md:text-base">
                  {isAr ? quizResult.subtitleAr : quizResult.subtitleEn}
                </p>
              </div>
              <div className="grid gap-2 md:min-w-[20rem]">
                {(isAr ? quizResult.reasonsAr : quizResult.reasonsEn).map((reason) => (
                  <div
                    key={reason}
                    className="flex items-start gap-3 rounded-2xl border border-border/70 bg-card/70 px-4 py-3 text-sm font-black text-foreground backdrop-blur-sm"
                  >
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-success" />
                    <span>{reason}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        <div className="mb-10 space-y-6">
          <div className="text-center space-y-3">
            <div className="inline-flex items-center gap-2 rounded-full border border-primary/15 bg-card/70 px-4 py-2 text-xs font-black text-primary shadow-sm backdrop-blur-md md:text-sm">
              <Layers3 className="h-4 w-4" />
              {isAr ? 'المسارات الجاهزة والباقات الذكية' : 'Ready paths and smart bundles'}
            </div>
            <h3 className="text-2xl font-black text-primary md:text-3xl">
              {isAr ? 'اختصر القرار واختر باقة جاهزة' : 'Make decisions faster with a ready bundle'}
            </h3>
            <p className="section-subtitle mx-auto max-w-3xl font-bold">
              {isAr
                ? 'يمكنك اختيار كورساتك يدويًا كما تريد، أو استخدام باقة جاهزة تمنحك مسارًا أوضح وتوفيرًا أفضل.'
                : 'You can still choose manually, or activate a ready bundle that gives you a clearer path and better value.'}
            </p>
          </div>

          <div className="grid gap-5 xl:grid-cols-2">
            {bundles.map((bundle, index) => {
              const bundlePricing = getBundlePricing(bundle);

              return (
                <motion.div
                  key={bundle.id}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.06 * index, duration: 0.35 }}
                  className={`hero-panel rounded-[1.75rem] p-5 text-right md:p-6 ${
                    bundlePricing.isActive ? 'border-primary bg-primary/6 shadow-xl' : ''
                  }`}
                >
                  <div className="flex flex-col gap-5">
                    <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                      <div className="space-y-2">
                        <div className="inline-flex items-center gap-2 rounded-full border border-primary/15 bg-card/70 px-3 py-1.5 text-[11px] font-black text-primary shadow-sm backdrop-blur-md md:text-xs">
                          {bundlePricing.isRecommended
                            ? (isAr ? 'موصى بها حسب الاختبار' : 'Recommended by your quiz')
                            : (isAr ? bundle.badgeAr : bundle.badgeEn)}
                        </div>
                        <h4 className="text-xl font-black text-foreground md:text-2xl">
                          {isAr ? bundle.nameAr : bundle.nameEn}
                        </h4>
                        <p className="text-sm font-bold leading-7 text-muted-foreground md:text-base">
                          {isAr ? bundle.descriptionAr : bundle.descriptionEn}
                        </p>
                      </div>
                      <div className="rounded-[1.4rem] border border-primary/15 bg-primary/8 px-4 py-3 text-center md:min-w-[11rem]">
                        <p className="text-[11px] font-black uppercase tracking-wide text-muted-foreground">
                          {isAr ? 'سعر الباقة' : 'Bundle Price'}
                        </p>
                        <p className="text-2xl font-black text-primary md:text-3xl">
                          {bundlePricing.total} <span className="text-sm md:text-base">{isAr ? 'ج' : 'EGP'}</span>
                        </p>
                        <p className="text-xs font-black text-success">
                          {isAr ? `توفر ${bundlePricing.savings} ج` : `Save ${bundlePricing.savings} EGP`}
                        </p>
                      </div>
                    </div>

                    <div className="grid gap-3 md:grid-cols-2">
                      <div className="metric-card rounded-[1.35rem] p-4">
                        <p className="text-[11px] font-black uppercase tracking-wide text-muted-foreground">
                          {isAr ? 'شراء الكورسات منفصلة' : 'Buying courses separately'}
                        </p>
                        <p className="mt-2 text-xl font-black text-foreground md:text-2xl">
                          {bundlePricing.subtotal} <span className="text-sm">{isAr ? 'ج' : 'EGP'}</span>
                        </p>
                        <p className="mt-1 text-xs font-bold text-muted-foreground">
                          {isAr ? 'بدون تفعيل المسار الجاهز' : 'Without activating the ready path'}
                        </p>
                      </div>
                      <div className="metric-card rounded-[1.35rem] p-4">
                        <p className="text-[11px] font-black uppercase tracking-wide text-muted-foreground">
                          {isAr ? 'سعر المسار بعد الخصم' : 'Path price after discount'}
                        </p>
                        <p className="mt-2 text-xl font-black text-primary md:text-2xl">
                          {bundlePricing.total} <span className="text-sm">{isAr ? 'ج' : 'EGP'}</span>
                        </p>
                        <p className="mt-1 text-xs font-bold text-success">
                          {isAr ? `الخصم المطبق ${bundlePricing.effectiveDiscount} ج` : `Discount applied ${bundlePricing.effectiveDiscount} EGP`}
                        </p>
                      </div>
                    </div>

                    <div className="grid gap-2">
                      {bundlePricing.bundleCourses.map((course) => (
                        <div
                          key={`${bundle.id}-${course.id}`}
                          className="flex items-center justify-between rounded-2xl border border-border/70 bg-card/70 px-4 py-3 text-sm font-black text-foreground backdrop-blur-sm"
                        >
                          <span className="inline-flex items-center gap-3">
                            <span className="text-2xl">{course.icon}</span>
                            <span>{isAr ? course.nameAr : course.nameEn}</span>
                          </span>
                          <span className="text-primary">
                            {(grantData ? course.grantPrice : course.originalPrice)} {isAr ? 'ج' : 'EGP'}
                          </span>
                        </div>
                      ))}
                    </div>

                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                      <p className="text-sm font-black text-muted-foreground">
                        {bundlePricing.isActive
                          ? (isAr ? 'هذه الباقة مفعلة حاليًا داخل اختيارك.' : 'This bundle is currently active in your selection.')
                          : (isAr ? 'يمكنك تفعيل هذه الباقة مباشرة وإكمال التسجيل بعدها.' : 'You can activate this bundle instantly and continue.')}
                      </p>
                      <button
                        onClick={() => onApplyBundle(bundle)}
                        className={`inline-flex items-center justify-center gap-2 rounded-3xl px-6 py-3 text-sm font-black transition-all ${
                          bundlePricing.isActive
                            ? 'action-secondary text-primary'
                            : 'action-primary'
                        }`}
                      >
                        {bundlePricing.isActive
                          ? (isAr ? 'الباقة مفعلة' : 'Bundle Active')
                          : (isAr ? 'فعّل هذا المسار' : 'Activate This Path')}
                        <ArrowLeft className="h-4 w-4 rtl:rotate-180" />
                      </button>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
        
        <div className="grid grid-cols-1 xl:grid-cols-[minmax(0,1fr)_360px] gap-8 items-start">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {courses.map((course, index) => {
            const isSelected = selectedCourses.find(c => c.id === course.id);
            const details = isAr ? course.detailsAr : course.detailsEn;
            const displayPrice = grantData ? course.grantPrice : course.originalPrice;

            return (
              <motion.div
                key={course.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                onClick={() => onToggle(course)}
                className={`
                  relative cursor-pointer rounded-[1.9rem] p-6 transition-all duration-300 group overflow-hidden glass-panel
                  ${isSelected 
                    ? 'border-primary bg-primary/6 shadow-2xl scale-[1.01]' 
                    : 'hover:border-primary/50 hover:shadow-xl hover:-translate-y-2'
                  }
                `}
              >
                {/* Legacy red bar on hover */}
                <div className={`absolute top-0 right-0 w-1 h-0 bg-primary transition-all duration-300 group-hover:h-full ${isSelected ? 'h-full' : ''}`} />

                <div className="flex justify-between items-start mb-6">
                  <span className="text-4xl md:text-5xl">{course.icon}</span>
                  {isSelected && (
                    <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center shadow-lg shadow-primary/30">
                      <Check className="w-5 h-5 text-white" />
                    </div>
                  )}
                </div>
                
                <div className="space-y-4">
                  <div>
                    <h3 className="text-xl md:text-2xl font-black title-font">
                      {isAr ? course.nameAr : course.nameEn}
                    </h3>
                  </div>
                  
                  <p className="min-h-[50px] text-sm font-bold leading-snug text-muted-foreground md:text-base">
                    {isAr ? course.benefitAr : course.benefitEn}
                  </p>

                  <div className="space-y-2 pt-4 border-t border-dashed border-border/50">
                    {details?.slice(0, 3).map((detail, i) => (
                      <div key={i} className="flex items-center gap-2 text-xs text-muted-foreground font-bold md:text-sm">
                        <div className="w-2 h-2 rounded-full bg-primary" />
                        {detail}
                      </div>
                    ))}
                  </div>
                  
                  <div className="pt-6">
                    <div className="text-sm text-muted-foreground line-through font-bold">
                      {course.originalPrice} {isAr ? 'ج' : 'EGP'}
                    </div>
                    <div className="flex items-baseline gap-2">
                      <span className="text-2xl md:text-3xl font-black text-primary">{displayPrice}</span>
                      <span className="text-sm md:text-base font-black text-primary">{isAr ? 'ج' : 'EGP'}</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
          </div>

          <div className="xl:sticky xl:top-24">
            <div className="hero-panel rounded-[1.9rem] p-5 md:p-6 space-y-6">
              <div className="flex items-center gap-3 text-primary">
                <ShoppingCart className="w-5 h-5 md:w-6 md:h-6" />
                <h3 className="text-xl md:text-2xl font-black title-font">
                  {isAr ? 'سلة الكورسات' : 'Courses Cart'}
                </h3>
              </div>

              {selectedCourses.length === 0 ? (
                <div className="rounded-2xl bg-muted/40 p-5 text-center text-muted-foreground font-black">
                  {isAr ? 'ابدأ باختيار كورس ليظهر داخل السلة تلقائيًا.' : 'Select a course and it will appear here automatically.'}
                </div>
              ) : (
                <div className="space-y-3">
                  {selectedCourses.map((course) => (
                    <div key={course.id} className="flex items-center justify-between rounded-2xl border border-border/70 bg-background/75 px-4 py-3 backdrop-blur-sm">
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">{course.icon}</span>
                        <div>
                          <p className="font-black text-foreground">{isAr ? course.nameAr : course.nameEn}</p>
                          <p className="text-xs font-bold text-muted-foreground">
                            {(grantData ? course.grantPrice : course.originalPrice)} {isAr ? 'ج' : 'EGP'}
                          </p>
                        </div>
                      </div>
                      <Check className="w-5 h-5 text-success" />
                    </div>
                  ))}
                </div>
              )}

              <div className="space-y-3 rounded-2xl bg-primary/5 p-5">
                <div className="flex justify-between text-xs md:text-sm font-black text-muted-foreground">
                  <span>{isAr ? 'الإجمالي قبل الخصم' : 'Subtotal before discount'}</span>
                  <span>{calculations.subtotal} {isAr ? 'ج' : 'EGP'}</span>
                </div>
                <div className="flex justify-between text-xs md:text-sm font-black text-success">
                  <span className="inline-flex items-center gap-2">
                    <Tag className="w-4 h-4" />
                    {isAr ? 'قيمة الخصم' : 'Discount'}
                  </span>
                  <span>- {calculations.discount} {isAr ? 'ج' : 'EGP'}</span>
                </div>
                <div className="border-t border-dashed border-primary/20 pt-3 flex justify-between text-base md:text-lg font-black">
                  <span>{isAr ? 'السعر النهائي' : 'Final total'}</span>
                  <span className="text-primary">{calculations.total} {isAr ? 'ج' : 'EGP'}</span>
                </div>
                <div className="grid grid-cols-2 gap-3 pt-2">
                  <div className="rounded-2xl border border-border bg-card px-4 py-3">
                    <p className="text-[11px] font-black text-muted-foreground">{isAr ? 'القسط الأول' : '1st installment'}</p>
                    <p className="text-base md:text-lg font-black text-success">{calculations.firstInstallment} {isAr ? 'ج' : 'EGP'}</p>
                  </div>
                  <div className="rounded-2xl border border-border bg-card px-4 py-3">
                    <p className="text-[11px] font-black text-muted-foreground">{isAr ? 'القسط الثاني' : '2nd installment'}</p>
                    <p className="text-base md:text-lg font-black text-primary">{calculations.secondInstallment} {isAr ? 'ج' : 'EGP'}</p>
                  </div>
                </div>
              </div>

              <button
                onClick={onContinue}
                disabled={selectedCourses.length === 0}
                className="action-primary w-full inline-flex items-center justify-center gap-3 rounded-2xl px-8 py-4 text-base md:text-lg font-black disabled:cursor-not-allowed disabled:opacity-40"
              >
                {isAr ? 'متابعة إلى السلة الكاملة' : 'Continue to full basket'}
                <ArrowLeft className="w-5 h-5 rtl:rotate-180" />
              </button>
            </div>
          </div>
        </div>
        
        <div className="glass-panel mt-16 flex flex-col items-center justify-between gap-6 rounded-[1.9rem] p-6 md:flex-row md:p-8">
          <div className="text-center md:text-right space-y-1">
            <p className="text-lg md:text-xl font-bold text-muted-foreground">
              {isAr ? 'الدورات المختارة' : 'Selected Courses'}: 
              <span className="font-black text-primary text-2xl mx-2">{selectedCourses.length}</span>
            </p>
            {selectedCourses.length > 0 && (
              <p className="text-sm md:text-base font-bold text-muted-foreground">
                {isAr ? 'إجمالي السعر' : 'Total Price'}: 
                <span className="text-foreground font-black text-xl mx-2">
                  {calculations.total} {isAr ? 'جنيه' : 'EGP'}
                </span>
              </p>
            )}
          </div>
          
          <button
            onClick={onContinue}
            disabled={selectedCourses.length === 0}
            className="action-primary w-full md:w-auto inline-flex items-center justify-center gap-3 rounded-2xl px-10 py-4 text-base md:text-lg font-black disabled:opacity-30 disabled:cursor-not-allowed"
          >
            {isAr ? 'متابعة للتسجيل' : 'Continue to Register'}
            <ArrowLeft className="w-6 h-6 transition-transform group-hover:-translate-x-2 rtl:rotate-180" />
          </button>
        </div>
      </div>
    </section>
  );
}
