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
