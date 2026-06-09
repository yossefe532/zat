'use client';

import { useState } from 'react';
import { ArrowRight, User, Phone, Calendar, AlertCircle } from 'lucide-react';
import { Course } from '@/lib/types';
import { formatPrice } from '@/lib/utils';

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
}

export function RegistrationForm({
  lang,
  selectedCourses,
  calculations,
  onBack,
  onSubmit
}: RegistrationFormProps) {
  const isAr = lang === 'ar';
  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    age: ''
  });
  const [agreed, setAgreed] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [submitError, setSubmitError] = useState('');

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
                    setFormData({ ...formData, fullName: e.target.value });
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
                    setFormData({ ...formData, phone: e.target.value });
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
                  setFormData({ ...formData, age: e.target.value });
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

            {/* Legacy Instructions Section */}
            <div className="metric-card rounded-[1.8rem] p-6 md:p-8">
              <h4 className="mb-6 rounded-2xl bg-primary/6 p-4 text-center text-lg md:text-xl font-black title-font text-primary">
                {isAr ? 'تعليمات مبادرة ذات الرقمية' : 'ZAT Digital Initiative Instructions'}
              </h4>
              <ul className="space-y-4">
                {[
                  isAr ? 'سعر المنحة لكل كورس: 675 جنيه فقط في حال وجود كود خصم.' : 'Grant price per course is 675 EGP only with discount code.',
                  isAr ? 'لا توجد رسوم إضافية على سعر المنحة.' : 'No extra fees are added to the grant price.',
                  isAr ? 'نظام التقسيط: القسط الأول 200 جنيه لكل كورس، والقسط الثاني 475 جنيه لكل كورس.' : 'Installments: 1st is 200 EGP per course, 2nd is 475 EGP per course.',
                  isAr ? 'يستلم المتدرب شهادة حضور لكل تدريب بعلامة مائية هولوجرام.' : 'Students receive hologram certificates for each training.',
                  isAr ? 'يفصل الطالب من المنحة في حال تجاوز غياب 3 محاضرات بدون عذر.' : 'Dismissal occurs after 3 unexcused absences.',
                ].map((instruction, i) => (
                  <li key={i} className="flex items-start gap-3 text-sm md:text-base font-bold text-muted-foreground leading-relaxed">
                    <div className="w-5 h-5 mt-1 rounded-full bg-primary flex items-center justify-center text-white text-xs flex-shrink-0">●</div>
                    {instruction}
                  </li>
                ))}
              </ul>
              <div className="mt-8 pt-6 border-t border-dashed border-border flex items-center gap-4 justify-center">
                <input 
                  type="checkbox" 
                  id="agree-check" 
                  checked={agreed}
                  onChange={(e) => setAgreed(e.target.checked)}
                  className="h-5 w-5 rounded border-2 border-primary text-primary focus:ring-primary"
                />
                <label htmlFor="agree-check" className="cursor-pointer text-sm md:text-base font-black text-foreground">
                  {isAr ? 'أوافق وأقر أني قرأت كل التعليمات الموضحة أعلاه' : 'I agree and acknowledge the above instructions'}
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
