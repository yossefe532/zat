'use client';

import { ArrowRight, ArrowLeft, ShoppingCart, Tag, ReceiptText } from 'lucide-react';
import { Course } from '@/lib/types';
import { formatPrice } from '@/lib/utils';
import { DISCOUNT_RULES, ADMIN_FEES } from '@/lib/data';
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
  const coursePrice = grantData ? 650 : 3000;
  
  const applicableDiscount = DISCOUNT_RULES.find(
    rule => selectedCourses.length >= rule.count
  );

  return (
    <section className="min-h-screen px-4 py-20 bg-background relative overflow-hidden">
      {/* Legacy background effect */}
      <div className="fixed inset-0 pointer-events-none -z-10 opacity-10 bg-[url('https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=1920&q=90')] bg-cover bg-center" />

      <div className="container mx-auto max-w-2xl">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-2 text-primary font-black hover:scale-105 transition-transform mb-12"
        >
          <ArrowRight className="w-5 h-5 rtl:rotate-180" />
          {isAr ? 'العودة لاختيار الكورسات' : 'Back to Courses'}
        </button>
        
        <div className="text-center mb-12 space-y-4">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-primary/5 border-4 border-primary/10 mb-4">
            <ShoppingCart className="w-10 h-10 text-primary" />
          </div>
          <h2 className="text-4xl md:text-5xl font-black title-font text-primary">
            {isAr ? 'سلة المشتريات الذكية' : 'Smart Shopping Cart'}
          </h2>
          <p className="text-xl text-muted-foreground font-bold">
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
              className="flex items-center justify-between p-6 rounded-3xl bg-card border-2 border-border shadow-lg hover:border-primary/50 transition-all group"
            >
              <div className="flex items-center gap-5">
                <span className="text-4xl group-hover:scale-110 transition-transform">{course.icon}</span>
                <div>
                  <p className="text-xl font-black title-font">{isAr ? course.nameAr : course.nameEn}</p>
                  <p className="text-sm font-bold text-muted-foreground">{isAr ? 'دورة تدريبية معتمدة' : 'Accredited Course'}</p>
                </div>
              </div>
              <div className="text-left">
                <p className="text-2xl font-black text-primary">{formatPrice(coursePrice)}</p>
                <p className="text-xs font-black text-muted-foreground uppercase">{isAr ? 'جنيه' : 'EGP'}</p>
              </div>
            </motion.div>
          ))}
        </div>
        
        <div className="rounded-[2.5rem] border-2 border-border bg-card shadow-2xl overflow-hidden">
          <div className="bg-primary/5 p-6 border-b-2 border-border flex items-center gap-3">
            <ReceiptText className="w-6 h-6 text-primary" />
            <h3 className="font-black text-xl title-font text-primary">{isAr ? 'تفاصيل الحساب النهائي' : 'Final Billing Details'}</h3>
          </div>
          
          <div className="p-8 space-y-6">
            <div className="space-y-4 font-bold text-base">
              <div className="flex justify-between text-muted-foreground">
                <span>
                  {isAr ? 'سعر الدورات' : 'Courses Price'} ({selectedCourses.length} × {formatPrice(coursePrice)})
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
              
              <div className="flex justify-between text-muted-foreground">
                <span className="flex items-center gap-2">
                  {isAr ? 'رسوم التسجيل الإدارية' : 'Admin Registration Fees'}
                  <span className="text-[10px] bg-muted px-2 py-0.5 rounded-full">{isAr ? 'تدفع لمرة واحدة' : 'One-time'}</span>
                </span>
                <span className="text-foreground">{formatPrice(ADMIN_FEES)} {isAr ? 'ج' : 'EGP'}</span>
              </div>
              
              <div className="pt-6 border-t-2 border-dashed border-border">
                <div className="flex justify-between items-center">
                  <span className="text-2xl font-black title-font">{isAr ? 'الإجمالي المطلوب' : 'Total Amount'}</span>
                  <div className="text-right">
                    <span className="text-4xl font-black text-primary">{formatPrice(calculations.total)}</span>
                    <span className="text-lg font-black text-primary mr-1">{isAr ? 'جنيه' : 'EGP'}</span>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="bg-muted/50 rounded-3xl p-6 space-y-4 border border-border/50">
              <p className="text-base font-black flex items-center gap-2">
                <div className="w-2 h-6 bg-primary rounded-full" />
                {isAr ? 'نظام التقسيط المتاح:' : 'Available Installment Plan:'}
              </p>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white p-4 rounded-2xl border border-border shadow-sm">
                  <span className="text-xs font-bold text-muted-foreground block mb-1">
                    {isAr ? 'القسط 1 (الآن)' : '1st Inst. (Now)'}
                  </span>
                  <span className="text-xl font-black text-success">{formatPrice(calculations.firstInstallment)} {isAr ? 'ج' : 'EGP'}</span>
                </div>
                <div className="bg-white p-4 rounded-2xl border border-border shadow-sm">
                  <span className="text-xs font-bold text-muted-foreground block mb-1">
                    {isAr ? 'القسط 2 (لاحقاً)' : '2nd Inst. (Later)'}
                  </span>
                  <span className="text-xl font-black text-primary/60">{formatPrice(calculations.secondInstallment)} {isAr ? 'ج' : 'EGP'}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <button
          onClick={onContinue}
          className="w-full mt-12 py-6 rounded-2xl bg-primary text-primary-foreground font-black text-2xl hover:bg-primary/90 transition-all shadow-2xl shadow-primary/40 flex items-center justify-center gap-3 hover:scale-[1.02]"
        >
          {isAr ? 'متابعة لتأكيد البيانات' : 'Continue to Confirmation'}
          <ArrowLeft className="w-8 h-8 transition-transform group-hover:-translate-x-2 rtl:rotate-180" />
        </button>
      </div>
    </section>
  );
}
