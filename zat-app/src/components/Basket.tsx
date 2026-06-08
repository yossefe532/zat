'use client';

import { ArrowRight, ArrowLeft, ShoppingCart, Trash2, Tag } from 'lucide-react';
import { Course } from '@/lib/types';
import { formatPrice } from '@/lib/utils';
import { DISCOUNT_RULES, ADMIN_FEES } from '@/lib/data';

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
  const isAr = lang === 'en' ? false : true;
  const coursePrice = grantData ? 650 : 3000;
  
  const applicableDiscount = DISCOUNT_RULES.find(
    rule => selectedCourses.length >= rule.count
  );

  return (
    <section className="min-h-[80vh] px-4 py-16">
      <div className="container mx-auto max-w-2xl">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-8"
        >
          <ArrowRight className="w-4 h-4 rtl:rotate-180" />
          {isAr ? 'العودة' : 'Back'}
        </button>
        
        <div className="text-center mb-12 space-y-4">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10">
            <ShoppingCart className="w-8 h-8 text-primary" />
          </div>
          <h2 className="text-3xl font-bold">
            {isAr ? 'سلة المشتريات' : 'Shopping Cart'}
          </h2>
        </div>
        
        <div className="space-y-4 mb-8">
          {selectedCourses.map((course) => (
            <div key={course.id} className="flex items-center justify-between p-4 rounded-xl bg-card border">
              <div className="flex items-center gap-4">
                <span className="text-2xl">{course.icon}</span>
                <div>
                  <p className="font-semibold">{isAr ? course.nameAr : course.nameEn}</p>
                  <p className="text-sm text-muted-foreground">{course.level}</p>
                </div>
              </div>
              <div className="text-left">
                <p className="font-bold text-primary">{formatPrice(coursePrice)}</p>
                <p className="text-xs text-muted-foreground">{isAr ? 'جنيه' : 'EGP'}</p>
              </div>
            </div>
          ))}
        </div>
        
        <div className="rounded-xl border bg-card p-6 space-y-4">
          <h3 className="font-semibold text-lg">{isAr ? 'تفاصيل الأسعار' : 'Price Details'}</h3>
          
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">
                {isAr ? 'سعر الكورسات' : 'Courses Price'} ({selectedCourses.length} × {formatPrice(coursePrice)})
              </span>
              <span>{formatPrice(calculations.subtotal)} {isAr ? 'جنيه' : 'EGP'}</span>
            </div>
            
            {applicableDiscount && (
              <div className="flex justify-between text-success">
                <span className="flex items-center gap-1">
                  <Tag className="w-4 h-4" />
                  {isAr ? 'خصم الدورات المتعددة' : 'Multi-course Discount'} 
                  ({applicableDiscount.count}+ {isAr ? 'دورات' : 'courses'})
                </span>
                <span>-{formatPrice(applicableDiscount.discount)} {isAr ? 'جنيه' : 'EGP'}</span>
              </div>
            )}
            
            <div className="flex justify-between">
              <span className="text-muted-foreground">{isAr ? 'رسوم إدارية' : 'Admin Fees'}</span>
              <span>{formatPrice(ADMIN_FEES)} {isAr ? 'جنيه' : 'EGP'}</span>
            </div>
            
            <div className="border-t pt-2 mt-2">
              <div className="flex justify-between font-bold text-lg">
                <span>{isAr ? 'الإجمالي' : 'Total'}</span>
                <span className="text-primary">{formatPrice(calculations.total)} {isAr ? 'جنيه' : 'EGP'}</span>
              </div>
            </div>
          </div>
          
          <div className="bg-muted rounded-lg p-4 space-y-2">
            <p className="text-sm font-medium">{isAr ? 'خطة الدفع بالتقسيط' : 'Installment Plan'}</p>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">
                {isAr ? 'القسط الأول (يُدفع الآن)' : '1st Installment (Pay Now)'}
              </span>
              <span className="font-semibold">{formatPrice(calculations.firstInstallment)} {isAr ? 'جنيه' : 'EGP'}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">
                {isAr ? 'القسط الثاني (خلال أسبوعين)' : '2nd Installment (Within 2 Weeks)'}
              </span>
              <span className="font-semibold">{formatPrice(calculations.secondInstallment)} {isAr ? 'جنيه' : 'EGP'}</span>
            </div>
          </div>
        </div>
        
        <button
          onClick={onContinue}
          className="w-full mt-8 py-4 rounded-xl bg-primary text-primary-foreground font-semibold hover:bg-primary/90 transition-colors flex items-center justify-center gap-2"
        >
          {isAr ? 'متابعة التسجيل' : 'Continue Registration'}
          <ArrowLeft className="w-5 h-5 rtl:rotate-180" />
        </button>
      </div>
    </section>
  );
}
