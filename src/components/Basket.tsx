'use client';

import { ArrowRight, ArrowLeft, ShoppingCart, Tag, ReceiptText } from 'lucide-react';
import { Course } from '@/lib/types';
import { formatPrice } from '@/lib/utils';
import { DISCOUNT_RULES } from '@/lib/data';
import { motion } from 'framer-motion';

interface BasketProps {
  lang: 'ar' | 'en';
  selectedCourses: Course[];
  grantData: { nameAr: string; nameEn: string } | null;
  calculations: {
    subtotal: number;
    discount: number;
    total: number;
    firstInstallment: number;
    secondInstallment: number;
  };
  onBack: () => void;
  onContinue: () => void;
}

export function Basket({
  lang,
  selectedCourses,
  grantData,
  calculations,
  onBack,
  onContinue
}: BasketProps) {
  const isAr = lang === 'ar';
  const displayedCoursePrice = selectedCourses.length === 0
    ? 0
    : (grantData ? selectedCourses[0].grantPrice : selectedCourses[0].originalPrice);
  
  const applicableDiscount = DISCOUNT_RULES.find(
    rule => selectedCourses.length >= rule.count
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
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
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
