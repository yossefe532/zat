'use client';

import { useState } from 'react';
import { ArrowRight, ArrowLeft, User, Phone, Calendar, AlertCircle, Check } from 'lucide-react';
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
  onSubmit: (data: { fullName: string; phone: string; age: number }) => void;
}

export function RegistrationForm({
  lang,
  selectedCourses,
  grantCode,
  grantData,
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
    await new Promise(resolve => setTimeout(resolve, 800));
    onSubmit({
      fullName: formData.fullName,
      phone: formData.phone,
      age: parseInt(formData.age)
    });
    setLoading(false);
  };

  return (
    <section className="min-h-screen px-4 py-20 bg-background relative overflow-hidden">
      <div className="container mx-auto max-w-3xl relative z-10">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-2 text-primary font-black hover:scale-105 transition-transform mb-12"
        >
          <ArrowRight className="w-5 h-5 rtl:rotate-180" />
          {isAr ? 'العودة لاختيار الكورسات' : 'Back to Courses'}
        </button>
        
        <div className="text-center mb-12 space-y-4">
          <h2 className="text-4xl md:text-5xl font-black title-font text-primary">
            {isAr ? 'استمارة التسجيل' : 'Registration Form'}
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto font-bold">
            {isAr 
              ? 'أدخل بياناتك بدقة لتأكيد حجز مكانك في المبادرة'
              : 'Enter your details accurately to confirm your spot in the initiative'}
          </p>
        </div>
        
        <div className="bg-card rounded-3xl border-2 border-border shadow-2xl p-8 md:p-12 space-y-10">
          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-3">
                <label className="text-lg font-black flex items-center gap-2 text-foreground">
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
                  className={`w-full px-6 py-4 rounded-2xl border-2 bg-background font-bold focus:outline-none focus:ring-4 focus:ring-primary/10 transition-all ${
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
                <label className="text-lg font-black flex items-center gap-2 text-foreground">
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
                  className={`w-full px-6 py-4 rounded-2xl border-2 bg-background font-bold focus:outline-none focus:ring-4 focus:ring-primary/10 transition-all ${
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
              <label className="text-lg font-black flex items-center gap-2 text-foreground">
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
                className={`w-full md:w-1/3 px-6 py-4 rounded-2xl border-2 bg-background font-bold focus:outline-none focus:ring-4 focus:ring-primary/10 transition-all ${
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
            <div className="bg-muted/50 rounded-3xl p-8 border border-border/50">
              <h4 className="text-xl font-black title-font text-primary mb-6 bg-primary/5 p-4 rounded-xl text-center">
                {isAr ? 'تعليمات مبادرة ذات الرقمية' : 'ZAT Digital Initiative Instructions'}
              </h4>
              <ul className="space-y-4">
                {[
                  isAr ? 'السعر لمنحة كاملة 650 جنيه فقط في حال وجود كود خصم.' : 'Full grant price is 650 EGP only with discount code.',
                  isAr ? 'سعر ملئ الأبليكيشن 25 جنيه فقط لا غير.' : 'Application fee is 25 EGP only.',
                  isAr ? 'القسط الأول 200 جنيه + 25 جنيه رسوم، والقسط الثاني 450 جنيه.' : '1st Installment: 200 + 25 fees. 2nd Installment: 450 EGP.',
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
                  className="w-6 h-6 rounded border-2 border-primary text-primary focus:ring-primary"
                />
                <label htmlFor="agree-check" className="text-base md:text-lg font-black text-foreground cursor-pointer">
                  {isAr ? 'أوافق وأقر أني قرأت كل التعليمات الموضحة أعلاه' : 'I agree and acknowledge the above instructions'}
                </label>
              </div>
              {errors.agreed && (
                <p className="text-destructive text-sm font-bold text-center mt-2 animate-pulse">{errors.agreed}</p>
              )}
            </div>

            <div className="bg-primary/5 rounded-3xl p-8 space-y-6">
              <h4 className="text-xl font-black title-font text-primary">{isAr ? 'ملخص الدورات والرسوم' : 'Courses & Fees Summary'}</h4>
              <div className="flex flex-wrap gap-3">
                {selectedCourses.map((course) => (
                  <span key={course.id} className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white border border-primary/20 text-primary font-black text-sm shadow-sm">
                    <span>{course.icon}</span>
                    <span>{isAr ? course.nameAr : course.nameEn}</span>
                  </span>
                ))}
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-6 border-t border-dashed border-primary/20">
                <div className="bg-white p-4 rounded-2xl shadow-sm border border-border">
                  <span className="text-xs text-muted-foreground font-bold block mb-1">{isAr ? 'الإجمالي النهائي' : 'Final Total'}</span>
                  <span className="text-2xl font-black text-primary">{formatPrice(calculations.total)} {isAr ? 'ج' : 'EGP'}</span>
                </div>
                <div className="bg-white p-4 rounded-2xl shadow-sm border border-border">
                  <span className="text-xs text-muted-foreground font-bold block mb-1">{isAr ? 'القسط الأول' : '1st Installment'}</span>
                  <span className="text-2xl font-black text-success">{formatPrice(calculations.firstInstallment)} {isAr ? 'ج' : 'EGP'}</span>
                </div>
                <div className="bg-white p-4 rounded-2xl shadow-sm border border-border">
                  <span className="text-xs text-muted-foreground font-bold block mb-1">{isAr ? 'القسط الثاني' : '2nd Installment'}</span>
                  <span className="text-2xl font-black text-primary/60">{formatPrice(calculations.secondInstallment)} {isAr ? 'ج' : 'EGP'}</span>
                </div>
              </div>
            </div>
            
            <button
              type="submit"
              disabled={loading || !agreed}
              className="w-full inline-flex items-center justify-center gap-3 px-12 py-6 rounded-2xl bg-primary text-primary-foreground font-black text-2xl hover:bg-primary/90 transition-all shadow-2xl shadow-primary/40 disabled:opacity-30 disabled:cursor-not-allowed hover:scale-[1.02]"
            >
              {loading ? (isAr ? 'جاري التأكيد...' : 'Confirming...') : (isAr ? '🚀 تأكيد التسجيل النهائي' : '🚀 Final Registration Confirmation')}
            </button>
          </form>
        </div>
      </div>
    </section>
  );
}
