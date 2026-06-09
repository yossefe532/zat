'use client';

import { ArrowRight, ArrowLeft, Check, ShoppingCart, Tag } from 'lucide-react';
import { Course } from '@/lib/types';
import { motion } from 'framer-motion';

interface CourseSelectionProps {
  lang: 'ar' | 'en';
  courses: Course[];
  selectedCourses: Course[];
  onToggle: (course: Course) => void;
  onBack: () => void;
  onContinue: () => void;
  grantData: { nameAr: string; nameEn: string } | null;
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
  calculations,
}: CourseSelectionProps) {
  const isAr = lang === 'ar';
  const price = grantData ? 650 : 3000;
  const adminFees = grantData ? 25 : 0;
  const displayPrice = price + adminFees;

  return (
    <section className="min-h-screen px-4 py-20 bg-background relative overflow-hidden">
      <div className="container mx-auto max-w-6xl relative z-10">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-2 text-primary font-black hover:scale-105 transition-transform mb-12"
        >
          <ArrowRight className="w-5 h-5 rtl:rotate-180" />
          {isAr ? 'العودة للرئيسية' : 'Back to Home'}
        </button>
        
        <div className="text-center mb-16 space-y-6">
          <h2 className="text-4xl md:text-5xl font-black title-font text-primary">
            {isAr ? 'اختر دوراتك التعليمية' : 'Choose Your Courses'}
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            {isAr 
              ? 'اختر الدورة أو الدورات التي تناسبك. يمكنك اختيار أكثر من دورة والاستفادة من خصومات التجميع.'
              : 'Choose the course or courses that suit you. You can select multiple courses and benefit from package discounts.'}
          </p>
          
          {grantData && (
            <div className="inline-flex items-center gap-3 px-6 py-3 rounded-full bg-success/10 text-success text-base font-black border border-success/20 animate-pulse">
              <Check className="w-6 h-6" />
              {isAr ? `تفعيل منحة ${grantData.nameAr} بنجاح` : `${grantData.nameEn} Grant activated successfully`}
            </div>
          )}
        </div>
        
        <div className="grid grid-cols-1 xl:grid-cols-[minmax(0,1fr)_360px] gap-8 items-start">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {courses.map((course, index) => {
            const isSelected = selectedCourses.find(c => c.id === course.id);
            const details = isAr ? course.detailsAr : course.detailsEn;

            return (
              <motion.div
                key={course.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                onClick={() => onToggle(course)}
                className={`
                  relative cursor-pointer rounded-3xl border-2 p-8 transition-all duration-300 group overflow-hidden
                  ${isSelected 
                    ? 'border-primary bg-primary/5 shadow-2xl scale-[1.02]' 
                    : 'border-border bg-card hover:border-primary/50 hover:shadow-xl hover:-translate-y-2'
                  }
                `}
              >
                {/* Legacy red bar on hover */}
                <div className={`absolute top-0 right-0 w-1 h-0 bg-primary transition-all duration-300 group-hover:h-full ${isSelected ? 'h-full' : ''}`} />

                <div className="flex justify-between items-start mb-6">
                  <span className="text-5xl">{course.icon}</span>
                  {isSelected && (
                    <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center shadow-lg shadow-primary/30">
                      <Check className="w-5 h-5 text-white" />
                    </div>
                  )}
                </div>
                
                <div className="space-y-4">
                  <div>
                    <h3 className="text-2xl font-black title-font">
                      {isAr ? course.nameAr : course.nameEn}
                    </h3>
                  </div>
                  
                  <p className="text-base text-muted-foreground font-bold leading-snug min-h-[50px]">
                    {isAr ? course.benefitAr : course.benefitEn}
                  </p>

                  <div className="space-y-2 pt-4 border-t border-dashed border-border/50">
                    {details?.slice(0, 3).map((detail, i) => (
                      <div key={i} className="flex items-center gap-2 text-sm text-muted-foreground font-bold">
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
                      <span className="text-3xl font-black text-primary">{displayPrice}</span>
                      <span className="text-base font-black text-primary">{isAr ? 'ج' : 'EGP'}</span>
                    </div>
                    {grantData && (
                      <div className="text-[10px] text-muted-foreground mt-1">
                        {isAr ? `(شاملة ${adminFees} ج رسوم تسجيل)` : `(Includes ${adminFees} EGP admin fees)`}
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            );
          })}
          </div>

          <div className="xl:sticky xl:top-24">
            <div className="rounded-[2rem] border-2 border-border bg-card p-6 shadow-2xl space-y-6">
              <div className="flex items-center gap-3 text-primary">
                <ShoppingCart className="w-6 h-6" />
                <h3 className="text-2xl font-black title-font">
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
                    <div key={course.id} className="flex items-center justify-between rounded-2xl border border-border/70 bg-background px-4 py-3">
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">{course.icon}</span>
                        <div>
                          <p className="font-black text-foreground">{isAr ? course.nameAr : course.nameEn}</p>
                          <p className="text-xs font-bold text-muted-foreground">
                            {displayPrice} {isAr ? 'ج' : 'EGP'}
                          </p>
                        </div>
                      </div>
                      <Check className="w-5 h-5 text-success" />
                    </div>
                  ))}
                </div>
              )}

              <div className="space-y-3 rounded-2xl bg-primary/5 p-5">
                <div className="flex justify-between text-sm font-black text-muted-foreground">
                  <span>{isAr ? 'الإجمالي قبل الخصم' : 'Subtotal before discount'}</span>
                  <span>{calculations.subtotal} {isAr ? 'ج' : 'EGP'}</span>
                </div>
                <div className="flex justify-between text-sm font-black text-success">
                  <span className="inline-flex items-center gap-2">
                    <Tag className="w-4 h-4" />
                    {isAr ? 'قيمة الخصم' : 'Discount'}
                  </span>
                  <span>- {calculations.discount} {isAr ? 'ج' : 'EGP'}</span>
                </div>
                <div className="border-t border-dashed border-primary/20 pt-3 flex justify-between text-lg font-black">
                  <span>{isAr ? 'السعر النهائي' : 'Final total'}</span>
                  <span className="text-primary">{calculations.total} {isAr ? 'ج' : 'EGP'}</span>
                </div>
                <div className="grid grid-cols-2 gap-3 pt-2">
                  <div className="rounded-2xl border border-border bg-card px-4 py-3">
                    <p className="text-xs font-black text-muted-foreground">{isAr ? 'القسط الأول' : '1st installment'}</p>
                    <p className="text-lg font-black text-success">{calculations.firstInstallment} {isAr ? 'ج' : 'EGP'}</p>
                  </div>
                  <div className="rounded-2xl border border-border bg-card px-4 py-3">
                    <p className="text-xs font-black text-muted-foreground">{isAr ? 'القسط الثاني' : '2nd installment'}</p>
                    <p className="text-lg font-black text-primary">{calculations.secondInstallment} {isAr ? 'ج' : 'EGP'}</p>
                  </div>
                </div>
              </div>

              <button
                onClick={onContinue}
                disabled={selectedCourses.length === 0}
                className="w-full inline-flex items-center justify-center gap-3 rounded-2xl bg-primary px-8 py-4 text-lg font-black text-primary-foreground shadow-xl shadow-primary/30 transition-all hover:scale-[1.02] disabled:cursor-not-allowed disabled:opacity-40"
              >
                {isAr ? 'متابعة إلى السلة الكاملة' : 'Continue to full basket'}
                <ArrowLeft className="w-5 h-5 rtl:rotate-180" />
              </button>
            </div>
          </div>
        </div>
        
        <div className="mt-20 flex flex-col md:flex-row items-center justify-between gap-8 p-8 rounded-3xl bg-card border border-border shadow-xl">
          <div className="text-center md:text-right space-y-1">
            <p className="text-xl font-bold text-muted-foreground">
              {isAr ? 'الدورات المختارة' : 'Selected Courses'}: 
              <span className="font-black text-primary text-2xl mx-2">{selectedCourses.length}</span>
            </p>
            {selectedCourses.length > 0 && (
              <p className="text-base font-bold text-muted-foreground">
                {isAr ? 'إجمالي السعر' : 'Total Price'}: 
                <span className="text-foreground font-black text-xl mx-2">
                  {selectedCourses.length * displayPrice} {isAr ? 'جنيه' : 'EGP'}
                </span>
              </p>
            )}
          </div>
          
          <button
            onClick={onContinue}
            disabled={selectedCourses.length === 0}
            className="w-full md:w-auto inline-flex items-center justify-center gap-3 px-12 py-5 rounded-2xl bg-primary text-primary-foreground font-black text-xl hover:bg-primary/90 transition-all shadow-xl shadow-primary/30 disabled:opacity-30 disabled:cursor-not-allowed hover:scale-105"
          >
            {isAr ? 'متابعة للتسجيل' : 'Continue to Register'}
            <ArrowLeft className="w-6 h-6 transition-transform group-hover:-translate-x-2 rtl:rotate-180" />
          </button>
        </div>
      </div>
    </section>
  );
}
