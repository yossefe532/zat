'use client';

import { useState } from 'react';
import { ArrowRight, User, Phone, Calendar, AlertCircle } from 'lucide-react';
import { Course } from '@/lib/types';
import { formatPrice } from '@/lib/utils';
import Link from 'next/link';
import type { RegistrationDraft } from '@/lib/types';

interface RegistrationFormProps {
  lang: 'ar' | 'en';
  selectedCourses: Course[];
  grantCode: string;
  grantData: { nameAr: string; nameEn: string; whatsappNumber: string } | null;
  calculations: {
    subtotal: number;
    discount: number;
    total: number;
    firstInstallment: number;
    secondInstallment: number;
  };
  onBack: () => void;
  onSubmit: (data: { fullName: string; phone: string; age: number }) => Promise<void>;
  draftData: RegistrationDraft;
  onDraftChange: (draft: RegistrationDraft) => void;
  supportWhatsappUrl: string;
}

export function RegistrationForm({
  lang,
  selectedCourses,
  calculations,
  onBack,
  onSubmit,
  draftData,
  onDraftChange,
  supportWhatsappUrl,
}: RegistrationFormProps) {
  const isAr = lang === 'ar';
  const instructions = isAr
    ? [
        'سعر الكورس بدون كود خصم هو 3000 جنيه.',
        'عند استخدام كود خصم معتمد يصبح سعر الكورس 650 جنيه، مع 25 جنيه رسوم إدارية.',
        'نظام التقسيط يكون 200 جنيه للقسط الأول، والباقي يُستكمل في القسط الثاني حسب تفاصيل الحجز.',
        'يمكنك اختيار أكثر من كورس بشرط الالتزام بالحضور وتسليم التاسكات المطلوبة.',
        'يمكنك الدراسة بنظام أونلاين أو أوفلاين حسب طبيعة الكورس والمواعيد المتاحة.',
        'يُمنح المتدرب شهادة حضور بعد إتمام التدريب وفق سياسة المبادرة.',
        'في حالة الغياب المتكرر أو عدم الالتزام، يحق للإدارة إلغاء الحجز أو المنحة.'
      ]
    : [
        'Course price without a discount code is 3000 EGP.',
        'With an approved discount code, the course price becomes 650 EGP plus 25 EGP administrative fees.',
        'Installments start with a 200 EGP first payment, and the remaining amount is completed in the second installment based on your booking details.',
        'You may select more than one course if you can commit to attendance and required tasks.',
        'You can study online or offline depending on the course format and available schedule.',
        'Trainees receive an attendance certificate after completing the training according to the initiative policy.',
        'Repeated absence or lack of commitment may result in canceling the booking or grant.'
      ];
  const [formData, setFormData] = useState({
    fullName: draftData.fullName,
    phone: draftData.phone,
    age: draftData.age
  });
  const [agreed, setAgreed] = useState(draftData.agreed);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [submitError, setSubmitError] = useState('');

  const updateDraft = (nextFormData: typeof formData, nextAgreed = agreed) => {
    setFormData(nextFormData);
    onDraftChange({
      fullName: nextFormData.fullName,
      phone: nextFormData.phone,
      age: nextFormData.age,
      agreed: nextAgreed,
    });
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.fullName.trim()) {
      newErrors.fullName = isAr ? 'الرجاء إدخال الاسم الكامل' : 'Please enter full name';
    }
    
    if (!formData.phone.trim()) {
      newErrors.phone = isAr ? 'الرجاء إدخال رقم الهاتف' : 'Please enter phone number';
    } else if (!/^01[0-9]{9}$/.test(formData.phone.replace(/\s/g, ''))) {
      newErrors.phone = isAr ? 'رقم الهاتف غير صحيح' : 'Invalid phone number';
    }
    
    if (!formData.age) {
      newErrors.age = isAr ? 'الرجاء إدخال العمر' : 'Please enter age';
    } else {
      const ageNum = parseInt(formData.age);
      if (ageNum < 10 || ageNum > 100) {
        newErrors.age = isAr ? 'العمر يجب أن يكون بين 10 و 100' : 'Age must be between 10 and 100';
      }
    }

    if (!agreed) {
      newErrors.agreed = isAr ? 'يجب الموافقة على التعليمات' : 'You must agree to instructions';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    
    setLoading(true);
    setSubmitError('');
    try {
      await onSubmit({
        fullName: formData.fullName,
        phone: formData.phone,
        age: parseInt(formData.age)
      });
    } catch {
      setSubmitError(isAr ? 'حدث خطأ أثناء حفظ التسجيل، حاول مرة أخرى.' : 'Something went wrong while saving your registration.');
    }
    setLoading(false);
  };

  return (
    <section className="min-h-screen px-4 py-20 bg-background relative overflow-hidden">
      <div className="container mx-auto max-w-3xl relative z-10">
        <button
          onClick={onBack}
          className="mb-10 inline-flex items-center gap-2 text-sm font-black text-primary transition-transform hover:scale-105"
        >
          <ArrowRight className="w-5 h-5 rtl:rotate-180" />
          {isAr ? 'العودة لاختيار الكورسات' : 'Back to Courses'}
        </button>
        
        <div className="text-center mb-12 space-y-4">
          <h2 className="section-title font-black title-font text-primary">
            {isAr ? 'استمارة التسجيل' : 'Registration Form'}
          </h2>
          <p className="section-subtitle max-w-2xl mx-auto font-bold">
            {isAr 
              ? 'أدخل بياناتك بدقة لتأكيد حجز مكانك في المبادرة'
              : 'Enter your details accurately to confirm your spot in the initiative'}
          </p>
        </div>
        
        <div className="hero-panel rounded-[2rem] p-6 md:p-8 space-y-8">
          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-3">
                <label className="flex items-center gap-2 text-base md:text-lg font-black text-foreground">
                  <User className="w-5 h-5 text-primary" />
                  {isAr ? 'الاسم الكامل' : 'Full Name'}
                </label>
                <input
                  type="text"
                  value={formData.fullName}
                  onChange={(e) => {
                    updateDraft({ ...formData, fullName: e.target.value });
                    if (errors.fullName) setErrors({ ...errors, fullName: '' });
                  }}
                  placeholder={isAr ? 'أدخل اسمك الكامل' : 'Enter your full name'}
                  className={`field-shell w-full rounded-2xl px-5 py-3.5 font-bold focus:outline-none focus:ring-4 focus:ring-primary/10 transition-all ${
                    errors.fullName ? 'border-destructive' : 'border-border focus:border-primary'
                  }`}
                />
                {errors.fullName && (
                  <p className="text-destructive text-sm font-bold flex items-center gap-1 animate-pulse">
                    <AlertCircle className="w-4 h-4" />
                    {errors.fullName}
                  </p>
                )}
              </div>
              
              <div className="space-y-3">
                <label className="flex items-center gap-2 text-base md:text-lg font-black text-foreground">
                  <Phone className="w-5 h-5 text-primary" />
                  {isAr ? 'رقم الهاتف' : 'Phone Number'}
                </label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => {
                    updateDraft({ ...formData, phone: e.target.value });
                    if (errors.phone) setErrors({ ...errors, phone: '' });
                  }}
                  placeholder="01xxxxxxxxx"
                  className={`field-shell w-full rounded-2xl px-5 py-3.5 font-bold focus:outline-none focus:ring-4 focus:ring-primary/10 transition-all ${
                    errors.phone ? 'border-destructive' : 'border-border focus:border-primary'
                  }`}
                  dir="ltr"
                />
                {errors.phone && (
                  <p className="text-destructive text-sm font-bold flex items-center gap-1 animate-pulse">
                    <AlertCircle className="w-4 h-4" />
                    {errors.phone}
                  </p>
                )}
              </div>
            </div>
            
            <div className="space-y-3">
              <label className="flex items-center gap-2 text-base md:text-lg font-black text-foreground">
                <Calendar className="w-5 h-5 text-primary" />
                {isAr ? 'العمر' : 'Age'}
              </label>
              <input
                type="number"
                value={formData.age}
                onChange={(e) => {
                  updateDraft({ ...formData, age: e.target.value });
                  if (errors.age) setErrors({ ...errors, age: '' });
                }}
                placeholder={isAr ? 'أدخل عمرك' : 'Enter your age'}
                className={`field-shell w-full md:w-1/3 rounded-2xl px-5 py-3.5 font-bold focus:outline-none focus:ring-4 focus:ring-primary/10 transition-all ${
                  errors.age ? 'border-destructive' : 'border-border focus:border-primary'
                }`}
              />
              {errors.age && (
                <p className="text-destructive text-sm font-bold flex items-center gap-1 animate-pulse">
                  <AlertCircle className="w-4 h-4" />
                  {errors.age}
                </p>
              )}
            </div>

            <div className="metric-card rounded-[1.8rem] p-6 md:p-8">
              <h4 className="mb-4 rounded-2xl bg-primary/6 p-4 text-center text-lg md:text-xl font-black title-font text-primary">
                {isAr ? 'تعليمات مبادرة ذات الرقمية' : 'ZAT Digital Initiative Instructions'}
              </h4>
              <p className="mb-6 text-center text-sm md:text-base font-semibold text-muted-foreground">
                {isAr
                  ? 'يرجى قراءة البنود التالية بعناية قبل تأكيد التسجيل النهائي.'
                  : 'Please read the following points carefully before final confirmation.'}
              </p>
              <ul
                className={`space-y-3 text-sm md:text-base leading-7 text-foreground marker:text-primary ${
                  isAr ? 'list-disc pr-6 text-right font-semibold' : 'list-disc pl-6 text-left font-medium'
                }`}
              >
                {instructions.map((instruction, i) => (
                  <li key={i} className="ps-1">
                    {instruction}
                  </li>
                ))}
              </ul>
              <div className="grid gap-3 pt-6 md:grid-cols-2">
                <Link href="/privacy" className="rounded-2xl border border-border/70 bg-card/70 px-4 py-3 text-center text-sm font-black text-primary transition-colors hover:border-primary/35 hover:bg-primary/5">
                  {isAr ? 'سياسة الخصوصية' : 'Privacy Policy'}
                </Link>
                <Link href="/terms" className="rounded-2xl border border-border/70 bg-card/70 px-4 py-3 text-center text-sm font-black text-primary transition-colors hover:border-primary/35 hover:bg-primary/5">
                  {isAr ? 'شروط الاستخدام' : 'Terms of Use'}
                </Link>
                <Link href="/refund-support" className="rounded-2xl border border-border/70 bg-card/70 px-4 py-3 text-center text-sm font-black text-primary transition-colors hover:border-primary/35 hover:bg-primary/5">
                  {isAr ? 'الاسترجاع والدعم' : 'Refund & Support'}
                </Link>
                <Link href="/payment-security" className="rounded-2xl border border-border/70 bg-card/70 px-4 py-3 text-center text-sm font-black text-primary transition-colors hover:border-primary/35 hover:bg-primary/5">
                  {isAr ? 'الدفع والأمان' : 'Payment & Security'}
                </Link>
              </div>
              <div className="mt-8 pt-6 border-t border-dashed border-border flex items-center gap-4 justify-center">
                <input 
                  type="checkbox" 
                  id="agree-check" 
                  checked={agreed}
                  onChange={(e) => {
                    const nextAgreed = e.target.checked;
                    setAgreed(nextAgreed);
                    onDraftChange({
                      fullName: formData.fullName,
                      phone: formData.phone,
                      age: formData.age,
                      agreed: nextAgreed,
                    });
                  }}
                  className="h-5 w-5 rounded border-2 border-primary text-primary focus:ring-primary"
                />
                <label htmlFor="agree-check" className="cursor-pointer text-sm md:text-base font-black text-foreground">
                  {isAr ? 'أوافق على التعليمات وسياسة الخصوصية وشروط الاستخدام وسياسة الاسترجاع والدعم' : 'I agree to the instructions, privacy policy, terms of use, and refund/support policy'}
                </label>
              </div>
              {errors.agreed && (
                <p className="text-destructive text-sm font-bold text-center mt-2 animate-pulse">{errors.agreed}</p>
              )}
            </div>

            <div className="metric-card rounded-[1.8rem] p-6 space-y-6">
              <h4 className="text-lg md:text-xl font-black title-font text-primary">{isAr ? 'ملخص الدورات والرسوم' : 'Courses & Fees Summary'}</h4>
              <div className="flex flex-wrap gap-3">
                {selectedCourses.map((course) => (
                  <span key={course.id} className="inline-flex items-center gap-2 rounded-xl border border-primary/20 bg-card/80 px-4 py-2 text-sm font-black text-primary shadow-sm backdrop-blur-sm">
                    <span>{course.icon}</span>
                    <span>{isAr ? course.nameAr : course.nameEn}</span>
                  </span>
                ))}
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-6 border-t border-dashed border-primary/20">
                <div className="rounded-2xl border border-border bg-card/80 p-4 shadow-sm backdrop-blur-sm">
                  <span className="text-xs text-muted-foreground font-bold block mb-1">{isAr ? 'الإجمالي النهائي' : 'Final Total'}</span>
                  <span className="text-xl md:text-2xl font-black text-primary">{formatPrice(calculations.total)} {isAr ? 'ج' : 'EGP'}</span>
                </div>
                <div className="rounded-2xl border border-border bg-card/80 p-4 shadow-sm backdrop-blur-sm">
                  <span className="text-xs text-muted-foreground font-bold block mb-1">{isAr ? 'القسط الأول' : '1st Installment'}</span>
                  <span className="text-xl md:text-2xl font-black text-success">{formatPrice(calculations.firstInstallment)} {isAr ? 'ج' : 'EGP'}</span>
                </div>
                <div className="rounded-2xl border border-border bg-card/80 p-4 shadow-sm backdrop-blur-sm">
                  <span className="text-xs text-muted-foreground font-bold block mb-1">{isAr ? 'القسط الثاني' : '2nd Installment'}</span>
                  <span className="text-xl md:text-2xl font-black text-primary/70">{formatPrice(calculations.secondInstallment)} {isAr ? 'ج' : 'EGP'}</span>
                </div>
              </div>
            </div>

            <div className="metric-card rounded-[1.8rem] p-6 space-y-4">
              <h4 className="text-lg md:text-xl font-black title-font text-primary">
                {isAr ? 'الثقة والدعم قبل التأكيد' : 'Trust and support before confirmation'}
              </h4>
              <div className="space-y-3 text-sm md:text-base font-bold text-muted-foreground">
                <p>{isAr ? 'بياناتك الحالية تُستخدم فقط لإتمام التسجيل والتواصل بشأن الحجز.' : 'Your current data is only used to complete registration and coordinate your reservation.'}</p>
                <p>{isAr ? 'يمكنك مراجعة السياسات كاملة من الروابط أعلاه قبل الإرسال النهائي.' : 'You can review all policies from the links above before the final submission.'}</p>
                <p>{isAr ? 'إذا احتجت مساعدة فورية، يمكنك التواصل عبر واتساب الدعم مباشرة.' : 'If you need immediate help, you can contact support on WhatsApp directly.'}</p>
              </div>
              <a
                href={supportWhatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="action-secondary inline-flex items-center justify-center rounded-2xl px-6 py-3 text-sm font-black text-primary hover:border-primary/35 hover:bg-primary/5"
              >
                {isAr ? 'التواصل مع واتساب الدعم' : 'Contact support on WhatsApp'}
              </a>
            </div>
            
            <button
              type="submit"
              disabled={loading || !agreed}
              className="action-primary inline-flex w-full items-center justify-center gap-3 rounded-[1.5rem] px-10 py-5 text-lg md:text-xl font-black disabled:cursor-not-allowed disabled:opacity-30"
            >
              {loading ? (isAr ? 'جاري التأكيد...' : 'Confirming...') : (isAr ? '🚀 تأكيد التسجيل النهائي' : '🚀 Final Registration Confirmation')}
            </button>
            {submitError && (
              <p className="rounded-2xl border border-destructive/20 bg-destructive/10 px-4 py-3 text-center text-sm font-black text-destructive">
                {submitError}
              </p>
            )}
          </form>
        </div>
      </div>
    </section>
  );
}
